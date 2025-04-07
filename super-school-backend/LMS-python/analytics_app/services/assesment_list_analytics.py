from collections import Counter

from django.contrib.postgres.aggregates import ArrayAgg
from django.db.models import Q

from exam_app.models import AssessmentSubject, StudentAnswerSheet, DigitalMarking
from nest_db_app.models import Teacher, ClassSubject, SchoolAdmin, Student, School


def fetch_and_count_tags(assessment_subject_ids):
    """
    Fetch strength and weakness tags from DigitalMarking and count their occurrences.
    Returns top 10 most common strength and weakness tags.
    """
    digital_markings = DigitalMarking.objects.filter(
        student_answer_sheet__assessment_subject_id__in=assessment_subject_ids,
        deleted_at__isnull=True
    ).values(
        'strength_tags',
        'weakness_tags'
    )

    strength_tag_counter = Counter()
    weakness_tag_counter = Counter()

    for marking in digital_markings:
        strength_tags = marking.get('strength_tags', [])
        weakness_tags = marking.get('weakness_tags', [])

        strength_tag_counter.update(strength_tags)
        weakness_tag_counter.update(weakness_tags)

    top_strength_tags = [tag for tag, count in strength_tag_counter.most_common(10)]
    top_weakness_tags = [tag for tag, count in weakness_tag_counter.most_common(10)]

    return top_strength_tags, top_weakness_tags


def map_top_tags_to_subjects(assessment_subjects):
    """
    Fetch top strength and weakness tags and attach them to assessment_subjects.
    """
    assessment_subject_ids = [subject['id'] for subject in assessment_subjects]

    top_strength_tags, top_weakness_tags = fetch_and_count_tags(assessment_subject_ids)

    for subject in assessment_subjects:
        subject['common_strength'] = top_strength_tags
        subject['common_weakness'] = top_weakness_tags

    return assessment_subjects


def map_student_answer_sheets(assessment_subjects):
    """
    Map StudentAnswerSheet data to AssessmentSubject objects and calculate average, highest, lowest marks,
    and student ranks based on obtained marks.
    """
    assessment_subject_ids = [subject['id'] for subject in assessment_subjects]

    # Fetch student answer sheets
    student_answer_sheets = StudentAnswerSheet.objects.filter(
        assessment_subject_id__in=assessment_subject_ids,
        deleted_at__isnull=True
    ).values(
        'assessment_subject_id',
        'student_id',
        'obtained_mark',
        'actual_mark'
    )

    # Organize marks data
    marks_mapping = {}
    for sheet in student_answer_sheets:
        subject_id = sheet['assessment_subject_id']
        student_id = sheet['student_id']
        obtained_mark = sheet['obtained_mark'] or 0
        actual_mark = sheet['actual_mark'] or 0

        if subject_id not in marks_mapping:
            marks_mapping[subject_id] = []

        marks_mapping[subject_id].append({
            'student_id': student_id,
            'obtained_mark': obtained_mark,
            'actual_mark': actual_mark,
        })

    # Calculate ranks and other metrics
    for subject in assessment_subjects:
        subject_id = subject['id']
        if subject_id in marks_mapping:
            students = marks_mapping[subject_id]
            obtained_marks = [s['obtained_mark'] for s in students]
            actual_marks = [s['actual_mark'] for s in students]

            # Sort students by obtained marks in descending order
            sorted_students = sorted(students, key=lambda x: x['obtained_mark'], reverse=True)

            # Assign ranks to students
            for rank, student in enumerate(sorted_students, start=1):
                student['rank'] = rank

            # Add ranks back to the subject's student data
            subject['students'] = sorted_students

            # Calculate subject-level metrics
            subject['average_obtained_mark'] = (
                sum(obtained_marks) / len(obtained_marks) if obtained_marks else 0
            )
            subject['average_actual_mark'] = (
                sum(actual_marks) / len(actual_marks) if actual_marks else 0
            )
            subject['highest_obtained_mark'] = max(obtained_marks) if obtained_marks else 0
            subject['lowest_obtained_mark'] = min(obtained_marks) if obtained_marks else 0
            subject['highest_actual_mark'] = max(actual_marks) if actual_marks else 0
            subject['lowest_actual_mark'] = min(actual_marks) if actual_marks else 0
        else:
            subject['students'] = []
            subject['average_obtained_mark'] = 0
            subject['average_actual_mark'] = 0
            subject['highest_obtained_mark'] = 0
            subject['lowest_obtained_mark'] = 0
            subject['highest_actual_mark'] = 0
            subject['lowest_actual_mark'] = 0

    return assessment_subjects



