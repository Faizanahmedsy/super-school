from datetime import datetime

from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import ValidationError

from nest_db_app.models import ClassSubject, Teacher
from django.utils.translation import gettext as _
from dateutil import parser
from django.utils import timezone

def validate_datetime(data):
    """
    Validates the start and end datetime in the request data.
    Returns an error dictionary if validation fails.
    """
    assessment_start_datetime = data.get("assessment_start_datetime")
    assessment_end_datetime = data.get("assessment_end_datetime")

    if not assessment_start_datetime or not assessment_end_datetime:
        missing_field = "assessment_start_datetime" if not assessment_start_datetime else "assessment_end_datetime"
        return {"error": _("The '%(missing_field)s' field is required.") % {"missing_field": missing_field}}

    try:
        start_datetime = datetime.fromisoformat(assessment_start_datetime.replace("Z", "+00:00"))
        end_datetime = datetime.fromisoformat(assessment_end_datetime.replace("Z", "+00:00"))

        if start_datetime >= end_datetime:
            return {"error": _("Assessment start datetime must be before assessment end datetime.")}
    except ValueError:
        return {"error": _("Invalid datetime format. Use ISO 8601 format.")}

    return None  # No error


def validate_teacher_and_students(grade_id, batch_id, term_id):
    """
    Validates that both a teacher and students exist for the given grade, batch, and term.
    Returns None if validation succeeds, otherwise raises ValidationError.
    """
    try:
        # Filter all matching ClassSubject records
        class_subjects = ClassSubject.objects.filter(
            grade_id=grade_id,
            batch_id=batch_id,
            term_id=int(term_id),
        )

        if not class_subjects.exists():
            raise ValidationError(_("No class subjects found for the given grade, batch, and term."))

        # Check if at least one record has a teacher
        if not class_subjects.filter(teacher__isnull=False).exists():
            raise ValidationError(_("No teacher is assigned to any class for the given criteria."))

        # Check if at least one record has students assigned
        if not any(class_subject.students.exists() for class_subject in class_subjects):
            raise ValidationError(_("No students are assigned to any class for the given criteria."))

    except ObjectDoesNotExist:
        raise ValidationError(_("Invalid data for grade, batch, or term."))

def create_assessment_for_teacher(user, data):
    """
    Handles assessment creation for teachers.
    Ensures the teacher is assigned to the relevant batch.
    """
    # Validate date and time
    validate_teacher_and_students(data["grade"], data["batch"], data["term"])
    error = validate_datetime(data)
    if error:
        return error  # Return the error

    # Check if the teacher is associated with the batch in ClassSubject
    try:
        teacher = Teacher.objects.get(teacher_user=user.id)
        class_grade = ClassSubject.objects.filter(batch_id=teacher.cur_batch.id, teacher_id=teacher.id,
                                                  grade_id=data["grade"]).first()
    except ObjectDoesNotExist:
        return {"error": _("You do not have permission to create assessments for this class as current batch.")}

    # Parse and make start_time timezone-aware
    start_time = datetime.strptime(data['assessment_start_datetime'], "%Y-%m-%dT%H:%M:%S.%fZ")
    start_time = timezone.make_aware(start_time, timezone.get_current_timezone())

    # Parse and make end_time timezone-aware
    end_time = datetime.strptime(data['assessment_end_datetime'], "%Y-%m-%dT%H:%M:%S.%fZ")
    end_time = timezone.make_aware(end_time, timezone.get_current_timezone())

    # Get current time in the same timezone
    current_time = timezone.now()

    # Corrected status logic
    if current_time < start_time:
        data['status'] = 'upcoming'
    elif start_time <= current_time <= end_time:
        data['status'] = 'ongoing'
    else:
        data['status'] = 'completed'
    # Add teacher-specific data
    data["school"] = user.school.id
    data["created_by"] = user.id

    # Save and return response
    return save_assessment(data)


def create_assessment_for_admin(user, data):
    """
    Handles assessment creation for admins.
    Admins have unrestricted access.
    """
    # Validate date and time
    validate_teacher_and_students(data["grade"], data["batch"], data["term"])
    error = validate_datetime(data)
    if error:
        return error  # Return the error

    # Parse and make start_time timezone-aware
    start_time = datetime.strptime(data['assessment_start_datetime'], "%Y-%m-%dT%H:%M:%S.%fZ")
    start_time = timezone.make_aware(start_time, timezone.get_current_timezone())

    # Parse and make end_time timezone-aware
    end_time = datetime.strptime(data['assessment_end_datetime'], "%Y-%m-%dT%H:%M:%S.%fZ")
    end_time = timezone.make_aware(end_time, timezone.get_current_timezone())

    # Get current time in the same timezone
    current_time = timezone.now()

    # Corrected status logic
    if current_time < start_time:
        data['status'] = 'upcoming'
    elif start_time <= current_time <= end_time:
        data['status'] = 'ongoing'
    else:
        data['status'] = 'completed'

    # Save and return response
    return save_assessment(data)


def save_assessment(data):
    """
    Saves the assessment using the serializer.
    """
    from exam_app.serializers.assessment import AssessmentSerializer  # Replace with your actual serializer
    serializer = AssessmentSerializer(data=data)

    if serializer.is_valid():
        instance = serializer.save()
        return serializer.data  # Return the serialized data, not the instance itself
    else:
        # Extract and raise the first validation error
        error_field, error_message = next(iter(serializer.errors.items()))
        raise ValidationError(_("The %(field)s field: %(message)s") % {"field": error_field, "message": error_message[0]})
