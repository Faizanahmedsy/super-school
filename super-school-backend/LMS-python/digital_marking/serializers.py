from rest_framework import serializers
from rest_framework.serializers import Serializer, ModelSerializer, CharField, JSONField

from analytics_app.services import *
from exam_app.models import *
from nest_db_app.views import get_achievement_details


class StudentAnswerSheetSerializerList(serializers.ModelSerializer):
    assessment_subject = serializers.SerializerMethodField()
    student = serializers.SerializerMethodField()
    batch = serializers.SerializerMethodField()
    grade = serializers.SerializerMethodField()
    grade_class = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    memorandom = serializers.SerializerMethodField()
    question_paper = serializers.SerializerMethodField()
    not_detected_word_count = serializers.SerializerMethodField()
    achievements_level = serializers.SerializerMethodField()
    achievements_description = serializers.SerializerMethodField()
    mark_percentage = serializers.SerializerMethodField()
    paper_marks = serializers.SerializerMethodField()
    class Meta:
        model = StudentAnswerSheet
        fields = '__all__'

    def get_paper_marks(self, obj):
        return AssessmentSubject.objects.get(id=obj.assessment_subject.id).paper_marks

    def get_mark_percentage(self, obj):
        paper_marks = AssessmentSubject.objects.get(id=obj.assessment_subject.id).paper_marks
        _, _, percentage = get_achievement_details(obj.obtained_mark, paper_marks)
        return percentage
    def get_achievements_level(self, obj):
        paper_marks = AssessmentSubject.objects.get(id=obj.assessment_subject.id).paper_marks
        level,_,_ = get_achievement_details(obj.obtained_mark, paper_marks)
        return level

    def get_achievements_description(self, obj):
        paper_marks = AssessmentSubject.objects.get(id=obj.assessment_subject.id).paper_marks
        _,description,_ = get_achievement_details(obj.obtained_mark, paper_marks)
        return description


    def get_not_detected_word_count(self, obj):
        return sum(len(dm.not_detected_word) for dm in obj.digital_markings.all())

    def get_memorandom(self, obj):
        return str(obj.assessment_subject.memorandom)

    def get_question_paper(self,obj):
        return str(obj.assessment_subject.question_paper)

    def get_assessment_subject(self, obj):
        # Calculate the time difference
        time_difference = obj.assessment_subject.assessment_end_datetime - obj.assessment_subject.assessment_start_datetime

        # Get the total hours and minutes
        hours = time_difference.seconds // 3600  # Get the number of hours
        minutes = (time_difference.seconds % 3600) // 60  # Get the number of minutes

        # Format the duration as 'hours:minutes'
        formatted_duration = f"{hours}:{minutes:02}"

        return {
            "id": obj.assessment_subject.subject.id,
            "name": obj.assessment_subject.subject.master_subject.subject_name,
            "code": obj.assessment_subject.subject.master_subject.subject_code,
            "assessment_date": obj.assessment_subject.assessment_start_datetime,
            "end_date_time": obj.assessment_subject.assessment_end_datetime,
            "duration": formatted_duration,
        }

    def get_student(self, obj):
        return {
            'id': obj.student.id,
            'first_name': obj.student.first_name,
            'last_name': obj.student.last_name,
            'email': obj.student.email,
            'admission_no': obj.student.addmission_no,
            'profile_image': obj.student.profile_image
        }

    def get_batch(self, obj):
        return {
            "id": obj.batch.id,
            "name": obj.batch.start_year,
        }

    def get_grade(self, obj):
        return {
            "id": obj.grade.id,
            "name": obj.grade.grade_number,
        }

    def get_grade_class(self, obj):
        return {
            "id": obj.grade_class.id,
            "name": obj.grade_class.name,
        }

    def get_created_by(self, obj):
        return {
            "id": obj.created_by.id,
            "name": obj.created_by.email,
        }


class StudentAnswerSheetSerializer(serializers.ModelSerializer):
    answer_sheet = serializers.FileField()

    class Meta:
        model = StudentAnswerSheet
        fields = '__all__'

    def validate_answer_sheet(self, value):
        """
        Custom validation to ensure the file path is unique.
        """

        batch = self.context.get('batch')
        grade = self.context.get('grade')
        grade_class = self.context.get('grade_class')
        assessment_subject = self.context.get('assessment_subject')
        file_name = value.name
        file_path = f"upload/assessment/answer_sheet/batch_{batch}/grade_{grade}/grade_class_{grade_class}/subject_{assessment_subject}/{file_name}"

        sheet = StudentAnswerSheet.objects.filter(answer_sheet=file_path)

        if StudentAnswerSheet.objects.filter(answer_sheet=file_path).exists():
            raise serializers.ValidationError(f"Aa answer sheet with the name '{file_name}' already exists.")
        return value


class AnswerSheetImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerSheetImage
        fields = '__all__'


class DigitalMarkingSerializer(serializers.ModelSerializer):
    class Meta:
        model = DigitalMarking
        fields = '__all__'


class ManualMarkingLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManualMarkingLog
        fields = '__all__'


class DigitalMarkingAnalysisSerializer(ModelSerializer):
    student_name = CharField(source="student_answer_sheet.student.first_name", read_only=True)
    student_admission_number = CharField(source="student_answer_sheet.student.addmission_no", read_only=True)
    subject_id = CharField(source="student_answer_sheet.assessment_subject.subject.id", read_only=True)
    subject_name = CharField(source="student_answer_sheet.assessment_subject.subject.name", read_only=True)
    strengths = JSONField()
    weaknesses = JSONField()

    class Meta:
        model = DigitalMarking
        fields = ['student_name', 'student_admission_number', 'subject_id', 'subject_name', 'strengths', 'weaknesses']


class StudentStrengthWeaknessSerializer(Serializer):
    student_name = CharField()
    student_admission_number = CharField()
    weakness = JSONField()
