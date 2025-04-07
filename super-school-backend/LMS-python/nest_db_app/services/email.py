from django.db.models import Q
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

from nest_db_app.models import *


def send_email(subject, recipients, template_name_text, template_name_html, context):
    """
    Generic email-sending method that supports both text and HTML templates.

    :param subject: Email subject
    :param recipients: List of email recipients
    :param template_name_text: Path to the plain text email template
    :param template_name_html: Path to the HTML email template
    :param context: Context to render the email templates
    """
    try:
        # Render email content
        text_content = render_to_string(template_name_text, context)
        html_content = render_to_string(template_name_html, context)

        # Send email
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipients
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
    except Exception as e:
        print(f"Error sending email: {e}")


def send_email_to_students(title, subject, template_name_text, template_name_html, context, module_name,
                           grade_id=None, grade_class_id=None, subject_id=None, school_id=None):
    """
    Fetch email IDs dynamically for students based on filters, just like notifications.
    :param title: Title of the email
    :param subject: Subject of the email
    :param template_name_text: Plain text template for the email
    :param template_name_html: HTML template for the email
    :param context: Context dictionary to use in the templates
    :param module_name: Name of the module associated with the email
    :param grade_id: Filter emails by grade ID
    :param grade_class_id: Filter emails by grade class ID
    :param subject_id: Filter emails by subject ID
    :param school_id: Filter emails by school ID
    """
    try:
        # Get module ID based on module name
        module_id = Module.objects.get(module_name_show=module_name)

        # Build filters dynamically like in the notification logic
        filters = Q()
        if grade_id:
            filters &= Q(grade_id=grade_id)
        if grade_class_id:
            filters &= Q(grade_class_id=grade_class_id)
        if subject_id:
            filters &= Q(subject_id=subject_id)
        if school_id:
            filters &= Q(school_id=school_id)

        # Fetch student email addresses with filters
        class_subjects = ClassSubject.objects.filter(filters).prefetch_related('students')
        student_emails = class_subjects.values_list('students__email', flat=True).distinct()

        # If emails exist, send the email
        if student_emails:
            send_email(
                subject=subject,
                recipients=list(student_emails),
                template_name_text=template_name_text,
                template_name_html=template_name_html,
                context=context
            )
    except Exception as e:
        print(f"Error sending email to students: {e}")


def send_email_to_parents(title, subject, template_name_text, template_name_html, context, module_name,
                          grade_id=None, grade_class_id=None, subject_id=None, school_id=None):
    """
    Fetch email IDs dynamically for parents based on filters, just like notifications.
    :param title: Title of the email
    :param subject: Subject of the email
    :param template_name_text: Plain text template for the email
    :param template_name_html: HTML template for the email
    :param context: Context dictionary to use in the templates
    :param module_name: Name of the module associated with the email
    :param grade_id: Filter emails by grade ID
    :param grade_class_id: Filter emails by grade class ID
    :param subject_id: Filter emails by subject ID
    :param school_id: Filter emails by school ID
    """
    try:
        # Get module ID based on module name
        module_id = Module.objects.get(module_name_show=module_name)

        # Build filters dynamically like in the notification logic
        filters = Q()
        if grade_id:
            filters &= Q(grade_id=grade_id)
        if grade_class_id:
            filters &= Q(grade_class_id=grade_class_id)
        if subject_id:
            filters &= Q(subject_id=subject_id)
        if school_id:
            filters &= Q(school_id=school_id)

        # Fetch parent email addresses with filters
        class_subjects = ClassSubject.objects.filter(filters).prefetch_related('students')
        parent_emails = class_subjects.values_list('students__parent_email', flat=True).distinct()

        # If emails exist, send the email
        if parent_emails:
            send_email(
                subject=subject,
                recipients=list(parent_emails),
                template_name_text=template_name_text,
                template_name_html=template_name_html,
                context=context
            )
    except Exception as e:
        print(f"Error sending email to parents: {e}")


def send_email_to_teachers(title, subject, template_name_text, template_name_html, context, module_name, school_id):
    """
    Fetch email IDs dynamically for teachers in a school, just like notifications.
    :param title: Title of the email
    :param subject: Subject of the email
    :param template_name_text: Plain text template for the email
    :param template_name_html: HTML template for the email
    :param context: Context dictionary to use in the templates
    :param module_name: Name of the module associated with the email
    :param school_id: Filter emails by school ID
    """
    try:
        # Get module ID based on module name
        module_id = Module.objects.get(module_name_show=module_name)

        # Fetch teacher emails based on school ID
        teacher_emails = Teacher.objects.filter(school_id=school_id).values_list('teacher_user__email', flat=True)

        # If emails exist, send the email
        if teacher_emails:
            send_email(
                subject=subject,
                recipients=list(teacher_emails),
                template_name_text=template_name_text,
                template_name_html=template_name_html,
                context=context
            )
    except Exception as e:
        print(f"Error sending email to teachers: {e}")


def send_email_to_admins(title, subject, template_name_text, template_name_html, context, module_name, school_id):
    """
    Fetch email IDs dynamically for school admins, just like notifications.
    :param title: Title of the email
    :param subject: Subject of the email
    :param template_name_text: Plain text template for the email
    :param template_name_html: HTML template for the email
    :param context: Context dictionary to use in the templates
    :param module_name: Name of the module associated with the email
    :param school_id: Filter emails by school ID
    """
    try:
        # Get module ID based on module name
        module_id = Module.objects.get(module_name_show=module_name)

        # Fetch admin emails based on school ID
        admin_emails = User.objects.filter(role__role_name="admin", school_id=school_id).values_list('email', flat=True)

        # If emails exist, send the email
        if admin_emails:
            send_email(
                subject=subject,
                recipients=list(admin_emails),
                template_name_text=template_name_text,
                template_name_html=template_name_html,
                context=context
            )
    except Exception as e:
        print(f"Error sending email to admins: {e}")