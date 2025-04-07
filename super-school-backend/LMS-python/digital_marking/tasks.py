import base64
import csv
import io
import logging
import os
import re
import traceback

import google.generativeai as genai
from celery import shared_task
from django.conf import settings
from django.db.models import Sum, Case, When, F

from digital_marking.models import DigitalMarking
from exam_app.models import AssessmentSubject, StudentAnswerSheet
from nest_db_app.services.email import send_email_to_teachers, send_email_to_admins
from nest_db_app.services.notification import create_notification_for_teachers, create_notification_for_school_admins
from .models import *

# Configure logging
logger = logging.getLogger(__name__)


def encode_file_to_base64(file_path):
    """Convert file to base64 encoded string."""
    with open(file_path, "rb") as file:
        return base64.b64encode(file.read()).decode('utf-8')


@shared_task(bind=True, max_retries=3, default_retry_delay=60)  # Add binding and retry config
def process_pdf(self, assessment_sub_id):
    """Processes student answer sheets and evaluates them using AI. Will retry up to 3 times on failure."""
    try:
        # print(f"Starting process_pdf for assessment_sub_id: {assessment_sub_id}")
        assessment_subject = AssessmentSubject.objects.get(pk=assessment_sub_id)
        # print(f"Processing PDF for {assessment_subject.paper_title}")
        student_answer_sheets = StudentAnswerSheet.objects.filter(
            assessment_subject_id=assessment_subject.id, ocr_status=False
        )
        # print(f"Total answer sheets: {student_answer_sheets.count()}")
        # Paths for PDFs
        question_paper_path = assessment_subject.question_paper.path
        # print(f"Question Paper Path: {question_paper_path}")
        memo_path = assessment_subject.memorandom.path
        # print(f"Memo Path: {memo_path}")

        # Call Gemini API for each student answer sheet
        for answer_sheet in student_answer_sheets:
            try:
                # print(f"Processing answer sheet for {answer_sheet.student.first_name}")
                response_csv = call_gemini_model(answer_sheet.answer_sheet.path, memo_path, question_paper_path)
                # print(f"Response CSV: {response_csv}")
                if response_csv:
                    save_evaluation_to_db(answer_sheet, response_csv, assessment_subject)
                    # print(f"Saved evaluation for {answer_sheet.student.first_name}")
                    answer_sheet.ocr_status = True
                    answer_sheet.save()
                    # print(f"Marked answer sheet as processed for {answer_sheet.student.first_name}")
                else:
                    # print(f"No response from Gemini for {answer_sheet.student.first_name}")
                    raise Exception("Empty response from Gemini API")
            except Exception as sheet_error:
                # print(f"Error processing sheet for {answer_sheet.student.first_name}: {sheet_error}")
                logger.error(f"Failed to process answer sheet {answer_sheet.id}: {str(sheet_error)}")
                # Don't retry here, continue with next sheet but propagate error up if needed

        # Queue update_assessment_status after processing
        # print(f"Queueing update_assessment_status for assessment_sub_id: {assessment_sub_id}")
        update_assessment_status.delay(assessment_sub_id)
        # print("update_assessment_status task queued successfully")

    except Exception as e:
        # print(f"Error in process_pdf: {e}")
        logger.error(f"Error in process_pdf for assessment_sub_id {assessment_sub_id}: {str(e)}")
        logger.error(traceback.format_exc())

        # Get current retry count
        retry_count = self.request.retries
        # print(f"Current retry count: {retry_count}")

        if retry_count < 3:  # We can retry (max_retries is 3)
            # print(f"Retrying task (attempt {retry_count + 1}/3)...")
            # Exponential backoff: 60s, 120s, 240s
            retry_delay = 60 * (2 ** retry_count)
            raise self.retry(exc=e, countdown=retry_delay)
        else:
            # Log that all retries were exhausted
            logger.error(f"All retries exhausted for assessment_sub_id {assessment_sub_id}")
            # Mark this assessment subject with a failed status
            try:
                AssessmentSubject.objects.filter(id=assessment_sub_id).update(ocr_status="failed")
                # Optionally notify admins about the failure
                assessment_subject = AssessmentSubject.objects.get(pk=assessment_sub_id)
                create_notification_for_school_admins(
                    title="PDF Processing Failed",
                    message=f"Failed to process assessment '{assessment_subject.paper_title}' after multiple attempts.",
                    module_name="assessments",
                    school_id=assessment_subject.school.id
                )
            except Exception as update_error:
                logger.error(f"Failed to update assessment status to failed: {str(update_error)}")

            # Re-raise to mark task as failed
            raise


