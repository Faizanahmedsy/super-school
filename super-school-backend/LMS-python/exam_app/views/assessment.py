from datetime import datetime

from django.conf import settings
from django.core.exceptions import PermissionDenied
from django.db import transaction
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, status
# from exam_app.pagination import AssessmentPagination
from rest_framework.filters import OrderingFilter
from rest_framework.filters import SearchFilter
from rest_framework.response import Response

from exam_app.models import Assessment, AssessmentSubject
from exam_app.pagination import GlobalPagination
from exam_app.serializers.assessment import AssessmentSerializer
from exam_app.services import create_assessment_for_teacher, create_assessment_for_admin, validate_and_update_assessment
from exam_app.services.assessment_list_services import get_teacher_assessments, get_student_assessments, \
    get_school_admin_assessments, get_super_admin_assessments
from nest_db_app.decorators import permission_required
from nest_db_app.models import User, Teacher, ClassSubject
from nest_db_app.services.notification import create_notification_for_students, create_notification_for_teachers, \
    create_notification_for_school_admins
from nest_db_app.views import update_user_obj

from rest_framework.filters import SearchFilter
from django.utils.translation import gettext as _, activate
from dateutil import parser

class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    pagination_class = GlobalPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['status', 'grade', 'grade_class', 'batch', 'created_by', 'updated_by', 'deleted_by', 'school',
                        'term', 'id', 'assessment__subject', 'assessment__grade_class', 'assessment__grade',
                        'ocr_status', 'is_reviewed']
    ordering_fields = ['assessment_start_datetime', 'created_at', 'updated_at', 'status', 'id']
    search_fields = ['assessment_name']

    @transaction.atomic
    @permission_required('assessments', 'add')
    def create(self, request, *args, **kwargs):
        """
        View to handle assessment creation requests and delegate logic by role.
        """
        user = User.objects.get(pk=request.user.id)
        role = user.role.role_name

        if role in settings.SUPER_ROLE:
            school_id = request.query_params.get('school_id')
            if not school_id:
                return Response({"error": _("School ID is required.")}, status=status.HTTP_400_BAD_REQUEST)
            user = update_user_obj(user, school_id)

        data = request.data
        required_fields = [
            'assessment_name',
            'assessment_start_datetime',
            'assessment_end_datetime',
            'grade',
            'term',
            'batch'
        ]

        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return Response(
                {"error": _("Missing required fields: %(fields)s") % {"fields": ", ".join(missing_fields)}},
                status=status.HTTP_400_BAD_REQUEST
            )

        data['created_by'] = request.user.id

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

        try:
            if role.lower() == "teacher":
                data['school'] = user.school.id
                response = create_assessment_for_teacher(user, data)
            elif role.lower() in settings.SUPER_ROLE or role.lower() == "admin":
                data['school'] = user.school.id
                response = create_assessment_for_admin(user, data)
            else:
                raise PermissionDenied(_("You do not have permission to create assessments."))

            assessment_id = response.get('id')
            if assessment_id:
                try:

                    create_notification_for_students(
                        title=f"New Assessment:{data['assessment_name']} has been Created",
                        message=f"A new assessment '{data['assessment_name']}' has been scheduled from {datetime.fromisoformat(data['assessment_start_datetime'].replace('Z', '+00:00')).strftime('%d-%m-%Y')} to {datetime.fromisoformat(data['assessment_end_datetime'].replace('Z', '+00:00')).strftime('%d-%m-%Y')}.",
                        module_name="assessments",
                        grade_id=data.get('grade'),
                        grade_class_id=data.get('grade_class'),
                        subject_id=data.get('subject_id'),
                        school_id=data.get('school')
                    )
                except Exception as e:
                    # pass
                    return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                try:
                    create_notification_for_teachers(
                        title="New Assessment Scheduled",
                        message=f"A new assessment '{data['assessment_name']}' has been scheduled for your class.",
                        module_name="assessments",
                        school_id=data.get('school')
                    )
                except Exception as e:
                    # pass
                    return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                try:
                    create_notification_for_school_admins(
                        title="New Assessment Notification",
                        message=f"A new assessment '{data['assessment_name']}' has been created.",
                        module_name="assessments",
                        school_id=data.get('school')
                    )
                except Exception as e:

                    return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                    # pass
            return Response({
                "message": _("Assessment created successfully"),
                "data": response
            }, status=status.HTTP_201_CREATED)

        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)

    @transaction.atomic
    @permission_required('assessments', 'view')
    def list(self, request, *args, **kwargs):
        user = User.objects.get(pk=request.user.id)
        role = user.role.role_name

        # Extract subject_id from query parameters
        subject_id = request.query_params.get('assessment_subject', None)
        if subject_id:
            subject_id = int(subject_id)

        if role in settings.SUPER_ROLE:
            school_id = request.query_params.get('school_id')
            if not school_id:
                return Response({"error": _("School ID is required.")}, status=status.HTTP_400_BAD_REQUEST)
            user = update_user_obj(user, school_id)

        queryset = self.filter_queryset(self.get_queryset())

        role_handler_map = {
            "teacher": get_teacher_assessments,
            "student": get_student_assessments,
            "admin": get_school_admin_assessments,
            **{super_role: get_super_admin_assessments for super_role in settings.SUPER_ROLE},
        }

        handler = role_handler_map.get(role)
        if not handler:
            return Response({"error": _("Role not recognized.")}, status=status.HTTP_400_BAD_REQUEST)

        assessment_data = handler(user, queryset, subject_id)

        if assessment_data:
            paginated_data = self.paginate_queryset(assessment_data)
            return self.get_paginated_response(paginated_data)
        else:
            return Response({"error": _("No data found.")}, status=status.HTTP_404_NOT_FOUND)

    @transaction.atomic
    @permission_required('assessments', 'view')
    def retrieve(self, request, *args, **kwargs):
        user = User.objects.get(pk=request.user.id)
        role = user.role.role_name

        if role in settings.SUPER_ROLE:
            school_id = request.query_params.get('school_id')
            if not school_id:
                return Response({"error": _("School ID is required.")}, status=status.HTTP_400_BAD_REQUEST)
            user = update_user_obj(user, school_id)

        queryset = self.filter_queryset(self.get_queryset()).filter(id=kwargs['pk'])

        if role == 'teacher':
            assessment_data = get_teacher_assessments(user, queryset)
        elif role == 'student':
            assessment_data = get_student_assessments(user, queryset)
        elif role == 'admin':
            assessment_data = get_school_admin_assessments(user, queryset)
        elif role in settings.SUPER_ROLE:
            assessment_data = get_super_admin_assessments(user, queryset)
        else:
            return Response({"error": _("Role not recognized.")}, status=status.HTTP_400_BAD_REQUEST)

        if assessment_data:

            paginated_data = self.paginate_queryset(assessment_data)

            return self.get_paginated_response(paginated_data)
        else:
            return Response({"error": _("No data found.")}, status=status.HTTP_404_NOT_FOUND)

    @transaction.atomic
    @permission_required('assessments', 'edit')
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()

        user = request.user
        role = user.role.role_name

        if role in settings.SUPER_ROLE:
            school_id = request.query_params.get('school_id')
            if not school_id:
                return Response({"error": _("School ID is required.")}, status=status.HTTP_400_BAD_REQUEST)
            user = update_user_obj(user, school_id)

        if role == 'teacher':
            teacher = Teacher.objects.filter(teacher_user=user.id).first()
            if not teacher:
                return Response({'error': _('You are not authorized to update this assessment.')},
                                status=status.HTTP_403_FORBIDDEN)
            teacher_grade_ids = ClassSubject.objects.filter(teacher=teacher).values_list('grade_id', flat=True)
            if instance.grade_id not in teacher_grade_ids:
                return Response({'error': _('You do not have access to this assessment.')},
                                status=status.HTTP_403_FORBIDDEN)

        elif role == 'admin' or role in settings.SUPER_ROLE:

            if instance.school_id != user.school.id:
                return Response({'error': _('You do not belong to this school.')},
                                status=status.HTTP_403_FORBIDDEN)

        response = validate_and_update_assessment(instance, request)

        if response.status_code == status.HTTP_200_OK:
            # Get the updated values from the instance
            updated_fields = []
            if instance.assessment_name:
                updated_fields.append(f"Name: {instance.assessment_name}")
            if instance.assessment_start_datetime:
                updated_fields.append(f"Start Date: {instance.assessment_start_datetime.strftime('%d-%m-%Y')}")
            if instance.assessment_end_datetime:
                updated_fields.append(f"End Date: {instance.assessment_end_datetime.strftime('%d-%m-%Y')}")
            if instance.status:
                updated_fields.append(f"Status: {instance.status}")


            # Construct the notification message
            updated_message = f"The following changes have been made to the assessment details: {', '.join(updated_fields)}."

            # Send notifications
            create_notification_for_students(
                title=f"Assessment '{instance.assessment_name}' Updated",
                message=updated_message,
                module_name="assessments",
                grade_id=instance.grade_id,
                school_id=instance.school_id
            )

            create_notification_for_teachers(
                title=f"Assessment '{instance.assessment_name}' Updated",
                message=updated_message,
                module_name="assessments",
                school_id=instance.school_id
            )

            create_notification_for_school_admins(
                title=f"Assessment '{instance.assessment_name}' Updated",
                message=updated_message,
                module_name="assessments",
                school_id=instance.school_id
            )

        return Response({
            "message": _("Assessment updated successfully"),
            "data": response.data
        }, status=status.HTTP_201_CREATED)

    @transaction.atomic
    @permission_required('assessments', 'delete')
    def destroy(self, request, *args, **kwargs):

        instance = self.get_object()
        user = request.user
        role = user.role.role_name

        if role in settings.SUPER_ROLE:
            school_id = request.query_params.get('school_id')
            if not school_id:
                return Response({"error": _("School ID is required.")}, status=status.HTTP_400_BAD_REQUEST)
            user = update_user_obj(user, school_id)

        if role == 'teacher':
            teacher = Teacher.objects.filter(teacher_user=user.id).first()
            if not teacher:
                return Response({'error': _('You are not authorized to update this assessment.')},
                                status=status.HTTP_403_FORBIDDEN)
            teacher_grade_ids = ClassSubject.objects.filter(teacher=teacher).values_list('grade_id', flat=True)
            if instance.grade_id not in teacher_grade_ids:
                return Response({'error': _('You do not have access to this assessment.')},
                                status=status.HTTP_403_FORBIDDEN)

        elif role == 'admin' or role in settings.SUPER_ROLE:
            if instance.school_id != user.school.id:
                return Response({'error': _('You do not belong to this school.')},
                                status=status.HTTP_403_FORBIDDEN)

        if instance.status == 'cancelled' or instance.status == 'completed':
            return Response({'error': _('Cannot cancel a cancelled assessment.')}, status=status.HTTP_400_BAD_REQUEST)

        instance.status = 'cancelled'

        instance.deleted_by = request.user
        instance.deleted_at = datetime.now()
        instance.is_locked = True

        instance.save()
        assessment_subjects = AssessmentSubject.objects.filter(assessment=instance)
        assessment_subjects.update(is_locked=True, status='cancelled', deleted_at=timezone.now(),
                                   deleted_by=request.user)

        cancellation_message = f"The assessment '{instance.assessment_name}' has been cancelled."

        # Send notifications for students
        create_notification_for_students(
            title=f"Assessment '{instance.assessment_name}' Cancelled",
            message=cancellation_message,
            module_name="assessments",
            grade_id=instance.grade_id,
            school_id=instance.school_id
        )

        # Send notifications for teachers
        create_notification_for_teachers(
            title=f"Assessment '{instance.assessment_name}' Cancelled",
            message=cancellation_message,
            module_name="assessments",
            school_id=instance.school_id
        )

        # Send notifications for school admins
        create_notification_for_school_admins(
            title=f"Assessment '{instance.assessment_name}' Cancelled",
            message=cancellation_message,
            module_name="assessments",
            school_id=instance.school_id
        )

        return Response(status=status.HTTP_204_NO_CONTENT)
