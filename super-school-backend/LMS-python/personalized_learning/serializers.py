from rest_framework import serializers

from .models import Quiz, QuizQandA, MainQuiz


class QuizQandASerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQandA
        fields = ['id', 'question', 'options', 'student_answers', 'multi_choice', 'is_correct', 'actual_answers']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Check context for `is_attempted`
        is_attempted = self.context.get('is_attempted', False)
        if not is_attempted:
            representation.pop('actual_answers', None)
        return representation


class QuizSerializer(serializers.ModelSerializer):
    student_data = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    grade_number = serializers.SerializerMethodField()
    grade_class_name = serializers.SerializerMethodField()
    term_name = serializers.SerializerMethodField()
    batch_name = serializers.SerializerMethodField()

    def get_subject_name(self, obj):
        return obj.subject.master_subject.subject_name

    def get_grade_number(self, obj):
        return obj.grade.grade_number

    def get_grade_class_name(self, obj):
        return obj.grade_class.name

    def get_term_name(self, obj):
        return obj.term.term_name

    def get_batch_name(self, obj):
        return obj.batch.start_year
    class Meta:
        model = Quiz
        fields = '__all__'

    def get_student_data(self, obj):
        if hasattr(obj, 'student'):  # Ensure the quiz object has a 'student' field.
            return {
                'id': obj.student.id,
                'first_name': obj.student.first_name,
                'last_name': obj.student.last_name,
                'email': obj.student.email,
                'admission_no': obj.student.addmission_no,
                'profile_image': obj.student.profile_image
            }
        return None


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQandA
        fields = 'student_answers'


class QuizQandASerializerCreate(serializers.ModelSerializer):
    class Meta:
        model = QuizQandA
        fields = '__all__'


class MainQuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = MainQuiz
        fields = '__all__'  # Include all fields of the MainQuiz model


class MainQuizSerializerList(serializers.ModelSerializer):

    class Meta:
        model = MainQuiz
        fields = '__all__'  # Include all fields of the MainQuiz model