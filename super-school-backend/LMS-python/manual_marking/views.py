from django.db import transaction
from django.db.models import Sum, Case, When, F, IntegerField, Func
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.response import Response

from nest_db_app.decorators import permission_required
from exam_app.models import DigitalMarking, ManualMarkingLog, Assessment, AssessmentSubject, StudentAnswerSheet
from nest_db_app.models import ClassSubject, Student, GradeClass, Grade, Subject
from nest_db_app.views import get_achievement_details
from .serializers import DigitalMarkingSerializer, ManualMarkingLogSerializer
from collections import Counter
from django.db.models import F
from django.utils.translation import gettext as _

class JSONBArrayLength(Func):
    function = 'jsonb_array_length'
    output_field = IntegerField()


class DigitalMarkingViewSet(viewsets.ModelViewSet):
    queryset = DigitalMarking.objects.all()
    serializer_class = DigitalMarkingSerializer
    ordering_fields = [
        'created_at',
        'updated_at',
        'question_number',
        'confidence_score',
        'obtained_mark',
        'not_detected_word_count',
    ]

    def get_queryset(self):
        # Get the `order_by` parameter from the request
        order_by = self.request.query_params.get('order_by', '')

        # Check if `not_detected_word_count` is mentioned in `order_by`
        if 'not_detected_word_count' in order_by:
            # Apply annotation only if it's referenced in the order_by
            return DigitalMarking.objects.annotate(
                not_detected_word_count=JSONBArrayLength('not_detected_word')
            ).order_by(order_by)

        # Return the default queryset without annotation
        return DigitalMarking.objects.all().order_by('-created_at')

    def list(self, request):
        # Disable GET method for listing
        raise MethodNotAllowed(method="GET")

    @transaction.atomic
    @permission_required('assessments', 'view')
    def retrieve(self, request, pk=None):
        if not pk:
            return Response({"detail": "Invalid student answer sheet ID."}, status=status.HTTP_400_BAD_REQUEST)

        queryset = DigitalMarking.objects.filter(student_answer_sheet=pk)
        ordering = request.query_params.get('order_by')
        if ordering:
            queryset = queryset.order_by(ordering)

        # Count occurrences of each tag
        strength_count = Counter()
        weakness_count = Counter()

        for obj in queryset:
            strength_count.update(obj.strength_tags or [])
            weakness_count.update(obj.weakness_tags or [])

        all_tags = set(strength_count.keys()).union(weakness_count.keys())
        new_strength = set()
        new_weakness = set()

        for tag in all_tags:
            total_occurrences = strength_count[tag] + weakness_count[tag]
            strength_ratio = strength_count[tag] / total_occurrences

            if strength_ratio > 0.7:
                new_strength.add(tag)
            else:
                new_weakness.add(tag)

        serializer = DigitalMarkingSerializer(queryset, many=True)
        return Response({
            "data": serializer.data,
            "strength_tags": list(new_strength),
            "weakness_tags": list(new_weakness)
        })

    @transaction.atomic
    @permission_required('assessments', 'edit')
    @action(detail=False, methods=['patch'], url_path='update-mark/(?P<pk>[^/.]+)', url_name='update_mark')
    def manual_marks(self, request, *args, **kwargs):
        print("manual_marks", request.data)
        if request.data.get("obtained_manual_mark") == None:
            return Response(
                {"detail": "Manual marks are required to perform this action"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        request.data["obtained_manual_mark"] = float(request.data["obtained_manual_mark"])

        instance = self.get_object()

        allowed_fields = {'obtained_manual_mark', 'teacher_reason', 'actual_mark','strength_tags','weakness_tags'}
        data = {key: value for key, value in request.data.items() if key in allowed_fields}

        if not data:
            return Response(
                {"detail": "Only 'obtained_manual_mark', 'teacher_reason' ,'strength_tags' and 'weakness_tags' can be updated."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if request.data["obtained_manual_mark"] > instance.actual_mark:
            return Response(
                {"detail": f"The mark entered should be close to the actual manual mark: {instance.actual_mark}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        before_data = {
            "obtained_mark": instance.obtained_mark,
            "obtained_manual_mark": instance.obtained_manual_mark,
            "teacher_reason": instance.teacher_reason,
            "strength_tags": instance.strength_tags,
            "weakness_tags": instance.weakness_tags
        }

        data['updated_by'] = request.user.id
        data['updated_at'] = timezone.now()
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        # Update related StudentAnswerSheet's obtained_marks
        if 'obtained_manual_mark' in data:
            student_answer_sheet = instance.student_answer_sheet
            new_obtained_marks = DigitalMarking.objects.filter(student_answer_sheet=student_answer_sheet).aggregate(
                total_obtain_marks=Sum(
                    Case(
                        When(obtained_manual_mark__isnull=False, then=F('obtained_manual_mark')),
                        default=F('obtained_mark')
                    )
                )
            )['total_obtain_marks']
            # Directly update the database
            StudentAnswerSheet.objects.filter(pk=student_answer_sheet.pk).update(obtained_mark=new_obtained_marks)
            # Reload the instance to see the updated value
            student_answer_sheet.refresh_from_db()
        after_data = {
            "obtained_mark": instance.obtained_mark,
            "obtained_manual_mark": serializer.validated_data.get(
                "obtained_manual_mark", instance.obtained_manual_mark
            ),
            "teacher_reason": serializer.validated_data.get(
                "teacher_reason", instance.teacher_reason
            ),
            "strength_tags": serializer.validated_data.get("strength_tags", instance.strength_tags),
            "weakness_tags": serializer.validated_data.get("weakness_tags", instance.weakness_tags)
        }

        ManualMarkingLog.objects.create(
            digital_marking=instance,
            school=instance.school,
            before=before_data,
            after=after_data,
            done_by=request.user,
        )

        return Response(serializer.data, status=status.HTTP_200_OK)

    @transaction.atomic
    @permission_required('assessments', 'view')
    @action(detail=False, methods=['get'], url_path='result', url_name='result')
    def assessment_result(self, request, *args, **kwargs):

        if request.user.role.role_name != "student":
            student_id = request.query_params.get("student_id")
            if not student_id:
                return Response({"error": "student_id must be provided"}, status=400)
        else:
            student = Student.objects.filter(student_user=request.user.id).first()
            student_id = student.id if student else None

        term_id = request.query_params.get("term_id")
        batch_id = request.query_params.get("batch_id")

        if not term_id:
            return Response({"error": _("term_id must be provided")}, status=400)
        if not batch_id:
            return Response({"error": _("batch_id must be provided")}, status=400)

        grade_class_id = request.query_params.get("grade_class")
        grade_id = request.query_params.get("grade")
        subject_id = request.query_params.get("subject_id")


        if not grade_class_id:
            return Response({"error": _("grade_class must be provided")}, status=400)
        if not grade_id:
            return Response({"error": _("grade must be provided")}, status=400)

        grade_class = GradeClass.objects.get(id=grade_class_id)
        grade = Grade.objects.get(id=grade_id)

        filter_conditions = {
            'grade': grade,
            'term_id': term_id,
            'batch_id': batch_id,
            'grade_class': grade_class
        }

        # If subject_id is provided, filter assessments that have this subject
        if subject_id:
            try:
                # Only get the Subject object if subject_id is provided
                subject = Subject.objects.get(id=subject_id)
                assessments = Assessment.objects.filter(
                    **filter_conditions,
                    assessment__subject=subject  # Using the relationship properly
                ).distinct()
            except Subject.DoesNotExist:
                # Handle the case where the subject doesn't exist
                return Response({"error": "Subject not found"}, status=404)
        else:
            assessments = Assessment.objects.filter(**filter_conditions)

        results = []
        total_obtained_marks = 0
        total_possible_marks = 0

        for assessment in assessments:
            assessment_subjects = AssessmentSubject.objects.filter(assessment=assessment, status='completed')

            subject_results = []
            all_strength_tags = []
            all_weakness_tags = []

            for assessment_subject in assessment_subjects:
                student_answersheets = StudentAnswerSheet.objects.filter(
                    assessment_subject=assessment_subject.id, student_id=student_id
                )

                if not student_answersheets:
                    continue

                for answersheet in student_answersheets:
                    digital_marks = DigitalMarking.objects.filter(student_answer_sheet_id=answersheet.id)

                    for digital_mark in digital_marks:
                        all_strength_tags.extend(digital_mark.strength_tags)
                        all_weakness_tags.extend(digital_mark.weakness_tags)

                    total_obtained_marks += answersheet.obtained_mark or 0
                    total_possible_marks += assessment_subject.paper_marks or 0

                    all_students_answersheets = StudentAnswerSheet.objects.filter(
                        assessment_subject=assessment_subject.id
                    ).order_by("-obtained_mark")

                    rank = list(all_students_answersheets.values_list("student_id", flat=True)).index(
                        int(student_id)) + 1
                    level, title, percent = get_achievement_details(answersheet.obtained_mark or 0,
                                                                    assessment_subject.paper_marks or 0)

                    subject_results.append({
                        "subject_name": assessment_subject.subject.master_subject.subject_name,
                        "obtained_mark": answersheet.obtained_mark,
                        "actual_mark": assessment_subject.paper_marks,
                        "achievement_level": level,
                        "achievement_title": title,
                        "achievement_percentage": percent,
                        "percentage": (
                            ((answersheet.obtained_mark or 0) / assessment_subject.paper_marks * 100)
                            if assessment_subject.paper_marks and assessment_subject.paper_marks > 0 else 0
                        ),
                        "feedback": answersheet.feedback,
                        "ocr_status": answersheet.ocr_status,
                        "is_reviewed": answersheet.is_reviewed,
                        "answer_sheet_url": answersheet.answer_sheet.url if answersheet.answer_sheet else None,
                        "rank": rank,
                    })

            top_strength_tags = [tag for tag, _ in Counter(all_strength_tags).most_common(10)]
            top_weakness_tags = [tag for tag, _ in Counter(all_weakness_tags).most_common(10)]

            if subject_results:
                subject_results[-1]["top_strength_tags"] = top_strength_tags
                subject_results[-1]["top_weakness_tags"] = top_weakness_tags

            results.append({
                "assessment_name": assessment.assessment_name,
                "term": assessment.term.term_name,
                "batch": assessment.batch.start_year,
                "subjects": subject_results,
            })

        # Calculate Grade Rank and Class Rank
        all_students_in_grade = StudentAnswerSheet.objects.filter(
            assessment_subject__assessment__grade=grade
        ).values("student_id").annotate(total_marks=Sum("obtained_mark")).order_by("-total_marks")

        all_students_in_class = StudentAnswerSheet.objects.filter(
            assessment_subject__assessment__grade_class=grade_class
        ).values("student_id").annotate(total_marks=Sum("obtained_mark")).order_by("-total_marks")

        grade_rank_list = list(all_students_in_grade.values_list("student_id", flat=True))
        class_rank_list = list(all_students_in_class.values_list("student_id", flat=True))

        grade_rank = grade_rank_list.index(int(student_id)) + 1 if int(student_id) in grade_rank_list else None
        class_rank = class_rank_list.index(int(student_id)) + 1 if int(student_id) in class_rank_list else None

        # Calculate overall achievement level using get_achievement_details
        overall_level, overall_title, overall_percent = get_achievement_details(total_obtained_marks or 0,
                                                                                total_possible_marks or 0)

        response_data = {
            "student_id": student_id,
            "grade": grade.grade_number,
            "class": grade_class.name,
            "grade_rank": grade_rank,
            "class_rank": class_rank,
            "achievement_level": overall_level,
            "achievement_title": overall_title,
            "achievement_percentage": overall_percent,
            "results": results,
        }

        return Response(response_data, status=200)


class ManualMarkingLogViewSet(viewsets.ModelViewSet):
    queryset = ManualMarkingLog.objects.all()
    serializer_class = ManualMarkingLogSerializer

    @transaction.atomic
    @permission_required('assessments', 'view')
    def list(self, request):
        queryset = ManualMarkingLog.objects.all()
        serializer = ManualMarkingLogSerializer(queryset, many=True)
        return Response(serializer.data)

    @transaction.atomic
    @permission_required('assessments', 'view')
    def retrieve(self, request, pk=None):
        digital_marking = DigitalMarking.objects.filter(student_answer_sheet=pk)
        queryset = ManualMarkingLog.objects.filter(digital_marking__in=digital_marking)
        serializer = ManualMarkingLogSerializer(queryset, many=True)
        return Response(serializer.data)

