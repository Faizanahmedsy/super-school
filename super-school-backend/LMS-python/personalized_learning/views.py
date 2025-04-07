from django.conf import settings
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action

from exam_app.models import StudentAnswerSheet, DigitalMarking
from .models import Quiz, QuizQandA, MainQuiz
from .serializers import QuizSerializer, QuizQandASerializer, QuizQandASerializerCreate, MainQuizSerializer
from nest_db_app.decorators import permission_required
from django.db import transaction
from nest_db_app.views import update_user_obj, generate_quiz_with_ai
from exam_app.pagination import GlobalPagination
from nest_db_app.models import ClassSubject, Grade, Subject, Student, Batch, Term, School, GradeClass, Teacher,Module,Notification
import json
from datetime import datetime,timedelta
from django.utils.timezone import now
from itertools import chain
from django.db.models import Count, Avg, Q,F,Sum
from django.http import JsonResponse
from django.contrib.postgres.aggregates import ArrayAgg
from django.utils.translation import gettext as _
from nest_db_app.services.notification import send_notification



class ManualQuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['main_quiz', 'student', 'title', 'subject', 'grade', 'grade_class', 'is_attempted',
        'term', 'batch', 'school', 'created_at', 'updated_at','marks_obtained'
    ]
    ordering_fields = ['is_attempted', 'created_at', 'updated_at','marks_obtained']
    pagination_class = GlobalPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        quiz_types = self.request.query_params.getlist('quiz_type')
        if quiz_types:
            queryset = queryset.filter(quiz_type__in=quiz_types)
            print(queryset)
        return queryset

    @transaction.atomic()
    @permission_required('practice_exercises', 'add')
    @action(detail=False, methods=['post'], url_path='generate-quiz', url_name='generate_quiz')
    def school_generate_quiz(self, request, *args, **kwargs):
        user = request.user

        # Handle SUPER_ROLE users
        if user.role.role_name in settings.SUPER_ROLE:
            school_id = request.query_params.get('school_id')
            if not school_id:
                return Response({"error": _("school_id is required.")}, status=status.HTTP_400_BAD_REQUEST)
            user = update_user_obj(user, school_id)



        # Extract necessary data
        quiz_qanda_data = request.data.pop('quiz_qanda', [])
        quiz_start_date_time = request.data.get('quiz_start_date_time')
        quiz_end_date_time = request.data.get('quiz_end_date_time')
        grade_id = request.data.get('grade')
        subject_id = request.data.get('subject')
        batch_id = request.data.get('batch')
        term_id = request.data.get('term')
        grade_classes = request.data.get('grade_class', [])
        number_of_questions = request.data.get('number_of_questions', 10)


        if user.role.role_name == 'teacher':
            quiz_count = MainQuiz.objects.filter(created_by=user.id,subject_id = subject_id,batch_id = batch_id).count()
            if quiz_count >= 40:
                return Response(
                    {"error": _("You have already generated 40 quizzes for this Class and Subject. You cannot generate more.")},
                    status=status.HTTP_400_BAD_REQUEST
                )
        # Validate input data
        if not quiz_start_date_time or not quiz_end_date_time:
            return Response({"error": _("Both quiz_start_date_time and quiz_end_date_time are required.")},
                            status=status.HTTP_400_BAD_REQUEST)
        if quiz_start_date_time >= quiz_end_date_time:
            return Response({"error": _("quiz_start_date_time must be earlier than quiz_end_date_time.")},
                            status=status.HTTP_400_BAD_REQUEST)
        if number_of_questions > 25:
            return Response({"error": _("Number of questions must be less than or equal to 25.")},
                            status=status.HTTP_400_BAD_REQUEST)
        if not grade_id or not subject_id:
            return Response({"error": _("Grade and subject are required.")}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(grade_classes, list) or not grade_classes:
            return Response({"error": _("grade_class must be a non-empty list.")}, status=status.HTTP_400_BAD_REQUEST)

        # Extract and process top weakness tags
        filtered_markings = DigitalMarking.objects.filter(
            student_answer_sheet__assessment_subject__subject_id=subject_id,
            student_answer_sheet__assessment_subject__term_id=term_id,
            student_answer_sheet__assessment_subject__batch_id=batch_id,
            student_answer_sheet__assessment_subject__school_id=user.school_id
        ).values_list('weakness_tags', flat=True)

        # Flatten the list and get unique tags
        unique_weakness_tags = list(set(chain.from_iterable(filtered_markings)))

        if not unique_weakness_tags:
            return Response({"error": _("No exam result found,Try generating quiz after exam")},
                            status=status.HTTP_400_BAD_REQUEST)

        # Fetch instances for foreign key fields
        try:
            grade = Grade.objects.get(id=grade_id)
            subject = Subject.objects.get(id=subject_id)
            batch = Batch.objects.get(id=batch_id)
            school = School.objects.get(id=user.school_id)
            term = Term.objects.get(id=term_id)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Generate AI-based Q&A
        ai_quiz_data = generate_quiz_with_ai(
            number_of_questions, grade.grade_number,
            subject.master_subject.subject_name,
            subject.master_subject.subject_code, unique_weakness_tags[:10]
        )
        ai_questions = ai_quiz_data.get('questions', [])
        if not ai_questions:
            return Response({"error": _("Failed to generate quiz with AI. Please try again later.")},
                            status=status.HTTP_400_BAD_REQUEST)
        quiz_topic = ai_quiz_data.get('quiz_topic')
        if not quiz_topic:
            return Response({"error": "Failed to generate quiz with AI. Please try again later."},
                            status=status.HTTP_400_BAD_REQUEST)
        quiz_qanda_data.extend(ai_questions)

        created_quizzes = []

        # Lists to collect notifications
        student_notifications = []
        parent_notifications = []

        # Process each grade class
        for grade_class_id in grade_classes:
            try:
                grade_class = GradeClass.objects.get(id=grade_class_id)
            except GradeClass.DoesNotExist:
                return Response(
                    {"error": _("GradeClass with ID %(grade_class_id)s does not exist.") % {
                        "grade_class_id": grade_class_id}},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create a separate MainQuiz for each grade_class
            main_quiz = MainQuiz.objects.create(
                title=request.data.get('title', 'AI-Generated Quiz'),
                quiz_type='ai',
                quiz_topic = quiz_topic,
                weaknesses=unique_weakness_tags[:10],
                number_of_questions=number_of_questions,
                subject=subject,
                grade=grade,
                grade_class=grade_class,
                term=term,
                batch=batch,
                school=school,
                quiz_start_date_time=quiz_start_date_time,
                quiz_end_date_time=quiz_end_date_time,
                created_by=user
            )

            # Fetch students in the grade class
            students = Student.objects.filter(
                classsubject__grade=grade,
                classsubject__grade_class=grade_class,
                classsubject__subject=subject,
                classsubject__batch=batch,
                classsubject__term_id=term_id,
            ).distinct()

            if not students.exists():
                return Response(
                    {"error": _("No students found for grade class %(grade_class_id)s.") % {
                        "grade_class_id": grade_class_id}},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create quizzes for each student and prepare notifications
            for student in students:
                quiz_data = {
                    "main_quiz": main_quiz.id,
                    "title": main_quiz.title,
                    "quiz_topic":main_quiz.quiz_topic,
                    "quiz_type": 'ai',
                    "student": student.id,
                    "grade": grade.id,
                    "subject": subject.id,
                    "grade_class": grade_class.id,
                    "term": term.id,
                    "batch": batch.id,
                    "school": school.id,
                    "quiz_start_date_time": quiz_start_date_time,
                    "quiz_end_date_time": quiz_end_date_time,
                    "number_of_questions": number_of_questions,
                }
                quiz_serializer = self.get_serializer(data=quiz_data)
                quiz_serializer.is_valid(raise_exception=True)
                quiz = quiz_serializer.save()

                # Add quiz questions
                for qanda in quiz_qanda_data:
                    qanda_data = {
                        **qanda, 'quiz': quiz.id, 'school': quiz.school.id,
                        'term': quiz.term.id, 'batch': quiz.batch.id
                    }
                    qanda_serializer = QuizQandASerializerCreate(data=qanda_data)
                    qanda_serializer.is_valid(raise_exception=True)
                    qanda_serializer.save()

                created_quizzes.append(quiz_serializer.data)

                # Prepare notifications for students
                notification_message_student = (
                    f"Dear {student.first_name} {student.last_name}, a new quiz for {subject.master_subject.subject_name} "
                    f"has been generated. Please check it."
                )
                student_notifications.append(Notification(
                    title="Quiz Generated",
                    message=notification_message_student,
                    to_user=student.student_user,
                    school=school,
                    module=Module.objects.get(module_name_show="practice_exercises"),
                ))

                # Prepare notifications for parents
                parents = student.parents.all()  # Assuming ManyToMany relation
                notification_message_parent = (
                    f"Dear Parent, a new quiz for {student.first_name} {student.last_name} in "
                    f"{subject.master_subject.subject_name} has been generated. Please check it."
                )
                for parent in parents:
                    parent_notifications.append(Notification(
                        title="Quiz Generated",
                        message=notification_message_parent,
                        to_user=parent.parent_user,
                        school=school,
                        module=Module.objects.get(module_name_show="practice_exercises"),
                    ))

        # Bulk save notifications
        Notification.objects.bulk_create(student_notifications + parent_notifications)

        send_notification(school_id=school.id)
        # Return the response
        return Response(
            {
                "message": _("Quizzes created successfully for %(num_learners)s learners.") % {
                    "num_learners": len(created_quizzes)},
                "data": created_quizzes,
            },
            status=status.HTTP_201_CREATED
        )


    @transaction.atomic()
    @permission_required('practice_exercises', 'add')
    @action(detail=False, methods=['post'], url_path='generate-self-quiz', url_name='generate_self_quiz')
    def student_generate_quiz(self, request, *args, **kwargs):
        user = request.user

        # Handle SUPER_ROLE users
        if user.role.role_name != 'student':
            return Response({"error": _( "You do not have permission to perform this action.")},
                            status=status.HTTP_403_FORBIDDEN)

        term = request.data.get('term')
        if not term:
            return Response({"error": _("Term is required.")},status=status.HTTP_400_BAD_REQUEST)

        # Extract quiz questions and other common data
        quiz_qanda_data = request.data.pop('quiz_qanda', [])
        quiz_start_date_time = request.data.get('quiz_start_date_time', now())
        quiz_end_date_time = request.data.get('quiz_end_date_time', now() + timedelta(days=7))

        request.data['school'] = user.school_id

        student = Student.objects.filter(student_user=user).first()
        quiz_count = Quiz.objects.filter(term_id=term, student=student.id, quiz_type='self').count()

        if quiz_count >= 25:
            return Response(
                {"error": _("You have already generated 25 quizzes for this TERM. You cannot generate more.")},
                status=status.HTTP_400_BAD_REQUEST
            )

        grade_id = student.grade_id
        subject_id = request.data.get('subject')
        batch_id = student.cur_batch
        term_id = request.data.get('term')
        grade_classes = student.grade_class

        request.data['batch'] = batch_id
        request.data['term'] = term_id

        top_10_weakness_tags = request.data.get('weaknesses')

        created_quizzes = []

        number_of_questions = request.data.get('number_of_questions', 10)

        if number_of_questions > 25:
            return Response(
                {"error": _("Number of questions must be less than or equal to 25.")},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not grade_id:
            return Response(
                {"error": _("grade_id required for generating quiz.")},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not subject_id:
            return Response(
                {"error": _("subject_id is required.")},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not top_10_weakness_tags:
            return Response(
                {"error": _("weaknesses is required.")},
                status=status.HTTP_400_BAD_REQUEST
            )

        grade = Grade.objects.filter(id=grade_id).first()
        subject = Subject.objects.get(id=subject_id)

        ai_quiz_data = generate_quiz_with_ai(number_of_questions, grade.grade_number,
                                             subject.master_subject.subject_name, subject.master_subject.subject_code,
                                             top_10_weakness_tags)

        # Append AI-generated questions to the existing quiz_qanda_data
        ai_questions = ai_quiz_data.get('questions', [])

        if not ai_questions:
            return Response(
                {"error": _("Failed to generate quiz with AI. Please try again later.")},
                status=status.HTTP_400_BAD_REQUEST
            )

        quiz_topic = ai_quiz_data.get('quiz_topic')
        if not quiz_topic:
            return Response({"error": "Failed to generate quiz with AI. Please try again later."},
                            status=status.HTTP_400_BAD_REQUEST)

        quiz_qanda_data.extend(ai_questions)

        # Create a MainQuiz instance
        main_quiz = MainQuiz.objects.create(
            title=request.data.get('title', 'AI-Generated Quiz'),
            quiz_type='self',
            quiz_topic=quiz_topic,
            weaknesses=top_10_weakness_tags,
            number_of_questions=number_of_questions,
            subject=subject,
            grade=grade,
            grade_class=grade_classes,
            term=Term.objects.get(id=term_id),
            batch=batch_id,
            school=School.objects.get(id=user.school_id),
            quiz_start_date_time=quiz_start_date_time,
            quiz_end_date_time=quiz_end_date_time
        )

        quiz_data = request.data.copy()
        quiz_data['student'] = student.id
        quiz_data['main_quiz'] = main_quiz.id  # Linking the quiz to the MainQuiz
        quiz_data['grade_class'] = grade_classes.id
        quiz_data['grade'] = grade.id
        quiz_data['batch'] = batch_id.id
        quiz_data['quiz_start_date_time'] = quiz_start_date_time
        quiz_data['quiz_end_date_time'] = quiz_end_date_time
        quiz_data['number_of_questions'] = number_of_questions
        quiz_data['quiz_type'] = 'self'
        quiz_data['quiz_topic'] = quiz_topic

        # Serialize and save the quiz
        quiz_serializer = self.get_serializer(data=quiz_data)
        quiz_serializer.is_valid(raise_exception=True)
        quiz = quiz_serializer.save()

        # Add quiz questions if provided (including AI-generated questions)
        if quiz_qanda_data:
            for qanda in quiz_qanda_data:
                qanda_data = qanda.copy()
                qanda_data['quiz'] = quiz.id
                qanda_data['school'] = quiz.school.id
                qanda_data['term'] = quiz.term.id
                qanda_data['batch'] = quiz.batch.id
                qanda_serializer = QuizQandASerializerCreate(data=qanda_data)
                qanda_serializer.is_valid(raise_exception=True)
                qanda_serializer.save()

        created_quizzes.append(quiz_serializer.data)
        student.quiz_count -= 1
        student.save()

        # Return the response
        return Response(
            {"message": _("Quiz generated successfully"), "data": created_quizzes},
            status=status.HTTP_201_CREATED
        )

    @transaction.atomic()
    @permission_required('practice_exercises', 'add')
    def create(self, request, *args, **kwargs):
        user = request.user

        # Handle SUPER_ROLE users
        if user.role.role_name in settings.SUPER_ROLE:
            school_id = request.query_params.get('school_id')
            if not school_id:
                return Response({"error": _("school_id is required.")}, status=status.HTTP_400_BAD_REQUEST)
            user = update_user_obj(user, school_id)

        # Extract quiz questions and other common data
        quiz_qanda_data = request.data.pop('quiz_qanda', [])
        quiz_start_date_time = request.data.get('quiz_start_date_time')
        quiz_end_date_time = request.data.get('quiz_end_date_time')

        # Validate date fields
        if not quiz_start_date_time or not quiz_end_date_time:
            return Response(
                {"error": _("Both quiz_start_date_time and quiz_end_date_time are required.")},
                status=status.HTTP_400_BAD_REQUEST
            )
        if quiz_start_date_time >= quiz_end_date_time:
            return Response(
                {"error": _("quiz_start_date_time must be earlier than quiz_end_date_time.")},
                status=status.HTTP_400_BAD_REQUEST
            )

        request.data['school'] = user.school_id
        request.data['quiz_type'] = 'school'

        if not request.data.get('quiz_topic'):
            return Response(
                {"error": "quiz_topic is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        grade_id = request.data.get('grade')
        subject_id = request.data.get('subject')
        batch_id = request.data.get('batch')
        term_id = request.data.get('term')
        grade_classes = request.data.get('grade_class', [])

        # Ensure grade_class is a list
        if not isinstance(grade_classes, list) or not grade_classes:
            return Response({"error": _("grade_class must be a non-empty list.")}, status=status.HTTP_400_BAD_REQUEST)

        created_quizzes = []

        # Fetch the necessary instances for foreign key fields
        try:
            grade = Grade.objects.get(id=grade_id)
            subject = Subject.objects.get(id=subject_id)
            batch = Batch.objects.get(id=batch_id)
            school = School.objects.get(id=user.school_id)
            term = Term.objects.get(id=term_id)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Initialize notification lists
        student_notifications = []
        parent_notifications = []

        # Iterate over the grade classes and create quizzes
        for grade_class_id in grade_classes:
            try:
                grade_class = GradeClass.objects.get(id=grade_class_id)
            except GradeClass.DoesNotExist:
                return Response(
                    {"error": _("GradeClass with ID %(grade_class_id)s does not exist.") % {
                        "grade_class_id": grade_class_id}},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create MainQuiz for each grade class
            main_quiz = MainQuiz.objects.create(
                title=request.data.get('title', 'School Generated Quiz'),
                quiz_type='school',
                quiz_topic = request.data.get('quiz_topic'),
                number_of_questions=request.data.get('number_of_questions', 10),
                subject=subject,
                grade=grade,
                grade_class=grade_class,
                term=term,
                batch=batch,
                school=school,
                quiz_start_date_time=quiz_start_date_time,
                quiz_end_date_time=quiz_end_date_time
            )

            # Fetch students in the grade class
            students = Student.objects.filter(
                classsubject__grade=grade,
                classsubject__grade_class=grade_class,
                classsubject__subject=subject,
                classsubject__batch=batch,
                classsubject__term=term,
            )

            if not students.exists():
                return Response(
                    {"error": _("No students found for grade class %(grade_class_id)s.") % {
                        "grade_class_id": grade_class_id}},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create quizzes for each student in the grade class
            for student in students:
                quiz_data = {
                    "main_quiz": main_quiz.id,
                    "title": main_quiz.title,
                    "quiz_topic": main_quiz.quiz_topic,
                    "quiz_type": 'school',
                    "student": student.id,
                    "grade": grade.id,
                    "subject": subject.id,
                    "grade_class": grade_class.id,
                    "term": term.id,
                    "batch": batch.id,
                    "school": school.id,
                    "quiz_start_date_time": quiz_start_date_time,
                    "quiz_end_date_time": quiz_end_date_time,
                    "number_of_questions": request.data.get('number_of_questions', 10),
                }
                quiz_serializer = self.get_serializer(data=quiz_data)
                quiz_serializer.is_valid(raise_exception=True)
                quiz = quiz_serializer.save()

                # Add quiz questions if provided
                if quiz_qanda_data:
                    for qanda in quiz_qanda_data:
                        qanda_data = qanda.copy()
                        qanda_data['quiz'] = quiz.id
                        qanda_data['school'] = quiz.school.id
                        qanda_data['term'] = quiz.term.id
                        qanda_data['batch'] = quiz.batch.id
                        qanda_serializer = QuizQandASerializerCreate(data=qanda_data)
                        qanda_serializer.is_valid(raise_exception=True)
                        qanda_serializer.save()

                created_quizzes.append(quiz_serializer.data)

                # Prepare notifications for the student
                notification_message_student = (
                    f"Dear {student.first_name} {student.last_name}, a new quiz titled '{main_quiz.title}' "
                    f"for {subject.master_subject.subject_name} has been assigned. Please check it."
                )
                student_notifications.append(Notification(
                    title="New Quiz Created",
                    message=notification_message_student,
                    to_user=student.student_user,
                    school=school,
                    module=Module.objects.get(module_name_show="practice_exercises"),
                ))

                # Prepare notifications for the parents of the student
                parents = student.parents.all()  # Assuming ManyToMany relation
                notification_message_parent = (
                    f"Dear Parent, a new quiz titled '{main_quiz.title}' for your child "
                    f"{student.first_name} {student.last_name} in {subject.master_subject.subject_name} has been created."
                )
                for parent in parents:
                    parent_notifications.append(Notification(
                        title="New Quiz for Your Child",
                        message=notification_message_parent,
                        to_user=parent.parent_user,
                        school=school,
                        module=Module.objects.get(module_name_show="practice_exercises"),
                    ))

        # Bulk create all notifications for students and parents
        Notification.objects.bulk_create(student_notifications + parent_notifications)
        send_notification(school_id=school.id)
        # Return the response
        return Response(
            {
                "message": _("Quizzes created successfully for %(count)d quizzes.") % {"count": len(created_quizzes)},
                "data": created_quizzes,
            },
            status=status.HTTP_201_CREATED
        )

    @transaction.atomic()
    @permission_required('practice_exercises', 'edit')
    def partial_update(self, request, pk=None, *args, **kwargs):
        """Partial update for a MainQuiz and associated QuizQandA objects."""

        # Fetch the MainQuiz object by pk (quiz id)
        try:
            main_quiz = MainQuiz.objects.get(id=pk)
        except MainQuiz.DoesNotExist:
            return Response(
                {"error": _("MainQuiz with id %(pk)s does not exist.") % {"pk": pk}},
                status=status.HTTP_404_NOT_FOUND
            )

        # Copy the request data to allow for modifications
        quiz_data = request.data.copy()

        # Update MainQuiz title if provided
        title = quiz_data.get('title', main_quiz.title)
        quiz_topic = quiz_data.get('quiz_topic', main_quiz.quiz_topic)
        main_quiz.quiz_topic = quiz_topic
        main_quiz.title = title

        # Update quiz start and end times if provided
        quiz_start_date_time = quiz_data.get('quiz_start_date_time', main_quiz.quiz_start_date_time)
        quiz_end_date_time = quiz_data.get('quiz_end_date_time', main_quiz.quiz_end_date_time)

        if quiz_start_date_time and quiz_end_date_time:
            if quiz_start_date_time >= quiz_end_date_time:
                return Response(
                    {"error": _("quiz_start_date_time must be earlier than quiz_end_date_time.")},
                    status=status.HTTP_400_BAD_REQUEST
                )

        main_quiz.quiz_start_date_time = quiz_start_date_time
        main_quiz.quiz_end_date_time = quiz_end_date_time
        main_quiz.save()

        # Update associated quizzes if any
        related_quizzes = Quiz.objects.filter(main_quiz=main_quiz)

        for quiz in related_quizzes:
            # Update quiz title and other fields
            quiz_serializer = QuizSerializer(quiz, data=quiz_data, partial=True)
            quiz_serializer.is_valid(raise_exception=True)
            quiz_serializer.save()

        # Update QuizQandA objects if provided in the payload
        questions_data = quiz_data.get('questions', [])
        updated_qandas = []

        if questions_data:
            for question in questions_data:
                qanda_id = question.get('id')

                if not qanda_id:
                    return Response(
                        {"error": _("Each QuizQandA object must include its 'id' for update.")},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                try:
                    qanda_instance = QuizQandA.objects.get(id=qanda_id, quiz__main_quiz=main_quiz)
                except QuizQandA.DoesNotExist:
                    return Response(
                        {"error": _("QuizQandA with id %(qanda_id)s does not exist for the provided MainQuiz.") % {
                            "qanda_id": qanda_id}},
                        status=status.HTTP_404_NOT_FOUND
                    )

                qanda_serializer = QuizQandASerializer(qanda_instance, data=question, partial=True)
                qanda_serializer.is_valid(raise_exception=True)
                updated_qandas.append(qanda_serializer.save())

        # Send Notifications
        student_notifications = []
        parent_notifications = []

        # Notify related students and their parents
        related_students = Student.objects.filter(
            quiz__main_quiz=main_quiz
        ).distinct()  # Ensure no duplicates

        for student in related_students:
            # Prepare and send notification for each student
            student_message = (
                f"Dear {student.first_name} {student.last_name}, the quiz '{main_quiz.title}' "
                f"has been updated. Please check the new details."
            )
            student_notifications.append(Notification(
                title="Quiz Updated",
                message=student_message,
                to_user=student.student_user,
                school=main_quiz.school,
                module=Module.objects.get(module_name_show="practice_exercises"),
            ))

            # Notify parents
            parents = student.parents.all()  # Assuming ManyToMany relation between Student and Parent
            parent_message = (
                f"Dear Parent, the quiz '{main_quiz.title}' assigned to your child "
                f"{student.first_name} {student.last_name} has been updated. Please check the new details."
            )
            for parent in parents:
                parent_notifications.append(Notification(
                    title="Quiz Updated for Your Child",
                    message=parent_message,
                    to_user=parent.parent_user,
                    school=main_quiz.school,
                    module=Module.objects.get(module_name_show="practice_exercises"),
                ))

        # Bulk create notifications
        Notification.objects.bulk_create(student_notifications + parent_notifications)
        send_notification(school_id=main_quiz.school.id)
        # Return a successful response with updated data
        return Response(
            {
                "message": _("Quiz updated successfully. Update notification sent."),
                "quiz": MainQuizSerializer(main_quiz).data,  # Use MainQuizSerializer here
                "quiz_qanda": [QuizQandASerializer(q).data for q in updated_qandas],
            },
            status=status.HTTP_200_OK
        )

    @transaction.atomic()
    @permission_required('practice_exercises', 'view')
    def list(self, request, *args, **kwargs):
        """Custom list method to return quizzes based on user role."""
        user = request.user  # Get the logged-in user
        queryset = self.filter_queryset(self.get_queryset())  # Apply default filters
        role_name = user.role.role_name
        # Filter quizzes based on user roles
        if role_name == 'student':
            batch_id = request.data.get('batch')
            student_id = Student.objects.filter(student_user=user.id).values_list('id', flat=True).first()
            queryset = queryset.filter(student_id=student_id)
        elif role_name == 'parents':
            student_id = request.data.get('student_id')
            if not student_id:
                return Response({"error": "student_id is required."}, status=status.HTTP_400_BAD_REQUEST)
            queryset = queryset.filter(student_id=student_id)
        elif role_name == 'teacher':
            teacher_user_id = Teacher.objects.filter(teacher_user=user.id).values_list('id', flat=True).first()
            subjects = ClassSubject.objects.filter(teacher_id=teacher_user_id).values_list(
                'subject_id', 'grade_id', 'grade_class_id'
            )
            queryset = queryset.filter(
                grade_id__in=[grade for _, grade, _ in subjects],
                grade_class_id__in=[grade_class for _, _, grade_class in subjects],
            )
        elif request.user.role.role_name in settings.SUPER_ROLE:
            school_id = request.query_params.get("school_id")
            if not school_id:
                return Response({"error": "school_id is required."}, status=status.HTTP_400_BAD_REQUEST)
            user = update_user_obj(user, school_id)
            queryset = queryset.filter(school_id=user.school_id)
        else:
            queryset = queryset.filter(school_id=user.school_id)

        # Calculate `duration` and `status` for each quiz and collect role-based quiz list
        quizzes = []
        current_time = now()

        # Stats initialization for MainQuiz
        total_main_quizzes = 0
        completed_main_quizzes = 0
        total_marks_obtained = 0
        total_max_marks = 0

        # Group quizzes by MainQuiz
        main_quiz_ids = queryset.values_list('main_quiz_id', flat=True).distinct()  # Get unique MainQuiz IDs
        main_quiz_queryset = MainQuiz.objects.filter(id__in=main_quiz_ids)

        for main_quiz in main_quiz_queryset:
            associated_quizzes = Quiz.objects.filter(main_quiz=main_quiz)

            # Determine if MainQuiz is "completed" (any quiz attempted OR all quizzes expired)
            all_quizzes_completed = associated_quizzes.filter(Q(is_attempted=True) | Q(quiz_end_date_time__lt=current_time)).exists()
            if all_quizzes_completed:
                completed_main_quizzes += 1

            # Aggregate marks for this MainQuiz
            marks_obtained = associated_quizzes.aggregate(Sum('marks_obtained'))['marks_obtained__sum'] or 0
            max_marks = associated_quizzes.aggregate(Sum('number_of_questions'))['number_of_questions__sum'] or 0

            # Increment total stats
            total_marks_obtained += marks_obtained
            total_max_marks += max_marks

        # Set total MainQuizzes
        total_main_quizzes = main_quiz_queryset.count()

        # Calculate Average Marks
        average_marks = f"{total_marks_obtained} out of {total_max_marks}" if total_max_marks > 0 else "0 out of 0"

        # Quiz-wise data for role-based list
        for quiz in queryset:
            quiz_data = self.get_serializer(quiz).data  # Serialize quiz

            # Calculate duration
            start_time = quiz.quiz_start_date_time
            end_time = quiz.quiz_end_date_time
            duration_minutes = (end_time - start_time).total_seconds() / 60  # Duration in minutes
            hours = int(duration_minutes // 60)
            minutes = int(duration_minutes % 60)

            quiz_data['duration'] = f"{hours}h{minutes}min" if hours > 0 else f"{minutes}min"

            # Determine status
            if current_time < start_time:
                quiz_data['status'] = 'upcoming'
            elif start_time <= current_time <= end_time:
                quiz_data['status'] = 'ongoing'
            else:
                quiz_data['status'] = 'ended'

            # Get student rank
            if role_name == 'student':
                student_id = Student.objects.filter(student_user=user.id).first().id
                student_grade = ClassSubject.objects.filter(students__id=student_id,batch=batch_id).first()
                student_grade_class = ClassSubject.objects.filter(students__id=student_id,batch=batch_id).first()
                # Calculate rank
                class_quiz_marks = Quiz.objects.filter(
                    main_quiz_id=quiz.main_quiz_id,
                    grade_class_id=student_grade_class
                ).order_by('-marks_obtained')

                class_rank = 0  # Default rank if no other students in class
                for idx, q in enumerate(class_quiz_marks, start=1):
                    if q.student_id == student_id:
                        class_rank = idx
                        break

                # Calculate rank in grade
                grade_quiz_marks = Quiz.objects.filter(
                    main_quiz_id=quiz.main_quiz_id,
                    grade_id=student_grade
                ).order_by('-marks_obtained')

                grade_rank = 1  # Default rank if no other students in grade
                for idx, q in enumerate(grade_quiz_marks, start=1):
                    if q.student_id == student_id:
                        grade_rank = idx
                        break

                # Add ranks to quiz data
                quiz_data['class_rank'] = class_rank
                quiz_data['grade_rank'] = grade_rank

            quizzes.append(quiz_data)

        # Overview stats (based on MainQuiz)
        overview = {
            'num_of_generated': total_main_quizzes,
            'num_of_completed': f"{completed_main_quizzes} out of {total_main_quizzes}",
            'average_marks': average_marks,
        }

        # Apply pagination
        page = self.paginate_queryset(quizzes)
        if page is not None:
            return self.get_paginated_response({
                'overview': overview,
                'quizzes': page
            })

        # Response if no pagination
        return Response({
            'overview': overview,
            'quizzes': quizzes
        }, status=status.HTTP_200_OK)

    @transaction.atomic()
    @permission_required('practice_exercises', 'view')
    def retrieve(self, request, *args, **kwargs):
        """Custom retrieve method to fetch a single quiz and its QuizQandA objects based on user role."""
        user = request.user  # Get the logged-in user
        student_id = Student.objects.filter(student_user=user.id).values_list('id', flat=True).first()
        quiz = self.get_object()
        role_name = user.role.role_name
        # Check access based on role
        if role_name == 'student':
            # Ensure the quiz belongs to the logged-in student
            if quiz.student_id != student_id:
                return Response({"error": "You do not have permission to view this quiz."}, status=status.HTTP_403_FORBIDDEN)

        elif role_name == 'parents':
            # Parents must provide the student_id and ensure the quiz belongs to their child
            student_id = request.query_params.get('student_id')
            if not student_id:
                return Response({"error": "student_id is required."}, status=status.HTTP_400_BAD_REQUEST)
            if quiz.student_id != int(student_id):
                return Response({"error": "You do not have permission to view this quiz."}, status=status.HTTP_403_FORBIDDEN)

        elif role_name == 'teacher':
            # Teachers can access quizzes for their assigned classes and subjects
            teacher_id = Teacher.objects.filter(teacher_user=user.id).values_list('id', flat=True).first()
            subjects = ClassSubject.objects.filter(teacher_id=teacher_id).values_list('subject_id', 'grade_id', 'grade_class_id')
            valid_subjects = [(sub, grade, grade_class) for sub, grade, grade_class in subjects]
            if (quiz.subject_id, quiz.grade_id, quiz.grade_class_id) not in valid_subjects:
                return Response({"error": "You do not have permission to view this quiz."}, status=status.HTTP_403_FORBIDDEN)

        elif user.role.role_name in settings.SUPER_ROLE:
            school_id = request.query_params.get('school_id')
            if not school_id:
                return Response({"error": "school_id is required."}, status=status.HTTP_400_BAD_REQUEST)
            user = update_user_obj(user, school_id)
        else:
            # Other roles can access quizzes for their school
            if quiz.school_id != user.school_id:
                return Response({"error": "You do not have permission to view this quiz."}, status=status.HTTP_403_FORBIDDEN)

        # Fetch the related QuizQandA objects
        quiz_qanda = QuizQandA.objects.filter(quiz=quiz)

        # Serialize the quiz and related QuizQandA objects
        quiz_serializer = self.get_serializer(quiz)
        if role_name in ['student', 'parents']:
            if quiz.is_attempted:
                quiz_qanda_serializer = QuizQandASerializerCreate(quiz_qanda, many=True)
            else:
                quiz_qanda_serializer = QuizQandASerializer(quiz_qanda, many=True)
        else:
            quiz_qanda_serializer = QuizQandASerializerCreate(quiz_qanda, many=True)
        return Response(
            {
                "quiz": quiz_serializer.data,
                "quiz_qanda": quiz_qanda_serializer.data,
            },
            status=status.HTTP_200_OK
        )

    from datetime import datetime

    @transaction.atomic
    @permission_required('practice_exercises', 'edit')
    @action(detail=False, methods=['patch'], url_path='attempt-quiz', url_name='attempt_quiz')
    def attempt_quiz(self, request):
        quiz_id = request.data.get('quiz_id')
        student_id = Student.objects.filter(student_user=request.user.id).values_list('id', flat=True).first()

        if request.user.role.role_name != 'student':
            return Response({"error": "You do not have permission to perform this action."},
                            status=status.HTTP_403_FORBIDDEN)

        if not quiz_id:
            return Response({"error": "quiz_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        quiz = Quiz.objects.filter(id=quiz_id, student_id=student_id).first()
        if not quiz:
            return Response({"error": "Invalid Quiz ID."}, status=status.HTTP_404_NOT_FOUND)

        # Check if the quiz end time has passed
        if quiz.quiz_end_date_time < now():
            return Response({"error": "This quiz has already ended. You cannot attempt it now."},
                            status=status.HTTP_400_BAD_REQUEST)

        quiz_questions = QuizQandA.objects.filter(quiz=quiz)

        answers = request.data.get('answers', [])
        if not isinstance(answers, list) or not answers:
            return Response({"error": "Answers are required and must be a list."}, status=status.HTTP_400_BAD_REQUEST)

        response_data = []
        correct_count = 0

        for answer in answers:
            question_id = answer.get('question_id')
            student_answers = answer.get('student_answers')

            if not question_id or not isinstance(student_answers, list):
                return Response(
                    {"error": "Each answer must include 'question_id' and 'student_answers' as a list."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            quiz_qanda = quiz_questions.filter(id=question_id).first()
            if not quiz_qanda:
                return Response({"error": f"Question with ID {question_id} not found."},
                                status=status.HTTP_404_NOT_FOUND)

            is_correct = set(student_answers) == set(quiz_qanda.actual_answers)
            if is_correct:
                correct_count += 1

            quiz_qanda.student_answers = student_answers
            quiz_qanda.is_correct = is_correct
            quiz_qanda.save()

            response_data.append({
                "question_id": question_id,
                "is_correct": is_correct,
            })

        quiz.is_attempted = True
        quiz.marks_obtained = correct_count
        quiz.save()

        return Response({
            "quiz_id": quiz_id,
            "obtained_marks": correct_count,
            "total_questions": len(quiz_questions),
            "details": response_data,
        }, status=status.HTTP_200_OK)



    @transaction.atomic
    @permission_required('practice_exercises', 'view')
    @action(detail=False, methods=['get'], url_path='main-quiz', url_name='main_quiz')
    def main_quiz_list(self, request, *args, **kwargs):
        user = request.user  # Get the logged-in user
        queryset = MainQuiz.objects.all()
        quiz_types = request.query_params.getlist('quiz_type')
        if quiz_types:
            queryset = queryset.filter(quiz_type__in=quiz_types)
        # Apply role-based filtering
        role_name = user.role.role_name
        if role_name == 'student':
            student_id = Student.objects.filter(student_user=user.id).values_list('id', flat=True).first()
            queryset = queryset.filter(quiz__student_id=student_id)
        elif role_name == 'parents':
            student_id = request.query_params.get('student_id')
            if not student_id:
                return Response({"error": "student_id is required."}, status=status.HTTP_400_BAD_REQUEST)
            queryset = queryset.filter(quiz__student_id=student_id)
        elif role_name == 'teacher':
            teacher_user_id = Teacher.objects.filter(teacher_user=user.id).values_list('id', flat=True).first()
            subjects = ClassSubject.objects.filter(teacher_id=teacher_user_id).values_list('subject_id', 'grade_id',
                                                                                           'grade_class_id')
            queryset = queryset.filter(
                grade_id__in=[grade for _, grade, _ in subjects],
                grade_class_id__in=[grade_class for _, _, grade_class in subjects],
            )
        elif request.user.role.role_name in settings.SUPER_ROLE:
            school_id = request.query_params.get("school_id")
            if not school_id:
                return Response({"error": "school_id is required."}, status=status.HTTP_400_BAD_REQUEST)
            user = update_user_obj(user, school_id)
            queryset = queryset.filter(school_id=user.school_id)
        else:
            queryset = queryset.filter(school_id=user.school_id)

        if not queryset:
            return Response({"error": "No quizzes found."}, status=status.HTTP_404_NOT_FOUND)

        # Apply filters from the URL query parameters
        filters = {key: value for key, value in request.query_params.items() if key in self.filterset_fields}
        queryset = queryset.filter(**filters)

        # Compute stats based on MainQuiz (higher-level aggregation)
        total_main_quizzes = queryset.count()  # Total main quizzes

        # Determine completed main quizzes: Either attempted or all quizzes' time has ended
        completed_main_quizzes = 0
        for main_quiz in queryset:
            quizzes = Quiz.objects.filter(main_quiz=main_quiz)
            # Check if all quizzes have either been attempted or are time-expired
            if quizzes.filter(Q(is_attempted=True) | Q(quiz_end_date_time__lt=now())).exists():
                completed_main_quizzes += 1

        # Calculate the average percentage instead of raw marks
        quizzes_with_percentages = Quiz.objects.filter(main_quiz__in=queryset, is_attempted=True).annotate(
            percentage=100.0 * F("marks_obtained") / F("number_of_questions")
        ).aggregate(avg_percentage=Avg("percentage"))

        average_percentage = quizzes_with_percentages["avg_percentage"] or 0
        average_marks = int(average_percentage) if average_percentage.is_integer() else round(average_percentage, 2)
        average_marks = f"{average_marks}%"  # Format to two decimal places

        # Apply pagination
        paginator = self.pagination_class()  # Use the pagination class defined in your view
        page = paginator.paginate_queryset(queryset, request)

        main_quiz_data = []

        # Process paginated data or all data based on filtering
        quizzes_to_process = page if page is not None else queryset
        for main_quiz in quizzes_to_process:
            quizzes = Quiz.objects.filter(main_quiz=main_quiz)

            # Get the number of students who are assigned the quiz
            total_students = quizzes.aggregate(num_students=Count('student', distinct=True))

            # Get the number of students who attended the quiz (attempted)
            attended_students = quizzes.aggregate(
                num_attended=Count('student', distinct=True, filter=Q(is_attempted=True)))

            # Get the average marks for all quizzes associated with this MainQuiz
            average_marks_for_quiz = quizzes.aggregate(avg_marks=Avg('marks_obtained'))
            # Get the number of questions from one of the quizzes
            number_of_questions = quizzes.first().number_of_questions if quizzes.exists() else 0

            # Get the quiz type
            quiz_type = quizzes.first().quiz_type if quizzes.exists() else 'unknown'
            # Get the grade and grade class for this main_quiz
            grade = main_quiz.grade
            grade_class = main_quiz.grade_class

            main_quiz_data.append({
                'id': main_quiz.id,
                'title': main_quiz.title,
                'quiz_topic': main_quiz.quiz_topic,
                'average_marks': average_marks_for_quiz['avg_marks'] or 0,  # Default to 0 if no marks available
                'num_students': total_students['num_students'] or 0,
                'num_attended_students': attended_students['num_attended'] or 0,
                'number_of_questions': number_of_questions,
                'quiz_type': quiz_type,
                'subject_id': main_quiz.subject_id,
                'subject': main_quiz.subject.master_subject.subject_name if main_quiz.subject else 'unknown',
                'grade_id': grade.id if grade else None,
                'grade': grade.grade_number if grade else None,
                'grade_class_id': grade_class.id if grade_class else None,
                'grade_class': grade_class.name if grade_class else None,
                'start_date': main_quiz.quiz_start_date_time,
                'end_date': main_quiz.quiz_end_date_time,
            })
        # Define overview stats (based on MainQuiz IDs)
        overview = {
            'num_of_generated': total_main_quizzes,
            'num_of_completed': f"{completed_main_quizzes}/{total_main_quizzes}",
            'average_marks': average_marks,  # New percentage-based average marks
        }

        # If paginated, return paginated response with overview
        if page is not None:
            response_data = {
                'overview': overview,
                'main_quizzes': main_quiz_data,
            }
            return paginator.get_paginated_response(response_data)

        # Otherwise, return all main quiz data with overview
        return Response({
            'overview': overview,
            'main_quizzes': main_quiz_data,
        }, status=status.HTTP_200_OK)

    @transaction.atomic
    @permission_required('practice_exercises', 'view')  # Ensure the user has permission to view quizzes
    @action(detail=False, methods=['get'], url_path='main-quiz/(?P<pk>[^/.]+)', url_name='main_quiz')
    def main_quiz_retrieve(self, request, *args, **kwargs):
        if request.user.role.role_name in ['student','parents']:
            return Response({"error": "You do not have permission to view main quiz."},
                            status=status.HTTP_403_FORBIDDEN)
        # Extract the main_quiz_id from URL parameters
        main_quiz_id = kwargs.get('pk')
        if not main_quiz_id:
            return Response({"error": "main_quiz_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch the MainQuiz instance
            main_quiz = MainQuiz.objects.filter(id=main_quiz_id).first()
        except Exception as e:
            return Response({"error": "MainQuiz not found."}, status=status.HTTP_404_NOT_FOUND)

        # Get the first associated Quiz instance for this MainQuiz
        try:
            quiz = Quiz.objects.filter(main_quiz=main_quiz).first()
        except Exception as e:
            return Response({"error": "No Quiz found for this MainQuiz."}, status=status.HTTP_404_NOT_FOUND)

        # Fetch associated QuizQandA for this Quiz
        quiz_qanda_data = QuizQandA.objects.filter(quiz=quiz)
        # Manually construct the response data
        response_data = {
            'main_quiz': {
                'id': main_quiz.id,
                'title': main_quiz.title,
                'quiz_type': main_quiz.quiz_type,
                'quiz_topic': main_quiz.quiz_topic,
                'weaknesses': main_quiz.weaknesses,
                'number_of_questions': main_quiz.number_of_questions,
                'subject': main_quiz.subject.id,  # Assuming subject has a name attribute
                'subject_name': main_quiz.subject.master_subject.subject_name,
                'grade': main_quiz.grade.grade_number,  # Assuming grade has a grade_number attribute
                'grade_class': main_quiz.grade_class.name,
                'quiz_start_date_time': main_quiz.quiz_start_date_time,
                'quiz_end_date_time': main_quiz.quiz_end_date_time,
            },
            'quiz_qanda': []
        }

        # Loop through QuizQandA data to construct quiz_qanda details
        for qanda in quiz_qanda_data:
            response_data['quiz_qanda'].append({
                'id': qanda.id,
                'question': qanda.question,
                'actual_answer': qanda.actual_answers,
                'quiz': qanda.quiz.id,
                'school': qanda.school.id,
                'term': qanda.term.id,
                'batch': qanda.batch.id,
                'options': qanda.options,
                'multi_choice':qanda.multi_choice
            })

        return Response(response_data, status=status.HTTP_200_OK)

    @permission_required('practice_exercises', 'view')  # Ensure the user has permission to view quizzes
    @action(detail=False, methods=['get'], url_path='student-stats', url_name='student-stats')
    def subject_stats(self, request, *args, **kwargs):
        user = request.user
        school_id = user.school_id  # Ensure only data from this school is processed

        # Determine `student_id` based on role
        if user.role.role_name in ['student', 'parents']:
            if user.role.role_name == 'parents':
                # Fetch student_id from query params for parents
                student_id = request.query_params.get('student_id')
                if not student_id:
                    return Response(
                        {"error": "Missing student_id for parent role."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                # For students, the student's user ID is used
                student_id = Student.objects.filter(student_user=user.id).values_list('id', flat=True).first()
            # Filter quizzes based on school_id and student_id
            filtered_quizzes = self.filter_queryset(self.get_queryset()).filter(
                school_id=school_id,
                student_id=student_id
            )
        else:
            # For others, only filter by school_id
            filtered_quizzes = self.filter_queryset(self.get_queryset()).filter(
                school_id=school_id
            )

        # Ensure there are quizzes to process
        if not filtered_quizzes.exists():
            return Response(
                {"error": "Stats not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Calculate subject statistics
        subject_stats = filtered_quizzes.filter(
            school_id=school_id  # Explicitly filter by school_id again
        ).values(
            'subject_id',
            'subject__master_subject__subject_name',
            'subject__master_subject__subject_code'
        ).annotate(
            total_marks_obtained=Sum('marks_obtained'),
            total_max_marks=Sum('number_of_questions'),
            quiz_count=Count('id')
        )

        aggregated_subjects = {}

        # Process each subject's statistics
        for subject_data in subject_stats:
            subject_id = subject_data['subject_id']
            subject_name = subject_data['subject__master_subject__subject_name']
            subject_code = subject_data['subject__master_subject__subject_code']
            total_marks_obtained = subject_data['total_marks_obtained'] or 0
            total_max_marks = subject_data['total_max_marks'] or 1  # Avoid division by zero

            # Calculate average percentage
            avg_mark_percentage = (total_marks_obtained / total_max_marks) * 100

            # Improvement calculation
            subject_quizzes = filtered_quizzes.filter(
                subject_id=subject_id,
                school_id=school_id
            ).order_by('-quiz_start_date_time')

            if subject_quizzes.count() >= 2:
                latest_quiz = subject_quizzes[0]
                previous_quiz = subject_quizzes[1]

                latest_marks = latest_quiz.marks_obtained or 0
                previous_marks = previous_quiz.marks_obtained or 0
                latest_questions = latest_quiz.number_of_questions or 1

                improvement_percentage = ((latest_marks - previous_marks) / latest_questions) * 100
            else:
                improvement_percentage = 0

            # Calculate top students
            top_students = filtered_quizzes.filter(
                subject_id=subject_id,
                school_id=school_id
            ).values(
                'student_id',
                'student__first_name',
                'student__last_name'
            ).annotate(
                total_marks_obtained=Sum('marks_obtained'),
                total_max_marks=Sum('number_of_questions')
            ).order_by('-total_marks_obtained')

            unique_top_students = {}
            for student in top_students:
                student_id = student['student_id']
                student_total_marks = student['total_marks_obtained'] or 0
                student_max_marks = student['total_max_marks'] or 1  # Avoid division by zero
                avg_percentage = (student_total_marks / student_max_marks) * 100

                if student_id not in unique_top_students:
                    unique_top_students[student_id] = {
                        'first_name': student.get('student__first_name', 'Unknown'),
                        'last_name': student.get('student__last_name', ''),
                        'average_marks_percentage': round(avg_percentage, 2)
                    }

            # Limit to top 5 students
            top_students_data = sorted(
                unique_top_students.values(),
                key=lambda x: x['average_marks_percentage'],
                reverse=True
            )[:5]

            # Add aggregated subject data
            aggregated_subjects[subject_id] = {
                'subject_id': subject_id,
                'subject_name': subject_name,
                'subject_code': subject_code,
                'average_mark_percentage': round(avg_mark_percentage, 2),
                'improvement_percentage': round(improvement_percentage, 2),
                'top_students': top_students_data,
            }

        # Organize results for final response
        subjects_performance = list(aggregated_subjects.values())

        if not subjects_performance:
            return Response(
                {"error": "No subjects found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Top-performing and low-performing subjects
        max_avg_percentage = max(subject['average_mark_percentage'] for subject in subjects_performance)
        min_avg_percentage = min(subject['average_mark_percentage'] for subject in subjects_performance)

        # Filter by max and min average_mark_percentage
        top_performing_subjects = [
            subject for subject in subjects_performance if subject['average_mark_percentage'] == max_avg_percentage
        ]
        low_performing_subjects = [
            subject for subject in subjects_performance if subject['average_mark_percentage'] == min_avg_percentage
        ]

        # Overview
        total_quizzes_generated = filtered_quizzes.count()
        total_quizzes_completed = filtered_quizzes.filter(is_attempted=True).count()
        improvement_rate = (
            sum(subject['improvement_percentage'] for subject in subjects_performance) / len(subjects_performance)
            if subjects_performance else 0
        )
        overview_data = {
            "quizzes_generated": total_quizzes_generated,
            "quizzes_completed": total_quizzes_completed,
            "improvement_rate": round(improvement_rate, 2)
        }

        # Final response
        return Response({
            "overview": overview_data,
            "subject_performance_insights": subjects_performance,
            "top_performing_subjects": [
                {
                    'subject_id': subject['subject_id'],
                    'subject_name': subject['subject_name'],
                    'subject_code': subject['subject_code'],
                    'average_mark_percentage': subject['average_mark_percentage']
                } for subject in top_performing_subjects
            ],
            "low_performing_subjects": [
                {
                    'subject_id': subject['subject_id'],
                    'subject_name': subject['subject_name'],
                    'subject_code': subject['subject_code'],
                    'average_mark_percentage': subject['average_mark_percentage']
                } for subject in low_performing_subjects
            ],
        })



    @action(detail=False, methods=['get'], url_path='strengths-weaknesses', url_name='strengths_weaknesses')
    @permission_required('practice_exercises', 'view')
    def strengths_and_weaknesses(self, request, *args, **kwargs):
        user = request.user
        if request.user.role.role_name in settings.SUPER_ROLE:
            school_id = request.query_params.get("school_id")
            if not school_id:
                return Response({"error": "school_id is required."}, status=status.HTTP_400_BAD_REQUEST)
            user = update_user_obj(user,school_id)

        # Extract query parameters for filters
        grade = request.query_params.get("grade")
        grade_class = request.query_params.get("grade_class")
        batch = request.query_params.get("batch")
        term = request.query_params.get("term")
        student = request.query_params.get("student")
        subject = request.query_params.get("subject")

        # Build a Q object for filters in StudentAnswerSheet
        filters = Q(student__school=user.school)  # Always filter by the user's school

        # Dynamically apply filters only if they are provided
        if grade:
            filters &= Q(grade_id=grade)
        if grade_class:
            filters &= Q(grade_class_id=grade_class)
        if batch:
            filters &= Q(batch_id=batch)
        if term:
            filters &= Q(term_id=term)
        if student:
            filters &= Q(student_id=student)
        if subject:
            filters &= Q(assessment_subject__subject__id=subject)

        # If the user is logged in as a student, restrict results to their data
        if user.role.role_name.lower() == "student":
            studen_id = Student.objects.get(student_user=user).id
            filters &= Q(student_id=studen_id)

        # Query StudentAnswerSheet based on the filters
        answer_sheets = StudentAnswerSheet.objects.filter(filters)
        # If no data is found in StudentAnswerSheet, return empty results
        if not answer_sheets.exists():
            return Response(
                {
                    "message": "No data found matching the specified filters.",
                    "filters_applied": {
                        "grade": grade,
                        "grade_class": grade_class,
                        "batch": batch,
                        "term": term,
                        "student": student,
                        "subject": subject
                    },
                    "strengths": [],
                    "strengths_count": 0,
                    "weaknesses": [],
                    "weaknesses_count": 0
                },
                status=200,
            )

        # Fetch all associated DigitalMarking data based on StudentAnswerSheet IDs
        answer_sheet_ids = answer_sheets.values_list("id", flat=True)
        digital_markings = DigitalMarking.objects.filter(student_answer_sheet_id__in=answer_sheet_ids)

        # Ensure the data exists in DigitalMarking
        if not digital_markings.exists():
            return Response(
                {
                    "message": "Strengths and weaknesses could not be retrieved due to missing digital marking data.",
                    "filters_applied": {
                        "grade": grade,
                        "grade_class": grade_class,
                        "batch": batch,
                        "term": term,
                        "student": student,
                        "subject": subject
                    },
                    "strengths": [],
                    "strengths_count": 0,
                    "weaknesses": [],
                    "weaknesses_count": 0
                },
                status=200,
            )

        # Collect and merge all strength and weakness tags
        strengths = set()
        weaknesses = set()

        for marking in digital_markings:
            # Extract tags and avoid duplicates
            strengths.update(marking.strength_tags)
            weaknesses.update(marking.weakness_tags)

        # Convert to sorted lists for consistent output
        strengths = sorted(list(strengths))
        weaknesses = sorted(list(weaknesses))

        # Return strengths and weaknesses along with the applied filters
        return Response(
            {
                "message": _("Strengths and weaknesses retrieved successfully."),
                "filters_applied": {
                    "grade": grade,
                    "grade_class": grade_class,
                    "batch": batch,
                    "term": term,
                    "student": student,
                    "subject": subject
                },
                "strengths": strengths,
                "strengths_count": len(strengths),
                "weaknesses": weaknesses,
                "weaknesses_count": len(weaknesses)

            },
            status=200,
        )

    @action(detail=False, methods=['get'], url_path='quiz-count', url_name='quiz_count')
    @permission_required('practice_exercises', 'view')
    def quiz_count(self,request, *args ,**kwargs):
        user = request.user

        if user.role.role_name == "student":
            term = request.query_params.get('term_id')
            if not term:
                return Response({'error': 'term_id is required'}, status=403)

            batch_id = request.query_params.get('batch_id')
            if not batch_id:
                return Response({'error': 'batch_id is required'}, status=403)
            student_id = Student.objects.filter(student_user=user.id).values_list('id', flat=True).first()
            quiz_count = Quiz.objects.filter(student_id =student_id,term=term,quiz_type='self',batch_id=batch_id).count()

        if user.role.role_name == "teacher":
            subject = request.query_params.get('subject_id')
            if not subject:
                return Response({'error': 'subject_id is required'}, status=403)

            batch_id = request.query_params.get('batch_id')
            if not batch_id:
                return Response({'error': 'batch_id is required'}, status=403)
            quiz_count = MainQuiz.objects.filter(created_by =user.id,subject_id=subject,quiz_type="ai",batch_id=batch_id).count()


        return Response({'quiz_count': quiz_count},status=200)