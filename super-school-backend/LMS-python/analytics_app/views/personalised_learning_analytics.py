from django.conf import settings
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response

from analytics_app.services import *
from digital_marking.serializers import StudentStrengthWeaknessSerializer
from exam_app.models import Assessment
from exam_app.pagination import GlobalPagination
from exam_app.serializers import AssessmentSerializer
from nest_db_app.decorators import permission_required
from nest_db_app.models import User
from nest_db_app.views import update_user_obj
from django.utils.translation import gettext as _, activate


class PersnolisedLearningAnalyticsViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    pagination_class = GlobalPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'grade', 'grade_class', 'batch', 'created_by', 'updated_by', 'deleted_by', 'school',
                        'term', 'id']
    ordering_fields = ['assessment_start_datetime', 'created_at', 'updated_at', 'status', 'id']

    @transaction.atomic
    @permission_required('assessments', 'view')
    def list(self, request, *args, **kwargs):
        user = User.objects.get(id=request.user.id)

        role = user.role.role_name

        if role in settings.SUPER_ROLE:
            school_id = request.query_params.get('school_id')
            if not school_id:
                return Response({"error": _("School ID is required.")}, status=status.HTTP_400_BAD_REQUEST)
            user = update_user_obj(user, school_id)
        queryset = self.filter_queryset(self.get_queryset())

        if role == 'teacher':
            analytics_data = get_teacher_analytics_data(user, queryset)
        elif role == 'student' or role == 'parents':
            if role == 'student':
                analytics_data = get_student_analytics_data(user, queryset)
            if role == 'parents':
                user.id = request.query_params.get('student_id')
                analytics_data = get_student_analytics_data(user, queryset)
        elif role in settings.SUPER_ROLE or role == 'admin':
            analytics_data = get_admin_analytics_data(user, queryset)

        if analytics_data:
            paginated_data = self.paginate_queryset(analytics_data)
            return self.get_paginated_response(paginated_data)
        else:
            return Response({"error": _("No data found.")}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='strength-weakness')
    @transaction.atomic
    @permission_required("assessments", "view")
    def analytics_strength_weakness(self, request, *args, **kwargs):
        grade_id = request.query_params.get('grade')
        term_id = request.query_params.get('term')
        subject_id = request.query_params.get('subject')

        if not grade_id or not term_id or not subject_id:
            return Response(
                {"error": _("grade, term, and subject are required.")},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Fetch related StudentAnswerSheet
        student_answer_sheets = StudentAnswerSheet.objects.filter(
            grade_id=grade_id,
            term_id=term_id,
            assessment_subject__subject_id=subject_id
        )

        if not student_answer_sheets.exists():
            return Response({"error": _("No data found.")}, status=status.HTTP_404_NOT_FOUND)

        # Fetch related DigitalMarking
        digital_markings = DigitalMarking.objects.filter(
            student_answer_sheet__in=student_answer_sheets
        )

        if not digital_markings.exists():
            return Response({"error": _("No data found.")}, status=status.HTTP_404_NOT_FOUND)

        # Aggregate and group by student and subject
        grouped_data = []
        for student_answer_sheet in student_answer_sheets:
            student_markings = digital_markings.filter(student_answer_sheet=student_answer_sheet)
            strength_tags = Counter(tag for marking in student_markings for tag in marking.strength_tags)
            weakness_tags = Counter(tag for marking in student_markings for tag in marking.weakness_tags)

            grouped_data.append({
                "student_name": student_answer_sheet.student.first_name,
                "student_admission_number": student_answer_sheet.student.addmission_no,
                "weakness": {
                    "subject_id": student_answer_sheet.assessment_subject.subject.id,
                    "subject_name": student_answer_sheet.assessment_subject.subject.master_subject.subject_name,
                    "weakness": [tag for tag, _ in weakness_tags.most_common(10)],
                    "strength": [tag for tag, _ in strength_tags.most_common(10)],
                }
            })

        serializer = StudentStrengthWeaknessSerializer(grouped_data, many=True)
        analytics_data = serializer.data
        if analytics_data:
            paginated_data = self.paginate_queryset(analytics_data)
            return self.get_paginated_response(paginated_data)
        # return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='student-analytics')
    @transaction.atomic
    @permission_required("assessments", "view")
    def get_specific_student_analytics_data(self, request, *args, **kwargs):
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response({"error": _("Student ID is required.")}, status=status.HTTP_400_BAD_REQUEST)
        student = User.objects.get(id=student_id)
        queryset = self.filter_queryset(self.get_queryset())
        if not student:
            return Response({"error": _("Student not found.")}, status=status.HTTP_404_NOT_FOUND)
        analytics_data = get_student_analytics_data(student, queryset)
        if analytics_data:
            paginated_data = self.paginate_queryset(analytics_data)
            return self.get_paginated_response(paginated_data)

        return Response({"error": _("No data found.")}, status=status.HTTP_404_NOT_FOUND)