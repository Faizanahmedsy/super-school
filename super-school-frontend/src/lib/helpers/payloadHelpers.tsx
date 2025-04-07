type FrontendPayload = {
  grade_id: string;
  grade_class_id: string;
  subject_ids_string: string[];
}[];

type BackendPayload = {
  subjects: {
    grade_id: number;
    grade_class_id: number;
    subject_id: number;
    batch_id: number;
  }[];
};

export function transformSubjectsPayload(frontendPayload: FrontendPayload, batchId: number): BackendPayload {
  const subjects = frontendPayload.flatMap(({ grade_id, grade_class_id, subject_ids_string }) =>
    subject_ids_string.map((subject_id) => ({
      grade_id: parseInt(grade_id, 10),
      grade_class_id: parseInt(grade_class_id, 10),
      subject_id: parseInt(subject_id, 10),
      batch_id: Number(batchId),
    }))
  );

  return {
    subjects,
  };
}
