from rest_framework import viewsets, filters, status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from exam_app.pagination import GlobalPagination
from nest_db_app.models import LessonPlans
from lesson_plan.serializers import LessonPlanSerializer, LessonPlanSerializerList
from nest_db_app.decorators import permission_required
from django.utils.translation import gettext as _

class LessonPlanViewSet(viewsets.ModelViewSet):
    serializer_class = LessonPlanSerializer
    pagination_class = GlobalPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['school', 'grade', 'grade_class', 'subject', 'user', 'batch', 'start_date', 'end_date']
    search_fields = ['title', 'notes', 'activity', 'activity_type']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = LessonPlans.objects.filter(user=self.request.user)
        return queryset

    @permission_required('lesson_plans', 'view')
    def list(self, request, *args, **kwargs):
        """Ensure that users can only list their own lesson plans."""
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        self.serializer_class = LessonPlanSerializerList
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @permission_required('lesson_plans', 'add')
    def create(self, request, *args, **kwargs):
        """Ensure that the lesson plan is created only for the logged-in user."""
        data = request.data.copy()
        data['user'] = request.user.id  # Assign current user
        data['school'] = request.user.school.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @permission_required('lesson_plans', 'edit')
    def update(self, request, *args, **kwargs):
        """Ensure that users can update only their own lesson plans."""
        instance = self.get_object()
        if instance.user != request.user:
            raise PermissionDenied(_("You do not have permission to edit this lesson plan."))

        data = request.data.copy()
        data['user'] = request.user.id  # Ensure user field remains the same
        data['school'] = request.user.school.id
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @permission_required('lesson_plans', 'delete')
    def destroy(self, request, *args, **kwargs):
        """Ensure that users can delete only their own lesson plans."""
        instance = self.get_object()
        if instance.user != request.user:
            raise PermissionDenied(_("You do not have permission to delete this lesson plan."))

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @permission_required('lesson_plans', 'view')
    def retrieve(self, request, *args, **kwargs):
        """Ensure that users can retrieve only their own lesson plans."""
        instance = self.get_object()
        if instance.user != request.user:
            raise PermissionDenied(_("You do not have permission to view this lesson plan."))

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @permission_required('lesson_plans', 'edit  ')
    def partial_update(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)