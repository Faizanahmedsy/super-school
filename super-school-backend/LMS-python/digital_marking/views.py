import os
from re import search

from rest_framework.exceptions import PermissionDenied,MethodNotAllowed
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework import status

from exam_app.pagination import GlobalPagination
from exam_app.serializers import AssessmentSerializer, AssessmentSerializerList
from nest_db_app.decorators import permission_required
from django.db import transaction

from nest_db_app.models import SchoolAdmin, ClassSubject, Teacher, Module, Notification
from .models import *
from .serializers import StudentAnswerSheetSerializerList, StudentAnswerSheetSerializer
from django_filters.rest_framework import DjangoFilterBackend,OrderingFilter
from rest_framework.decorators import action
from .tasks import process_pdf
from rest_framework.exceptions import ValidationError
from tempfile import TemporaryDirectory
from digital_marking.services import split_pdf_by_qr_codes
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.files.uploadedfile import InMemoryUploadedFile, TemporaryUploadedFile
import os
from rest_framework.filters import SearchFilter
from django.conf import settings
from nest_db_app.views import update_user_obj
from django.db.models import Q
from manual_marking.serializers import DigitalMarkingSerializer
from django.http import HttpResponse
from django.template.loader import render_to_string
from io import BytesIO
from weasyprint import HTML
from datetime import timedelta
from nest_db_app.services.notification import send_notification
from django.utils.translation import gettext as _, activate

