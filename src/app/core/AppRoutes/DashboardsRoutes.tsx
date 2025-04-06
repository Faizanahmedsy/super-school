import { RoutePermittedRole } from '@/app/constants/AppEnums';
import UnderConstruction from '@/components/global/UnderConstruction';
import UserProfile from '@/components/userProfile/UserProfile';
import { ACTION, MODULE, ProtectedRoute } from '@/lib/helpers/authHelpers';
import Calendar from '@/modules/CalenderModule/calender';
import Dashboard from '@/modules/Dashboards/Academy';
import AnswerScriptsList from '@/modules/DigitalMarking/AnsweerScripts/AnswerScriptsList';
import GradeCard from '@/modules/DigitalMarking/GradeCard/GradeCard';
import ManualReview from '@/modules/DigitalMarking/ManualReview/ManualReview';
import ManualReviewAssessmentDetails from '@/modules/DigitalMarking/ManualReview/ManualReviewDetails';
import ManualReviewSubjectDetails from '@/modules/DigitalMarking/ManualReview/ManualReviewSubjectDetails';
import ReviewAnswerSheet from '@/modules/DigitalMarking/ManualReview/ReviewAnswerSheet';
import MarkedAnswerDetails from '@/modules/DigitalMarking/MarkedAnswerScript/MarkedAnswerDetails';
import MarkedAnswerScript from '@/modules/DigitalMarking/MarkedAnswerScript/MarkedAnswerScript';
import MarkedAnswerScriptDetails from '@/modules/DigitalMarking/MarkedAnswerScript/MarkedAnswerScriptSubjectDetails';
import MarkingAssessmentDetails from '@/modules/DigitalMarking/MarkingProcess/MarkingAssessmentDetails';
import MarkingAssessmentSubjectDetails from '@/modules/DigitalMarking/MarkingProcess/MarkingAssessmentSubjectDetails';
import MarkingProcess from '@/modules/DigitalMarking/MarkingProcess/MarkingProcess';
import MemoYearCard from '@/modules/DigitalMarking/MemoCard/MemoYear.Card';
import MemosList from '@/modules/DigitalMarking/Memos/MemoList';
import SubjectCard from '@/modules/DigitalMarking/SubjectCard/SubjectCard';
import ExamTimeTableDetails from '@/modules/ExamTimeTable/AssessmentDetails';
import ExamTimeTableDetail from '@/modules/ExamTimeTable/ExamTimeTableDetail';
import ExamTimeTableMainList from '@/modules/ExamTimeTable/ExamTimeTableMainList';
import { ExamsList } from '@/modules/Management';
import CreateEditDoe from '@/modules/Management/da/CreateDoe';
import DepartmentAdminDetailsPage from '@/modules/Management/da/DepartmentAdminDetailsPage';
import DepartmentOfEducationList from '@/modules/Management/da/DepartmentOfEducationList';
import AssessmentList from '@/modules/Management/exams/AssessmentList';
import AssessmentSubjectDetails from '@/modules/Management/exams/AssessmentSubjectDetails';
import ExamDetails from '@/modules/Management/exams/ExamDetails';
import AddAssessmentSubject from '@/modules/Management/exams/mutate/AddSubject';
import CreateEditAssessment from '@/modules/Management/exams/mutate/CreateEditAssessment';
import CreateEditInstitute from '@/modules/Management/Institutes/CreateEditInstitute';
import InstituteDetails from '@/modules/Management/Institutes/InstituteDetails';
import InstitutesList from '@/modules/Management/Institutes/InstitutesList';
import CreateEditParent from '@/modules/Management/parents/CreateEditParent';
import ParentDetails from '@/modules/Management/parents/ParentDetails';
import ParentsList from '@/modules/Management/parents/ParentsList';
import CreateEditStudent from '@/modules/Management/students/components/mutate/CreateEditStudent';
import StudentsList from '@/modules/Management/students/components/list/StudentsList';
import TeacherDetails from '@/modules/Management/Teachers/components/details/TeacherDetails';
import TeachersList from '@/modules/Management/Teachers/components/list/TeachersList';
import CreateEditTeacher from '@/modules/Management/Teachers/components/mutate/CreateEditTeacher';
import Setupsubject from '@/modules/Management/Teachers/components/mutate/SetupSubject';
import AdminList from '@/modules/Master/admin/AdminList';
import CreateEditAdmin from '@/modules/Master/admin/CreateEditAdmin';
import BatchDetails from '@/modules/Master/batch/details/BatchDetails';
import BatchsList from '@/modules/Master/batch/list/BatchList';
import ClassDetails from '@/modules/Master/class/details/ClassDetails';
import ClasssList from '@/modules/Master/class/list/ClassList';
import CreateUpdateClass from '@/modules/Master/class/mutate/CreateUpdateClass';
import GradeDetails from '@/modules/Master/grade/details/GradeDetails';
import NotificationList from '@/modules/Notification/NotificationList';
import IndividualFeedback from '@/modules/PersonaisedLearning/feedback/IndividualFeedback';
import LessonPlan from '@/modules/PersonaisedLearning/LessonPlan/components/list/LessonPlan';
import CreateEditLessonPlan from '@/modules/PersonaisedLearning/LessonPlan/components/mutate/CreateEditLessonPlan';

