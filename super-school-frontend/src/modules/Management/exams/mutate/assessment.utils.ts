import dayjs from 'dayjs';

//TODO: REPLACE ANY WITH ASSESSMENT RESPONSE TYPE
export const autoFillEditForm = (form: any, data: any) => {


  form.setFieldsValue({
    assessment_name: data[0]?.assessment_name,
    assessment_start_datetime: dayjs(data[0]?.assessment_start_datetime),
    assessment_end_datetime: dayjs(data[0]?.assessment_end_datetime),
    status: data[0]?.status,
    batch: data[0]?.batch__start_year,
    term: data[0]?.term,
    grade_class: data[0]?.grade_classes,
    grade_number: data[0]?.grade__grade_number,
  });
};
