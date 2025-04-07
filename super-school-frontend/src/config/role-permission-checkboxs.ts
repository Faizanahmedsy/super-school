import { ACTION } from '@/lib/helpers/authHelpers';

export const disabledConditions = [
  {
    role: 'Admin',
    modules: [
      {
        name: 'Dashboard',
        permissions: [ACTION.ADD, ACTION.EDIT, ACTION.DELETE],
      },
      {
        name: 'Schools',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Department Admin',
        permissions: [ACTION.ADD, ACTION.EDIT, ACTION.DELETE],
      },
      {
        name: 'Result Dashboard',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Reports Management',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },

      {
        name: 'General Settings',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
    ],
  },
  {
    role: 'Teacher',
    modules: [
      {
        name: 'Dashboard',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Admin',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Schools',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Teachers',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Learners',
        permissions: [ACTION.DELETE],
      },
      {
        name: 'Parents',
        permissions: [ACTION.DELETE],
      },
      {
        name: 'Department Admin',
        permissions: [ACTION.ADD, ACTION.EDIT, ACTION.DELETE],
      },
      {
        name: 'Result Dashboard',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Reports Management',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },

      {
        name: 'General Settings',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
    ],
  },
  {
    role: 'Parents',
    modules: [
      {
        name: 'Dashboard',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Admin',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Parents',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Schools',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Department Admin',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Learners',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Teachers',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'General Settings',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Assessments',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Grading Process',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Manual Review',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Marked Answer Scripts',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Result Dashboard',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Report Card',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Calendar',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Practice Exercises',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Lesson Plans',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Study Materials',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Reports Management',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD, ACTION.VIEW],
      },
      {
        name: 'Exam Timetable',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
    ],
  },
  {
    role: 'Learner',
    modules: [
      {
        name: 'Dashboard',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Admin',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Schools',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Department Admin',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Learners',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Teachers',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'General Settings',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Assessments',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Grading Process',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Manual Review',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Marked Answer Scripts',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Result Dashboard',
        permissions: [ACTION.VIEW, ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Practice Exercises',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },

      {
        name: 'Study Materials',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Reports Management',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD, ACTION.VIEW],
      },
      // {
      //   name: 'Exam Timetable',
      //   permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      // },
    ],
  },
  {
    role: 'Department Admin',
    modules: [
      {
        name: 'Dashboard',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Admin',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Schools',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Department Admin',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Learners',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Teachers',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Assessments',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Grading Process',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Manual Review',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Marked Answer Scripts',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Result Dashboard',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Practice Exercises',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Lesson Plans',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Study Materials',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Reports Management',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Exam Timetable',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Parents',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Report Card',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'Calendar',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD],
      },
      {
        name: 'General Settings',
        permissions: [ACTION.EDIT, ACTION.DELETE, ACTION.ADD, ACTION.VIEW],
      },
    ],
  },
];
