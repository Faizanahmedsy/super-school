from django.utils.timezone import now,localtime
from exam_app.models import Assessment, AssessmentSubject


def update_assessment_status():
    """
    Update the status of assessments and assessment subjects based on their start and end times.
    Do not update if the status is 'cancelled'.
    """
    try:
        current_time = localtime(now())
        # Update status for Assessments
        assessments = Assessment.objects.exclude(status='cancelled')  # Exclude cancelled assessments
        for assessment in assessments:
            if assessment.assessment_start_datetime >= current_time:
                assessment.status = 'upcoming'
            elif assessment.assessment_start_datetime <= current_time <= assessment.assessment_end_datetime:
                assessment.status = 'ongoing'
            elif assessment.assessment_end_datetime <= current_time:
                assessment.status = 'completed'
            assessment.save()

        # Update status for AssessmentSubjects
        assessment_subjects = AssessmentSubject.objects.exclude(
            status='cancelled')  # Exclude cancelled assessment subjects
        for subject in assessment_subjects:

            if subject.assessment_start_datetime >= current_time:
                subject.status = 'upcoming'
            elif subject.assessment_start_datetime <= current_time <= subject.assessment_end_datetime:
                subject.status = 'ongoing'
            elif subject.assessment_end_datetime <= current_time:
                subject.status = 'completed'
            subject.save()

        return "Assessment and AssessmentSubject statuses updated successfully, skipping 'cancelled' records."
    except Exception as e:
        print(f"Error while updating assessment statuses: {str(e)}")
