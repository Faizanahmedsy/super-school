from nest_db_app.models import LessonPlans
from rest_framework import serializers

class LessonPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonPlans
        fields = '__all__'

class LessonPlanSerializerList(serializers.ModelSerializer):
    grade_name = serializers.SerializerMethodField()
    grade_class_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()




    class Meta:
        model = LessonPlans
        fields = '__all__'

    def get_grade_name(self, obj):
        return obj.grade.grade_number


    def get_grade_class_name(self, obj):
        return obj.grade_class.name

    def get_subject_name(self, obj):
        return f"{ obj.subject.master_subject.subject_name}({obj.subject.master_subject.subject_code})"