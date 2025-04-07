from django.db.models import Q

from nest_db_app.models import Notification
from nest_db_app.models import Teacher, User, ClassSubject, Module, Student
from nest_db_app.services.send_notification import send_notification
from django.utils.translation import gettext as _

def create_notification_for_students(title, message, module_name, grade_id=None, grade_class_id=None, subject_id=None,
                                     school_id=None):
    """
    Sends notifications to students based on provided filters.
    """

    module_id = Module.objects.get(module_name_show=module_name)
    filters = Q()
    if grade_id:
        filters &= Q(grade_id=grade_id)
    if grade_class_id:
        filters &= Q(grade_class_id=grade_class_id)
    if subject_id:
        filters &= Q(subject_id=subject_id)
    if school_id:
        filters &= Q(school_id=school_id)

    # Fetch students based on filters
    class_subjects = ClassSubject.objects.filter(filters).prefetch_related('students')
    student_ids = class_subjects.values_list('students__student_user_id', flat=True).distinct()
    # Create notifications for students
    if student_ids:
        notifications = [
            Notification(
                title=title,
                message=message,
                to_user_id=student_id,
                school_id=school_id,
                module=module_id,  # Replace with appropriate module ID if available
            )
            for student_id in student_ids if student_id is not None  # Filter out None values
        ]
        Notification.objects.bulk_create(notifications)
        send_notification(school_id)
    print(f"Notifications sent to students.")
    return {"message": _("Notifications sent to students.")}

def create_notification_for_parents(title, message, module_name, grade_id=None, grade_class_id=None, school_id=None):
    """
    Sends notifications to all parents of students based on provided filters.
    """

    # Get the module by its name
    module_id = Module.objects.get(module_name_show=module_name)

    # Build query filters for students
    filters = Q()
    if grade_id:
        filters &= Q(grade_id=grade_id)
    if grade_class_id:
        filters &= Q(grade_class_id=grade_class_id)
    if school_id:
        filters &= Q(school_id=school_id)

    # Fetch students based on the filters
    students = Student.objects.filter(filters).prefetch_related('parents')

    # Collect parent user IDs (from linked Parent models)
    parent_ids = students.values_list('parents__parent_user__id', flat=True).distinct()

    # Create notifications for parents
    if parent_ids:
        notifications = [
            Notification(
                title=title,
                message=message,
                to_user_id=parent_id,
                school_id=school_id,  # Assuming school_id is passed to this function
                module=module_id,
            )
            for parent_id in parent_ids if parent_id
        ]

        # Bulk create notifications
        Notification.objects.bulk_create(notifications)
        send_notification(school_id)
        print(f"Notifications sent to {len(notifications)} parents.")
        return {"message": _("Notifications sent to %(count)s parents.") % {"count": len(notifications)}}


def create_notification_for_teachers(title, message, module_name, school_id):
    """
    Sends notifications to all teachers in a given school.
    """
    module_id = Module.objects.get(module_name_show=module_name)
    teacher_ids = Teacher.objects.filter(school_id=school_id).values_list('teacher_user__id', flat=True)
    if teacher_ids:
        notifications = [
            Notification(
                title=title,
                message=message,
                to_user_id=teacher_id,
                school_id=school_id,
                module=module_id,  # Replace with appropriate module ID if available
            )
            for teacher_id in teacher_ids
        ]
        Notification.objects.bulk_create(notifications)
        send_notification(school_id)
        print("Notifications sent to all teachers.")
        return {"message": _("Notifications sent to %(count)s teachers.") % {"count": len(notifications)}}



def create_notification_for_school_admins(title, message, module_name, school_id):
    """
    Sends notifications to all admins in a given school.
    """
    module_id = Module.objects.get(module_name_show=module_name)
    admin_ids = User.objects.filter(role__role_name="admin", school_id=school_id).values_list('id', flat=True)

    if admin_ids:
        notifications = [
            Notification(
                title=title,
                message=message,
                to_user_id=admin_id,
                school_id=school_id,
                module=module_id,  # Replace with appropriate module ID if available
            )
            for admin_id in admin_ids
        ]
        Notification.objects.bulk_create(notifications)
        send_notification(school_id)
        print(f"Notifications sent to {len(notifications)} school admins.")
        return {"message": _("Notifications sent to %(count)s school admins.") % {"count": len(notifications)}}

