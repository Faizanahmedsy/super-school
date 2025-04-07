from datetime import datetime

from rest_framework import status
from rest_framework.response import Response

from exam_app.models import AssessmentSubject, Assessment
from nest_db_app.models import Teacher, ClassSubject, GradeClass, Student, Subject
from nest_db_app.services.notification import create_notification_for_students, create_notification_for_teachers, \
    create_notification_for_school_admins
from django.core.files.base import ContentFile
from django.utils.translation import gettext as _
from django.utils import timezone
def validate_teacher_permissions(teacher, data, assessment):
    """
    Validates if the teacher is authorized to create an assessment for the provided class, grade, subject, and batch.
    """
    cur_batch = teacher.cur_batch
    grade = assessment.grade.id
    grade_classes = [int(x) for x in data['grade_class'].split(',')]
    subject = data['subject']

    for grade_class_id in grade_classes:
        if not ClassSubject.objects.filter(
                teacher=teacher,
                grade_id=grade,
                grade_class_id=grade_class_id,
                subject=subject,
                batch=cur_batch,
        ).exists():
            return False
    return True


def validate_assessment_dates(assessment_subject_start_datetime, assessment_subject_end_datetime,
                              assessment_start_datetime, assessment_end_datetime):
    """
    Validates that the subject assessment dates lie within the parent assessment dates.
    Returns an error message directly if validation fails.
    """
    if assessment_subject_start_datetime < assessment_start_datetime or assessment_subject_end_datetime > assessment_end_datetime:
        error_message = (
            f"Assessment subject dates ({assessment_subject_start_datetime.strftime('%d-%m-%Y')}) "
            f"must lie within the parent assessment dates ({assessment_start_datetime.strftime('%d-%m-%Y')} - {assessment_end_datetime.strftime('%d-%m-%Y')})."
        )
        return {"error": error_message}
    return None


def fetch_students_for_assessment(batch, term, subject, grade_class, grade, school):
    """
    Fetches all students associated with the subject from the ClassSubject model.
    """
    class_subjects = ClassSubject.objects.filter(
        grade=grade,
        grade_class=grade_class,
        subject=subject,
        batch=batch,
        term=term,
        school=school,
    )
    students = Student.objects.filter(classsubject__in=class_subjects).distinct()
    return students


def create_assessment_subject(data, user, assessment):
    """
    Core logic to create AssessmentSubjects and associate them with students.
    """

    grade = assessment.grade.id
    try:
        subject = Subject.objects.get(id=int(data['subject'].id))
    except Subject.DoesNotExist:
        raise ValueError(_("Invalid subject ID provided."))  # Handle this more gracefully in a real-world app.

    grade_classes = [int(x) for x in data['grade_class'].split(',')]
    valid_grade_classes = GradeClass.objects.filter(id__in=grade_classes, grade=grade).values_list('id', flat=True)

    invalid_grade_classes = set(grade_classes) - set(valid_grade_classes)
    if invalid_grade_classes:
        return {
            "error": _("Invalid grade class IDs provided: %(invalid_ids)s") % {
                "invalid_ids": ", ".join(map(str, invalid_grade_classes))}
        }

    teacher = ClassSubject.objects.filter(
        grade=grade,
        batch=assessment.batch,
        term=assessment.term,
        subject=subject,
        grade_class__in=valid_grade_classes,
    ).first()

    if not teacher:
        return {
            "error": _("No teacher is assigned to the provided grade, batch, and subject.")
        }

    students = ClassSubject.objects.filter(
        grade=grade,
        batch=assessment.batch,
        term=assessment.term,
        subject=subject,
        grade_class__in=valid_grade_classes,
    ).values_list('students', flat=True)

    if not students:
        return {
            "error": _("No students are assigned to the provided grade, batch, and subject.")
        }

    assessment_start_datetime = datetime.fromisoformat(data['assessment_start_datetime'])
    assessment_end_datetime = datetime.fromisoformat(data['assessment_end_datetime'])

    # Save uploaded files
    memorandom_file = None
    question_paper_file = None

    if 'memorandom' in data and data['memorandom']:
        memorandom_file = ContentFile(data['memorandom'].read(), name=data['memorandom'].name)

    if 'question_paper' in data and data['question_paper']:
        question_paper_file = ContentFile(data['question_paper'].read(), name=data['question_paper'].name)

    current_time = timezone.now()

    # Parse and make start_time and end_time timezone-aware
    start_time = datetime.strptime(data['assessment_start_datetime'], "%Y-%m-%dT%H:%M:%S.%fZ")
    start_time = timezone.make_aware(start_time, timezone.get_current_timezone())

    end_time = datetime.strptime(data['assessment_end_datetime'], "%Y-%m-%dT%H:%M:%S.%fZ")
    end_time = timezone.make_aware(end_time, timezone.get_current_timezone())

    # Corrected status logic
    if current_time < start_time:
        assessment_status = 'upcoming'
    elif start_time <= current_time <= end_time:
        assessment_status = 'ongoing'
    else:
        assessment_status = 'completed'


    assessment_subjects = []
    for grade_class_id in grade_classes:
        grade_class = GradeClass.objects.get(id=grade_class_id)
        assessment_subject = AssessmentSubject(
            assessment_id=assessment.id,
            grade_id=grade,
            grade_class=grade_class,
            subject=subject,
            paper_title=data.get('paper_title'),
            paper_marks=data.get('paper_marks'),
            school=assessment.school,
            term=assessment.term,
            batch=assessment.batch,
            status=assessment_status,
            assessment_start_datetime=assessment_start_datetime,
            assessment_end_datetime=assessment_end_datetime,
            memorandom=memorandom_file,  # Use saved file
            question_paper=question_paper_file,  # Use saved file
            created_by=user,
        )
        assessment_subjects.append(assessment_subject)

        create_notification_for_students(
            title=f"New Assessment Subject has been Created",
            message=f"A new assessment subject '{subject.master_subject.subject_name}' has been Created",
            module_name="assessments",
            grade_id=grade,
            grade_class_id=grade_class.id,
            subject_id=subject.id,
            school_id=assessment.school.id,
        )

        create_notification_for_teachers(
            title=f"New Assessment Subject has been Created",
            message=f"A new assessment subject '{subject.master_subject.subject_name}' has been Created",
            module_name="assessments",
            school_id=assessment.school.id
        )

        create_notification_for_school_admins(
            title=f"New Assessment Subject has been Created",
            message=f"A new assessment subject '{subject.master_subject.subject_name}' has been Created",
            module_name="assessments",
            school_id=assessment.school.id
        )

    AssessmentSubject.objects.bulk_create(assessment_subjects)

    for assessment_subject, grade_class_id in zip(assessment_subjects, grade_classes):
        grade_class = GradeClass.objects.get(id=grade_class_id)
        students = fetch_students_for_assessment(
            batch=assessment.batch,
            term=assessment.term,
            subject=subject,
            grade_class=grade_class,
            grade=grade,
            school=assessment.school,
        )
        assessment_subject.student.add(*students)

    existing_grade_classes = assessment.grade_class.all()
    updated_grade_classes = set(existing_grade_classes) | set(GradeClass.objects.filter(id__in=grade_classes))
    assessment.grade_class.set(updated_grade_classes)

    created_assessment_subjects = AssessmentSubject.objects.filter(id__in=[a.id for a in assessment_subjects])
    created_assessment_subjects_ids = [subject_assessment.id for subject_assessment in created_assessment_subjects]

    # Clean up saved files
    if memorandom_file:
        memorandom_file.close()

    if question_paper_file:
        question_paper_file.close()

    return {"message": _("Assessment subjects created successfully."), "data": created_assessment_subjects_ids}


