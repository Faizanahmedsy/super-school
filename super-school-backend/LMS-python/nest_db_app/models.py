from django.db import models


class Province(models.Model):
    # from nest_db_app.models import User
    province_name = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'provinces'
        verbose_name = 'province'
        db_table = 'provinces'


class District(models.Model):
    # from nest_db_app.models import User
    district_name = models.CharField(max_length=100)
    province = models.ForeignKey(Province, on_delete=models.CASCADE, related_name='districts_province')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'districts'
        verbose_name = 'district'
        db_table = 'districts'


class MasterSubject(models.Model):
    grade_number = models.CharField()
    subject_name = models.CharField()
    subject_code = models.CharField(unique=True)
    is_language = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'master_subject'
        verbose_name = 'master_subject'
        verbose_name_plural = 'master_subjects'


class Role(models.Model):
    role_name = models.CharField()  # use in backend to check condition
    role_name_show = models.CharField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'roles'
        verbose_name = 'role'
        db_table = 'roles'


class User(models.Model):
    # from nest_db_app.models import School
    email = models.EmailField()
    password = models.CharField(null=True, blank=True)
    user_name = models.CharField()
    status = models.CharField(null=True, blank=True)
    role = models.ForeignKey(Role, on_delete=models.DO_NOTHING, related_name='users_role')
    school = models.ForeignKey('School', on_delete=models.DO_NOTHING, related_name='users_school', null=True,
                               blank=True)
    resetToken = models.CharField(null=True, blank=True)
    resetTokenExpires = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('self', on_delete=models.DO_NOTHING, related_name='users_created_by',
                                   db_column='created_by', null=True, blank=True)
    updated_by = models.ForeignKey('self', on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='users_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey('self', on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='users_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'users'
        verbose_name = 'user'
        db_table = 'users'


class Module(models.Model):
    module_name = models.CharField()
    module_name_show = models.CharField()
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='modules_created_by', null=True,
                                   blank=True, db_column='created_by')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='modules_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='modules_deleted_by', db_column='deleted_by')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'modules'
        verbose_name = 'module'
        db_table = 'modules'


class School(models.Model):
    logo = models.CharField(null=True, blank=True)
    school_name = models.CharField(max_length=100)
    province = models.ForeignKey(Province, on_delete=models.DO_NOTHING, related_name='schools_province')
    district = models.ForeignKey(District, on_delete=models.DO_NOTHING, related_name='schools_district')
    school_type = models.CharField(max_length=100)
    medium_of_instruction = models.CharField(max_length=100)
    EMIS_number = models.CharField()
    address = models.CharField()
    location_type = models.CharField()
    contact_number = models.CharField(max_length=15, null=True, blank=True)
    contact_person = models.CharField()
    contact_email = models.EmailField()
    themePrimaryColor = models.CharField(null=True, blank=True)
    themeSecondaryColor = models.CharField(null=True, blank=True)
    max_users = models.IntegerField()
    current_users = models.IntegerField(null=True, blank=True)
    setup = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='schools_created_by',
                                   db_column='created_by')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='schools_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='schools_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'schools'
        verbose_name = 'school'
        db_table = 'schools'


class SchoolSetup(models.Model):
    admin_id = models.IntegerField()
    school_id = models.IntegerField()
    current_step =  models.CharField(default='CREATE_YEAR')
    year_data = models.JSONField(null=True, blank=True)
    grades_data = models.JSONField(null=True, blank=True)
    classes_data = models.JSONField(null=True, blank=True)
    subjects_data = models.JSONField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    batch_id = models.IntegerField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'school_setups'
        verbose_name = 'school_setup'
        db_table = 'school_setup'

class Permission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='permissions_role')
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='permissions_module')
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='permissions_school',null=True,blank=True)
    allow = models.JSONField()
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='permissions_created_by',
                                   db_column='created_by')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='permissions_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='permissions_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'permissions'
        verbose_name = 'permission'
        db_table = 'permissions'


class Batch(models.Model):
    start_year = models.CharField()
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='batches_school')
    is_active = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='batches_created_by',
                                   db_column='created_by')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='batches_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='batches_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'batches'
        verbose_name = 'batch'
        db_table = 'batches'


class Term(models.Model):
    term_name = models.CharField(max_length=100)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='terms_school')
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='terms_batch')
    status = models.BooleanField()
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='terms_created_by',
                                   db_column='created_by')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='terms_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='terms_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'terms'
        verbose_name = 'term'
        db_table = 'terms'