def map_assessment_subjects(assessments):
    """
    Map AssessmentSubject data to assessments, ensuring separate entries for each grade_class.
    Add top-performing and low-performing subjects, and calculate average marks.
    """
    for assessment in assessments:
        assessment['grade_class'] = assessment.get('grade_class')  # Safeguard against missing grade_class

    unique_grade_class_ids = [
        assessment['grade_class'] for assessment in assessments if assessment['grade_class'] is not None
    ]

    assessment_subjects = AssessmentSubject.objects.filter(
        assessment_id__in=[a['id'] for a in assessments],
        grade_class_id__in=unique_grade_class_ids,
        deleted_at__isnull=True
    ).values(
        'assessment_id',
        'id',
        'subject__id',
        'subject__master_subject__subject_name',
        'grade_class__id',
        'grade_class__name',
        'paper_title'
    )

    assessment_subjects = map_student_answer_sheets(list(assessment_subjects))

    # Map top strength and weakness tags to assessment subjects
    assessment_subjects = map_top_tags_to_subjects(assessment_subjects)

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
            'paper_title': subject['paper_title'],
            'average_obtained_mark': subject['average_obtained_mark'],
            'average_actual_mark': subject['average_actual_mark'],
            'highest_obtained_mark': subject['highest_obtained_mark'],
            'lowest_obtained_mark': subject['lowest_obtained_mark'],
            'common_strength': subject['common_strength'],
            'common_weakness': subject['common_weakness'],
        })

    for assessment in assessments:
        assessment_id = assessment['id']
        grade_class_id = assessment['grade_class']

        if grade_class_id is None:
            assessment['assessment_subjects'] = []
            assessment['top_performing_subject'] = None
            assessment['low_performing_subject'] = None
            assessment['average_mark'] = "0/0"
        else:
            subjects = subject_mapping.get(assessment_id, {}).get(grade_class_id, [])
            assessment['assessment_subjects'] = subjects

            if subjects:
                top_subject = max(subjects, key=lambda x: x['average_obtained_mark'])
                low_subject = min(subjects, key=lambda x: x['average_obtained_mark'])

                assessment['top_performing_subject'] = {
                    "subject_name": top_subject['subject_name'],
                    "subject_id": top_subject['subject_id'],
                }
                assessment['low_performing_subject'] = {
                    "subject_name": low_subject['subject_name'],
                    "subject_id": low_subject['subject_id'],
                }

                total_obtained = sum(s['average_obtained_mark'] for s in subjects)
                total_actual = sum(s['average_actual_mark'] for s in subjects)

                assessment['average_mark'] = f"{total_obtained}/{total_actual}"
            else:
                assessment['top_performing_subject'] = None
                assessment['low_performing_subject'] = None
                assessment['average_mark'] = "0/0"

    return list(assessments)



def get_teacher_analytics_data(user, queryset):
    """
    Fetch assessments for a teacher, including related assessment_subject data.
    """
    teacher = Teacher.objects.get(teacher_user=user.id)
    grade_ids = ClassSubject.objects.filter(teacher=teacher.id).values_list('grade_id', flat=True).distinct()

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
        'batch__start_year',
        'term__term_name',
        'grade__grade_number',
        'is_locked',
        'created_at'
    )

    return map_assessment_subjects(assessments)


def get_student_analytics_data(user, queryset):
    """
    Fetch assessments for a teacher, including related assessment_subject data.
    """
    student = Student.objects.get(student_user=user.id)

    assessments = queryset.filter(
        Q(deleted_at__isnull=True) & Q(deleted_by__isnull=True),
        id__in=AssessmentSubject.objects.filter(student=student.id).values_list('assessment', flat=True)
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
        'is_locked'
    ).annotate(
        grade_classes=ArrayAgg('grade_class', distinct=True),
        grade_class_names=ArrayAgg('grade_class__name', distinct=True)
    )

    return map_assessment_subjects(assessments)


def get_admin_analytics_data(user, queryset):
    """
    Fetch assessments for an admin, including related assessment_subject data.
    """
    if user.role.role_name == "admin":
        school_admin = SchoolAdmin.objects.get(school_admin_user_id=user.id)
        school_obj = school_admin.school
    else:
        school_obj = School.objects.get(id=user.school_id)
    assessments = queryset.filter(
        Q(deleted_at__isnull=True) & Q(deleted_by__isnull=True),
        school=school_obj
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
        'batch__start_year',
        'term__term_name',
        'grade__grade_number',
        'is_locked',
        'created_at'
    )

    return map_assessment_subjects(assessments)
