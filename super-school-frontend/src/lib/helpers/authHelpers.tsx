import { jwtDecode } from 'jwt-decode';
import canPerformAction from '../common-functions';
import { getItem } from '../localstorage';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { RouterConfigData } from '@/app/types/models/Apps';
import useGlobalState from '@/store';

/**
 * IMPORTANT: DO NOT MODIFY THIS FILE WITHOUT APPROVAL.
 * This file contains critical enums used across the application.
 * Any changes to these enums can lead to application instability and security vulnerabilities if not handled properly.
 * If you need to update this file, seek approval from the team leader or lead frontend developer.
 */

// IMPORTANT: DO NOT REMOVE OR CHANGE THIS ENUM! WITHOUT APPROVAL (SEE ABOVE MESSAGE)
export const enum ACTION {
  VIEW = 'view',
  ADD = 'add',
  EDIT = 'edit',
  DELETE = 'delete',
}
// IMPORTANT: DO NOT REMOVE OR CHANGE THIS ENUM! WITHOUT APPROVAL (SEE ABOVE MESSAGE)
export const enum ROLE_NAME {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parents',
  DEPARTMENT_OF_EDUCATION = 'department_of_education',
}

// IMPORTANT: DO NOT REMOVE OR CHANGE THIS ENUM! WITHOUT APPROVAL (SEE ABOVE MESSAGE)
export const enum MODULE {
  INSTITUTE = 'schools', //
  DASHBOARD = 'dashboard', //
  ASSESSMENTS = 'assessments', //
  DEPARTMENT_OF_EDUCATION = 'department_admin', //
  // GRADE = 'grade',
  // USER = 'user',
  // USERS = 'users',
  ADMIN = 'admin', //
  TEACHERS = 'teachers', //
  STUDENTS = 'learners', //
  PARENTS = 'parents', //
  // DIGITALMARKING = 'digitalmarking',
  GRADING_PROCESS = 'grading_process', //
  // MEMO = 'memo',
  MANUAL_REVIEW = 'manual_review', //
  // ANSWERSCRIPT = 'answerscript',
  // PERSONALIZEDLEARNING = 'personalizedlearning',
  PRACTICE_EXERCISES = 'practice_exercises', //
  // INDIVIDUAL = 'quizzes',
  LESSON_PLAN = 'lesson_plans', //
  STUDY_MATERIAL = 'study_materials', // multiple
  // RESULTSPORTAL = 'resultSportal',
  // RESULT = 'resultdashboard',
  MARKED_ANSWER_SCRIPTS = 'marked_answer_scripts', //
  RESULT_DASHBOARD = 'result_dashboard', //
  REPORT_CARD = 'report_card', //
  REPORT_MANAGEMENT = 'reports_management', //
  // EVENT = 'event',
  CALENDAR = 'calendar', //
  EXAM_TIME_TABLE = 'exam_timetable', //
  // ROLE = 'role',
  // SETTINGS = 'settings',
  GENERAL_SETTINGS = 'general_settings', //
}

export const fetchRole = () => {
  const accessToken = getItem('access_token');

  const result: {
    email: string;
    role_name: string;
    sub: number;
    iat: number;
    exp: number;
  } = jwtDecode(accessToken);

  return result?.role_name;
};

export const updatedRoutesConfig = (routesConfig: any[]) => {
  routesConfig.filter((route: { id: string; children: any[] }) => {
    // Check if user can view the route module
    const hasPermission = canPerformAction(route.id, 'view');

    if (hasPermission && route.children) {
      // If the module has children, filter them based on permissions
      route.children = route.children.filter((child: { id: string }) => canPerformAction(child.id, 'view'));
    }
    return hasPermission;
  });
};

export const ProtectedRoute = ({
  module,
  element,
  action,
}: {
  module: string;
  element: React.ReactElement;
  action: ACTION;
}) => {
  const user = useGlobalState((state) => state.user);
  const role = user?.role_name;

  if (role == ROLE_NAME.SUPER_ADMIN || role == ROLE_NAME.DEPARTMENT_OF_EDUCATION) {
    return element;
  }
  const canAccess = canPerformAction(module, action);
  if (!canAccess) {
    return <Navigate to="/error-pages/error-403" />;
  }

  return element;
};

export const hideRoutesForRole = (routesConfig: RouterConfigData[], hideRouteIds: string[]): RouterConfigData[] => {
  return routesConfig
    .map((route) => {
      // If the route's ID is in the hideRouteIds, remove it
      if (hideRouteIds.includes(route.id)) {
        return null; // Remove this route
      }

      // If route has children, filter out any child with an ID in hideRouteIds
      if (route.children) {
        route.children = route.children.filter((child) => !hideRouteIds.includes(child.id));
      }

      return route; // Keep the rest of the routes
    })
    .filter((route) => route !== null); // Remove any null entries (hidden routes)
};
