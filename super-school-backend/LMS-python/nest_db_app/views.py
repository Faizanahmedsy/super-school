import json
import os

import google.generativeai as genai

genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))


def update_user_obj(user_obj, school_id):
    user_obj.school_id = school_id
    return user_obj


def convert_to_json(response_string):
    """
    Converts a string to a JSON object, handling any formatting inconsistencies.
    """
    try:
        # Remove the triple backticks if they exist
        response_string = response_string.replace('```json', '').replace('```', '').strip()

        # Convert the string to a JSON object
        json_obj = json.loads(response_string)
        return json_obj
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return None


def generate_quiz_with_ai(number_of_questions, grade, subject, subject_code, weakness_tags):
    # Generate the prompt for AI
    prompt = f"""
        You are an expert educational quiz generator. Your task is to create a multiple-choice quiz for South African students based on the given **standard (grade), subject, and identified weaknesses**.
        
        #### **Quiz Specifications:**
        - **Number of Questions:** {number_of_questions}
        - **Grade Level:** {grade}
        - **Subject:** {subject}
        - **Subject Code:** {subject_code}
        - **Top Student Weaknesses:** {weakness_tags}
        
        #### **Instructions:**
        - **Generate a relevant `quiz_topic`** that best represents the quiz content based on the **subject and weaknesses**.
        - Follow the **South African curriculum** guidelines.
        - Ensure questions are **challenging but appropriate** for the grade level.
        - Incorporate **the provided weaknesses** into the questions.
        - Each question must have **exactly four answer options**.
        - Some questions may have **one correct answer (single-choice)**, while others may have **multiple correct answers (multi-choice)**.
        - Clearly indicate **multi_choice: true/false** for each question.
        - **Strictly adhere to the JSON output format** (no extra text, explanations, or comments).
        
        #### **Expected JSON Output Format:**
        ```json
        {{
            "title": "{subject} {grade} Quiz",
            "quiz_topic": "AI-GENERATED QUIZ TOPIC BASED ON SUBJECT & WEAKNESSES",
            "questions": [
                {{
                    "question": "What is the capital of South Africa?",
                    "options": ["Pretoria", "Cape Town", "Johannesburg", "Durban"],
                    "actual_answers": ["Pretoria"],
                    "multi_choice": false
                }},
                {{
                    "question": "Which of the following are official South African languages?",
                    "options": ["Zulu", "Afrikaans", "French", "Xhosa"],
                    "actual_answers": ["Zulu", "Afrikaans", "Xhosa"],
                    "multi_choice": true
                }}
            ],
            "no_of_questions": {number_of_questions}
        }}
        
        ⚠️ Important:
        
        AI must generate a meaningful quiz_topic based on the subject and weaknesses.
        Return ONLY valid JSON output in the above format.
        Do NOT include any explanations, notes, or extra text outside the JSON.
        Ensure all answer options and actual_answers are valid strings.
    """

    # Generate quiz using AI (replace this with your actual AI model generation call)
    response = genai.GenerativeModel('gemini-1.5-flash').generate_content(prompt)
    ai_quiz_data = convert_to_json(response.text)  # Assuming this converts AI response into a usable format
    return ai_quiz_data


def get_achievement_details(marks, actual_marks):
    if marks is None:
        return None, None, None

    if not actual_marks:
        return None, None, None

    if actual_marks <= 0:  # Prevent division by zero
        return None, None, None

    # Calculate percentage
    percentage = round((marks / actual_marks) * 100,2)

    # Determine level and description based on percentage
    match percentage:
        case percentage if 80 <= percentage <= 100:
            return 7, "Outstanding achievement",percentage
        case percentage if 70 <= percentage <= 79:
            return 6, "Meritorious achievement",percentage
        case percentage if 60 <= percentage <= 69:
            return 5, "Substantial achievement",percentage
        case percentage if 50 <= percentage <= 59:
            return 4, "Adequate achievement",percentage
        case percentage if 40 <= percentage <= 49:
            return 3, "Moderate achievement",percentage
        case percentage if 30 <= percentage <= 39:
            return 2, "Elementary achievement",percentage
        case percentage if 0 <= percentage <= 29:
            return 1, "Not achieved",percentage
        case _:
            return None, "Invalid marks",None