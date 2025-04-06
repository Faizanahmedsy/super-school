export interface QuizData {
  id: number;
  title: string;
  quiz_topic: string;
  average_marks: number;
  num_students: number;
  num_attended_students: number;
  number_of_questions: number;
  quiz_type: 'ai' | 'manual' | 'self';
  grade: number;
  grade_class: string;
  end_date: string;
  start_date: string;
}

export interface MainQuizResp {
  totalCount: number;
  results: {
    main_quizzes: QuizData[];
    overview: {
      num_of_generated: number;
      num_of_completed: string;
      average_marks: string;
    };
  };
}

export interface StudentAnalyticsResp {
  overview: {
    quizzes_generated: number;
    quizzes_completed: number;
    improvement_rate: number;
  };
  subject_performance_insights: {
    subject_id: number;
    subject_name: string;
    subject_code: string;
    average_mark_percentage: number;
    improvement_percentage: number;
    top_students: {
      first_name: string;
      last_name: string;
      average_marks_percentage: number;
    }[];
  }[];
  top_performing_subjects: {
    subject_id: number;
    subject_name: string;
    subject_code: string;
    average_mark_percentage: number;
  }[];
  low_performing_subjects: {
    subject_id: number;
    subject_name: string;
    subject_code: string;
    average_mark_percentage: number;
  }[];
}

export interface StudentWeaknessResp {
  totalCount: number;
  next: string | null;
  previous: string | null;
  records_per_page: number;
  totalPages: number;
  currentPage: number;
  results: {
    student_name: string;
    student_admission_number: string;
    weakness: {
      subject_id: number;
      subject_name: string;
      weakness: string[];
      strength: string[];
    };
  }[];
}

interface MainQuiz {
  id: number;
  title: string;
  quiz_topic: string;
  quiz_type: string;
  weaknesses: null | string;
  number_of_questions: number;
  subject: number;
  grade: number;
  quiz_start_date_time: string; // ISO date string
  quiz_end_date_time: string; // ISO date string
  weaknessess: string[];
}

interface QuizQanda {
  id: number;
  question: string;
  actual_answer: string[];
  options: string[];
  quiz: number;
  school: number;
  term: number;
  batch: number;
}

export interface MainQuizDetailsResp {
  main_quiz: MainQuiz;
  quiz_qanda: QuizQanda[];
}

export interface QuizDetailsResp {
  quiz: {
    id: number;
    student_data: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      admission_no: string;
      profile_image: string | null;
    };
    title: string;
    quiz_type: string;
    feedback: string | null;
    number_of_questions: number;
    marks_obtained: number | null;
    is_attempted: boolean;
    created_at: string;
    updated_at: string;
    quiz_start_date_time: string;
    quiz_end_date_time: string;
    main_quiz: number;
    student: number;
    subject: number;
    grade: number;
    grade_class: number;
    term: number;
    batch: number;
    school: number;
  };
  quiz_qanda: {
    id: number;
    question: string;
    options: string[];
    actual_answers: string[];
    student_answers: string[] | null;
    multi_choice: boolean;
    is_correct: boolean;
    created_at: string;
    updated_at: string;
    quiz: number;
    term: number;
    batch: number;
    school: number;
  }[];
}

interface Overview {
  num_of_generated: number;
  num_of_completed: string; // e.g., "0 out of 10"
  average_marks: string; // e.g., "0 out of 77"
}

interface StudentData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  admission_no: string;
  profile_image: string | null; // Can be a URL, a file path, or null
}

export interface QuizType {
  id: number;
  student_data: StudentData;
  title: string;
  quiz_type: string; // Could be an enum if the values are fixed, e.g., "ai" | "school"
  feedback: string | null;
  number_of_questions: number;
  marks_obtained: number | null;
  is_attempted: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  quiz_start_date_time: string; // ISO date string
  quiz_end_date_time: string; // ISO date string
  main_quiz: number;
  student: number;
  subject: number;
  grade: number;
  grade_class: number;
  term: number;
  batch: number;
  school: number;
  duration: number; // Duration in seconds or minutes?
  status: string; // Could be an enum if the values are fixed, e.g., "upcoming" | "completed"
}

export interface QuizListData {
  totalCount: number;
  results: {
    overview: Overview;
    quizzes: QuizType[];
  };
}

export interface RetrieveQuizStudentAnswerDetails {
  quiz: {
    id: number;
    student_data: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      admission_no: string;
      profile_image: string | null;
    };
    title: string;
    quiz_type: string;
    grade_class_name: string;
    grade_number: number;
    term_name: string;
    batch_name: number,
    quiz_topic: string,
    feedback: string | null;
    number_of_questions: number;
    marks_obtained: number | null;
    is_attempted: boolean;
    created_at: string;
    updated_at: string;
    quiz_start_date_time: string;
    quiz_end_date_time: string;
    main_quiz: number;
    student: number;
    subject: number;
    subject_name: string;
    grade: number;
    grade_class: number;
    term: number;
    batch: number;
    school: number;
  };
  quiz_qanda: {
    id: number;
    question: string;
    options: string[];
    actual_answers: string[];
    student_answers: string[] | null;
    multi_choice: boolean;
    is_correct: boolean;
    created_at: string;
    updated_at: string;
    quiz: number;
    term: number;
    batch: number;
    school: number;
  }[];
}

export interface QuizAssessmentStudentWeaknessResp {
  [key: string]: any;
}

export interface StudentAssessmentResp {
  totalCount: number;
  next: string | null;
  previous: string | null;
  records_per_page: number;
  totalPages: number;
  currentPage: number;
  grade_rank: number;
  class_rank: number;
  achievement_level: number;
  results: StudIndividualAssessment[];
}

export interface StudIndividualAssessment {
  id: number;
  assessment_name: string;
  assessment_start_datetime: string; // ISO 8601 datetime format
  assessment_end_datetime: string; // ISO 8601 datetime format
  status: string;
  term: number;
  grade: number;
  grade_class: number;
  grade_class__name: string;
  batch__start_year: string;
  term__term_name: string;
  grade__grade_number: number;
  batch: number;
  is_locked: boolean;
  grade_classes: number[];
  grade_class_names: string[];
  assessment_subjects: AssessmentSubject[];
  top_performing_subject: PerformingSubject;
  low_performing_subject: PerformingSubject;
  average_mark: string;
}

interface AssessmentSubject {
  id: number;
  subject_name: string;
  subject_id: number;
  grade_class_name: string;
  grade_class_id: number;
  paper_title: string;
  average_obtained_mark: number;
  average_actual_mark: number;
  highest_obtained_mark: number;
  lowest_obtained_mark: number;
}

interface PerformingSubject {
  subject_name: string;
  subject_id: number;
}
