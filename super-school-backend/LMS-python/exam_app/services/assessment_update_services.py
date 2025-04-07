from datetime import datetime

from django.db.models import Min, Max
from django.utils.timezone import now as timezone_now
from rest_framework import status
from rest_framework.response import Response

from ..models import AssessmentSubject
from ..serializers import AssessmentUpdateSerializer
from django.utils.translation import gettext as _, activate


def validate_and_update_assessment(instance, request):
    """
    Validates and updates an assessment instance.
    """
    data = request.data.copy()
    data['updated_by'] = request.user.id
    data['updated_at'] = timezone_now()

    # Check for conflicting dates if start_datetime or end_datetime is being updated
    new_start_datetime = data.get('assessment_start_datetime')
    new_end_datetime = data.get('assessment_end_datetime')

    if new_start_datetime or new_end_datetime:
        new_start_datetime, new_end_datetime = normalize_and_validate_dates(
            instance, new_start_datetime, new_end_datetime
        )

        # Fetch the minimum and maximum datetime from associated AssessmentSubjects
        min_subject_datetime = AssessmentSubject.objects.filter(assessment=instance.id).aggregate(
            min_start=Min('assessment_start_datetime'),
            max_end=Max('assessment_end_datetime')
        )

        # Skip validations if no associated AssessmentSubjects exist
        if min_subject_datetime['min_start'] is None and min_subject_datetime['max_end'] is None:
            return update_instance(instance, data)

        # Validate start date
        if new_start_datetime > min_subject_datetime['min_start']:
            return Response({
                'error': _('The assessment start date must be on or before the earliest associated AssessmentSubject start date.')
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate end date
        if new_end_datetime < min_subject_datetime['max_end']:
            return Response({
                'error': _('Assessment end date must be later than or equal to the latest associated AssessmentSubject end date.')
            }, status=status.HTTP_400_BAD_REQUEST)

    # Update the instance
    return update_instance(instance, data)


def normalize_and_validate_dates(instance, start_datetime, end_datetime):
    """
    Normalizes string dates to datetime objects and validates them.
    """

    def normalize_datetime_string(dt_str):
        try:
            if dt_str.endswith('Z'):
                dt_str = dt_str[:-1] + '+00:00'  # Replace 'Z' with '+00:00' for UTC
            return datetime.fromisoformat(dt_str)
        except ValueError:
            raise ValueError(_("Invalid datetime format: %(datetime)s") % {"datetime": dt_str})

    # Normalize datetime values
    if isinstance(start_datetime, str):
        start_datetime = normalize_datetime_string(start_datetime)
    else:
        start_datetime = start_datetime or instance.assessment_start_datetime

    if isinstance(end_datetime, str):
        end_datetime = normalize_datetime_string(end_datetime)
    else:
        end_datetime = end_datetime or instance.assessment_end_datetime

    return start_datetime, end_datetime


def update_instance(instance, data):
    """
    Updates the assessment instance with validated data.
    """
    serializer = AssessmentUpdateSerializer(instance, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()

        # Update assessment subjects if status is being updated
        if 'status' in data and data['status'] == 'cancelled':
            AssessmentSubject.objects.filter(assessment=instance).update(
                is_locked=True,
                status='cancelled',
                updated_by=data['updated_by'],
                updated_at=data['updated_at']
            )

        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
