from rest_framework import serializers

from exam_app.models import AssessmentSubject


class AssessmentSubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentSubject
        fields = '__all__'