class Grade(models.Model):
    grade_number = models.IntegerField()
    description = models.CharField(max_length=100, null=True)
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='grades_school')
    batch = models.ForeignKey(Batch, on_delete=models.DO_NOTHING, related_name='grades_batch', null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='grades_created_by',
                                   db_column='created_by')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='grades_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='grades_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'grades'
        verbose_name = 'grade'
        db_table = 'grades'


class Subject(models.Model):
    master_subject = models.ForeignKey(MasterSubject, on_delete=models.DO_NOTHING,
                                       related_name='subjects_master_subject')
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='subjects_school')
    grade = models.ForeignKey(Grade, on_delete=models.DO_NOTHING, related_name='subjects_grade')
    batch = models.ForeignKey(Batch, on_delete=models.DO_NOTHING, related_name='subjects_batch')
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='subjects_created_by',
                                   db_column='created_by')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='subjects_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='subjects_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'subjects'
        verbose_name = 'subject'
        db_table = 'subjects'


class GradeClass(models.Model):
    name = models.CharField(max_length=100)
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, related_name='grade_classes_grade')
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='grade_classes_school')
    subject = models.ManyToManyField(Subject)
    batch = models.ForeignKey(Batch, on_delete=models.DO_NOTHING, related_name='grade_classes_batch', null=True,
                              blank=True)
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='grade_classes_created_by',
                                   db_column='created_by')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='grade_classes_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='grade_classes_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'grade_classes'
        verbose_name = 'grade_class'
        db_table = 'grade_classes'


class SchoolAdmin(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    mobile_number = models.CharField(max_length=100, null=True, blank=True)
    gender = models.CharField(max_length=100, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    profile_image = models.CharField(null=True, blank=True)
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='school_admins_school')
    school_admin_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='school_admins_user')
    role = models.ForeignKey(Role, on_delete=models.DO_NOTHING, related_name='school_admins_role')
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='school_admins_created_by',
                                   db_column='created_by')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='school_admins_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='school_admins_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'school_admins'
        verbose_name = 'school_admin'
        db_table = 'school_admins'


class Teacher(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    mobile_number = models.CharField(max_length=100)
    gender = models.CharField(max_length=100, null=True, blank=True)
    subject_specialization = models.CharField(max_length=100, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    hire_date = models.DateTimeField(null=True, blank=True)
    profile_image = models.CharField(null=True, blank=True)
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='teachers_school')
    teacher_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='teachers_user')
    role = models.ForeignKey(Role, on_delete=models.DO_NOTHING, related_name='teachers_role')
    extra_activity = models.CharField(null=True, blank=True)
    cur_batch = models.ForeignKey(Batch, on_delete=models.DO_NOTHING, related_name='teachers_cur_batch', null=True,
                                  blank=True)
    sace_number = models.CharField(max_length=255)
    persal_number = models.CharField(max_length=255,null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='teachers_created_by',
                                   db_column='created_by')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='teachers_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='teachers_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'teachers'
        verbose_name = 'teacher'
        db_table = 'teachers'


class Parent(models.Model):
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    mobile_number = models.CharField(max_length=100, null=True, blank=True)
    gender = models.CharField(max_length=100, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    profile_image = models.CharField(null=True, blank=True)
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='parents_school')
    parent_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='parents_user', null=True, blank=True)
    no_of_student = models.IntegerField(null=True, blank=True)
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='parents_role')
    relationship = models.CharField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='parents_created_by',
                                   db_column='created_by')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='parents_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='parents_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'parents'
        verbose_name = 'parent'
        db_table = 'parents'


class Student(models.Model):
    addmission_no = models.CharField(null=True, blank=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    mobile_number = models.CharField(max_length=100)
    gender = models.CharField(max_length=100, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    profile_image = models.CharField(null=True, blank=True)
    cur_batch = models.ForeignKey(Batch, on_delete=models.DO_NOTHING, related_name='students_cur_batch')
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='students_school')
    student_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='students_user')
    role = models.ForeignKey(Role, on_delete=models.DO_NOTHING, related_name='students_role')
    parents = models.ManyToManyField(Parent)
    grade = models.ForeignKey(Grade, on_delete=models.DO_NOTHING, related_name='students_grade', null=True, blank=True)
    grade_class = models.ForeignKey(GradeClass, on_delete=models.DO_NOTHING, related_name='students_grade_class')
    # subjects = models.ManyToManyField(Subject)
    quiz_count = models.IntegerField(default=25)
    extra_activity = models.CharField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='students_created_by',
                                   db_column='created_by')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='students_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='students_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'students'
        verbose_name = 'student'
        db_table = 'students'


