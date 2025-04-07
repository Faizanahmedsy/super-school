// src/types/data.ts
export interface ManualReviewItem {
  id: number;
  student_id: number | null;
  question: string;
  question_number: string;
  answer: string;
  not_detected_word: string[];
  confidence_score: number;
  actual_marks: number;
  obtained_marks: number;
  reason: string;
  weakness: string | null;
  strength: string | null;
  exam_id: number;
}

export interface ManualReviewResponse {
  data: ManualReviewItem[];
  sheet: string;
}

export interface ManualReviewData {
  data: {
    data: ManualReviewItem[];
    sheet: string;
  };
  isSuccess: boolean;
  isPending: boolean;
  isError: boolean;
}