def call_gemini_model(answer_path, memo_path, question_path):
    """Calls Gemini API to evaluate student answers."""
    api_key = os.environ.get("GEMINI_API_KEY")
    print("Entering call_gemini_model")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        'gemini-2.5-pro-exp-03-25',
        system_instruction="""
        CRITICAL EVALUATION INSTRUCTIONS:

        ABSOLUTE REQUIREMENTS:
        - Use ONLY text EXACTLY as written by the student.
        - If question is related to open-ended answers like short-note, essay or something like that then there will be certain criteria mentioned in memorandum so evaluate the answer based on the student's response and those criteria.
        - If question is related graphs, diagrams or any other visual representation then there will be certain criteria mentioned in memorandum so evaluate the answer based on the student's response and those criteria.
        - If there is graph in answer-sheet then check each point of graph with the memorandum and then evaluate the answer.
        - If there is diagram in answer-sheet then check it's shape, size, and labeling with the memorandum and then evaluate the answer.
        - If the guidelines specify "attempt any 2 out of 3 questions" and the student attempts all 3, only return the first two questions the student attempted. Exclude and do not consider the third question in the response.
        - In the memorandum, tick marks (✔) may indicate partial marks. It is mandatory to ensure that the answer explicitly includes the information corresponding to these tick marks in order to be awarded the partial marks. Strict adherence to this instruction is required.
        - If student's answer is matching with memorandum then grant marks.
        - Return only those question's number is mentioned in answer sheet by the student.
        - If student haven't written the question number in answer sheet then, add "NOT ATTEMPTED".
        - If NO text is found for a question or not find those in student answer sheet then, add "NOT ATTEMPTED".
        - If handwriting is not clear or not readable then, add those words under 'not_detected_word' column.
        - NO answer generation or reconstruction, also don't write answers from memo just user for comparison.
        - NO interpretation or inference of student's intent
        - Based on the student's response, generate strength_tags and weakness_tags that reflect the student's understanding. The strength_tags should indicate areas where the student demonstrates competence, such as specific subject concepts or skills. The weakness_tags should highlight areas where the student could improve, focusing on the overall topic without specifying individual mistakes, For Example Strength: 'Application of circle theorems', Weakness: 'Weak explanation of trigonometry'.
        
        ---  

        **STRICT PARTIAL MARKING ENFORCEMENT:**  
        1. **Tick marks (✔) in the memorandum signify partial marks.** LLM must:  
           - Award marks **only if the exact component with a tick mark is present in the student’s answer**.  
           - **No tick mark = No marks for that component.**  
        2. If the final answer is **incorrect**, but **a step with a tick (✔) is correct**, **grant partial marks**.  
        3. If multiple answer variations (e.g., **OR conditions**) exist, **grant marks only if at least one method is completely correct**.  
        
        ---  
            
        RESPONSE FORMAT REQUIREMENTS:
        - You MUST return the evaluation in CSV format ONLY
        - Use exactly these column headers: question_number,question,answer_in_student_sheet,actual_marks,obtained_marks,confidence_score,reason,weakness_tags,strength_tags,not_detected_word
        - Enclose all fields in double quotes
        - Separate fields with commas
        - Include the header row

        Detailed Evaluation Criteria:

        Example:
        "question_number","question","answer_in_student_sheet","actual_marks","obtained_marks","confidence_score","reason","weakness_tags","strength_tags","not_detected_word"
        "1.2","SMRC is a cyclic quadrilateral","Not Attempted","4","0","0","student did not attempt the question","Application of triangle theorems","","Weak explanation of trigonometry, wrong theorem application"
        "1.3","RP is a tangent to the circle passing through P, S and A at P","Not Attempted","6","0","0","student did not attempt the question","Weak explanation of calculus","",""
        """
    )

    prompt = """
    Evaluate student's answers with detailed question and answer information. 
    Only process what the student has written.
    Return the evaluation in CSV format with exactly the specified columns.
    """

    content_parts = [
        {"text": prompt},
        {"inline_data": {"mime_type": "application/pdf", "data": encode_file_to_base64(answer_path)}},
        {"text": "Memo Sheet:"},
        {"inline_data": {"mime_type": "application/pdf", "data": encode_file_to_base64(memo_path)}},
        {"text": "Question Paper:"},
        {"inline_data": {"mime_type": "application/pdf", "data": encode_file_to_base64(question_path)}}
    ]

    try:
        response = model.generate_content(content_parts)
        # print(f"Response from Gemini: {response.text}")
        return response.text
    except Exception as e:
        # print(f"Error calling Gemini model: {e}", exc_info=True)
        return None