# from these we have craeted from python perspective need to follow this.

class ClassSubject(models.Model):
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, related_name='class_subjects_grade')
    grade_class = models.ForeignKey(GradeClass, on_delete=models.CASCADE, related_name='class_subjects_grade_class')
    subject = models.ForeignKey(Subject, on_delete=models.DO_NOTHING, related_name='class_subjects_subject')
    master_subject = models.ForeignKey(MasterSubject, on_delete=models.DO_NOTHING,
                                       related_name='class_subjects_master_subject')
    teacher = models.ForeignKey(Teacher, on_delete=models.DO_NOTHING, related_name='class_subjects_teacher')
    students = models.ManyToManyField(Student)
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='class_subjects_school')
    batch = models.ForeignKey(Batch, on_delete=models.DO_NOTHING, related_name='class_subjects_batch')
    term = models.ForeignKey(Term, on_delete=models.DO_NOTHING, related_name='class_subjects_term')
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='class_subjects_created_by',
                                   db_column='created_by')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='class_subjects_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='class_subjects_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'class_subjects'
        verbose_name = 'class_subject'
        db_table = 'class_subjects'


class Notification(models.Model):
    title = models.CharField()
    message = models.CharField()
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications_to_user')
    is_read = models.BooleanField(default=False)
    module = models.ForeignKey(Module, on_delete=models.DO_NOTHING, related_name='notifications_module')
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='notifications_school')
    grade = models.ForeignKey(Grade, on_delete=models.DO_NOTHING, related_name='notifications_grade', null=True,
                                blank=True)
    grade_class = models.ForeignKey(GradeClass, on_delete=models.DO_NOTHING, related_name='notifications_grade_class',
                                    null=True, blank=True)
    event = models.ForeignKey('CalenderEvent', on_delete=models.DO_NOTHING, related_name='notifications_event', null=True,
                                blank=True)
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='notifications_created_by',
                                   db_column='created_by',null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                      related_name='notifications_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                        related_name='notifications_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    show_to_all = models.BooleanField(default=False,null=True, blank=True)
    recipient_count = models.IntegerField(default=0,null=True, blank=True)

    class Meta:
        verbose_name_plural = 'notifications'
        verbose_name = 'notification'
        db_table = 'notifications'


class OldQuestionPapers(models.Model):
    paper_name = models.CharField()
    paper_exam_date = models.DateField()
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='old_question_papers_subject')
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, related_name='old_question_papers_grade')
    batch = models.ForeignKey(Batch, on_delete=models.DO_NOTHING, related_name='old_question_papers_batch')
    term = models.ForeignKey(Term, on_delete=models.DO_NOTHING, related_name='old_question_papers_term')
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='old_question_papers_school')
    question_paper = models.FileField()
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='old_question_papers_created_by',
                                   db_column='created_by')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='old_question_papers_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='old_question_papers_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True, )
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'old_question_papers'
        verbose_name = 'old_question_paper'
        db_table = 'old_question_papers'


class CalenderEvent(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='calenders_school')
    event_name = models.CharField()
    grade_class = models.ForeignKey(GradeClass, on_delete=models.DO_NOTHING, related_name='calenders_grade_class',
                                    db_column='class_id', null=True, blank=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    start_time = models.CharField(max_length=10,null=True, blank=True)
    end_time = models.CharField(max_length=10,null=True, blank=True)
    description = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    grade = models.ForeignKey(Grade, on_delete=models.DO_NOTHING, related_name='calenders_grade',null=True,blank=True)
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='calenders_created_by',
                                   db_column='created_by')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='calenders_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='calenders_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'calendar_event'
        verbose_name_plural = 'calendar_event'
        db_table = 'calendar_event'


class AuditLog(models.Model):
    role = models.ForeignKey(Role, on_delete=models.DO_NOTHING, related_name='audit_logs_role', null=True, blank=True)
    action = models.CharField()
    message = models.CharField()
    old_data = models.JSONField(null=True, blank=True)
    new_data = models.JSONField(null=True, blank=True)
    action_user = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='audit_logs_action_user', null=True,
                                    blank=True)
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='audit_logs_school', null=True,
                               blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'audit_logs'
        verbose_name = 'audit_log'
        db_table = 'audit_log'


