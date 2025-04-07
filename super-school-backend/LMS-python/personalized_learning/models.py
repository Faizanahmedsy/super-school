from django.contrib.postgres.fields import ArrayField

from nest_db_app.models import *


class MainQuiz(models.Model):
    choices = (
        ('school', 'school'),
        ('self', 'self'),
        ('ai', 'ai'),
    )
    title = models.CharField(max_length=100)
    quiz_topic = models.CharField(max_length=255)
    quiz_type = models.CharField(choices=choices, max_length=100)
    weaknesses = models.JSONField(null=True, blank=True)
    number_of_questions = models.IntegerField(null=True, blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE)
    grade_class = models.ForeignKey(GradeClass, on_delete=models.CASCADE)
    term = models.ForeignKey(Term, on_delete=models.CASCADE)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    quiz_start_date_time = models.DateTimeField()
    quiz_end_date_time = models.DateTimeField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE,null=True,blank=True)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'main_quiz'
        verbose_name = 'MainQuiz'


class Quiz(models.Model):
    choices = (
        ('school', 'school'),
        ('self', 'self'),
        ('ai', 'ai'),
    )
    main_quiz = models.ForeignKey(MainQuiz, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    quiz_topic = models.CharField(max_length=255)
    quiz_type = models.CharField(choices=choices, max_length=100)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE)
    grade_class = models.ForeignKey(GradeClass, on_delete=models.CASCADE)
    feedback = models.TextField(null=True, blank=True)
    number_of_questions = models.IntegerField(null=True, blank=True)
    marks_obtained = models.IntegerField(null=True, blank=True)
    is_attempted = models.BooleanField(default=False)
    term = models.ForeignKey(Term, on_delete=models.CASCADE)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    quiz_start_date_time = models.DateTimeField()
    quiz_end_date_time = models.DateTimeField()

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'quiz'
        verbose_name = 'Quiz'


class QuizQandA(models.Model):
    quiz = models.ForeignKey('Quiz', on_delete=models.CASCADE, null=True, blank=True)
    question = models.TextField()
    options = ArrayField(
        models.CharField(max_length=255),
        null=True,
        blank=True
    )
    actual_answers = ArrayField(
        models.CharField(max_length=255),
        null=True,
        blank=True
    )
    student_answers = ArrayField(
        models.CharField(max_length=255),
        null=True,
        blank=True
    )
    multi_choice = models.BooleanField(default=False)
    is_correct = models.BooleanField(default=False)
    term = models.ForeignKey(Term, on_delete=models.CASCADE)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.question

    class Meta:
        db_table = 'quiz_q_and_a'
        verbose_name = 'QuizQandA'
