from rest_framework import serializers

from exam_app.models import DigitalMarking, ManualMarkingLog


class DigitalMarkingSerializer(serializers.ModelSerializer):
    is_reviewed = serializers.BooleanField(source='student_answer_sheet.is_reviewed', read_only=True)

    class Meta:
        model = DigitalMarking
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class ManualMarkingLogSerializer(serializers.ModelSerializer):
    digital_marking = serializers.SerializerMethodField()

    class Meta:
        model = ManualMarkingLog
        fields = '__all__'
        read_only_fields = ['id', 'done_at']

    def get_digital_marking(self, obj):
        return {
            "id": obj.digital_marking.id,
            "question_number": obj.digital_marking.question_number,
        }