class DepartmentUser(models.Model):
    first_name = models.CharField()
    last_name = models.CharField()
    email = models.EmailField()
    mobile_number = models.CharField(max_length=15, null=True, blank=True)
    profile_image = models.ImageField(null=True, blank=True)
    job_title = models.CharField()
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='department_users_district')
    province = models.ForeignKey(Province, on_delete=models.CASCADE, related_name='department_users_province')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='department_users_role')
    department_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='department_users_user', null=True,
                                        blank=True)
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='department_users_created_by',
                                   db_column='created_by')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='department_users_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='department_users_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'department_user'
        verbose_name = 'department_user'
        verbose_name_plural = 'department_users'

class LessonPlans(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='lesson_plans_school')
    grade = models.ForeignKey(Grade, on_delete=models.DO_NOTHING, related_name='lesson_plans_grade',null=True,blank=True)
    grade_class = models.ForeignKey(GradeClass, on_delete=models.DO_NOTHING, related_name='lesson_plans_grade_class',null=True,blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.DO_NOTHING, related_name='lesson_plans_subject', null=True,blank=True)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='lesson_plans_user')
    batch = models.ForeignKey(Batch, on_delete=models.DO_NOTHING, related_name='lesson_plans_batch',null=True,blank=True)
    title = models.CharField()
    notes = models.CharField(null=True, blank=True)
    activity = models.TextField()
    activity_type = models.CharField()
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'lesson_plans'
        verbose_name = 'lesson_plan'
        db_table = 'lesson_plans'

class GeneralSetting (models.Model):
    theme_primary_color = models.CharField(null=True, blank=True)
    theme_secondary_color = models.CharField(null=True, blank=True)
    support_email = models.CharField(max_length=255,default="support@pax-africana.co.za")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'general_settings'
        verbose_name = 'general_setting'
        db_table = 'general_setting'


class StudyMaterial(models.Model):
    type = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    topic = models.CharField(max_length=255,null=True,blank=True)
    file = models.CharField(null=True, blank=True)
    url = models.CharField(max_length=255, null=True, blank=True)
    year = models.CharField(max_length=255,null=True, blank=True)
    month = models.CharField(max_length=255,null=True, blank=True)
    batch = models.ForeignKey(Batch, on_delete=models.DO_NOTHING, related_name='study_materials_batch',null=True, blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.DO_NOTHING, related_name='study_materials_subject',null=True, blank=True)
    master_subject = models.ForeignKey(MasterSubject, on_delete=models.DO_NOTHING, related_name='study_materials_master_subject',null=True, blank=True)
    grade = models.ForeignKey(Grade, on_delete=models.DO_NOTHING, related_name='study_materials_grade',null=True, blank=True)
    term = models.ForeignKey(Term, on_delete=models.DO_NOTHING, related_name='study_materials_term',null=True, blank=True)
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='study_materials_school')
    description = models.TextField(null=True, blank=True)
    question_paper = models.CharField( null=True, blank=True)
    paper_memo = models.CharField(max_length=255, null=True, blank=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.DO_NOTHING, related_name='study_materials_teacher',null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='study_materials_created_by',
                                   db_column='created_by')

    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='study_materials_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='study_materials_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "study_materials"
        verbose_name = "study material"
        verbose_name_plural = "study materials"


class TimeTable(models.Model):
    assessment_name = models.CharField(max_length=255)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    start_time = models.CharField(null=True, blank=True)
    end_time = models.CharField(null=True, blank=True)
    paper_title = models.CharField()
    term = models.ForeignKey(Term, on_delete=models.DO_NOTHING, related_name='timetable_term',null=True,blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.DO_NOTHING, related_name='timetable_subject',null=True, blank=True)
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='time_tables_school')
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, related_name='time_tables_grade')
    grade_class = models.ForeignKey(GradeClass, on_delete=models.CASCADE, related_name='time_tables_grade_class', db_column='class_id',null=True, blank=True)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='time_tables_batch')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='time_tables_created_by',db_column='created_by')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True, related_name='time_tables_updated_by',db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True, related_name='time_tables_deleted_by',db_column='deleted_by')


    class Meta:
        db_table = 'time_table'
        verbose_name = 'time_table'
        verbose_name_plural = 'time_tables'

class Support(models.Model):
    description = models.TextField()
    email = models.EmailField()
    role_name = models.CharField(max_length=255)
    attachment = models.JSONField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    school = models.ForeignKey(School, on_delete=models.DO_NOTHING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Support Ticket {self.id}"

    class Meta:
        db_table = 'support'
        verbose_name = 'support'
        verbose_name_plural = 'supports'
