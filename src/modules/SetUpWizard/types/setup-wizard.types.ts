import React from 'react';

interface SubjectData {
  normalSubjects: number[]; // selected normal subject ids
  languageSubjects: number[]; // selected language subject ids
  terms: number[]; // selected term ids
}

interface GradeData {
  id: number;
  grade_number: number;
}

interface TermsData {
  id: number;
  term_name: string;
}

interface SubjectListApiResponse {
  data?: {
    list: {
      id: number;
      subject_name: string;
      subject_code: string;
      is_language: boolean;
    }[];
  };
}

interface User {
  school?: {
    id: string | number;
  };
}

interface SetUpData {
  grade: GradeData[];
  batch?: {
    terms: TermsData[];
  };
}

export type UIFormCardProps = {
  children: React.ReactNode;
  title: string | React.ReactNode;
  description: string;
  className?: string;
};
