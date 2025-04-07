from datetime import datetime
from io import BytesIO

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.response import Response
from weasyprint import HTML

from exam_app.models import AssessmentSubject, Assessment
from exam_app.pagination import GlobalPagination
from exam_app.serializers.assessment_subject import AssessmentSubjectSerializer
from exam_app.services.assessment_subject_create import create_teacher_assessment, create_admin_assessment
from exam_app.services.assessment_subject_list import get_teacher_subject_assessments, get_student_subject_assessments, \
    get_school_admin_subject_assessments, get_super_admin_subject_assessments
from nest_db_app.decorators import permission_required
from nest_db_app.models import User, School, Subject
from nest_db_app.services.notification import create_notification_for_students, create_notification_for_teachers, \
    create_notification_for_school_admins
from nest_db_app.views import update_user_obj
from django.utils.translation import gettext as _, activate


class AssessmentSubjectViewSet(viewsets.ModelViewSet):
    queryset = AssessmentSubject.objects.all()
    serializer_class = AssessmentSubjectSerializer
    pagination_class = GlobalPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['assessment', 'status', 'id', 'grade', 'grade_class', 'batch', 'created_by', 'updated_by',
                        'deleted_by', 'school',
                        'term']

    @transaction.atomic
    @permission_required('assessments', 'add')
    def create(self, request, *args, **kwargs):
        """
        Handles the API request to create an assessment subject.
        """
        data = request.data
        user = request.user
        role = user.role.role_name.lower()

        if role in settings.SUPER_ROLE:
            school_id = request.query_params.get('school_id')
            if not school_id:
                return Response({"error": _("School ID is required.")}, status=status.HTTP_400_BAD_REQUEST)
            user = update_user_obj(user, school_id)

        if role == "teacher":
            return create_teacher_assessment(user, data)
        elif role in settings.SUPER_ROLE or role == "admin":
            return create_admin_assessment(user, data)
        else:
            return Response({"error": _("Unauthorized role.")}, status=status.HTTP_403_FORBIDDEN)

    @transaction.atomic
    @permission_required('assessments', 'view')
    def list(self, request, *args, **kwargs):
        user = User.objects.get(pk=request.user.id)
        role = user.role.role_name

        if role in settings.SUPER_ROLE:
            school_id = request.query_params.get('school_id')
            if not school_id:
                return Response({"error": _("School ID is required.")}, status=status.HTTP_400_BAD_REQUEST)
            user = update_user_obj(user, school_id)

        queryset = self.filter_queryset(self.get_queryset())
        if role == 'teacher':
            assessment_data = get_teacher_subject_assessments(user, queryset)
        elif role == 'student':
            assessment_data = get_student_subject_assessments(user, queryset)
        elif role == 'admin':
            assessment_data = get_school_admin_subject_assessments(user, queryset)
        elif role in settings.SUPER_ROLE:
            assessment_data = get_super_admin_subject_assessments(user, queryset)
        else:
            return Response({"error": _("Role not recognized.")}, status=status.HTTP_400_BAD_REQUEST)
        if assessment_data:
            return Response({'results': assessment_data}, status=status.HTTP_200_OK)
        else:
            return Response({"error": _("No data found.")}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], url_path='update-memo')
    @transaction.atomic
    @permission_required('assessments', 'edit')
    def update_memos(self, request, *args, **kwargs):
        """
        Update the memo for a specific AssessmentSubject.
        - Accepts `assessment_subject_id` and `memo` in form data.
        - Saves the new memo before deleting the old one to ensure consistency.
        """
        user = User.objects.get(pk=request.user.id)
        role = user.role.role_name

        if role in settings.SUPER_ROLE:
            school_id = request.query_params.get('school_id')
            if not school_id:
                return Response({"error": _("School ID is required.")}, status=status.HTTP_400_BAD_REQUEST)
            user = update_user_obj(user, school_id)

        assessment_subject_id = request.data.get('assessment_subject_id')
        memo = request.FILES.get('memo')
        if not assessment_subject_id or not memo:
            return Response(
                {"error": _("Both `assessment_subject_id` and `memo` are required.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            assessment_subject = AssessmentSubject.objects.get(id=assessment_subject_id, school=user.school)
        except AssessmentSubject.DoesNotExist:
            return Response(
                {"error": _("AssessmentSubject with id %(id)s does not exist or is not in your school.") % {
                    "id": assessment_subject_id}},
                status=status.HTTP_404_NOT_FOUND,
            )

        old_memo = assessment_subject.memorandom  # Keep reference to the old memo
        assessment_subject.memorandom = memo
        assessment_subject.updated_by = request.user
        assessment_subject.save()

        if old_memo:
            old_memo.delete(save=False)

        return Response(
            {"result": _("Memo updated successfully.")},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['post'], url_path='update-question-paper')
    @transaction.atomic
    @permission_required('assessments', 'edit')
    def update_question_paper(self, request, *args, **kwargs):
        """
        Update the question paper for a specific AssessmentSubject.
        - Accepts `assessment_subject_id` and `memo` in form data.
        - Saves the new question paper before deleting the old one to ensure consistency.
        """

        user = User.objects.get(pk=request.user.id)
        role = user.role.role_name

        if role in settings.SUPER_ROLE:
            school_id = request.query_params.get('school_id')
            if not school_id:
                return Response({"error": _("School ID is required.")}, status=status.HTTP_400_BAD_REQUEST)
            user = update_user_obj(user, school_id)

        assessment_subject_id = request.data.get('assessment_subject_id')
        question_paper = request.FILES.get('question_paper')  # Expecting a file upload

        if not assessment_subject_id or not question_paper:
            return Response(
                {"error": _("Both `assessment_subject_id` and `question_paper` are required.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            assessment_subject = AssessmentSubject.objects.get(id=assessment_subject_id, school=user.school)
        except AssessmentSubject.DoesNotExist:
            return Response(
                {"error": _("AssessmentSubject with id %(id)s does not exist or is not in your school.") % {
                    "id": assessment_subject_id}},
                status=status.HTTP_404_NOT_FOUND,
            )

        old_question_paper = assessment_subject.question_paper
        assessment_subject.question_paper = question_paper
        assessment_subject.updated_by = request.user
        assessment_subject.save()

        if old_question_paper:
            old_question_paper.delete(save=False)

        return Response(
            {"result": _("Question Paper updated successfully.")},
            status=status.HTTP_200_OK,
        )

    def partial_update(self, request, *args, **kwargs):
        raise MethodNotAllowed(method='PATCH')

    def update(self, request, *args, **kwargs):
        raise MethodNotAllowed(method='PUT')

    def retrieve(self, request, *args, **kwargs):
        raise MethodNotAllowed(method='GET')

    @transaction.atomic
    @permission_required('assessments', 'delete')
    def destroy(self, request, *args, **kwargs):
        user = User.objects.get(pk=request.user.id)
        role = user.role.role_name

        if role in settings.SUPER_ROLE:
            school_id = request.query_params.get('school_id')
            if not school_id:
                return Response({"error": _("School ID is required.")}, status=status.HTTP_400_BAD_REQUEST)
            user = update_user_obj(user, school_id)

        instance = self.get_object()
        if instance.status != 'upcoming':
            return Response({'error': _('Cannot cancel assessment.')}, status=status.HTTP_400_BAD_REQUEST)
        instance.deleted_by = request.user
        instance.status = 'cancelled'
        instance.deleted_at = datetime.now()
        instance.save()

        create_notification_for_students(
            title=f"Assessment Subject has been changed",
            message=f"An assessment subject '{instance.subject.master_subject.subject_name}' has been changed",
            module_name="assessments",
            grade_id=instance.grade.id,
            grade_class_id=instance.grade_class.id,
            subject_id=instance.subject.id,
            school_id=instance.school.id,
        )

        create_notification_for_teachers(
            title=f"Assessment Subject has been changed",
            message=f"An assessment subject '{instance.subject.master_subject.subject_name}' has been changed",
            module_name="assessments",
            school_id=instance.school.id
        )

        create_notification_for_school_admins(
            title=f"Assessment Subject has been changed",
            message=f"An assessment subject '{instance.subject.master_subject.subject_name}' has been changed",
            module_name="assessments",
            school_id=instance.school.id
        )

        return Response({"result": _("Assessment cancelled successfully.")}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='generate-cover-paper')
    @transaction.atomic
    @permission_required('assessments', 'view')
    def generate_cover_paper(self, request, *args, **kwargs):
        """
        Generate a cover paper PDF for a specific assessment subject with student barcodes
        and store it in the file system.
        """

        user = User.objects.get(pk=request.user.id)

        if user.role.role_name in settings.SUPER_ROLE:
            if not request.query_params.get('school_id'):
                return Response({"error":"school_id is required"},status=400)
            user = update_user_obj(user, request.query_params.get('school_id'))
        school = School.objects.get(pk=user.school.id)
        if school.logo is not None:
            school.logo =  settings.SUPER_SCHOOL_BACKEND+"public/uploads/school/logo/"+school.logo
        assessment_subject_id = request.query_params.get('assessment_subject_id')
        assessment_subject = AssessmentSubject.objects.get(id = assessment_subject_id)
        file_path = f'cover_papers/{assessment_subject.assessment.assessment_name}_{assessment_subject.paper_title}_{assessment_subject.grade.grade_number}_{assessment_subject.grade_class.name}.pdf'

        if default_storage.exists(file_path):
            default_storage.delete(file_path)

        ordering = request.query_params.get('ordering')
        if not assessment_subject_id:
            return Response({"error": _("assessment_subject_id is required")}, status=400)

        assessment_subject = get_object_or_404(AssessmentSubject, id=assessment_subject_id)
        assessment = get_object_or_404(Assessment, id=assessment_subject.assessment.id)

        if ordering == 'surname':
            students = assessment_subject.student.all().order_by('last_name')
        else:
            students = assessment_subject.student.all().order_by('addmission_no')
        if not students:
            return Response({"error": _("No students found for this assessment subject")}, status=404)
        students_with_barcodes = []
        for student in students:
            barcode_image = self.generate_qr_code_image(student.id)
            students_with_barcodes.append({
                "student": student,
                "school": school,
                "assessment_subject": assessment_subject,
                "assessment": assessment,
                "barcode_image": barcode_image
            })

        base_url = request.build_absolute_uri('/')
        html_string = render_to_string('cover_paper.html', {
            'students_with_barcodes': students_with_barcodes,
            'base_url': base_url
        })
        pdf_buffer = BytesIO()
        HTML(string=html_string).write_pdf(pdf_buffer)
        pdf_buffer.seek(0)

        filename = f'cover_papers/{assessment_subject.assessment.assessment_name}_{assessment_subject.paper_title}_{assessment_subject.grade.grade_number}_{assessment_subject.grade_class.name}.pdf'

        saved_path = default_storage.save(filename, ContentFile(pdf_buffer.getvalue()))
        pdf_buffer.close()

        assessment_subject.cover_paper = saved_path  # Assuming you have this field in your model
        assessment_subject.save()

        file_url = default_storage.url(saved_path)
        file_url = str.replace(file_url, '/upload/', '')
        return Response({
            "message": _("Cover paper downloaded successfully"),
            "file_path": saved_path,
            "file_url": file_url
        }, status=200)

    def generate_qr_code_image(self, student_id):
        """
        Generate a QR code for the given student_id and return it as a base64-encoded string.
        """
        import qrcode
        from io import BytesIO
        import base64

        # Generate QR Code
        qr = qrcode.QRCode(box_size=10, border=4)
        qr.add_data(str(student_id))
        qr.make(fit=True)
        qr_img = qr.make_image(fill="black", back_color="white")

        # Convert to base64
        buffer = BytesIO()
        qr_img.save(buffer, format="PNG")
        base64_qr = base64.b64encode(buffer.getvalue()).decode('utf-8')
        buffer.close()

        return f"data:image/png;base64,{base64_qr}"

    @action(detail=False, methods=['delete'], url_path='delete-cover-paper')
    @transaction.atomic
    @permission_required('assessments', 'view')
    def delete_cover_paper(self, request, *args, **kwargs):
        """
        Delete the cover paper PDF file for a specific assessment subject.
        """
        assessment_subject_id = request.query_params.get('assessment_subject_id')
        if not assessment_subject_id:
            return Response({"error": _("assessment_subject_id is required")}, status=400)

        assessment_subject = get_object_or_404(AssessmentSubject, id=assessment_subject_id)

        try:
            file_path = f'cover_papers/{assessment_subject.assessment.assessment_name}_{assessment_subject.paper_title}_{assessment_subject.grade.grade_number}_{assessment_subject.grade_class.name}.pdf'

            if default_storage.exists(file_path):
                default_storage.delete(file_path)

                assessment_subject.cover_paper = None
                assessment_subject.save()

                return Response({
                    "message": _("Cover paper deleted successfully")
                }, status=200)
            else:
                return Response({
                    "error": _("File not found in storage")
                }, status=404)

        except Exception as e:
            return Response({
                "error": _("Error deleting cover paper: %(error)s") % {"error": str(e)}
            }, status=500)