import PracticeExercises from '@/modules/PersonaisedLearning/PracticeExercises/components/PracticeExercises';
import CreateEditManualQuizPage from '@/modules/PersonaisedLearning/PracticeExercises/components/Quiz/CreateEditManualQuizPage';
import MainQuizList from '@/modules/PersonaisedLearning/PracticeExercises/components/Teacher/MainQuizList';
import QuizDetailPage from '@/modules/PersonaisedLearning/PracticeExercises/components/Teacher/QuizDetailPage';
import QuizStudentAnswersDetails from '@/modules/PersonaisedLearning/PracticeExercises/components/Teacher/QuizStudentAnswersDetails';
import QuizStudentList from '@/modules/PersonaisedLearning/PracticeExercises/components/Teacher/QuizStudentList';

import AttendQuiz from '@/modules/PersonaisedLearning/Quiz/AttendQuiz';
import ModernQuiz from '@/modules/PersonaisedLearning/quizzes/IndividualQuizzes';
import Quizzes from '@/modules/PersonaisedLearning/quizzes/Quizzes';
import QuizzesSubject from '@/modules/PersonaisedLearning/quizzes/QuizzesSubject';
import StudyMaterial from '@/modules/PersonaisedLearning/StudyMaterial/StudyMaterial';
import ReportManagementModuleList from '@/modules/ReportManagementModule/ReportManagementModuleList';
import { ResultDashboard } from '@/modules/ResultModule';
import StudentResultDetail from '@/modules/ResultsPortal/StudentResultDetail';
import StudentsResultsList from '@/modules/ResultsPortal/StudentsResultsList';
import EditRole from '@/modules/RoleManagement/Edit-role/EditRole';
import RoleManagement from '@/modules/RoleManagement/RoleManagement';
import SelectInstitute from '@/modules/RoleManagement/select-Institute/select-institute';
import CreateEditMasterSubject from '@/modules/Settings/components/mastersubject/createEditMasterSubject';
import Settings from '@/modules/Settings/components/Settings';
import SetUpWizard from '@/modules/SetUpWizard/components/SetUpWizard';
import UpgradeStudent from '@/modules/UpgradeTONextBatch/UpgradeStudent';
import UpgradeTeacher from '@/modules/UpgradeTONextBatch/UpgradeTeacher';
import StudentDetails from '@/modules/Management/students/components/details/StudentDetails';