def save_evaluation_to_db(answer_sheet, response_csv, assessment_subject):
    """Parses CSV output from Gemini and saves evaluations in the database."""
    print("Entering save_evaluation_to_db")
    try:
        # Log raw response for debugging
        logger.debug("Raw response from Gemini: %r", response_csv)

        # Clean the response: remove ```csv and ``` markers, strip all whitespace/newlines
        cleaned_csv = re.sub(r'```csv|```', '', response_csv).strip()
        cleaned_csv = re.sub(r'^\s+', '', cleaned_csv, flags=re.MULTILINE)
        print("Cleaned CSV: %r", cleaned_csv)

        # More flexible header check - allow both with and without quotes
        if not (cleaned_csv.startswith('"question_number"') or cleaned_csv.startswith('question_number')):
            print("CSV does not start with 'question_number'. First 50 chars: %r", cleaned_csv[:50])
            raise ValueError("CSV response does not have the expected header with 'question_number'")

        csv_reader = csv.DictReader(io.StringIO(cleaned_csv))
        print("CSV Headers: %s", csv_reader.fieldnames)

        expected_headers = [
            "question_number", "question", "answer_in_student_sheet",
            "actual_marks", "obtained_marks", "confidence_score",
            "reason", "weakness_tags", "strength_tags", "not_detected_word"
        ]

        # Check that all expected headers are present, in any order
        if not all(header in csv_reader.fieldnames for header in expected_headers):
            print(f"Missing expected CSV headers. Found: {csv_reader.fieldnames}, expected: {expected_headers}")
            raise ValueError(f"Missing expected CSV headers. Found: {csv_reader.fieldnames}, expected: {expected_headers}")

        # Rest of your code remains the same
        for row in csv_reader:
            print("Processing row: %s", row)
            DigitalMarking.objects.create(
                student_answer_sheet=answer_sheet,
                school=assessment_subject.school,
                question_number=row["question_number"],
                question=row["question"],
                answer=row["answer_in_student_sheet"],
                actual_mark=int(row["actual_marks"]),
                obtained_mark=int(row["obtained_marks"]),
                confidence_score=float(row["confidence_score"]),
                reason=row["reason"],
                strength_tags=row["strength_tags"].split(",") if row["strength_tags"] else [],
                weakness_tags=row["weakness_tags"].split(",") if row["weakness_tags"] else [],
                batch=assessment_subject.batch,
                term=assessment_subject.term,
                not_detected_word=row["not_detected_word"].split(",") if row["not_detected_word"] else [],
            )
        print(f"Saved evaluation for student_answer_sheet: {answer_sheet.id}")

    except ValueError as ve:
        print(f'ValueError in save_evaluation_to_db: {ve}', exc_info=True)
        raise
    except Exception as e:
        print(f"Error in save_evaluation_to_db: {e}", exc_info=True)
        raise