class StudentAnswerSheetViewSet(viewsets.ModelViewSet):
    queryset = StudentAnswerSheet.objects.all()
    serializer_class = StudentAnswerSheetSerializer
    filter_backends = [DjangoFilterBackend,OrderingFilter,SearchFilter]
    filterset_fields = ['assessment_subject','batch','grade','grade_class','ocr_status','created_by','is_reviewed','student__first_name']
    ordering_fields = ['created_at','updated_at','student__first_name','student__last_name']
    search_fields = ['student__first_name','student__last_name']
    pagination_class = GlobalPagination

    def count_questions_to_review(self, answer_sheet):
        from .models import DigitalMarking  # Import here to avoid circular imports

        count = 0
        questions = DigitalMarking.objects.filter(student_answer_sheet=answer_sheet)

        for question in questions:
            obtained_mark = question.obtained_mark or 0
            actual_mark = question.actual_mark or 0
            obtained_manual_mark = question.obtained_manual_mark or None
            teacher_reason = question.teacher_reason or None

            if (obtained_manual_mark == None and teacher_reason == None) and (question.not_detected_word or (obtained_mark == 0) or (obtained_mark < actual_mark)):
                count += 1
        return count

    @transaction.atomic
    @permission_required('assessments', 'view')
    def list(self, request, *args, **kwargs):
        self.serializer_class = StudentAnswerSheetSerializerList
        user = request.user  # Get the logged-in user
        role_name = user.role.role_name  # Get the role name

        # Handle SUPER_ROLE users
        if user.role.role_name in settings.SUPER_ROLE:
            school_id = request.query_params.get('school_id')
            if not school_id:
                return Response({"error": _("school_id is required.")}, status=status.HTTP_400_BAD_REQUEST)
            user = update_user_obj(user, school_id)

        # Retrieve assessment_subject_id and grade_class from query parameters
        assessment_subject_id = request.query_params.get('assessment_subject')
        grade_class = request.query_params.get('grade_class')
        ordering = request.query_params.get('ordering')
        search = request.query_params.get('search', "").strip()

        if not assessment_subject_id:
            raise ValidationError({'detail': _('Assessment subject ID is required.')})

        if not grade_class:
            raise ValidationError({'detail': _('Grade class ID is required.')})


        subject_id = AssessmentSubject.objects.filter(id=assessment_subject_id).values_list('subject_id', flat=True).first()
        # Fetch related data
        # class_subjects = ClassSubject.objects.filter(grade_class=grade_class,subject_id=subject_id)
        student_ids = AssessmentSubject.objects.filter(grade_class=grade_class, subject_id=subject_id,id=assessment_subject_id) \
            .values_list("student", flat=True).distinct()

        students = Student.objects.filter(id__in=student_ids).distinct()
        # Apply search filter on first_name and last_name
        if search:
            students = students.filter(
                Q(first_name__icontains=search) | Q(last_name__icontains=search)
            )

        # Apply ordering
        if ordering == 'student__first_name':
            students = students.order_by('first_name')
        elif ordering == '-student__first_name':
            students = students.order_by('-first_name')
        elif ordering == 'student__last_name':
            students = students.order_by('last_name')
        elif ordering == '-student__last_name':
            students = students.order_by('-last_name')
        elif ordering == 'admission_number':
            students = students.order_by('addmission_no')
        elif ordering == '-admission_number':
            students = students.order_by('-addmission_no')
        else:
            students = students.order_by('addmission_no')

        # Filter answer sheets for the given assessment_subject and grade_class
        queryset = self.get_queryset().filter(
            assessment_subject_id=assessment_subject_id,
            grade_class=grade_class
        ).distinct()

        if role_name == 'student':
            student_id = Student.objects.filter(student_user=user.id).values_list('id', flat=True).first()
            queryset = queryset.filter(student_id=student_id)
        elif role_name == 'parents':
            student_id = request.data.get('student_id')
            if not student_id:
                return Response({"error": _("student_id is required.")}, status=status.HTTP_400_BAD_REQUEST)
            queryset = queryset.filter(student_id=student_id)
        elif role_name == 'teacher':
            teacher_user_id = Teacher.objects.filter(teacher_user=user.id).values_list('id', flat=True).first()
            subjects = ClassSubject.objects.filter(teacher_id=teacher_user_id).values_list(
                'subject_id', 'grade_id', 'grade_class_id'
            )
            if not subjects:
                return Response({'error': _('No subjects found for this teacher')}, status=status.HTTP_404_NOT_FOUND)

            queryset = queryset.filter(
                grade_id__in=[grade for _, grade, _ in subjects],
                grade_class_id__in=[grade_class for _, _, grade_class in subjects],
            )

        else:
            queryset = queryset.filter(school_id=user.school_id)

        filter_backends = getattr(self, 'filter_backends', [])
        for backend in filter_backends:
            backend_instance = backend()
            if hasattr(backend_instance, 'filter_queryset'):
                queryset = backend_instance.filter_queryset(request, queryset, self)

        # Serialize the queryset
        serialized_data = self.get_serializer(queryset, many=True).data
        # Check OCR status and count questions for manual review
        for item in serialized_data:
            answer_sheet_id = item.get('id')
            ocr_status = item.get('ocr_status')

            # Only check if OCR status is True
            if ocr_status:
                answer_sheet_instance = self.get_queryset().filter(id=answer_sheet_id).first()
                if answer_sheet_instance:
                    questions_to_review = self.count_questions_to_review(answer_sheet_instance)
                    item['questions_to_review'] = questions_to_review

        # Identify students who have submitted their answer sheets
        submitted_student_ids = {entry['student']['id'] for entry in serialized_data}

        filter_by_upload = request.query_params.get('filter_by_upload', "")

        # Prepare the final response data
        response_data = []

        for student in students:
            student_id = student.id
            # Check if the student has submitted data
            is_submitted = student_id in submitted_student_ids

            if filter_by_upload == 'true':
                # Include only students who have submitted data
                if is_submitted:
                    student_data = next(
                        (item for item in serialized_data if item['student']['id'] == student_id),
                        {}
                    )
                    student_data['sheet_update'] = True

                    # Add questions_to_review to student data if available
                    questions_to_review = student_data.get('questions_to_review', 0)
                    student_data['questions_to_review'] = questions_to_review
                    response_data.append(student_data)

            elif filter_by_upload == 'false':
                # Include only students who have not submitted data
                if not is_submitted:
                    student_data = {
                        'student': {
                            'id': student_id,
                            'first_name': student.first_name,
                            'last_name': student.last_name,
                            'email': student.email,
                            'admission_no': student.addmission_no,
                            'profile_image': student.profile_image if student.profile_image else None,
                        },
                        'sheet_update': False,
                    }
                    response_data.append(student_data)

            else:
                # Include all students
                if is_submitted:
                    # Use serialized data for submitted students
                    student_data = next(
                        (item for item in serialized_data if item['student']['id'] == student_id),
                        {}
                    )
                    student_data['sheet_update'] = True
                else:
                    # Construct data for non-submitted students
                    student_data = {
                        'student': {
                            'id': student_id,
                            'first_name': student.first_name,
                            'last_name': student.last_name,
                            'email': student.email,
                            'admission_no': student.addmission_no,
                            'profile_image': student.profile_image if student.profile_image else None,
                        },
                        'sheet_update': False,
                    }
                response_data.append(student_data)

        # Paginate the final response data
        paginated_data = self.paginate_queryset(response_data)
        data = self.get_paginated_response(paginated_data)
        total_uploads = sum(1 for item in response_data if item.get('sheet_update', False))

        # Append 'totalUploads' to the paginated data response
        data.data['totalUploads'] = total_uploads

        return data

    @transaction.atomic
    @permission_required('assessments', 'view')
    def retrieve(self, request, *args, **kwargs):
        self.serializer_class = StudentAnswerSheetSerializerList
        user = request.user  # Get the logged-in user
        role_name = user.role.role_name  # Get the role name
        sheet_id = kwargs.get('pk')  # Get the sheet ID from URL kwargs

        # Handle SUPER_ROLE users
        if user.role.role_name in settings.SUPER_ROLE:
            school_id = request.query_params.get('school_id')
            if not school_id:
                return Response({"error": _("school_id is required.")}, status=status.HTTP_400_BAD_REQUEST)
            user = update_user_obj(user, school_id)

        # Retrieve assessment_subject_id and grade_class from query parameters
        assessment_subject_id = request.query_params.get('assessment_subject')
        grade_class = request.query_params.get('grade_class')

        if not assessment_subject_id:
            raise ValidationError({'detail': _('Assessment subject ID is required.')})

        if not grade_class:
            raise ValidationError({'detail': _('Grade class ID is required.')})

        # Fetch related data
        class_subjects = ClassSubject.objects.filter(grade_class=grade_class)

        # Filter the queryset for the specific sheet
        queryset = self.get_queryset().filter(
            pk=sheet_id,
            assessment_subject_id=assessment_subject_id,
            grade_class=grade_class
        ).distinct()

        # Apply role-based filtering
        if role_name == 'student':
            student_id = Student.objects.filter(student_user=user.id).values_list('id', flat=True).first()
            queryset = queryset.filter(student_id=student_id)
        elif role_name == 'parents':
            student_id = request.data.get('student_id')
            if not student_id:
                return Response({"error": _("student_id is required.")}, status=status.HTTP_400_BAD_REQUEST)
            queryset = queryset.filter(student_id=student_id)
        elif role_name == 'teacher':
            teacher_user_id = Teacher.objects.filter(teacher_user=user.id).values_list('id', flat=True).first()
            subjects = ClassSubject.objects.filter(teacher_id=teacher_user_id).values_list(
                'subject_id', 'grade_id', 'grade_class_id'
            )
            if not subjects:
                return Response({'error': _('No subjects found for this teacher')}, status=status.HTTP_404_NOT_FOUND)

            queryset = queryset.filter(
                grade_id__in=[grade for _, grade, _ in subjects],
                grade_class_id__in=[grade_class for _, _, grade_class in subjects],
            )
        else:
            queryset = queryset.filter(school_id=user.school_id)

        # Apply additional filters manually (if any filter backends are configured)
        filter_backends = getattr(self, 'filter_backends', [])
        for backend in filter_backends:
            backend_instance = backend()
            if hasattr(backend_instance, 'filter_queryset'):
                queryset = backend_instance.filter_queryset(request, queryset, self)

        # Serialize the filtered queryset
        serializer = self.get_serializer(queryset, many=True)

        school = School.objects.get(id=user.school_id)

        # Prepare the response data
        response = serializer.data[0]
        response['school_name'] = school.school_name
        response['school_logo'] = school.logo

        # Calculate questions that need manual review
        if queryset.exists():
            answer_sheet = queryset.first()
            response['questions_to_review'] = self.count_questions_to_review(answer_sheet)
        else:
            response['questions_to_review'] = 0

        return Response([response])

    @transaction.atomic
    @permission_required('assessments', 'add')
    @action(detail=False, methods=['post'], url_path='bulk-upload')
    def bulk_upload(self, request, *args, **kwargs):
        if not request.FILES.getlist('answer_sheet'):
            return Response({'error': _('Please provide answer_sheet')})

        # Validate the assessment_subject
        try:
            assessment_subject = AssessmentSubject.objects.get(pk=request.data['assessment_subject'])
        except AssessmentSubject.DoesNotExist:
            return Response({'error': _('Assessment subject not found')}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.user.role.role_name

        if assessment_subject.is_locked:
            raise PermissionDenied(detail= _('Uploading answer sheet for this assessment is locked'))

        elif user_role in {'student', 'parents', 'guest'}:
            raise PermissionDenied(detail= _('You do not have permission to upload answersheet'))

        elif user_role == 'admin':
            admin_school = SchoolAdmin.objects.filter(school_admin_user_id=request.user.id).first()
            if not admin_school or assessment_subject.school_id != admin_school.school_id:
                raise PermissionDenied(detail= _('You do not have permission to upload answersheet'))

        elif user_role == 'teacher':
            teacher_school = Teacher.objects.filter(teacher_user=request.user.id).first()
            if not teacher_school or assessment_subject.school_id != teacher_school.school_id:
                raise PermissionDenied(detail= _('You do not have permission to upload answersheet'))

        elif user_role not in settings.SUPER_ROLE:
            raise PermissionDenied(detail= _('You do not have permission to upload answersheet'))

        error_list = []

        for uploaded_file in request.FILES.getlist('answer_sheet'):
            with TemporaryDirectory() as temp_dir:
                # Determine the path of the uploaded file
                if isinstance(uploaded_file, TemporaryUploadedFile):
                    file_path = uploaded_file.temporary_file_path()
                elif isinstance(uploaded_file, InMemoryUploadedFile):
                    temp_file_path = os.path.join(temp_dir, uploaded_file.name)
                    with open(temp_file_path, 'wb') as temp_file:
                        for chunk in uploaded_file.chunks():
                            temp_file.write(chunk)
                    file_path = temp_file_path
                else:
                    return Response({'error': _('Unsupported file type')}, status=status.HTTP_400_BAD_REQUEST)

                # Split the PDF into individual files by QR code
                split_files = split_pdf_by_qr_codes(file_path, temp_dir)

                for qr_code, split_file_path in split_files:
                    print("QR Code:", qr_code)
                    grade_class = assessment_subject.grade_class
                    print("Grade Class:", grade_class)
                    term = assessment_subject.term
                    print("Term:", term)

                    students = Student.objects.filter(
                        classsubject__grade_class=grade_class,
                        classsubject__term=term,
                        classsubject__subject_id=assessment_subject.subject_id
                    ).values_list('id', flat=True)

                    print("Students:", list(students))

                    if int(qr_code) not in list(students):
                        error_list.append({'student_id': qr_code,
                                           'errors': _("The student with QR Code ID %(qr_code)s is not registered for this examination.") % {"qr_code": qr_code}
                        })
                        continue

                    with open(split_file_path, 'rb') as answer_sheet:
                        # Prepare data for saving
                        data = {
                            'student': qr_code,
                            'assessment_subject': assessment_subject.id,
                            'school': assessment_subject.school_id,
                            'answer_sheet': SimpleUploadedFile(
                                name=f"{qr_code}.pdf",
                                content=answer_sheet.read(),
                                content_type='application/pdf'
                            ),
                            'batch': assessment_subject.assessment.batch.id,
                            'term': assessment_subject.assessment.term.id,
                            'grade': assessment_subject.grade.id,
                            'grade_class': assessment_subject.grade_class.id,
                            'created_by': request.user.id,
                        }

                        # Check if the record already exists
                        existing_record = StudentAnswerSheet.objects.filter(
                            student=qr_code,
                            assessment_subject=assessment_subject.id,
                            batch=assessment_subject.assessment.batch.id,
                            grade=assessment_subject.grade.id,
                            grade_class=assessment_subject.grade_class.id
                        ).first()

                        if existing_record:
                            serializer = StudentAnswerSheetSerializer(existing_record, data=data, context={
                                'batch': assessment_subject.assessment.batch.id,
                                'grade': assessment_subject.grade.id,
                                'grade_class': assessment_subject.grade_class.id,
                                'assessment_subject': assessment_subject.id
                            }, partial=True)

                            if serializer.is_valid():
                                serializer.save()
                            else:
                                error_list.append({'student_id': qr_code, 'errors': serializer.errors})
                        else:
                            serializer = StudentAnswerSheetSerializer(data=data, context={
                                'batch': assessment_subject.assessment.batch.id,
                                'grade': assessment_subject.grade.id,
                                'grade_class': assessment_subject.grade_class.id,
                                'assessment_subject': assessment_subject.id
                            })

                            if serializer.is_valid():
                                serializer.save()
                            else:
                                error_list.append({'student_id': qr_code, 'errors': serializer.errors})

        # Return response based on errors
        if error_list:
            return Response({'error': error_list}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'success': _("Bulk PDF has been uploaded successfully.")})

    @transaction.atomic
    @permission_required('assessments', 'add')
    def create(self, request, *args, **kwargs):
        # Validate the assessment_subject
        try:
            assessment_subject = AssessmentSubject.objects.get(pk=request.data['assessment_subject'])
            if assessment_subject.is_locked:
                raise PermissionDenied(detail= _('Uploading answer sheet for this assessment is locked'))
        except AssessmentSubject.DoesNotExist:
            return Response({'error': _('Assessment subject not found')}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.user.role.role_name

        # Role-based permission checks
        if user_role in {'student', 'parents', 'guest'}:
            raise PermissionDenied(detail= _('You do not have permission to upload answersheet'))

        if user_role == 'admin':
            admin_school = SchoolAdmin.objects.filter(school_admin_user_id=request.user.id).first()
            if not admin_school or assessment_subject.school_id != admin_school.school_id:
                raise PermissionDenied(detail= _('You do not have permission to upload answersheet'))

        elif user_role == 'teacher':
            teacher_school = Teacher.objects.filter(teacher_user=request.user.id).first()
            if not teacher_school or assessment_subject.school_id != teacher_school.school_id:
                raise PermissionDenied(detail= _('You do not have permission to upload answersheet'))

        # Allow super_admin to proceed
        elif user_role not in settings.SUPER_ROLE:
            raise PermissionDenied(detail= _('You do not have permission to upload answersheet'))

        # Permission check if the user is not the creator of the assessment subject and not an admin
        if assessment_subject.created_by.id != request.user.id and user_role != 'admin':
            raise PermissionDenied(detail= _('You do not have permission to upload answersheet'))

        error_list = []
        for sheet in request.FILES.getlist('answer_sheet'):
            data = {
                'student': sheet.name.strip('.pdf'),
                'assessment_subject': assessment_subject.id,
                'school': assessment_subject.school_id,
                'answer_sheet': sheet,
                'batch': assessment_subject.assessment.batch.id,
                'term': assessment_subject.assessment.term.id,
                'grade': assessment_subject.grade.id,
                'grade_class': assessment_subject.grade_class.id,
                'created_by': request.user.id,
            }
            student_answer_sheet = StudentAnswerSheetSerializer(data=data, context={
                'batch': assessment_subject.assessment.batch.id,
                'grade': assessment_subject.grade.id,
                'grade_class': assessment_subject.grade_class.id,
                'assessment_subject': assessment_subject.id
            })

            if student_answer_sheet.is_valid():
                student_answer_sheet.save()
            else:
                error_list.append({'student_id': sheet.name.strip(".pdf"), 'errors': student_answer_sheet.errors})

        if error_list:
            return Response({'error': error_list}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'success': _('Answer sheet uploaded successfully')})




    @transaction.atomic
    @permission_required('assessments', 'edit')
    def destroy(self, request, *args, **kwargs):
        self.serializer_class = StudentAnswerSheetSerializerList
        if request.user.role.role_name in {'student', 'parents', 'guest'}:
            raise PermissionDenied(detail= _('You do not have permission to delete answersheet'))

        admin_school = SchoolAdmin.objects.filter(school_admin_user_id=request.user.id).first()
        answer_sheet = StudentAnswerSheet.objects.filter(pk=kwargs.get("pk")).first()
        if request.user.role.role_name == 'admin' and answer_sheet.school.id != admin_school.school.id:
            raise PermissionDenied(detail=_('You do not have permission to delete answersheet'))

        if request.user.role.role_name == 'teacher' and admin_school.created_by.id != request.user.id:
            raise PermissionDenied(detail=_('You do not have permission to delete answersheet'))



        queryset = self.get_queryset().get(pk=kwargs.get("pk"))
        if queryset.is_locked:
            raise PermissionDenied(detail= _('Uploading answer sheet for this assessment is locked'))
        path = queryset.answer_sheet.path
        if queryset:
            try:
                os.remove(path)
            except OSError:
                return Response({'success': _("unable to delete file")}, status=status.HTTP_404_NOT_FOUND)
            queryset.delete()
            return Response({'success': _('Answer sheet deleted successfully')})
        return Response({'success': _('Answer sheet not found')}, status=status.HTTP_404_NOT_FOUND)


    # Disable the update method
    def update(self, request, *args, **kwargs):
        raise MethodNotAllowed('PUT', detail= _('Update method is disabled.'))

    def partial_update(self, request, *args, **kwargs):
        raise MethodNotAllowed('PATCH', detail= _("Partial update is disabled."))

    @action(detail=False, methods=['post'], url_path='start-checking/(?P<pk>[^/.]+)')
    @permission_required('assessments', 'edit')
    def start_checking(self, request, *args, **kwargs):
        assessment_subject = AssessmentSubject.objects.get(pk=kwargs.get('pk'))
        if assessment_subject.is_locked :
            raise PermissionDenied(detail= _('Automate marking is already in progress'))
        student_answer_sheet = StudentAnswerSheet.objects.filter(assessment_subject_id=assessment_subject).update(is_locked=True)
        assessment_subject.is_locked = True
        assessment_subject.ocr_status = 'in progress'
        assessment_subject.save()

        assessment_id = assessment_subject.assessment.id

        if not AssessmentSubject.objects.filter(assessment_id=assessment_id,ocr_status='not started').exists():
            Assessment.objects.filter(id=assessment_id).update(ocr_status='in progress')

        process_pdf.delay(assessment_subject.id)
        return Response({'success': _('Automate marking has been started')})

    @action(detail=False, methods=['post'], url_path='reviewed')
    @permission_required('assessments', 'edit')
    def final_reviewed(self, request, *args, **kwargs):
        student_answer_sheet_id = request.data.get('student_answer_sheet_id')
        if not student_answer_sheet_id:
            return Response({'error': _('Please provide student_answer_sheet_id')}, status=status.HTTP_400_BAD_REQUEST)

        student_answer_sheet = StudentAnswerSheet.objects.filter(id=student_answer_sheet_id).first()
        if not student_answer_sheet:
            return Response({'error': _('Student answer sheet not found')}, status=status.HTTP_404_NOT_FOUND)

        # Mark the individual StudentAnswerSheet as reviewed
        student_answer_sheet.is_reviewed = True
        student_answer_sheet.save()

        # **Send Feedback Notification for Student and Parents**
        feedback = student_answer_sheet.feedback or "We recommend reviewing your performance for further improvements."
        feedback_title = "Improvements Suggested"

        # Create Feedback Notification for the Student
        student_user = student_answer_sheet.student.student_user
        student_name = student_answer_sheet.student.first_name + " " + student_answer_sheet.student.last_name
        feedback_message_student = f"Dear {student_name}, improvements have been suggested in your answer sheet: {feedback}"

        Notification.objects.create(
            title=feedback_title,
            message=feedback_message_student,
            to_user=student_user,  # Linked User for the student
            school=student_answer_sheet.assessment_subject.school,  # Link to school from assessment_subject
            module=Module.objects.get(module_name_show="assessments"),
        )

        # Create Feedback Notifications for Parents
        parents = student_answer_sheet.student.parents.all()  # Assuming `parents` is a ManyToMany relation
        feedback_message_parent = f"Dear Parent, improvements have been suggested in {student_name}'s answer sheet: {feedback}"

        parent_feedback_notifications = [
            Notification(
                title=feedback_title,
                message=feedback_message_parent,
                to_user=parent.parent_user,  # Linked User for the parent
                school=student_answer_sheet.assessment_subject.school,
                module=Module.objects.get(module_name_show="assessments"),
            )
            for parent in parents if parent.parent_user
        ]

        # Bulk create feedback notifications for parents
        Notification.objects.bulk_create(parent_feedback_notifications)

        # Check if all StudentAnswerSheets for the related AssessmentSubject are reviewed
        assessment_subject = student_answer_sheet.assessment_subject
        related_sheets = StudentAnswerSheet.objects.filter(assessment_subject=assessment_subject)
        if related_sheets.exists() and not related_sheets.filter(is_reviewed=False).exists():
            # All sheets are reviewed, update the AssessmentSubject
            assessment_subject.is_reviewed = True
            assessment_subject.save()

            # **Send Marking Completion Notifications**
            paper_title = assessment_subject.paper_title
            subject_name = assessment_subject.subject.master_subject.subject_name  # Assuming 'subject' is related to Subject

            # Notification content for marking completion
            marking_title = "Results Available"
            marking_message_student = (f"Dear {student_name}, your result for {subject_name} is now available. "
                                       f"You can check your marks.")
            marking_message_parent = (f"Dear Parent, your child {student_name}'s result for {subject_name} "
                                      f"is now available. You can check the marks.")

            # Notify Students
            students = assessment_subject.student.all()  # Assuming .students is a ManyToMany relation
            student_marking_notifications = [
                Notification(
                    title=marking_title,
                    message=marking_message_student,
                    to_user=student.student_user,  # Linked User for the student
                    school=assessment_subject.school,  # Assuming assessment_subject has a reference to school
                    module=Module.objects.get(module_name_show="assessments"),
                )
                for student in students
            ]

            # Notify Parents
            parent_marking_notifications = []
            for student in students:
                parents = student.parents.all()  # ManyToMany relation to Parent model
                parent_marking_notifications.extend([
                    Notification(
                        title=marking_title,
                        message=marking_message_parent,
                        to_user=parent.parent_user,  # Linked User for the parent
                        school=assessment_subject.school,
                        module=Module.objects.get(module_name_show="assessments"),
                    )
                    for parent in parents if parent.parent_user
                ])

            # Bulk create marking completion notifications
            Notification.objects.bulk_create(student_marking_notifications + parent_marking_notifications)

            # Update the parent Assessment only if all AssessmentSubjects are reviewed
            assessment = assessment_subject.assessment
            related_subjects = assessment.assessment.all()  # Assuming related_name for AssessmentSubject in Assessment
            if not related_subjects.filter(is_reviewed=False).exists():
                assessment.is_reviewed = True
                assessment.save()
            send_notification(school_id=student_answer_sheet.assessment_subject.school.id)
        return Response({'success': _('Answer sheet has been reviewed')})

    @transaction.atomic
    @permission_required('assessments', 'view')
    @action(methods=['get'], detail=False, url_path='progress')
    def progress(self, request, *args, **kwargs):
        user = request.user

        if request.user.role.role_name in settings.SUPER_ROLE:
            school_id = request.query_params.get('school_id')
            if not school_id:
                return Response({"error": _("school_id is required.")}, status=status.HTTP_400_BAD_REQUEST)
            else:
                user = update_user_obj(request.user, school_id)

        # Validate user role
        if user.role.role_name in ['student', 'parents']:
            return Response(
                {'error': _('You do not have permission to view this endpoint.')},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Validate the user's school association
        user_school = user.school_id
        if not user_school:
            return Response(
                {'error': _('No school associated with the logged-in user.')},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Fetch assessments, applying filters
        assessments = Assessment.objects.filter(school_id=user_school).exclude(status="cancelled")

        filters = {
            'batch__id': request.query_params.get('batch'),
            'grade__id': request.query_params.get('grade'),
            'term__id': request.query_params.get('term'),
            'grade_class__id': request.query_params.get('grade_class'),
            'id': request.query_params.get('assessment')
        }
        filters = {k: v for k, v in filters.items() if v}
        assessments = assessments.filter(**filters)

        total_assessments = assessments.count()

        if total_assessments == 0:
            return Response({
                'message': _('No assessments match the applied filters.'),
                'percentages': {
                    'upcoming': 0,
                    'in_progress': 0,
                    'completed': 0,
                }
            }, status=status.HTTP_200_OK)

        # Count assessments by status
        upcoming_count = assessments.filter(ocr_status='not started').count()
        in_progress_count = assessments.filter(ocr_status='in progress').count()
        completed_count = assessments.filter(ocr_status='completed').count()

        # Calculate percentages
        upcoming_percentage = round((upcoming_count / total_assessments) * 100, 2)
        in_progress_percentage = round((in_progress_count / total_assessments) * 100, 2)
        completed_percentage = round((completed_count / total_assessments) * 100, 2)

        return Response({
            'percentages': {
                'upcoming': upcoming_percentage,
                'in_progress': in_progress_percentage,
                'completed': completed_percentage,
            }
        }, status=status.HTTP_200_OK)
    @transaction.atomic
    @permission_required('assessments', 'view')
    @action(methods=['get'], detail=False, url_path='filter-by-status')
    def get_assessments_by_status(self, request, *args, **kwargs):
        user = request.user

        if user.role.role_name in settings.SUPER_ROLE:
            school_id = request.query_params.get('school_id')
            if not school_id:
                return Response({"error": _("school_id is required.")}, status=status.HTTP_400_BAD_REQUEST)
            user = update_user_obj(user, school_id)

        if user.role.role_name in ['student', 'parents']:
            return Response({'error': _('You do not have permission to view this endpoint.')},
                            status=status.HTTP_403_FORBIDDEN)

        if not user.school_id:
            return Response({'error': _('No school associated with the logged-in user.')},
                            status=status.HTTP_400_BAD_REQUEST)

        assessments = Assessment.objects.filter(school_id=user.school_id).exclude(status="cancelled")

        # Apply query parameters
        filters = {
            'batch__id': request.query_params.get('batch'),
            'grade__id': request.query_params.get('grade'),
            'term__id': request.query_params.get('term'),
            'grade_class__id': request.query_params.get('grade_class'),
            'id': request.query_params.get('assessment')
        }
        filters = {k: v for k, v in filters.items() if v}
        assessments = assessments.filter(**filters)

        search_query = request.query_params.get('search')
        if search_query:
            assessments = assessments.filter(assessment_name__icontains=search_query)

        if not assessments.exists():
            return Response({'message': _('No assessments match the applied filters or search query.')},
                            status=status.HTTP_200_OK)

        status_filter = request.query_params.get('status')
        filtered_assessments = []

        for assessment in assessments:
            if status_filter == 'upcoming' and assessment.ocr_status == 'not started':
                filtered_assessments.append(assessment)
            elif status_filter == 'in_progress' and assessment.ocr_status == 'in progress':
                filtered_assessments.append(assessment)
            elif status_filter == 'completed' and assessment.ocr_status == 'completed':
                filtered_assessments.append(assessment)

        # Pagination
        page = self.paginate_queryset(filtered_assessments)
        if page is not None:
            serializer = AssessmentSerializerList(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = AssessmentSerializerList(filtered_assessments, many=True)
        return Response(serializer.data)

    @transaction.atomic
    @permission_required('assessments', 'view')
    @action(methods=['post'], detail=False, url_path='download')
    def download_marked_answersheet(self, request, *args, **kwargs):
        answersheet_id = request.data.get('answersheet_id')

        # Check if answersheet_id is provided
        if not answersheet_id:
            return Response({'error': _('No answersheet id was provided.')}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch the relevant answersheet and digital marking data
            answersheet = StudentAnswerSheet.objects.select_related(
                'student', 'batch', 'grade', 'grade_class', 'school',
                'assessment_subject__subject'
            ).get(id=answersheet_id)

            digital_marking = DigitalMarking.objects.filter(student_answer_sheet=answersheet).order_by('question_number')

            # Format date and duration
            assessment_start = answersheet.assessment_subject.assessment_start_datetime
            assessment_end = answersheet.assessment_subject.assessment_end_datetime

            # Calculate Assessment Duration
            duration = assessment_end - assessment_start
            duration_in_minutes = divmod(duration.total_seconds(), 60)
            hours = int(duration_in_minutes[0] // 60)
            minutes = int(duration_in_minutes[0] % 60)

            # Format Duration
            if hours > 0:
                if minutes > 0:
                    assessment_duration = f"{hours} hour {minutes} min"
                else:
                    assessment_duration = f"{hours} hour"
            else:
                assessment_duration = f"{minutes} min"
            logo = None
            if answersheet.school.logo is not None:
                logo = settings.SUPER_SCHOOL_BACKEND+"public/uploads/school/logo/"+answersheet.school.logo
            # Prepare data for the template
            data = {
                "student_name": answersheet.student.first_name + " " + answersheet.student.last_name,
                "admission_number": answersheet.student.addmission_no,
                "year": answersheet.batch.start_year,
                "term": answersheet.assessment_subject.term.term_name,
                "grade": answersheet.grade.grade_number,
                "class_name": answersheet.grade_class.name,
                "subject_name": f"{answersheet.assessment_subject.subject.master_subject.subject_name} ({answersheet.assessment_subject.subject.master_subject.subject_code})",
                # Format Date in dd-mm-yy
                "assessment_date": assessment_start.strftime('%d-%m-%y'),
                "assessment_duration": assessment_duration,  # Use formatted duration
                "total_score": f"{int(answersheet.obtained_mark) if answersheet.obtained_mark.is_integer() else answersheet.obtained_mark}/{int(answersheet.assessment_subject.paper_marks)}",
                "feedback": answersheet.feedback,
                "school_logo": logo,
                "school_name": answersheet.school.school_name,
            }

            # Process questions and collect strengths and weaknesses
            strengths = set()
            weaknesses = set()
            questions = []

            for dm in digital_marking:
                strengths.update(dm.strength_tags)
                weaknesses.update(dm.weakness_tags)

                questions.append({
                    "question_number": dm.question_number,
                    "question_text": dm.question,
                    "student_answer": dm.answer,
                    "teacher_comment": dm.teacher_reason or "No comment",
                    "ai_comment": dm.reason or "No comment",
                    # Use obtained_manual_mark if available, otherwise use obtained_mark
                    "marks": f"{int(dm.obtained_manual_mark) if dm.obtained_manual_mark is not None and dm.obtained_manual_mark.is_integer() else int(dm.obtained_mark) if dm.obtained_mark is not None and dm.obtained_mark.is_integer() else dm.obtained_mark}/{int(dm.actual_mark) if dm.actual_mark.is_integer() else dm.actual_mark}",
                    "type": "full" if (
                                          dm.obtained_manual_mark if dm.obtained_manual_mark is not None else dm.obtained_mark) == dm.actual_mark
                    else "partial" if (
                                          dm.obtained_manual_mark if dm.obtained_manual_mark is not None else dm.obtained_mark) > 0
                    else "zero"
                })

            # Add strengths and weaknesses to the data
            data["questions"] = questions
            data["strengths"] = list(strengths)[:10]
            data["weaknesses"] = list(weaknesses)[:10]

            # Generate absolute URL for assets (optional, in case of assets in the template)
            base_url = request.build_absolute_uri('/')

            # Render HTML template to string
            html_string = render_to_string('student_answersheet.html', data)

            # Create a BytesIO buffer for the PDF
            pdf_buffer = BytesIO()
            HTML(string=html_string, base_url=base_url).write_pdf(pdf_buffer)

            # Reset buffer to the beginning
            pdf_buffer.seek(0)

            # Return the PDF directly in the Response with headers for download
            response = HttpResponse(pdf_buffer.read(), content_type='application/pdf')
            response[
                'Content-Disposition'] = f'attachment; filename="{answersheet.student.first_name}_{answersheet.student.last_name}_marked_answersheet.pdf"'

            return response

        except StudentAnswerSheet.DoesNotExist:
            return Response({'error': _('Answer sheet not found.')}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)