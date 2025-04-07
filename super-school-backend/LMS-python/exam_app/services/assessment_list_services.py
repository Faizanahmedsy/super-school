from django.db.models import Q

from exam_app.models import AssessmentSubject
from nest_db_app.models import Teacher, Student, ClassSubject, SchoolAdmin


def map_assessment_subjects(assessments, subject_id=None):
    """
    Map AssessmentSubject data to assessments, ensuring separate entries for each grade_class.
    Dynamically filter subjects by subject_id if provided.
    """
    # Ensure all assessments have a grade_class
    for assessment in assessments:
        assessment['grade_class'] = assessment.get('grade_class')  # Safeguard against missing grade_class

    # Fetch related AssessmentSubject data
    unique_grade_class_ids = [
        assessment['grade_class'] for assessment in assessments if assessment['grade_class'] is not None
    ]

    # Base filter for AssessmentSubject
    subject_filter = {
        'assessment_id__in': [a['id'] for a in assessments],
        'grade_class_id__in': unique_grade_class_ids,
        'deleted_at__isnull': True,
    }

    # Add subject_id filter if provided
    if subject_id:
        subject_filter['subject__id'] = subject_id

    assessment_subjects = AssessmentSubject.objects.filter(**subject_filter).values(
        'assessment_id',
        'id',
        'subject__id',
        'subject__master_subject__subject_name',
        'grade_class__id',
        'grade_class__name',
        'paper_title'
    )

    # Group subjects by assessment and grade_class
    subject_mapping = {}
    for subject in assessment_subjects:
        assessment_id = subject['assessment_id']
        grade_class_id = subject['grade_class__id']

        if assessment_id not in subject_mapping:
            subject_mapping[assessment_id] = {}

        if grade_class_id not in subject_mapping[assessment_id]:
            subject_mapping[assessment_id][grade_class_id] = []

        subject_mapping[assessment_id][grade_class_id].append({
            'id': subject['id'],
            'subject_name': subject['subject__master_subject__subject_name'],
            'subject_id': subject['subject__id'],
            'grade_class_name': subject['grade_class__name'],
            'grade_class_id': grade_class_id,
            'paper_title': subject['paper_title']
        })

    # Append subjects relevant to the grade_class
    for assessment in assessments:
        assessment_id = assessment['id']
        grade_class_id = assessment['grade_class']

        if grade_class_id is None:
            assessment['assessment_subjects'] = []
        else:
            assessment['assessment_subjects'] = subject_mapping.get(assessment_id, {}).get(grade_class_id, [])

    return list(assessments)


def get_teacher_assessments(user, queryset, subject_id=None):
    """
    Fetch assessments for a teacher, including related assessment_subject data.
    """
    teacher = Teacher.objects.get(teacher_user=user.id)
    grade_ids = ClassSubject.objects.filter(teacher=teacher.id).values_list('grade_id', flat=True).distinct()

    # Fetch assessments for the teacher
    assessments = queryset.filter(
        Q(deleted_at__isnull=True) & Q(deleted_by__isnull=True),
        grade__in=grade_ids
    ).values(
        'id',
        'assessment_name',
        'assessment_start_datetime',
        'assessment_end_datetime',
        'status',
        'term',
        'grade',
        'grade_class',
        'grade_class__name',
        'batch',
        'ocr_status',
        'is_reviewed',
        'batch__start_year',
        'term__term_name',
        'grade__grade_number',
        'is_locked',
        'created_at'
    )

    return map_assessment_subjects(assessments, subject_id)  # Return as a QuerySet (no need to call list())


def get_student_assessments(user, queryset, subject_id=None):
    student = Student.objects.get(student_user=user.id)

    student_grade_class = list(ClassSubject.objects.filter(
        students__id=student.id
    ).values_list('grade_class', flat=True).distinct())

    assessments = queryset.filter(
        Q(deleted_at__isnull=True) & Q(deleted_by__isnull=True),grade_class__in=student_grade_class,
        id__in=AssessmentSubject.objects.filter(student=student.id).values_list('assessment')
    ).values(
        'id',
        'assessment_name',
        'assessment_start_datetime',
        'assessment_end_datetime',
        'status',
        'term',
        'grade',
        'grade_class',
        'grade_class__name',
        'batch__start_year',
        'term__term_name',
        'grade__grade_number',
        'batch',
        'is_locked',
        'is_reviewed'
    )
    return map_assessment_subjects(assessments, subject_id)


def get_school_admin_assessments(user, queryset, subject_id=None):
    school_admin = SchoolAdmin.objects.get(school_admin_user_id=user.id)

    assessments = queryset.filter(
        school=school_admin.school
    ).values(
        'id',
        'assessment_name',
        'assessment_start_datetime',
        'assessment_end_datetime',
        'grade',
        'grade_class',
        'grade_class__name',
        'status',
        'batch',
        'term',
        'ocr_status',
        'is_reviewed',
        'batch__start_year',
        'term__term_name',
        'grade__grade_number',
        'is_locked',
        'created_by',
        'created_by__email',
        'updated_by',
        'updated_by__email',
        'deleted_by',
        'deleted_by__email',
        'created_at',
        'updated_at',
        'deleted_at'

    )

    return map_assessment_subjects(assessments, subject_id)

def get_super_admin_assessments(user,queryset,subject_id=None):
    # school_admin = SchoolAdmin.objects.get(school_admin_user_id=user.id)
    assessments = queryset.filter(
        school=user.school
    ).values(
        'id',
        'assessment_name',
        'assessment_start_datetime',
        'assessment_end_datetime',
        'grade',
        'grade_class',
        'grade_class__name',
        'status',
        'batch',
        'term',
        'ocr_status',
        'is_reviewed',
        'batch__start_year',
        'term__term_name',
        'grade__grade_number',
        'is_locked',
        'created_by',
        'created_by__email',
        'updated_by',
        'updated_by__email',
        'deleted_by',
        'deleted_by__email',
        'created_at',
        'updated_at',
        'deleted_at'


    )

    return map_assessment_subjects(assessments, subject_id)
