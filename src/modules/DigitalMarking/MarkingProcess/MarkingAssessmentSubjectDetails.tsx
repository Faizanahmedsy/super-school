import BtnLoader from '@/components/custom/buttons/btn-loader';
import UILoader from '@/components/custom/loaders/UILoader';
import ProfileImageAvatar from '@/components/custom/Table/ProfileImageAvatar';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import PageTitle from '@/components/global/PageTitle';
import PdfViewer from '@/components/global/PdfViewer/PdfViewer';
import UIText from '@/components/global/Text/UIText';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { calculateExamDuration, capitalizeFirstLetter, formatDate, getTimeFromISO } from '@/lib/common-functions';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { displayWarning } from '@/lib/helpers/warningHelpers';
import { cn } from '@/lib/utils';
import BulkAnswerSheetUpload from '@/modules/Management/exams/BulkAnswerSheetUpload';
import UploadAnswerSheetModal from '@/modules/Management/exams/UploadAnswerSheetModal';
import {
  useAssessmentWiseStudentstList,
  useOcrStart,
  useSubjectDetailsList,
} from '@/services/assessments/assessments.hook';
import { QueryParams } from '@/services/types/params';
import useGlobalState from '@/store';
import { ColumnDef } from '@tanstack/react-table';
import { Form, Modal, Spin, Tooltip, Upload } from 'antd';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { AlertTriangle, ArrowUpDown, OctagonAlertIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaFilePdf, FaRegEdit } from 'react-icons/fa';
import { MdOutlineNotificationsActive } from 'react-icons/md';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

interface FormValues {
  subjects: {
    memo: any;
    questionPaper: any;
  }[];
}

