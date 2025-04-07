from django.db import models

from nest_db_app.models import School, Grade, Batch, Subject, Student, User, GradeClass, Term


class Assessment(models.Model):
    choices = (
        ('upcoming', 'upcoming'),
        ('ongoing', 'ongoing'),
        ('completed', 'completed'),
        ('cancelled', 'cancelled')

    )
    ocr_status_list = (
        ('not started', 'not started'),
        ('in progress', 'in progress'),
        ('completed', 'completed')
    )
    assessment_name = models.CharField(max_length=100)
    assessment_start_datetime = models.DateTimeField()
    assessment_end_datetime = models.DateTimeField()
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='school_assessments')
    grade = models.ForeignKey(Grade, on_delete=models.DO_NOTHING, related_name='grade_assessments', null=True,
                              blank=True)
    grade_class = models.ManyToManyField(GradeClass, related_name='assessments')
    status = models.CharField(choices=choices, max_length=100)
    batch = models.ForeignKey(Batch, on_delete=models.DO_NOTHING, related_name='batch_assessments')
    term = models.ForeignKey(Term, on_delete=models.DO_NOTHING, related_name='term_assessments')
    is_locked = models.BooleanField(default=False)
    ocr_status = models.CharField(choices=ocr_status_list, default='not started')
    is_reviewed = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='assessments_created_by',
                                   db_column='created_by')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='assessments_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='assessments_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'assessments'
        verbose_name_plural = 'assessments'
        verbose_name = 'assessment'


def memorandom_upload_path(instance, filename):
    return f'assessment/memo/batch_{instance.batch.id}/grade_{instance.grade.id}/subject_{instance.subject.id}/{filename}'


def question_paper_upload_path(instance, filename):
    return f'assessment/question_paper/batch_{instance.batch.id}/grade_{instance.grade.id}/subject_{instance.subject.id}/{filename}'


class AssessmentSubject(models.Model):
    choices = (
        ('upcoming', 'upcoming'),
        ('ongoing', 'ongoing'),
        ('completed', 'completed'),
        ('cancelled', 'cancelled')

    )
    ocr_status_list = (
        ('not started', 'not started'),
        ('in progress', 'in progress'),
        ('completed', 'completed')
    )
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='assessment')
    subject = models.ForeignKey(Subject, on_delete=models.DO_NOTHING, related_name='assessment_subjects')
    grade = models.ForeignKey(Grade, on_delete=models.DO_NOTHING, related_name='assessment_subjects_grade')
    grade_class = models.ForeignKey(GradeClass, on_delete=models.DO_NOTHING,
                                    related_name='assessment_subjects_grade_class')
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='assessment_subjects_school')
    student = models.ManyToManyField(Student, related_name='assessment_subjects_students')
    memorandom = models.FileField(null=True, blank=True, upload_to=memorandom_upload_path)
    question_paper = models.FileField(null=True, blank=True, upload_to=question_paper_upload_path)
    assessment_start_datetime = models.DateTimeField()
    assessment_end_datetime = models.DateTimeField()
    paper_title = models.CharField(null=True, blank=True)
    status = models.CharField(choices=choices, max_length=100)
    batch = models.ForeignKey(Batch, on_delete=models.DO_NOTHING, related_name='assessment_subjects_batch')
    term = models.ForeignKey(Term, on_delete=models.DO_NOTHING, related_name='assessment_subjects_term')
    is_locked = models.BooleanField(default=False)
    paper_marks = models.FloatField(default=0)
    ocr_status = models.CharField(choices=ocr_status_list, default='not started')
    is_reviewed = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='assessment_subjects_created_by',
                                   db_column='created_by')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='assessment_subjects_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='assessment_subjects_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'assessment_subjects'
        verbose_name_plural = 'assessment_subjects'
        verbose_name = 'assessment_subject'


def answer_sheet_upload_path(instance, filename):
    return f'assessment/answer_sheet/batch_{instance.batch.id}/grade_{instance.grade.id}/grade_class_{instance.grade_class.id}/subject_{instance.assessment_subject.id}/{filename}'


class StudentAnswerSheet(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='student_answer_sheets')
    assessment_subject = models.ForeignKey(AssessmentSubject, on_delete=models.DO_NOTHING,
                                           related_name='student_assessment_subject_answer_sheets')
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='student_answer_sheets_school')
    answer_sheet = models.FileField(upload_to=answer_sheet_upload_path)
    batch = models.ForeignKey(Batch, on_delete=models.DO_NOTHING, related_name='student_answer_sheets_batch')
    term = models.ForeignKey(Term, on_delete=models.DO_NOTHING, related_name='student_answer_sheets_term')
    grade = models.ForeignKey(Grade, on_delete=models.DO_NOTHING, related_name='student_answer_sheets_grade')
    grade_class = models.ForeignKey(GradeClass, on_delete=models.DO_NOTHING,
                                    related_name='student_answer_sheets_grade_class')
    feedback = models.TextField(null=True, blank=True)
    obtained_mark = models.FloatField(null=True, blank=True)
    actual_mark = models.FloatField(null=True, blank=True)
    ocr_status = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    is_reviewed = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='student_answer_sheets_created_by',
                                   db_column='created_by')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='student_answer_sheets_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='student_answer_sheets_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'student_answer_sheets'
        verbose_name_plural = 'student_answer_sheets'
        verbose_name = 'student_answer_sheet'


class AnswerSheetImage(models.Model):
    student_answer_sheet = models.ForeignKey(StudentAnswerSheet, on_delete=models.CASCADE,
                                             related_name='answer_sheet_images')
    image = models.ImageField()
    ocr_status = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'answer_sheet_images'
        verbose_name_plural = 'answer_sheet_images'
        verbose_name = 'answer_sheet_image'


class DigitalMarking(models.Model):
    student_answer_sheet = models.ForeignKey(StudentAnswerSheet, on_delete=models.CASCADE,
                                             related_name='digital_markings')
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='digital_markings_school')
    question_number = models.CharField()
    question = models.CharField()
    answer = models.CharField()
    not_detected_word = models.JSONField()
    confidence_score = models.IntegerField()
    actual_mark = models.FloatField()
    obtained_mark = models.FloatField()
    obtained_manual_mark = models.FloatField(null=True, blank=True)
    reason = models.CharField()
    teacher_reason = models.CharField(null=True, blank=True)
    strength = models.CharField(default="")
    weakness = models.CharField(default="")
    strength_tags = models.JSONField(default=[])
    weakness_tags = models.JSONField(default=[])
    batch = models.ForeignKey(Batch, on_delete=models.DO_NOTHING, related_name='digital_markings_batch')
    term = models.ForeignKey(Term, on_delete=models.DO_NOTHING, related_name='digital_markings_term')
    updated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='digital_markings_updated_by', db_column='updated_by')
    deleted_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, blank=True,
                                   related_name='digital_markings_deleted_by', db_column='deleted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'digital_markings'
        verbose_name_plural = 'digital_markings'
        verbose_name = 'digital_marking'


class ManualMarkingLog(models.Model):
    digital_marking = models.ForeignKey(DigitalMarking, on_delete=models.DO_NOTHING, related_name='manual_marking_logs')
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='manual_marking_logs_school')
    before = models.JSONField()
    after = models.JSONField()
    done_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='manual_marking_logs_done_by')
    done_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'manual_marking_logs'
        verbose_name_plural = 'manual_marking_logs'
        verbose_name = 'manual_marking_log'
