from django.db.models import Count
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets
from django.conf import settings

from nest_db_app.models import *
from nest_db_app.decorators import permission_required
from exam_app.models import *
from django.db.models import Case, When, Count, F, IntegerField, Max, Sum , Q
from django.http import JsonResponse

from personalized_learning.models import MainQuiz, Quiz
from datetime import datetime, timedelta
from django.db.models.functions import TruncDate
from django.utils.translation import gettext as _, activate

class DashboardViewset(viewsets.GenericViewSet):


    @action(
        detail=False,
        methods=["GET"],
        url_path="subjects-per-grade",
        url_name="subjects_per_grade",
    )
    @permission_required('dashboard', 'view')
    def subjects_per_grade(self, request, *args, **kwargs):
        SUPER_ROLE = getattr(settings, "SUPER_ROLE", None)

        # Determine the school_id
        if request.user.role.role_name not in SUPER_ROLE:
            school_id = request.user.school.id
        else:
            school_id = request.GET.get("school_id")

        if not school_id:
            return Response({"error": "school_id must be provided"}, status=400)

        # **Step 1: Count total unique subjects in the entire school**
        total_subjects_in_school = Subject.objects.filter(school_id=school_id).distinct().count()

        # **Step 2: Count subjects per grade and include subject names**
        subjects_per_grade = (
            Subject.objects.filter(school_id=school_id)
            .values("grade__grade_number")
            .annotate(total_subjects_in_grade=Count("id", distinct=True))
            .order_by("grade__grade_number")
        )

        # Convert subjects_per_grade to a list
        subjects_per_grade_list = list(subjects_per_grade)

        # **Step 3: Add all subject names per grade**
        for grade_entry in subjects_per_grade_list:
            grade_number = grade_entry["grade__grade_number"]
            subject_names = (
                Subject.objects.filter(school_id=school_id, grade__grade_number=grade_number)
                .values_list("master_subject__subject_name", flat=True)
                .distinct()
            )
            grade_entry["subject_names"] = list(subject_names)  # Add subject names to the response

        # Prepare response
        response_data = {
            "total_subjects_in_school": total_subjects_in_school,
            "subjects_per_grade": subjects_per_grade_list
        }

        return Response(response_data)

    @action(
        detail=False,
        methods=["GET"],
        url_path="student-per-grade",
        url_name="student_per_grade",
    )
    @permission_required('dashboard', 'view')
    def student_per_grade(self, request, *args, **kwargs):
        """
        API to fetch the number of students per grade filtered by year and school.
        """
        SUPER_ROLE = getattr(settings, "SUPER_ROLE", None)

        filters = {}

        if request.user.role.role_name not in SUPER_ROLE:
            school_id = request.user.school.id
        else:
            school_id = request.GET.get("school_id")

        if not school_id:
            return Response({"error": _("school_id must be provided")}, status=400)

        filters["school_id"] = school_id

        year = request.GET.get("year")
        if year:
            filters["cur_batch__start_year"] = year

        data = (
            Student.objects.filter(**filters)
            .values("grade__grade_number")
            .annotate(student_count=Count("id"))
            .order_by("grade__grade_number")
        )

        result = [
            {"grade": entry["grade__grade_number"], "student_count": entry["student_count"]}
            for entry in data
        ]

        return Response(result)

    @action(
        detail=False,
        methods=["GET"],
        url_path="teachers-per-grade",
        url_name="teachers_per_grade",
    )
    @permission_required('dashboard', 'view')
    def teachers_per_grade(self, request, *args, **kwargs):
        """
        API to fetch the number of teachers per grade filtered by year and school.
        """
        # Get the SUPER_ROLE constant (e.g., for super admin users)
        SUPER_ROLE = getattr(settings, "SUPER_ROLE", None)

        # Initialize filters
        filters = {}

        # Filter by school
        if request.user.role.role_name not in SUPER_ROLE:  # User is an admin, not super admin
            # Get school_id from the user's associated school
            school_id = request.user.school.id
        else:  # If SUPER_ROLE, fetch school_id from query parameters
            school_id = request.GET.get("school_id")

        if not school_id:
            return Response({"error": _("school_id must be provided")}, status=400)

        filters["school_id"] = school_id

        # Filter by year (via Batch associated with ClassSubject)
        year = request.GET.get("year")
        if year:  # Add year filter if provided
            filters["batch__start_year"] = year

        # Fetch teacher count grouped by grade
        data = (
            ClassSubject.objects.filter(**filters)
            .values("grade__grade_number")  # Group by grade number
            .annotate(teacher_count=Count("teacher", distinct=True))  # Count distinct teachers per grade
            .order_by("grade__grade_number")  # Order by ascending grade number
        )

        # Prepare the response for graph usage
        result = [
            {"grade": entry["grade__grade_number"], "teacher_count": entry["teacher_count"]}
            for entry in data
        ]

        return Response(result)


    @action(
        detail=False,
        methods=["GET"],
        url_path="students-per-subject",
        url_name="students_per_subject",
    )
    @permission_required('dashboard', 'view')
    def students_per_subject(self, request, *args, **kwargs):
        """
        API to fetch number of students per subject for a specific grade.
        Filters:
          - grade_id: required
          - school_id: required for super admin
          - year: optional
        """
        # Fetch the SUPER_ROLE constant from settings
        SUPER_ROLE = getattr(settings, "SUPER_ROLE", None)

        # Initialize filters
        filters = {}

        # Filter by school
        if request.user.role.role_name not in SUPER_ROLE:  # For admin users
            school_id = request.user.school.id
        else:  # For super admins
            school_id = request.GET.get("school_id")

        if not school_id:
            return Response({"error": _("school_id must be provided")}, status=400)

        filters["school_id"] = school_id

        # Filter by year (batch__start_year if available in ClassSubject model)
        year = request.GET.get("year")
        if year:
            filters["batch__start_year"] = year

        # Filter by grade (grade_id must be provided)
        grade_id = request.GET.get("grade_id")
        if not grade_id:
            return Response({"error": _("grade_id must be provided")}, status=400)

        filters["grade_id"] = grade_id

        # Query ClassSubject to count students per subject
        data = (
            ClassSubject.objects.filter(**filters)
            .values(
                "subject__master_subject__subject_name",  # Subject name
                "subject__master_subject__subject_code",  # Subject code
            )
            .annotate(student_count=Count("students", distinct=True))  # Count distinct students
            .order_by("subject__master_subject__subject_name")  # Order by subject name
        )

        # Prepare the response
        result = [
            {
                "subject_name": entry["subject__master_subject__subject_name"],
                "subject_code": entry["subject__master_subject__subject_code"],
                "student_count": entry["student_count"],
            }
            for entry in data
        ]

        return Response(result)


    @action(
        detail=False,
        methods=["GET"],
        url_path="subject-pass-fail-rate",
        url_name="subject_pass_fail_rate",
    )
    @permission_required('dashboard', 'view')
    def grades_pass_fail_rate(self, request, *args, **kwargs):
        """
        API to calculate overall pass and fail rates per grade.
        Similar to subject_pass_fail_rate but grouped by grade.
        """
        try:
            # Fetch the SUPER_ROLE constant from settings
            SUPER_ROLE = getattr(settings, "SUPER_ROLE", None)

            # Initialize filters
            filters = {}

            # Filter by school
            if request.user.role.role_name not in SUPER_ROLE:  # For admins
                school_id = getattr(request.user.school, "id", None)
            else:  # For super admins
                school_id = request.GET.get("school_id")

            if not school_id:
                return Response([])  # Return empty list if no school_id is found

            filters["school_id"] = school_id

            # Filter by year (batch__start_year if available in StudentAnswerSheet models)
            year = request.GET.get("year")
            if year:
                filters["batch__start_year"] = year

            # Query StudentAnswerSheet for pass/fail rates grouped by grade and student
            data = (
                StudentAnswerSheet.objects.filter(**filters)
                .values("grade_id", "grade__grade_number", "student_id")  # Group by grade and student
                .annotate(
                    max_obtained_mark=Max("obtained_mark"),  # Get the best score per student
                    max_actual_mark=Max("actual_mark")  # Get the corresponding max actual mark
                )
                # Group by grade and compute totals, pass, and fail rates
                .values("grade__grade_number")
                .annotate(
                    total_students=Count("student_id", distinct=True),
                    passed_students=Count(
                        "student_id",
                        filter=Q(max_obtained_mark__gte=F("max_actual_mark") * 0.33),
                        distinct=True,
                    ),
                    failed_students=Count(
                        "student_id",
                        filter=Q(max_obtained_mark__lt=F("max_actual_mark") * 0.33),
                        distinct=True,
                    ),
                )
                .order_by("grade__grade_number")  # Order by grade
            )

            # If no data is found, return an empty list
            if not data:
                return Response([])

            # Prepare the response
            result = [
                {
                    "grade_number": entry["grade__grade_number"],  # Use the grade number
                    "total_students": entry["total_students"],
                    "pass_rate": round((entry["passed_students"] / entry["total_students"]) * 100, 2)
                    if entry["total_students"] > 0
                    else 0,
                    "fail_rate": round((entry["failed_students"] / entry["total_students"]) * 100, 2)
                    if entry["total_students"] > 0
                    else 0,
                }
                for entry in data
            ]

            return Response(result)

        except Exception as e:
            # Return a safe empty response in case of unexpected errors
            return Response({"error": str(e)})


    @action(detail=False, methods=['get'],
            url_path="user-counts",
        url_name="user-counts")
    @permission_required('dashboard', 'view')
    def user_counts(self, request):
        """
        API to calculate total teachers, students, and parents.
        Filters:
          - school_id: required for super admin, optional for admin
          - year: optional (applies to created_at field)
        """

        # Fetch the SUPER_ROLE constant from settings
        SUPER_ROLE = getattr(settings, "SUPER_ROLE", None)

        # Initialize filters
        filters = {}

        # School filter
        if request.user.role.role_name not in SUPER_ROLE:  # For admin users
            school_id = request.user.school.id  # Assign current school ID
        else:  # For super admins
            school_id = request.GET.get("school_id")  # Fetch from query parameters

        if not school_id:
            return Response({"error": _("school_id must be provided")}, status=400)

        filters["school_id"] = school_id

        # Year filter
        year = request.GET.get("year")
        if year:
            try:
                # Add year-based filtering to created_at timestamps
                filters["cur_batch__start_year"] = int(year)
            except ValueError:
                return Response({"error": _("Invalid year format.")}, status=400)

        # Query the models with applied filters
        total_teachers = Teacher.objects.filter(**filters).filter(Q(deleted_at__isnull=True)).count()
        total_students = Student.objects.filter(**filters).filter(Q(deleted_at__isnull=True)).count()
        total_admins = SchoolAdmin.objects.filter(school_id=school_id).filter(Q(deleted_at__isnull=True)).count()

        # Adjust parent query to apply 'year' filtering only if 'year' is provided
        parent_filters = {
            "student__school_id": school_id,
            "student__deleted_at__isnull": True
        }
        if year:
            parent_filters["student__cur_batch__start_year"] = year

        total_parents = Parent.objects.filter(**parent_filters).count()

        user_limit = School.objects.filter(id=school_id).values_list('current_users', 'max_users').first()
        user_limit = f"{user_limit[0]}/{user_limit[1]}"
        # Return the aggregated counts
        return Response({
            "user_limit": user_limit,
            "total_teachers": total_teachers,
            "total_students": total_students,
            "total_parents": total_parents,
            "total_admins": total_admins
        })


    @action(
        detail=False,
        methods=["GET"],
        url_path="subject-quizzes",
        url_name="subject_quizzes",
    )
    @permission_required('dashboard', 'view')
    def subject_quizzes(self, request, *args, **kwargs):
        # Fetch the SUPER_ROLE constant from settings
        SUPER_ROLE = getattr(settings, "SUPER_ROLE", None)

        # Initialize filters
        filters = {}

        # School filter (based on user role)
        if request.user.role.role_name not in SUPER_ROLE:  # For admin users
            school_id = request.user.school.id  # Assign current school ID
        else:  # For super admins
            school_id = request.GET.get("school_id")  # Fetch from query params

        if not school_id:
            return Response({"error": _("school_id must be provided")}, status=400)

        filters["school_id"] = school_id

        # Grade filter (mandatory)
        grade_id = request.GET.get("grade_id")
        if not grade_id:
            return Response({"error": _("grade_id must be provided")}, status=400)

        filters["grade_id"] = grade_id

        # Year filter (optional)
        year = request.GET.get("year")
        if year:
            try:
                filters["created_at__year"] = int(year)
            except ValueError:
                return Response({"error": _("Invalid year format.")}, status=400)

        # Query MainQuiz model to calculate quiz counts per subject
        quiz_data = (
            MainQuiz.objects.filter(**filters)  # Apply dynamic filters
            .values("subject__master_subject__subject_name", "subject__master_subject__subject_code")  # Group by subject
            .annotate(
                ai_quiz_count=Count(
                    "id", filter=models.Q(quiz_type="ai")
                ),  # Count AI quizzes
                manual_quiz_count=Count(
                    "id", filter=models.Q(quiz_type__in=["self", "school"])
                ),  # Count manual quizzes (self or school)
                total_quiz_count=Count("id"),  # Total quizzes
            )
            .order_by("subject__master_subject__subject_name")  # Order by subject name
        )

        # Prepare response in the desired format
        result = [
            {
                "subject_name": entry["subject__master_subject__subject_name"],
                "subject_code": entry["subject__master_subject__subject_code"],
                "ai_quiz_count": entry["ai_quiz_count"],
                "manual_quiz_count": entry["manual_quiz_count"],
                "total_quiz_count": entry["total_quiz_count"],
            }
            for entry in quiz_data
        ]

        # Return response
        return Response(result)



    @action(
        detail=False,
        methods=["GET"],
        url_path="grade-pass-fail-rate",
        url_name="grade_pass_fail_rate",
    )
    @permission_required('dashboard', 'view')
    def grade_pass_fail_rate(self, request, *args, **kwargs):
        # Fetch the SUPER_ROLE constant from settings
        SUPER_ROLE = getattr(settings, "SUPER_ROLE", None)

        # Initialize filters
        filters = {}

        # School filter
        if request.user.role.role_name not in SUPER_ROLE:  # For admin users
            school_id = request.user.school.id  # Use logged-in user's school ID
        else:  # For super admins
            school_id = request.GET.get("school_id")  # Get from query params

        if not school_id:
            return Response({"error": _("school_id must be provided")}, status=400)

        filters["school_id"] = school_id

        # Grade filter
        grade_id = request.GET.get("grade_id")
        if not grade_id:
            return Response({"error": _("grade_id must be provided")}, status=400)

        filters["grade_id"] = grade_id

        # Year filter (optional)
        year = request.GET.get("year")
        if year:
            try:
                filters["created_at__year"] = int(year)
            except ValueError:
                return Response({"error": _("Invalid year format.")}, status=400)

        # Define the pass threshold (33% of actual marks)
        PASS_THRESHOLD_PERCENTAGE = 33

        # Query StudentAnswerSheet model to calculate total students, pass, and fail counts
        stats = (
            StudentAnswerSheet.objects.filter(**filters)
            .annotate(
                pass_threshold=F("actual_mark") * (PASS_THRESHOLD_PERCENTAGE / 100)  # 33% pass threshold
            )
            .aggregate(
                total_students=Count("student", distinct=True),  # Total unique students
                students_failed=Count(
                    "student",
                    filter=Q(obtained_mark__lt=F("pass_threshold")),
                    distinct=True,  # Students who failed
                ),
            )
        )

        # Extract stats
        total_students = stats["total_students"] or 0
        students_failed = stats["students_failed"] or 0
        students_passed = total_students - students_failed

        # Avoid division by zero in percentage calculations
        if total_students > 0:
            pass_percentage = (students_passed / total_students) * 100
            fail_percentage = (students_failed / total_students) * 100
        else:
            pass_percentage = fail_percentage = 0

        # Prepare response
        return Response({
            "grade_id": int(grade_id),
            "total_students": total_students,
            "students_passed": students_passed,
            "students_failed": students_failed,
            "pass_percentage": round(pass_percentage, 2),  # Rounded to 2 decimal places
            "fail_percentage": round(fail_percentage, 2),  # Rounded to 2 decimal places
        })

    @action(
        detail=False,
        methods=["GET"],
        url_path="compare-two-years-grade",
        url_name="compare_two_years-grade",
    )
    @permission_required('dashboard', 'view')
    def compare_two_years_grades(self, request, *args, **kwargs):
        # Fetch the SUPER_ROLE constant from settings
        SUPER_ROLE = getattr(settings, "SUPER_ROLE", None)

        # Initialize filters
        filters = {}

        # School filter
        if request.user.role.role_name not in SUPER_ROLE:  # For admin users
            school_id = request.user.school.id  # Use logged-in user's school ID
        else:  # For super admins
            school_id = request.GET.get("school_id")  # Get from query params

        if not school_id:
            return Response({"error": _("school_id must be provided")}, status=400)

        filters["school_id"] = school_id

        # Year filter (required)
        year = request.GET.get("year")
        if not year:
            return Response({"error": _("year parameter must be provided")}, status=400)

        try:
            current_year = int(year)  # Current year
            previous_year = current_year - 1 if current_year > 1 else None  # Ensure previous_year is valid
        except ValueError:
            return Response({"error": _("Invalid year format.")}, status=400)

        # Define the pass threshold (33% of actual marks)
        PASS_THRESHOLD_PERCENTAGE = 33

        # Fetch all grades for the school
        grades = Grade.objects.filter(school_id=school_id)

        # Helper function to calculate stats for a specific year and grade
        def calculate_stats(year_filter, grade_id):
            if not year_filter:  # If year is None, return default stats
                return {
                    "total_students": 0,
                    "students_failed": 0,
                }

            year_filters = filters.copy()
            year_filters["created_at__year"] = year_filter
            year_filters["grade_id"] = grade_id

            # Query StudentAnswerSheet model
            return (
                StudentAnswerSheet.objects.filter(**year_filters)
                .annotate(
                    pass_threshold=F("actual_mark") * (PASS_THRESHOLD_PERCENTAGE / 100)  # 33% pass threshold
                )
                .aggregate(
                    total_students=Count("student", distinct=True),  # Total unique students
                    students_failed=Count(
                        "student",
                        filter=Q(obtained_mark__lt=F("pass_threshold")),
                        distinct=True,  # Students who failed
                    ),
                )
            )

        # Prepare comparison data for all grades
        grade_comparison_data = []

        for grade in grades:
            grade_id = grade.id
            grade_name = grade.grade_number  # Assume 'Grade' model has 'name' field

            # Calculate stats for current year
            current_year_stats = calculate_stats(current_year, grade_id)
            total_students_current = current_year_stats["total_students"] or 0
            students_failed_current = current_year_stats["students_failed"] or 0
            students_passed_current = total_students_current - students_failed_current

            # Calculate stats for previous year if applicable
            if previous_year:
                previous_year_stats = calculate_stats(previous_year, grade_id)
                total_students_previous = previous_year_stats["total_students"] or 0
                students_failed_previous = previous_year_stats["students_failed"] or 0
                students_passed_previous = total_students_previous - students_failed_previous
            else:
                total_students_previous = students_failed_previous = students_passed_previous = 0

            # Calculate percentages for current and previous years
            pass_percentage_current = (
                        students_passed_current / total_students_current * 100) if total_students_current > 0 else 0
            fail_percentage_current = (
                        students_failed_current / total_students_current * 100) if total_students_current > 0 else 0

            pass_percentage_previous = (
                        students_passed_previous / total_students_previous * 100) if total_students_previous > 0 else 0
            fail_percentage_previous = (
                        students_failed_previous / total_students_previous * 100) if total_students_previous > 0 else 0

            # Calculate differences
            total_students_difference = total_students_current - total_students_previous
            pass_percentage_difference = pass_percentage_current - pass_percentage_previous
            fail_percentage_difference = fail_percentage_current - fail_percentage_previous

            # Add grade data to response
            grade_comparison_data.append({
                "grade_id": grade_id,
                "grade_number": grade_name,
                "current_year_stats": {
                    "total_students": total_students_current,
                    "students_passed": students_passed_current,
                    "students_failed": students_failed_current,
                    "pass_percentage": round(pass_percentage_current, 2),
                    "fail_percentage": round(fail_percentage_current, 2),
                },
                "previous_year_stats": {
                    "total_students": total_students_previous,
                    "students_passed": students_passed_previous,
                    "students_failed": students_failed_previous,
                    "pass_percentage": round(pass_percentage_previous, 2),
                    "fail_percentage": round(fail_percentage_previous, 2),
                },
                "comparison": {
                    "total_students_difference": total_students_difference,
                    "pass_percentage_difference": round(pass_percentage_difference, 2),
                    "fail_percentage_difference": round(fail_percentage_difference, 2),
                }
            })

        # Final response
        return Response({
            "current_year": current_year,
            "previous_year": previous_year if previous_year else "N/A",
            "grade_comparison_data": grade_comparison_data
        })

    @action(
        detail=False,
        methods=["GET"],
        url_path="quiz_analytics",
        url_name="quiz-analytics",
    )
    @permission_required('dashboard', 'view')
    def quiz_analytics(self, request, *args, **kwargs):
        SUPER_ROLE = getattr(settings, "SUPER_ROLE", None)
        role_name = request.user.role.role_name
        three_months_ago = datetime.now() - timedelta(days=90)

        if role_name == "student" or role_name == "parents":
            # Get the student's ID
            if role_name == "student":
                student_id = Student.objects.filter(student_user=request.user.id).values_list("id", flat=True).first()
            elif role_name == "parents":
                student_id = request.query_params.get("student_id")

            if not student_id:
                return Response({"error": _("Student record not found")}, status=404)

            # Filter quizzes for the student from the Quiz model
            quiz_data = (
                Quiz.objects.filter(student_id=student_id, created_at__gte=three_months_ago)
                .annotate(date=TruncDate("created_at"))
                .annotate(
                    completed_manual=Count("id", filter=Q(is_attempted=True, quiz_type="school")),
                    completed_ai=Count("id", filter=Q(is_attempted=True, quiz_type="ai")),
                    pending_manual=Count("id", filter=Q(is_attempted=False, quiz_type="school")),
                    pending_ai=Count("id", filter=Q(is_attempted=False, quiz_type="ai")),
                )
                .values("date", "completed_manual", "completed_ai", "pending_manual", "pending_ai")
            )

        else:
            # For Admin or Super Admin Users
            if role_name not in SUPER_ROLE:  # For normal admin users
                school_id = request.user.school.id
            else:  # For super admins, get school_id from query params
                school_id = request.GET.get("school_id")

            if not school_id:
                return Response({"error": _("school_id must be provided")}, status=400)

            # Fetch data from MainQuiz for admins
            quiz_data = (
                MainQuiz.objects.filter(school_id=school_id, created_at__gte=three_months_ago)
                .annotate(date=TruncDate("created_at"))
                .annotate(
                    completed_manual=Count("quiz", filter=Q(quiz__is_attempted=True, quiz__quiz_type="school")),
                    completed_ai=Count("quiz", filter=Q(quiz__is_attempted=True, quiz__quiz_type="ai")),
                    pending_manual=Count("quiz", filter=Q(quiz__is_attempted=False, quiz__quiz_type="school")),
                    pending_ai=Count("quiz", filter=Q(quiz__is_attempted=False, quiz__quiz_type="ai")),
                )
                .values("date", "completed_manual", "completed_ai", "pending_manual", "pending_ai")
            )

        # Convert to list in the required format
        chart_data = [
            {
                "date": entry["date"].strftime("%Y-%m-%d"),
                "completed": {
                    "manual": entry["completed_manual"],
                    "ai": entry["completed_ai"],
                },
                "pending": {
                    "manual": entry["pending_manual"],
                    "ai": entry["pending_ai"],
                }
            }
            for entry in quiz_data
        ]

        return Response(chart_data, status=200)

    @action(
        detail=False,
        methods=["GET"],
        url_path="assessments-analytics",
        url_name="assessments-analytics",
    )
    @permission_required('dashboard', 'view')
    def assessments_analytics(self, request, *args, **kwargs):
        # Fetch the SUPER_ROLE constant from settings
        SUPER_ROLE = getattr(settings, "SUPER_ROLE", None)


        # School filter
        if request.user.role.role_name not in SUPER_ROLE:  # For admin users
            school_id = request.user.school.id  # Use logged-in user's school ID
        else:  # For super admins
            school_id = request.GET.get("school_id")  # Get from query params

        if not school_id:
            return Response({"error": _("school_id must be provided")}, status=400)

        batch_id = request.GET.get("batch_id")
        if not batch_id:
            return Response({"error": _("batch_id must be provided")}, status=400)

        total_assessments = Assessment.objects.filter(school_id=school_id,batch_id = batch_id).count()
        upcoming = Assessment.objects.filter(school_id=school_id,batch_id = batch_id,status='upcoming')
        completed = Assessment.objects.filter(school_id=school_id,batch_id = batch_id,status='completed')
        ongoing = Assessment.objects.filter(school_id=school_id,batch_id = batch_id,status='ongoing')
        cancelled = Assessment.objects.filter(school_id=school_id,batch_id = batch_id,status='cancelled')

        return  Response(
            {
                'total_assessments': total_assessments,
                'upcoming': upcoming.count(),
                'completed': completed.count(),
                'ongoing': ongoing.count(),
                'cancelled': cancelled.count(),
            },
            status=200
        )