export default function MarkingAssessmentSubjectDetails() {
  const navigate = useNavigate();
  const params: any = useParams();
  const [openAnswerSheetModal, setOpenAnswerSheetModal] = useState(false);
  const [openBulkAnswerSheetModal, setOpenBulkAnswerSheetModal] = useState(false);
  const [modalTrue, setModalTrue] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [checkStatus, setCheckStatus] = useState(false);
  const [isLocked, setLocked] = useState(false);
  const [openModel, setOpenModel] = useState(false);
  const [students_id, setStudentId] = useState();
  const [AnswersheetId, setAnswersheetId] = useState();
  const school_id = useRoleBasedSchoolId();
  const [loading, setLoading] = useState(false);

  // const { gradeId } = location.state || {};

  const user = useGlobalState((state: any) => state.user);

  const isSuperAdmin = user.role_name == ROLE_NAME.SUPER_ADMIN;

  const [searchParams] = useSearchParams();
  const gradeId = searchParams.get('grade_class');

  const [form] = Form.useForm();
  const [change, setName] = useState('');

  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    page_size: 10,
    search: '',
    city_id: '',
    state_id: '',
    school_id: school_id ? school_id : undefined,
  });

  // const fileUrl = JANGO_PDF_ENDPOINT;
  const { data: subjectDetails, isLoading: studentsLoding } = useSubjectDetailsList({
    id: params?.id,
    school_id: isSuperAdmin ? school_id : undefined,
  });

  const { mutate: ocrdata, isPending: ocrPending } = useOcrStart(params?.id);

  const [_, setUploadedFiles] = useState({
    memo: 'null',
  });

  const {
    data: getSubjectWiseStudent,
    isLoading,
    isPending,
    refetch,
  } = useAssessmentWiseStudentstList({
    ...pageQuery,
    assessment_subject: params?.id,
    grade_class: gradeId ? gradeId : undefined,
  });

  useEffect(() => {
    if (getSubjectWiseStudent?.results && Array.isArray(getSubjectWiseStudent?.results)) {
      const isAnySheetUpdated = getSubjectWiseStudent?.results.some((item: any) => item.sheet_update === true);
      setCheckStatus(isAnySheetUpdated);
      const isLocked = getSubjectWiseStudent?.results.some((item: any) => item.is_locked === true);
      setLocked(isLocked);
    }
  }, [getSubjectWiseStudent]);

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      limit: pageSize,
    }));
  };

  const debouncedSearch = debounce((searchTerm: string) => {
    setPageQuery((prev) => ({
      ...prev,
      search: searchTerm,
    }));
  }, 300);

  const handleSearchInputChange = (searchTerm: string) => {
    debouncedSearch(searchTerm);
  };

  const columns: ColumnDef<any[number]>[] = [
    {
      accessorKey: 'student.profile_image',
      header: '',
      cell: (info) => <ProfileImageAvatar info={info} />,
    },
    {
      accessorKey: 'student.first_name',
      header: () => {
        return (
          <div
            className="gap-2 flex justify-start items-center cursor-pointer text-primary"
            onClick={() => {
              setPageQuery({
                ...pageQuery,
                ordering: pageQuery.ordering === 'student__first_name' ? '-student__first_name' : 'student__first_name',
              });
            }}
          >
            <UIText>Name</UIText>
            <ArrowUpDown size={14} />
          </div>
        );
      },
      cell: (info) => {
        const value = info.getValue();
        return (
          <div
            className={cn(
              'flex items-center space-x-2 ',
              (info.row.original.not_detected_word_count > 0 || info.row.original.questions_to_review > 0) &&
                'bg-nsc-red/30 rounded-sm'
            )}
          >
            {value as string}
          </div>
        );
      },
    },
    {
      accessorKey: 'student.last_name',
      header: () => {
        return (
          <div
            className="gap-2 flex justify-start items-center cursor-pointer text-primary"
            onClick={() => {
              setPageQuery({
                ...pageQuery,
                ordering: pageQuery.ordering === 'student__first_name' ? '-student__first_name' : 'student__first_name',
              });
            }}
          >
            <UIText>Surname</UIText>
            <ArrowUpDown size={14} />
          </div>
        );
      },
      cell: (info) => {
        const value = info.getValue();
        return (
          <div
            className={cn(
              'flex items-center space-x-2 ',
              (info.row.original.not_detected_word_count > 0 || info.row.original.questions_to_review > 0) &&
                'bg-nsc-red/30 rounded-sm'
            )}
          >
            {value as string}
          </div>
        );
      },
    },
    {
      accessorKey: 'student.admission_no',
      header: () => {
        return (
          <div
            className="gap-2 flex justify-start items-center cursor-pointer text-primary"
            onClick={() => {
              setPageQuery({
                ...pageQuery,
                ordering: pageQuery.ordering === 'admission_number' ? '-admission_number' : 'admission_number',
              });
            }}
          >
            <UIText>Addmission No</UIText>
            <ArrowUpDown size={14} />
          </div>
        );
      },
      cell: (info) => {
        const value = info.getValue();
        return <div className="flex items-center space-x-2">{value != null ? String(value) : ''}</div>;
      },
    },
    {
      accessorKey: 'sheet_update',
      header: 'Answer Sheet Uploaded',
      cell: (info) => {
        const { sheet_update } = info.row.original;
        return (
          <div>
            <span
              className={cn(
                'px-2 py-1 rounded-full  text-[12px] text-white',
                sheet_update === true && '  bg-green-600',
                sheet_update === false && 'bg-red-600'
              )}
            >
              {sheet_update ? 'Yes' : 'No'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'sheet_update',
      header: 'Grading Status',
      cell: (info) => {
        const { ocr_status, is_locked } = info.row.original;
        return (
          <div>
            {is_locked ? (
              <span
                className={`px-2 py-1 rounded-full text-[12px] text-white ${
                  ocr_status ? 'bg-green-600' : 'bg-yellow-600'
                }`}
              >
                {ocr_status ? 'Completed' : 'In Progress'}
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full text-[12px] text-white bg-gray-500">Not Started</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'is_reviewed',
      header: 'Manual Review Status',
      cell: (info: any) => {
        const isReviewed = info.getValue();
        return (
          <span
            className={cn('px-2 py-1 rounded-full text-[12px] text-white', isReviewed ? 'bg-green-600' : 'bg-red-600')}
          >
            {capitalizeFirstLetter(isReviewed ? 'Done' : 'Pending')}
          </span>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Uploaded Date & Time',
      cell: (info) => {
        const { created_at } = info.row.original;
        return <div>{dayjs.utc(created_at).format('DD-MM-YYYY hh:mm A')}</div>;
      },
    },

    {
      accessorKey: 'student.ocr_status',
      header: 'Review Answer sheet',
      cell: (info) => {
        const { is_reviewed, not_detected_word_count, id, questions_to_review } = info.row.original;
        if (!info?.row?.original?.ocr_status) {
          return <div className="flex justify-center items-center">-</div>;
        }
        return (
          <div>
            <Button
              variant={'outline'}
              className={cn(
                'hover:bg-white hover:text-black',
                is_reviewed || (not_detected_word_count.length > 0 && 'bg-rose-700 text-rose-50')
              )}
              onClick={() => {
                const componentName = 'marking-assessment';
                navigate(`/manual-review/instant-grades/review/${id}`, {
                  state: { componentName, assessment_subject: params?.id, grade_class: gradeId ? gradeId : undefined },
                });
              }}
            >
              {is_reviewed ? 'Preview Result' : `Review (${questions_to_review})`}{' '}
              {not_detected_word_count.length > 0 && `(${not_detected_word_count})*`}
            </Button>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const { sheet_update, student } = info.row.original;
        const answer_sheet = info.row.original?.answer_sheet;

        return (
          <div className="flex space-x-2">
            {/* Upload/View Answer Sheet Button */}
            <div>
              {sheet_update ? (
                <div className="cursor-pointer w-20 flex justify-center items-center gap-3">
                  <Tooltip title="Preview Answer Sheet">
                    <FaFilePdf type="button" size={24} onClick={() => handlePreview(answer_sheet)} />
                  </Tooltip>
                  {isLocked ? (
                    ''
                  ) : (
                    <Button
                      variant={'outline'}
                      type="button"
                      className={`flex justify-end ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                      disabled={isLocked}
                    >
                      <FaRegEdit
                        size={18}
                        className={`text-orange-600 ${isLocked ? 'pointer-events-none' : ''}`}
                        onClick={() => !isLocked && handleEdit(info.row.original, 'change')}
                      />
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  variant={'outline'}
                  disabled={isLocked}
                  onClick={() => {
                    // displaySuccess(student.id);
                    setStudentId(student.id);
                    if (!sheet_update) {
                      // Open modal to upload answer sheet
                      // setSelectedStudentId(student.id);
                      setOpenAnswerSheetModal(true);
                    } else {
                      // View existing answer sheet
                      window.open(info.row.original.answer_sheet, '_blank');
                    }
                  }}
                >
                  <UIText>Upload Answer Sheet</UIText>
                </Button>
              )}
            </div>
          </div>
        );
      },
    },
  ];

  const uploadProps = {
    customRequest: (options: any) => {
      const { file, onSuccess, onError } = options;

      setTimeout(() => {
        if (file.type === 'application/pdf') {
          onSuccess('ok', file);
          displaySuccess(`${file.name} uploaded successfully.`);
          if (file.name.includes('Memo')) {
            setUploadedFiles((prev) => ({ ...prev, memo: file }));
          } else if (file.name.includes('Question')) {
            setUploadedFiles((prev) => ({ ...prev, questionPaper: file }));
          }
        } else {
          onError(new Error('Upload failed'));
          displayError(`${file.name} upload failed.`);
        }
      }, 1000);
    },
    beforeUpload: (file: File) => {
      const isPDF = file.type === 'application/pdf';
      if (!isPDF) {
        displayError(`${file.name} is not a PDF file`);
      }
      return isPDF;
    },
    onPreview: async (file: any) => {
      let fileURL = file.url;
      // Generate a preview URL for local files
      if (!fileURL) {
        fileURL = URL.createObjectURL(file.originFileObj);
      }
      // Open the file in a new tab
      window.open(fileURL, '_blank');
    },
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
  };

  const ocrHandle = (): void => {
    setModalTrue(true);
    refetch();
  };

  const onClickOrc = () => {
    // if (!loading) {
    setTimeout(() => {
      displayWarning('Digital marking process will take some time once it will complete, you will be notification');
    }, 10000);

    ocrdata({
      onSuccess: () => {
        setLoading(false);
        refetch();
      },
      onError: () => {
        displayError('OCR Failed');
      },
    });
    refetch();
    setModalTrue(false);
  };

  const handlePreview = async (url: any) => {
    const fileURL = `${url}?t=${new Date().getTime()}`;
    setPreviewFile(fileURL);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    if (previewFile) {
      URL.revokeObjectURL(previewFile);
    }
    setIsPreviewOpen(false);
    setPreviewFile(null);
  };

  const handleEdit = (data: any, name: string) => {
    setStudentId(data?.student?.id);
    setAnswersheetId(data?.id);

    setOpenAnswerSheetModal(true);
    setName(name);
  };
  const closeModal = () => {
    setOpenModel(false);
  };
  const handleFinish = (values: FormValues) => {
    // const data = values.subjects.map((subject) => {
    //   return {
    //     memorandom: subject.memo?.[0]?.originFileObj || null,
    //     question_paper: subject.questionPaper?.[0]?.originFileObj || null,
    //   };
    // });
    // const formData = new FormData();
    // data.forEach((item, index) => {
    //   if (item.memorandom) {
    //     formData.append(`data[${index}][memorandom]`, item.memorandom);
    //   }
    //   if (item.question_paper) {
    //     formData.append(`data[${index}][question_paper]`, item.question_paper);
    //   }
    // });
    // for (const pair of formData.entries()) {
    //   console.log(`${pair[0]}: ${pair[1]}`);
    // }
  };

  const startDate: any = new Date(subjectDetails?.results[0].assessment_start_datetime);
  const endDate: any = new Date(subjectDetails?.results[0].assessment_end_datetime);

  const startDateStr = formatDate(startDate);

  const startTimeStr = getTimeFromISO(startDate);

  const endTimeStr = getTimeFromISO(endDate);

  const examDuration = calculateExamDuration(startDate, endDate);

  return (
    <>
      <div>
        <PageTitle
          breadcrumbs={[
            { label: 'Marking Process', href: '/grading-process' },
            {
              label: 'Assessment Details',
              href: `/grading-process/assessment/details/${params?.id ? params?.id : '1'}`,
            },
            {
              label: 'Subject Wise Assessment Details',
              href: `/grading-process/assessment/subject-details/${params?.id}?grade_class=${gradeId}`,
            },
          ]}
        >
          Subject Wise Assessment Details
        </PageTitle>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-slate-500">General Details</CardTitle>
          </CardHeader>
          <CardContent>
            {studentsLoding ? (
              <UILoader />
            ) : subjectDetails?.results?.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Year</UIText>
                  </label>
                  <p className="mb-0">{subjectDetails?.results[0]?.batch__start_year}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Grade</UIText>
                  </label>
                  <p className="mb-0">{subjectDetails?.results[0]?.grade__grade_number}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Term</UIText>
                  </label>
                  <p className="mb-0">{subjectDetails?.results[0]?.term__term_name}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Class</UIText>
                  </label>
                  <p className="mb-0">{subjectDetails?.results[0]?.grade_class_names}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Assessment Name</UIText>
                  </label>
                  <p className="mb-0">{subjectDetails?.results[0]?.assessment__assessment_name}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Subject Name</UIText>
                  </label>
                  <p>{subjectDetails?.results[0]?.subject__master_subject__subject_name}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Subject Code</UIText>
                  </label>
                  <p>{subjectDetails?.results[0]?.subject__master_subject__subject_code}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Date</UIText>
                  </label>
                  <p>{startDateStr}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Start Time</UIText>
                  </label>
                  <p>{startTimeStr}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>End Time</UIText>
                  </label>
                  <p>{endTimeStr}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Duration</UIText>
                  </label>
                  <p>{examDuration}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>
                  <UIText>No data Found</UIText>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-slate-500 ">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <div>
                  <UIText>Learners who attended the assessment</UIText>
                </div>
                <div className="gap-5 mb-3 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <span className="flex text-black text-md font-semibold">
                      <UIText>Answer Sheet Uploaded</UIText> :{' '}
                      <span className="text-blue-600 text-md ps-1">
                        {getSubjectWiseStudent && getSubjectWiseStudent.totalCount > 0
                          ? `${getSubjectWiseStudent.totalUploads}/${getSubjectWiseStudent.totalCount}`
                          : 'No Data'}
                      </span>
                    </span>
                  </div>

                  <Button
                    type="button"
                    disabled={!checkStatus || isLocked || loading}
                    className="shadow-2xl"
                    onClick={() => ocrHandle()}
                    variant={'cust_01'}
                  >
                    <UIText>Start Digital Marking</UIText>
                  </Button>
                  <Button
                    disabled={isLocked || isPending || getSubjectWiseStudent?.results?.length === 0}
                    onClick={() => setOpenBulkAnswerSheetModal(true)}
                  >
                    Upload Bulk Answer Sheet
                  </Button>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <div className="px-4">
            <DynamicTable
              className="pb-5"
              data={
                (Array.isArray(getSubjectWiseStudent?.results) &&
                  getSubjectWiseStudent?.results?.length > 0 &&
                  getSubjectWiseStudent?.results) ||
                []
              }
              columns={columns}
              searchColumn="first_name"
              searchPlaceholder="Search by Learner Name & Surname"
              loading={isLoading}
              totalCount={getSubjectWiseStudent?.totalCount || 0}
              pageSize={pageQuery.limit}
              pageIndex={(pageQuery.page ?? 1) - 1}
              onPaginationChange={handlePaginationChange}
              onSearchChange={handleSearchInputChange}
            />
          </div>
        </Card>
      </div>

      <UploadAnswerSheetModal
        open={openAnswerSheetModal}
        setOpen={setOpenAnswerSheetModal}
        studentsId={students_id}
        assessmentSubjectId={params?.id}
        refetch={refetch}
        change={change}
        AnswersheetId={AnswersheetId}
        setAnswersheetId={setAnswersheetId}
      />

      <BulkAnswerSheetUpload open={openBulkAnswerSheetModal} setOpen={setOpenBulkAnswerSheetModal} refetch={refetch} />

      <Modal
        open={modalTrue}
        onCancel={() => setModalTrue(false)}
        title={
          <>
            <UIText>Start Digital Marking</UIText>
          </>
        }
        centered
        maskClosable={false}
        okButtonProps={{
          loading: ocrPending,
        }}
        onOk={() => {
          setLoading(true);
          {
            loading && <BtnLoader />;
          }
          onClickOrc();
        }}
        cancelText={
          <>
            <UIText>Cancel</UIText>
          </>
        }
      >
        <div className="space-y-2 mt-[30px]">
          {!checkStatus && (
            <div className="flex gap-3 p-4 mb-0 rounded-lg bg-red-50 border border-red-200">
              <OctagonAlertIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="mb-2">
                  <UIText>
                    Some students have not uploaded their ANSWER-SHEET. Please verify and ensure that ANSWER_SHEET of
                    all Learners who attended the assessment are uploaded.
                  </UIText>
                </p>
              </div>
            </div>
          )}
          <div className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="mb-2">
                <UIText>
                  Please be aware that once the DIGITAL MARKING process begins, you will not be able to add or upload
                  any student's ANSWER-SHEET.
                </UIText>
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
            <MdOutlineNotificationsActive className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="mb-2">
                <UIText>You will receive a notification once the DIGITAL MARKING process is completed.</UIText>
              </p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={openModel}
        onCancel={closeModal}
        footer={null}
        width={500}
        className="p-0"
        centered={true}
        maskClosable={false}
      >
        <div className="p-0">
          <h2 className="text-lg font-semibold mb-4">Change Memo</h2>
          <Form
            form={form}
            name="dynamic_card_form"
            onFinish={handleFinish}
            layout="vertical"
            autoComplete="off"
            initialValues={{ subjects: [{}] }}
            className="p-4"
          >
            <Form.List name="subjects">
              {(fields) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <>
                      <Card key={key} title={`Subject ${key + 1}`} className="mb-4 p-8 ">
                        <div>
                          <div className="mb-4 p-8 pb-0 grid gap-4 relative">
                            {
                              <div className="flex justify-center">
                                <Form.Item
                                  {...restField}
                                  label="Upload New Memo"
                                  name={[name, 'memo']}
                                  valuePropName="fileList"
                                  rules={[{ required: true, message: 'Please upload the memo.' }]}
                                >
                                  <Upload accept=".pdf" {...uploadProps} maxCount={1}>
                                    <Button type="button">Upload Memo</Button>
                                  </Upload>
                                </Form.Item>
                              </div>
                            }
                          </div>
                        </div>
                      </Card>
                    </>
                  ))}
                </>
              )}
            </Form.List>
          </Form>
        </div>
      </Modal>

      <Modal
        open={isPreviewOpen}
        onCancel={closePreview}
        footer={null}
        width={800}
        className="p-0"
        maskClosable={false}
      >
        <div className="p-0">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          {previewFile && (
            <div className="h-[auto]">
              <PdfViewer url={previewFile} />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