const ALL_MODULE_PERMISSIONS = [
  RoutePermittedRole.SuperAdmin,
  RoutePermittedRole.Admin,
  RoutePermittedRole.Teacher,
  RoutePermittedRole.Parent,
  RoutePermittedRole.Student,
  RoutePermittedRole.DEPARTMENT_OF_EDUCATION,
];
export const dashboardConfig = [
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/dashboard',
    element: <ProtectedRoute module={MODULE.DASHBOARD} action={ACTION.VIEW} element={<Dashboard />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/calendar',
    element: <ProtectedRoute module={MODULE.CALENDAR} action={ACTION.VIEW} element={<Calendar />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/setup-wizard',
    element: <SetUpWizard />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/upgrade-student',
    element: <ProtectedRoute module={MODULE.STUDENTS} action={ACTION.VIEW} element={<UpgradeStudent />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/upgrade-teacher',
    element: <ProtectedRoute module={MODULE.TEACHERS} action={ACTION.VIEW} element={<UpgradeTeacher />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/report-management',
    element: <ReportManagementModuleList />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/module/select',
    element: <RoleManagement />,
  },

  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/module/select/editrole',
    element: <EditRole editMode={true} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/assessments',
    element: <ProtectedRoute module={MODULE.ASSESSMENTS} action={ACTION.VIEW} element={<ExamsList />} />,
  },

  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/assessments/list',
    element: <ProtectedRoute module={MODULE.ASSESSMENTS} action={ACTION.VIEW} element={<AssessmentList />} />,
  },

  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/grading-process',
    element: <ProtectedRoute module={MODULE.GRADING_PROCESS} action={ACTION.VIEW} element={<MarkingProcess />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/grading-process/assessment/details/:id',
    element: (
      <ProtectedRoute module={MODULE.GRADING_PROCESS} action={ACTION.VIEW} element={<MarkingAssessmentDetails />} />
    ),
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/grading-process/assessment/subject-details/:id',
    element: (
      <ProtectedRoute
        module={MODULE.GRADING_PROCESS}
        action={ACTION.VIEW}
        element={<MarkingAssessmentSubjectDetails />}
      />
    ),
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/manual-review/assessment/details/:id',
    element: (
      <ProtectedRoute module={MODULE.MANUAL_REVIEW} action={ACTION.VIEW} element={<ManualReviewAssessmentDetails />} />
    ),
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/manual-review/assessment/subject-details/:id',
    element: (
      <ProtectedRoute module={MODULE.MANUAL_REVIEW} action={ACTION.VIEW} element={<ManualReviewSubjectDetails />} />
    ),
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/assessment/add',
    element: <ProtectedRoute module={MODULE.ASSESSMENTS} action={ACTION.VIEW} element={<CreateEditAssessment />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/assessments/update/:id',
    element: (
      <ProtectedRoute
        module={MODULE.ASSESSMENTS}
        action={ACTION.VIEW}
        element={<CreateEditAssessment editMode={true} />}
      />
    ),
  },

  // {
  //   permittedRole: [
  //     RoutePermittedRole.SuperAdmin,
  //     RoutePermittedRole.Admin,
  //     RoutePermittedRole.Teacher,
  //     RoutePermittedRole.Parent,
  //     RoutePermittedRole.Student,
  //     RoutePermittedRole.DEPARTMENT_OF_EDUCATION,
  //   ],
  //   path: '/digital-marking/dashboard',
  //   element: <ProtectedRoute module={MODULE.DIGITALMARKING} action={ACTION.VIEW} element={<DMDashboard />} />,
  // },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/assessments/details/:id',
    element: <ProtectedRoute module={MODULE.ASSESSMENTS} action={ACTION.VIEW} element={<AssessmentSubjectDetails />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/exams/details/:id',
    element: <ProtectedRoute module={MODULE.ASSESSMENTS} action={ACTION.VIEW} element={<ExamDetails />} />,
  },
  // {
  //   permittedRole: [
  //     RoutePermittedRole.SuperAdmin,
  //     RoutePermittedRole.Admin,
  //     RoutePermittedRole.Teacher,
  //     RoutePermittedRole.Parent,
  //     RoutePermittedRole.Student,
  //     RoutePermittedRole.DEPARTMENT_OF_EDUCATION,
  //   ],
  //   path: '/exams/instant-grades',
  //   element: <ProtectedRoute module={MODULE.GRADE} action={ACTION.VIEW} element={<InstantGrades />} />,
  // },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/manual-review',
    element: <ProtectedRoute module={MODULE.MANUAL_REVIEW} action={ACTION.VIEW} element={<ManualReview />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/marked-answerscript',
    element: (
      <ProtectedRoute module={MODULE.MARKED_ANSWER_SCRIPTS} action={ACTION.VIEW} element={<MarkedAnswerScript />} />
    ),
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/marked-answerscript/assessment/details/:id',
    element: (
      <ProtectedRoute module={MODULE.MARKED_ANSWER_SCRIPTS} action={ACTION.VIEW} element={<MarkedAnswerDetails />} />
    ),
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/marked-answerscript/assessment/subject-details/:id',
    element: (
      <ProtectedRoute
        module={MODULE.MARKED_ANSWER_SCRIPTS}
        action={ACTION.VIEW}
        element={<MarkedAnswerScriptDetails />}
      />
    ),
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/manual-review/instant-grades/review/:id',

    element: (
      <ProtectedRoute
        module={MODULE.MANUAL_REVIEW || MODULE.MARKED_ANSWER_SCRIPTS || MODULE.GRADING_PROCESS}
        action={ACTION.VIEW}
        element={<ReviewAnswerSheet />}
      />
    ),
  },
  // MODULE.MANUAL_REVIEW || MODULE.MARKED_ANSWER_SCRIPTS || MODULE.GRADING_PROCESS ||
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/marked-answerscript/instant-grades/review/:id',

    element: <ProtectedRoute module={MODULE.ASSESSMENTS} action={ACTION.VIEW} element={<ReviewAnswerSheet />} />,
  },
  // {
  //   permittedRole: [
  //     RoutePermittedRole.SuperAdmin,
  //     RoutePermittedRole.Admin,
  //     RoutePermittedRole.Teacher,
  //     RoutePermittedRole.Parent,
  //     RoutePermittedRole.Student,
  //   ],
  //   path: '/exams/instant-grades/review/:id',

  //   element: (
  //     <ProtectedRoute
  //       module={MODULE.MANUAL_REVIEW || MODULE.MARKED_ANSWER_SCRIPTS || MODULE.GRADING_PROCESS}
  //       action={ACTION.VIEW}
  //       element={<ReviewAnswerSheet />}
  //     />
  //   ),
  // },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/quiz',
    element: <ProtectedRoute module={MODULE.PRACTICE_EXERCISES} action={ACTION.VIEW} element={<Quizzes />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/quiz/subject',
    element: <ProtectedRoute module={MODULE.PRACTICE_EXERCISES} action={ACTION.VIEW} element={<QuizzesSubject />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/quiz/individual',
    element: <ProtectedRoute module={MODULE.PRACTICE_EXERCISES} action={ACTION.VIEW} element={<ModernQuiz />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/result/dashboard',
    element: <ProtectedRoute module={MODULE.RESULT_DASHBOARD} action={ACTION.VIEW} element={<UnderConstruction />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/results/all',
    element: <ProtectedRoute module={MODULE.RESULT_DASHBOARD} action={ACTION.VIEW} element={<StudentsResultsList />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/result/detail/:id',
    element: <ProtectedRoute module={MODULE.RESULT_DASHBOARD} action={ACTION.VIEW} element={<StudentResultDetail />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/practice',
    element: <ProtectedRoute module={MODULE.PRACTICE_EXERCISES} action={ACTION.VIEW} element={<PracticeExercises />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/practice/quiz-list',
    element: <ProtectedRoute module={MODULE.PRACTICE_EXERCISES} action={ACTION.VIEW} element={<MainQuizList />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/practice/quiz-details/:id',
    element: <ProtectedRoute module={MODULE.PRACTICE_EXERCISES} action={ACTION.VIEW} element={<QuizDetailPage />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/practice/quiz-details/student-answers/:id',
    element: (
      <ProtectedRoute module={MODULE.PRACTICE_EXERCISES} action={ACTION.VIEW} element={<QuizStudentAnswersDetails />} />
    ),
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/practice/student-details/:id',
    element: <ProtectedRoute module={MODULE.PRACTICE_EXERCISES} action={ACTION.VIEW} element={<PracticeExercises />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/practice/learner-list',
    element: <ProtectedRoute module={MODULE.PRACTICE_EXERCISES} action={ACTION.VIEW} element={<QuizStudentList />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/generate-quiz',
    element: (
      <ProtectedRoute module={MODULE.PRACTICE_EXERCISES} action={ACTION.VIEW} element={<CreateEditManualQuizPage />} />
    ),
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/practice/quiz/attend/:id',
    element: <ProtectedRoute module={MODULE.PRACTICE_EXERCISES} action={ACTION.VIEW} element={<AttendQuiz />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/feedback',
    element: <IndividualFeedback />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/memos',
    element: <MemosList />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/memo',
    element: <MemoYearCard />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/memo/gradelist',
    element: <GradeCard />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/memo/subject',
    element: <SubjectCard />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/answer-scripts',
    element: <AnswerScriptsList />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/role/select',
    element: <SelectInstitute />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/school/list',
    element: <ProtectedRoute module={MODULE.INSTITUTE} action={ACTION.VIEW} element={<InstitutesList />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/institute/detail/:id',
    element: <ProtectedRoute module={MODULE.INSTITUTE} action={ACTION.VIEW} element={<InstituteDetails />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/school/add',
    element: <ProtectedRoute module={MODULE.INSTITUTE} action={ACTION.ADD} element={<CreateEditInstitute />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/school/update/:id',

    element: (
      <ProtectedRoute
        module={MODULE.INSTITUTE}
        action={ACTION.EDIT}
        element={<CreateEditInstitute editMode={true} />}
      />
    ),
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/teacher/list',
    element: <ProtectedRoute module={MODULE.TEACHERS} action={ACTION.VIEW} element={<TeachersList />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/teacher/detail/:id',
    element: <ProtectedRoute module={MODULE.TEACHERS} action={ACTION.VIEW} element={<TeacherDetails />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/teacher/add',
    element: <ProtectedRoute module={MODULE.TEACHERS} action={ACTION.ADD} element={<CreateEditTeacher />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/teacher/update/:id',
    element: <CreateEditTeacher editMode={true} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/parent/list',
    element: <ProtectedRoute module={MODULE.PARENTS} action={ACTION.VIEW} element={<ParentsList />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/department-admin/list',
    element: (
      <ProtectedRoute
        module={MODULE.DEPARTMENT_OF_EDUCATION}
        action={ACTION.VIEW}
        element={<DepartmentOfEducationList />}
      />
    ),
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/department-admin/add',
    element: <ProtectedRoute module={MODULE.DEPARTMENT_OF_EDUCATION} action={ACTION.ADD} element={<CreateEditDoe />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/department-admin/update/:id',
    element: (
      <ProtectedRoute
        module={MODULE.DEPARTMENT_OF_EDUCATION}
        action={ACTION.EDIT}
        element={<CreateEditDoe editMode={true} />}
      />
    ),
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/department-admin/detail/:id',
    element: (
      <ProtectedRoute
        module={MODULE.DEPARTMENT_OF_EDUCATION}
        action={ACTION.EDIT}
        element={<DepartmentAdminDetailsPage />}
      />
    ),
  },

  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/parent/detail/:id',
    element: <ProtectedRoute module={MODULE.PARENTS} action={ACTION.VIEW} element={<ParentDetails />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/parent/add',
    element: <ProtectedRoute module={MODULE.PARENTS} action={ACTION.ADD} element={<CreateEditParent />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/parent/update/:id',
    element: (
      <ProtectedRoute module={MODULE.PARENTS} action={ACTION.EDIT} element={<CreateEditParent editMode={true} />} />
    ),
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/learner/list',
    element: <ProtectedRoute module={MODULE.STUDENTS} action={ACTION.VIEW} element={<StudentsList />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/learner/detail/:id',
    element: (
      <ProtectedRoute module={MODULE.STUDENTS} action={ACTION.VIEW} element={<StudentDetails role={'learner'} />} />
    ),
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/learner/add',
    element: <ProtectedRoute module={MODULE.STUDENTS} action={ACTION.ADD} element={<CreateEditStudent />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/learner/update/:id',
    element: (
      <ProtectedRoute module={MODULE.STUDENTS} action={ACTION.EDIT} element={<CreateEditStudent editMode={true} />} />
    ),
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/admin/list',
    element: <ProtectedRoute module={MODULE.ADMIN} action={ACTION.VIEW} element={<AdminList />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/admin/add',
    element: <ProtectedRoute module={MODULE.ADMIN} action={ACTION.ADD} element={<CreateEditAdmin />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/admin/update/:id',
    element: (
      <ProtectedRoute module={MODULE.ADMIN} action={ACTION.EDIT} element={<CreateEditAdmin editMode={true} />} />
    ),
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/settings',
    element: <Settings />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/notifications',
    element: <NotificationList />,
  },
  // {
  //   permittedRole: [
  //     RoutePermittedRole.SuperAdmin,
  //     RoutePermittedRole.Admin,
  //     RoutePermittedRole.Teacher,
  //     RoutePermittedRole.Parent,
  //     RoutePermittedRole.Student,
  //     RoutePermittedRole.DEPARTMENT_OF_EDUCATION,
  //   ],
  //   path: '/grade/list',
  //   element: <ProtectedRoute module={MODULE.GRADE} action={ACTION.VIEW} element={<GradeList />} />,
  // },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/grade/details',
    element: <GradeDetails />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/class/list',
    element: <ClasssList />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/class/details',
    element: <ClassDetails />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/class/add',
    element: <CreateUpdateClass />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/class/update/:id',
    element: <CreateUpdateClass editMode={true} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/batch/list',
    element: <BatchsList />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/batch/details',
    element: <BatchDetails />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/grouped',
    element: <UnderConstruction />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/lesson-plan',
    element: <ProtectedRoute module={MODULE.LESSON_PLAN} action={ACTION.VIEW} element={<LessonPlan />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/lesson-plan/add',
    element: <ProtectedRoute module={MODULE.LESSON_PLAN} action={ACTION.ADD} element={<CreateEditLessonPlan />} />,
  },

  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/study-material',
    element: <ProtectedRoute module={MODULE.STUDY_MATERIAL} action={ACTION.VIEW} element={<StudyMaterial />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/term/list',
    element: <UnderConstruction />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/assessment-timetable',
    element: (
      <ProtectedRoute module={MODULE.EXAM_TIME_TABLE} action={ACTION.VIEW} element={<ExamTimeTableMainList />} />
    ),
  },

  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/assessment-timetable/details/:id',
    element: <ProtectedRoute module={MODULE.EXAM_TIME_TABLE} action={ACTION.VIEW} element={<ExamTimeTableDetails />} />,
  },

  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/exam-timetable/details/:id',
    element: <ProtectedRoute module={MODULE.EXAM_TIME_TABLE} action={ACTION.VIEW} element={<ExamTimeTableDetail />} />,
  },

  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/setupsubject:id',
    element: <Setupsubject />,
  },

  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/add/subject/:id',
    element: <ProtectedRoute module={MODULE.ASSESSMENTS} action={ACTION.ADD} element={<AddAssessmentSubject />} />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/my-profile',
    element: <UserProfile />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/master-subject/create',
    element: <CreateEditMasterSubject />,
  },
  {
    permittedRole: ALL_MODULE_PERMISSIONS,
    path: '/master-subject/update/:id',
    element: <CreateEditMasterSubject editMode={true} />,
  },
];
