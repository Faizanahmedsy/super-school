from rest_framework import serializers

from exam_app.models import Assessment
from nest_db_app.models import GradeClass


class AssessmentSerializer(serializers.ModelSerializer):
    grade_class = serializers.PrimaryKeyRelatedField(many=True, queryset=GradeClass.objects.all(), required=False)

    # grade = serializers.PrimaryKeyRelatedField(queryset=Grade.objects.all(), required=False)

    class Meta:
        model = Assessment
        fields = '__all__'


class AssessmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = ['assessment_name', 'assessment_start_datetime', 'assessment_end_datetime', 'grade_class', 'grade',
                  'status', 'batch', 'term']


class AssessmentSerializerList(serializers.ModelSerializer):

    grade_number = serializers.SerializerMethodField()
    batch_year = serializers.SerializerMethodField()
    term_name = serializers.SerializerMethodField()

    def get_grade_number(self, obj):
        return obj.grade.grade_number

    def get_batch_year(self, obj):
        return obj.batch.start_year

    def get_term_name(self, obj):
        return obj.term.term_name

    class Meta:
        model = Assessment
        fields = '__all__'