@shared_task
def update_assessment_status(assessment_sub_id):
    """
    Callback to update the assessment status after all OCR tasks have completed,
    and generate quizzes for students based on their feedback.
    Also sends notifications and emails for manual review where required.
    """
    try:
        student_answer_sheets = StudentAnswerSheet.objects.filter(assessment_subject_id=assessment_sub_id)

        # Store students with questions needing manual review
        students_needing_manual_review = []
        model = genai.GenerativeModel(
            'gemini-2.5-pro-exp-03-25',
            system_instruction="""
                You are a supportive and experienced teaching instructor providing personalized student feedback. 
                Craft a concise, informative, and motivational feedback paragraph that:
                - Highlights the student's key strengths
                - Provides specific, actionable advice for improvement
                - Maintains an encouraging and constructive tone
                - Avoids overly critical or negative language
                - keep the feedback brief, concise and focused on the student's performance
                - and directly just share feedback only not any other information.
                """
        )

        for answer_sheet in student_answer_sheets:
            # Aggregate results per student
            # print(f"Processing answer sheet for {answer_sheet}")
            result = DigitalMarking.objects.filter(student_answer_sheet=answer_sheet).aggregate(
                total_obtain_marks=Sum(
                    Case(
                        When(obtained_manual_mark__isnull=False, then=F("obtained_manual_mark")),
                        default=F("obtained_mark")
                    )
                ),
                total_actual_marks=Sum("actual_mark")
            )
            # print(f"Result: {result}")
            obtain_marks = result.get("total_obtain_marks", 0) or 0
            actual_marks = result.get("total_actual_marks", 0) or 0
            # print(f"Obtained Marks: {obtain_marks}, Actual Marks: {actual_marks}")

            # Check if manual review is needed (obtained marks ≠ actual marks)
            if obtain_marks != actual_marks:
                student = answer_sheet.student
                students_needing_manual_review.append({
                    "name": f"{student.first_name} {student.last_name}",
                    "admission_no": student.addmission_no,
                    "total_questions_to_review": DigitalMarking.objects.filter(
                        student_answer_sheet=answer_sheet, obtained_mark__lt=F("actual_mark")
                    ).count(),
                    "student_email": student.email
                })

            # Retrieve strengths and weaknesses from DigitalMarking
            markings = DigitalMarking.objects.filter(student_answer_sheet=answer_sheet)
            # print(f"Markings: {markings}")
            strengths = markings.values_list("strength_tags", flat=True)
            # print(f"Strengths_neel: {strengths}")
            weaknesses = markings.values_list("weakness_tags", flat=True)

            all_strengths = []
            for strength_list in strengths:
                if isinstance(strength_list, list):  # Check if it's a list
                    all_strengths.extend(strength_list)
                elif strength_list:  # If it's a non-empty string or other value
                    all_strengths.append(strength_list)

            all_weaknesses = []
            for weakness_list in weaknesses:
                if isinstance(weakness_list, list):
                    all_weaknesses.extend(weakness_list)
                elif weakness_list:
                    all_weaknesses.append(weakness_list)

            # Now join the flattened lists
            strength_text = ", ".join(all_strengths) if all_strengths else "None"
            weakness_text = ", ".join(all_weaknesses) if all_weaknesses else "None"

            # Generate feedback using AI model with specific system instruction
            prompt = (
                "\n\nFeedback Details:"
                f"\n- **Strengths**: {strength_text}"
                f"\n- **Weaknesses**: {weakness_text}"
            )
            # print(f"Generating feedback for answer sheet {prompt}")
            try:
                # Use advanced generation with system instruction
                response = model.generate_content(
                    prompt,
                    generation_config={
                        "max_output_tokens": 8192,
                        "temperature": 0.3,  # More focused, less random output
                    }
                )
                # print(f"Feedback response: {response.text}")
                # print(f"Feedback candis-dates: {response.candidates}")
                # Carefully extract feedback text with error handling
                if response.candidates:
                    feedback_text = response.text
                else:
                    # Fallback feedback if no response
                    feedback_text = (
                        f"Based on your performance, your strengths include: {strength_text}. "
                        f"Areas for improvement: {weakness_text}. "
                        "Continue practicing and seeking help when needed."
                    )
                    # print(f"No AI-generated feedback for answer sheet {answer_sheet.id}")

            except Exception as gen_error:
                # Fallback feedback if generation fails
                feedback_text = (
                    f"Based on your performance, your strengths include: {strength_text}. "
                    f"Areas for improvement: {weakness_text}. "
                    "Continue practicing and seeking help when needed."
                )
                # print(f"Feedback generation failed for answer sheet {answer_sheet.id}: {gen_error}")

            # Check if all OCR tasks for the student are complete
            if not AnswerSheetImage.objects.filter(student_answer_sheet=answer_sheet.id, ocr_status=False).exists():
                # print(f"Updating answer sheet for {answer_sheet}")
                answer_sheet.ocr_status = True
                answer_sheet.obtained_mark = obtain_marks
                answer_sheet.actual_mark = actual_marks
                answer_sheet.feedback = feedback_text
                answer_sheet.save()

        # Check if all answer sheets for this assessment subject are processed
        if not StudentAnswerSheet.objects.filter(
                assessment_subject_id=assessment_sub_id,
                ocr_status=False
        ).exists():
            AssessmentSubject.objects.filter(id=assessment_sub_id).update(ocr_status="completed")

            assessment_subject = AssessmentSubject.objects.get(id=assessment_sub_id)
            assessment_name = assessment_subject.paper_title
            total_students = StudentAnswerSheet.objects.filter(
                assessment_subject_id=assessment_sub_id
            ).count()

            # Notify teachers/admins of grading completion
            completion_message = (
                f"Grading Process Completed for '{assessment_name}' for {total_students} Learners."
            )
            module_name = "assessments"
            create_notification_for_teachers(title="Grading Process Completed", message=completion_message,
                                             module_name=module_name, school_id=assessment_subject.school.id)
            create_notification_for_school_admins(title="Grading Process Completed", message=completion_message,
                                                  module_name=module_name, school_id=assessment_subject.school.id)

            # Notify about students needing manual review
            if students_needing_manual_review:
                email_context = {
                    "students": students_needing_manual_review,
                    "assessment_name": assessment_subject.assessment.assessment_name,
                    "assessment_subject_name": assessment_subject.paper_title,
                    "reviewUrl": f"{settings.SUPER_SCHOOL_FRONTEND}nsc-app/manual-review",
                    "email_logo": f"{settings.SUPER_SCHOOL_BACKEND}public/images/logo/nsc_email.png"
                }

                email_subject = "Manual Review Required for Students' Answer Sheets"
                template_text_teacher = "emails/manual_intervention_email_teacher.txt"
                template_html_teacher = "emails/manual_intervention_email_teacher.html"
                template_text_admin = "emails/manual_intervention_email_admin.txt"
                template_html_admin = "emails/manual_intervention_email_admin.html"

                create_notification_for_teachers(
                    title="Manual Review Needed",
                    message=f"Manual review required for assessment '{assessment_subject.assessment.assessment_name}' - Subject: '{assessment_subject.paper_title}'.",
                    module_name=module_name,
                    school_id=assessment_subject.school.id
                )
                create_notification_for_school_admins(
                    title="Manual Review Needed",
                    message=f"Manual review required for assessment '{assessment_subject.assessment.assessment_name}' - Subject: '{assessment_subject.paper_title}'.",
                    module_name=module_name,
                    school_id=assessment_subject.school.id
                )

                send_email_to_teachers(title="Manual Review Required", subject=email_subject,
                                       template_name_text=template_text_teacher,
                                       template_name_html=template_html_teacher, context=email_context,
                                       module_name=module_name, school_id=assessment_subject.school.id)
                send_email_to_admins(title="Manual Review Required", subject=email_subject,
                                     template_name_text=template_text_admin, template_name_html=template_html_admin,
                                     context=email_context, module_name=module_name,
                                     school_id=assessment_subject.school.id)

        # Check if the overall assessment is complete
        assessment_id = AssessmentSubject.objects.filter(id=assessment_sub_id).values_list("assessment_id",
                                                                                           flat=True).first()

        if not AssessmentSubject.objects.filter(assessment_id=assessment_id,
                                                ocr_status__in=["not started", "in progress"]).exists():
            Assessment.objects.filter(id=assessment_id).update(ocr_status="completed")

    except Exception as e:
        print("Error in update_assessment_status:", e)
        traceback.print_exc()