"""
URL configuration for LMS project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import path, include
from rest_framework.routers import DefaultRouter

import exam_app.views
from analytics_app.views import PersnolisedLearningAnalyticsViewSet
from digital_marking.views import StudentAnswerSheetViewSet
from exam_app.views.assessment import *
from exam_app.views.assessment_subject import *
from manual_marking.views import DigitalMarkingViewSet, ManualMarkingLogViewSet
from personalized_learning.views import ManualQuizViewSet
from dashboard.views import DashboardViewset
from report_app.views import ReportViewset
from lesson_plan.views import LessonPlanViewSet

router = DefaultRouter()
router.register(r'lesson-plans', LessonPlanViewSet, basename='lesson-plans')
router.register(r'reports', ReportViewset, basename='reports')
router.register(r'dashboard', DashboardViewset, basename='dashboard')
router.register(r'assessments', exam_app.views.AssessmentViewSet)
router.register(r'assessments-subjects', exam_app.views.AssessmentSubjectViewSet)

router.register(r'student-answersheet', StudentAnswerSheetViewSet, basename='student-answersheet')

router.register(r'answersheet-marks', DigitalMarkingViewSet, basename='answersheet-marks')

router.register(r'answersheet-marks-logs', ManualMarkingLogViewSet, basename='answersheet-marks-logs')

router.register(r'assessment-analytics', PersnolisedLearningAnalyticsViewSet, basename='assessment-subjects')
router.register(r'quiz', ManualQuizViewSet, basename='quiz')
urlpatterns = [
    path('api/v1/', include(router.urls)),
    # path('connect/', nest_db_app.views.test),
    path('api/v1/assessment-subjects/update-memo/', AssessmentSubjectViewSet.as_view({'post': 'update_memos'}),
         name='update-memo'),
]

urlpatterns += staticfiles_urlpatterns()
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
