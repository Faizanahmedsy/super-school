export type Exam = {
  id: number;
  exam_name: string;
  start_date: string;
  start_time: string;
  start_date_time: string;
  end_date: string;
  end_time: string;
  end_date_time: string;
  status: string;
  total_students: number;
  created_at: string;
  updated_at: string;
};

export type CreateEditAssessmentProps = {
  editMode?: boolean;
};
