from django.contrib.postgres.aggregates import ArrayAgg
from prompt_toolkit import pep440

from exam_app.models import AssessmentSubject
from exam_app.serializers import AssessmentSubjectSerializer
from nest_db_app.models import User, Teacher, Student, ClassSubject, SchoolAdmin
from django.db.models import F
from django.db.models import Q

from nest_db_app.models import Teacher, Student, ClassSubject, SchoolAdmin


def get_student_subject_assessments(user, queryset):
    """
    Fetches assessment subjects for a student where their student ID is associated with the assessment subject.
    """
    student = Student.objects.get(student_user=user.id)

    grade_ids = ClassSubject.objects.filter(students__id=student.id).values_list('grade', flat=True).distinct()

    assessments = queryset.filter(
        Q(deleted_at__isnull=True) & Q(deleted_by__isnull=True),
        grade__in=grade_ids

    ).values(
        'id',
        'subject__id',
        'paper_title',
        'subject__master_subject__subject_name',
        'subject__master_subject__subject_code',
        'assessment__id',
        'assessment__assessment_name',
        'grade__id',
        'grade__grade_number',
        'assessment_start_datetime',
        'assessment_end_datetime',
        'status',
        'batch__id',
        'batch__start_year',
        'term__id',
        'term__term_name'
    ).annotate(

        grade_class_ids=ArrayAgg('grade_class__id', distinct=True),
        grade_class_names=ArrayAgg('grade_class__name', distinct=True),
    )

    return assessments


def get_teacher_subject_assessments(user, queryset):
    teacher = Teacher.objects.get(teacher_user=user.id)
    grade_ids = ClassSubject.objects.filter(teacher=teacher.id).values_list('grade', flat=True).distinct()

    assessments = queryset.filter(
        Q(deleted_at__isnull=True) & Q(deleted_by__isnull=True),
        grade__in=grade_ids
    ).values(
        'id',
        'subject__id',
        'paper_title',
        'subject__master_subject__subject_name',
        'subject__master_subject__subject_code',
        'assessment__id',
        'assessment__assessment_name',
        'grade__id',
        'grade__grade_number',
        'memorandom',
        'ocr_status',
        'question_paper',
        'paper_marks',
        'assessment_start_datetime',
        'assessment_end_datetime',
        'status',
        'batch__id',
        'batch__start_year',
        'term__id',
        'term__term_name',
        'is_locked',
    ).annotate(

        grade_class_ids=ArrayAgg('grade_class__id', distinct=True),
        grade_class_names=ArrayAgg('grade_class__name', distinct=True),
    )

    return assessments


def get_school_admin_subject_assessments(user, queryset):
    """
    Fetches all assessment subjects for an admin, providing access to all assessment subjects within their school.
    """
    school_admin = SchoolAdmin.objects.get(school_admin_user_id=user.id)
    assessments = queryset.filter(
        school=school_admin.school
    ).values(
        'id',
        'subject__id',
        'paper_title',
        'subject__master_subject__subject_name',
        'subject__master_subject__subject_code',
        'assessment__id',
        'assessment__assessment_name',
        'grade__id',
        'grade__grade_number',
        'memorandom',
        'ocr_status',
        'question_paper',
        'paper_marks',
        'assessment_start_datetime',
        'assessment_end_datetime',
        'status',
        'batch__id',
        'batch__start_year',
        'term__id',
        'term__term_name',
        'is_locked',
        'created_by__id',
        'created_by__email',
        'created_at',
        'updated_by__id',
        'updated_by__email',
        'updated_at',
        'deleted_by__id',
        'deleted_by__email',
        'deleted_at',
    ).annotate(

        grade_class_ids=ArrayAgg('grade_class__id', distinct=True),
        grade_class_names=ArrayAgg('grade_class__name', distinct=True),
    )

    return assessments


def get_super_admin_subject_assessments(user,queryset):
    """
    Fetches all assessment subjects for a  super admin, providing access to all assessment subjects within their school.
    """
    # school_admin = SchoolAdmin.objects.get(school_admin_user_id=user.id)
    assessments = queryset.filter(
        school=user.school
    ).values(
        'id',
        'subject__id',
        'paper_title',
        'subject__master_subject__subject_name',
        'subject__master_subject__subject_code',
        'assessment__id',
        'assessment__assessment_name',
        'grade__id',
        'grade__grade_number',
        'memorandom',
        'ocr_status',
        'question_paper',
        'paper_marks',
        'assessment_start_datetime',
        'assessment_end_datetime',
        'status',
        'batch__id',
        'batch__start_year',
        'term__id',
        'term__term_name',
        'is_locked',
        'created_by__id',
        'created_by__email',
        'created_at',
        'updated_by__id',
        'updated_by__email',
        'updated_at',
        'deleted_by__id',
        'deleted_by__email',
        'deleted_at',
    ).annotate(

        grade_class_ids=ArrayAgg('grade_class__id', distinct=True),
        grade_class_names=ArrayAgg('grade_class__name', distinct=True),
    )


    return assessments