def create_teacher_assessment(user, data):
    """
    Logic for teacher to create an assessment subject after validation.
    """
    try:
        teacher = Teacher.objects.get(teacher_user=user.id)
    except Teacher.DoesNotExist:
        return Response({"error": _("Teacher record not found.")}, status=status.HTTP_404_NOT_FOUND)

    try:
        assessment = Assessment.objects.get(id=int(data['assessment']))
        assessment_start_datetime = datetime.fromisoformat(data['assessment_start_datetime'])
        assessment_end_datetime = datetime.fromisoformat(data['assessment_end_datetime'])
    except (Assessment.DoesNotExist, ValueError):

        return Response({"error": _("Invalid assessment or datetime format.")}, status=status.HTTP_400_BAD_REQUEST)
    data['subject'] = Subject.objects.get(id=int(data['subject']))
    if not validate_teacher_permissions(teacher, data, assessment):
        return Response({"error": _("Unauthorized: Teacher does not teach the provided class or subject.")},
                        status=status.HTTP_403_FORBIDDEN)

    validation_error = validate_assessment_dates(
        assessment_subject_start_datetime=assessment_start_datetime,
        assessment_subject_end_datetime=assessment_end_datetime,
        assessment_start_datetime=assessment.assessment_start_datetime,
        assessment_end_datetime=assessment.assessment_end_datetime,
    )
    if validation_error:
        return Response(validation_error, status=status.HTTP_400_BAD_REQUEST)

    result = create_assessment_subject(data, user, assessment)
    return Response(result, status=status.HTTP_201_CREATED)


def create_admin_assessment(user, data):
    """
    Logic for admin to create an assessment subject.
    """
    try:
        assessment = Assessment.objects.get(id=int(data['assessment']))
    except Assessment.DoesNotExist:
        return Response({"error": _( "Invalid assessment ID.")}, status=status.HTTP_400_BAD_REQUEST)

    try:
        assessment_start_datetime = datetime.fromisoformat(data['assessment_start_datetime'])
        assessment_end_datetime = datetime.fromisoformat(data['assessment_end_datetime'])
    except (Assessment.DoesNotExist, ValueError):
        return Response({"error": _("Invalid assessment or datetime format.")}, status=status.HTTP_400_BAD_REQUEST)

    data['subject'] = Subject.objects.get(id=int(data['subject']))
    validation_error = validate_assessment_dates(
        assessment_subject_start_datetime=assessment_start_datetime,
        assessment_subject_end_datetime=assessment_end_datetime,
        assessment_start_datetime=assessment.assessment_start_datetime,
        assessment_end_datetime=assessment.assessment_end_datetime,
    )
    if validation_error:
        return Response(validation_error, status=status.HTTP_400_BAD_REQUEST)
    result = create_assessment_subject(data, user, assessment)
    return Response(result, status=status.HTTP_201_CREATED)
