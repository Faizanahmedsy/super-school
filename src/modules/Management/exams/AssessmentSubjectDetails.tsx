import CreateButton from '@/components/custom/buttons/CreateButton';
import UILoader from '@/components/custom/loaders/UILoader';
import TableViewBtn from '@/components/custom/Table/TableViewBtn';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import TableDeleteBtn from '@/components/custom/Table/TableDeleteBtn';
import PageTitle from '@/components/global/PageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { capitalizeFirstLetter, formatDate, formatTimeOnly } from '@/lib/common-functions';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';
import { cn } from '@/lib/utils';
import {
  useAssessmentDetails,
  useSubjectWiseAssessmentDelete,
  useSubjectWiseAssessmentList,
} from '@/services/assessments/assessments.hook';
import { useCoverpageDelete, useDownloadCoverpage } from '@/services/downloadcoverpage/downloadcoverpage.hooks';
import { JANGO_PDF_ENDPOINT } from '@/services/endpoints';
import { QueryParams } from '@/services/types/params';
import useGlobalState from '@/store';

import { ColumnDef, Row } from '@tanstack/react-table';
import { Modal, Select, Spin, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { FaDownload, FaFilePdf, FaRegEdit } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import UploadMemoAndQuestionModal from './changeMemoAndQuestionpdf';
import PDFViewer from '@/components/global/PdfViewer/PdfViewer';
import UIText from '@/components/global/Text/UIText';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { caughtIn4k } from '@/lib/helpers/error/caught-in-4k';
import useColumnBasedOnRole from '@/hooks/table/use-columns-based-on-role';

export default function AssessmentSubjectDetails() {
  const subjectDetailsId = useGlobalState((state) => state.subjectDetailsId);
  const [value, setValue] = useState('');
  const params: any = useParams();
  const school_id = useRoleBasedSchoolId();
  const user = useGlobalState((state) => state.user);

  const [subjectId, setSubjectId] = useState<any>();
  const [subjectPdfId, setSubjectPdfId] = useState<any>();
  const [fireDownload, setFireDownload] = useState(false);
  const [grade_Id, setGrade_id] = useState<number>();

  // const [downloadParams, setDownloadParams] = useState<any>();

  // const { mutateAsync: addData, isPending } = useBulkUploadData();
  const {
    data: coverpageDownload,
    isLoading: loader,
    error: coverPageError,
    refetch: downloadcoverpage,
  } = useDownloadCoverpage(
    {
      ordering: value,
      ...((user?.role_name == ROLE_NAME.SUPER_ADMIN || user?.role_name == ROLE_NAME.DEPARTMENT_OF_EDUCATION) && {
        school_id: school_id ? school_id : undefined,
      }),
      assessment_subject_id: subjectId,
    },
    fireDownload
  );
  const { mutate: deleteData } = useCoverpageDelete();

  const setBatchId = useGlobalState((state) => state.setBatchId);
  const setTermId = useGlobalState((state) => state.setTermId);
  const setGradeId = useGlobalState((state) => state.setGradeId);

  const setStartingDate = useGlobalState((state) => state.setStartDate);
  const setEndingDate = useGlobalState((state) => state.setEndDate);

  const fileUrl = JANGO_PDF_ENDPOINT;

  const navigate = useNavigate();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [openModel, setOpenModel] = useState(false);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [assessmentStatus, setassessmentStatus] = useState('upcoming');

  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    limit: 10,
    search: '',
    city_id: '',
    state_id: '',
    school_id: school_id ? school_id : undefined,
  });

  const { mutate: deleteAssessments } = useSubjectWiseAssessmentDelete();

  const { data: getSubjectWiseAssessment, refetch } = useSubjectWiseAssessmentList({
    ...pageQuery,
    assessment: subjectDetailsId.subjectdetailsid?.id,
    grade_class: subjectDetailsId.gradeclass?.id,
    school_id: school_id ? school_id : undefined,
  });

  const { data: assessmentsDetails, isLoading } = useAssessmentDetails(subjectDetailsId?.subjectdetailsid?.id, {
    grade_class: subjectDetailsId.gradeclass?.id,
    school_id: school_id ? school_id : undefined,
  });

  setStartingDate(assessmentsDetails?.results[0].assessment_start_datetime);
  setEndingDate(assessmentsDetails?.results[0].assessment_start_datetime);

  setBatchId(assessmentsDetails?.results[0]?.batch);
  setTermId(assessmentsDetails?.results[0]?.term);
  setGradeId(assessmentsDetails?.results[0]?.grade);

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      limit: pageSize,
    }));
  };

  const columns: ColumnDef<any[0]>[] = [
    {
      accessorKey: 'subject__master_subject__subject_code',
      header: 'Subject Code',
    },
    {
      accessorKey: 'subject__master_subject__subject_name',
      header: 'Subject Name',
      cell: (info) => {
        const { subject__master_subject__subject_name } = info.row.original;
        const subjectName = capitalizeFirstLetter(subject__master_subject__subject_name);
        return <div>{subjectName}</div>;
      },
    },
    {
      accessorKey: 'paper_title',
      header: 'Paper Title',
      cell: (info: any) => {
        const { status } = info.row.original;
        setassessmentStatus(status);
        const paperTitle = info.getValue();
        return <div className="flex flex-col gap-2">{paperTitle ? paperTitle : '-'}</div>;
      },
    },

    // {
    //   accessorKey: 'grade__grade_number',
    //   header: 'Grade',
    // },

    // {
    //   accessorKey: 'grade_class_names',
    //   header: 'Grade Class',
    // },

    {
      accessorKey: 'assessment_start_datetime',
      header: 'Date',
      cell: (info) => {
        const { assessment_start_datetime } = info.row.original;
        const startDate = new Date(assessment_start_datetime);
        return <div>{formatDate(startDate)}</div>;
      },
    },
    {
      accessorKey: 'assessment_start_datetime',
      header: 'Start Time',
      cell: (info) => {
        const { assessment_start_datetime } = info.row.original;
        const startDate = new Date(assessment_start_datetime);
        return <div>{formatTimeOnly(startDate)}</div>;
      },
    },
    {
      accessorKey: 'assessment_end_datetime',
      header: 'End Time',
      cell: (info) => {
        const { assessment_end_datetime } = info.row.original;
        const endDate = new Date(assessment_end_datetime);
        return <div>{formatTimeOnly(endDate)}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => {
        return (
          <span
            className={cn(
              'px-2 py-1 rounded-full text-[12px] text-white',
              info.getValue() === 'completed' && '  bg-green-600',
              info.getValue() === 'upcoming' && '  bg-orange-600',
              info.getValue() === 'cancelled' && 'bg-red-600',
              info.getValue() === 'ongoing' && '  bg-blue-600'
            )}
          >
            {capitalizeFirstLetter(info.getValue() as string)}
          </span>
        );
      },
    },
    // {
    //   accessorKey: 'memorandom',
    //   header: 'Memo',
    //   cell: (info) => {
    //     <MemoColumn info={info} />;
    //   },
    // },

    {
      accessorKey: 'paper_marks',
      header: 'Paper Marks',
    },

    {
      accessorKey: 'question_paper',
      header: 'Question Paper',
      cell: (info) => {
        const { question_paper, status } = info.row.original;

        return (
          <div className="cursor-pointer w-20">
            {status == 'upcoming' && (
              <>
                <div className="flex justify-end">
                  <FaRegEdit
                    size={18}
                    className="text-orange-600"
                    onClick={() => handleEditPdf(info.row.original, 'Question Paper')}
                  />
                </div>
              </>
            )}
            <Tooltip title="Preview Question Paper">
              <FaFilePdf size={24} onClick={() => handlePreview(question_paper, 'Question Paper')} />
            </Tooltip>
          </div>
        );
      },
    },
    {
      accessorKey: 'memorandom',
      header: 'Memo',
      cell: (info) => {
        const { memorandom, status } = info.row.original;
        return (
          <div className="cursor-pointer w-20">
            {status == 'upcoming' && (
              <>
                <div className="flex justify-end">
                  <FaRegEdit
                    size={18}
                    className="text-orange-600"
                    onClick={() => handleEditPdf(info.row.original, 'Memo')}
                  />
                </div>
              </>
            )}

            <Tooltip title="Preview Memo">
              <FaFilePdf size={24} onClick={() => handlePreview(memorandom, 'Memo')} />
            </Tooltip>
          </div>
        );
      },
    },

    {
      accessorKey: 'coverpage',
      header: 'Cover Page',
      cell: ({ row }: { row: Row<any> }) => (
        <>
          <Tooltip title="Download Cover Page">
            <Button
              type="button"
              disabled={loader}
              variant={'outline'}
              onClick={() => {
                handleDownloadCoverpage(row.original.id);
              }}
              className="mx-3 border-none"
              style={{ cursor: 'pointer', textDecoration: 'none' }}
            >
              <FaDownload size={20} />
            </Button>
          </Tooltip>
        </>
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: Row<any> }) => (
        <>
          <div className="flex space-x-2 items-center">
            <TableViewBtn onClick={(e) => handleDetails(e, row.original?.id, row.original?.grade_class_ids)} />
            <TableDeleteBtn onClick={(e) => handleDelete(e, row.original.id)} checkPermission={false} />
          </div>
        </>
      ),
    },
  ];

  interface RemoveColumns {
    columns: any[];
    restrictedKeys: string[];
    additionalColumns: any[];
    roleName: string;
  }

  let removeColumns: RemoveColumns = {
    columns,
    restrictedKeys: [],
    additionalColumns: [],
    roleName: '',
  };
  if (user?.role_name === ROLE_NAME.STUDENT) {
    removeColumns = {
      columns,
      restrictedKeys: ['memorandom', 'question_paper', 'paper_marks', 'actions', 'status', 'coverpage'],
      additionalColumns: [],
      roleName: ROLE_NAME.STUDENT,
    };
  } else {
    caughtIn4k(new Error('Invalid role name'));
  }

  const filteredColumns = useColumnBasedOnRole(removeColumns);

  useEffect(() => {
    if (coverPageError && (coverPageError as any).response) {
      displayError((coverPageError as any).response.data.error);
    }
    setassessmentStatus('upcoming');
  }, [coverPageError, setassessmentStatus]);

  const handleEditPdf = (data: any, name: string) => {
    setOpenModel(true);
    setPdfName(name);
    setSubjectPdfId(data?.id);
  };

  const handleDetails = (e: React.MouseEvent, id: number, gradeId: number) => {
    e.stopPropagation();
    setGrade_id(gradeId);
    navigate(`/grading-process/assessment/subject-details/${id}?grade_class=${gradeId}`);
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    Modal.confirm({
      centered: true,
      title: 'Are you sure you want to delete?',
      onOk: async () => {
        deleteAssessments(id, {
          onSuccess: () => {
            refetch();
          },
        });
      },
    });
  };

  const downloadPdf = async () => {
    const coverpageurl = `${fileUrl}${coverpageDownload?.file_url}`;
    try {
      // Fetch the PDF file content
      const response = await fetch(coverpageurl);

      if (!response.ok) {
        throw new Error('Failed to fetch the PDF file');
      }

      const blob = await response.blob(); // Get the binary data as a Blob
      const url = URL.createObjectURL(blob);

      let filePath = `${coverpageDownload?.file_path}`;
      let newPath: any = filePath.split('/').pop();

      // Create a link element and trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = newPath;
      link.click();

      // Clean up the object URL
      URL.revokeObjectURL(url);

      // Display success message
      displaySuccess(coverpageDownload?.message);
      if (coverpageDownload?.message) {
        deleteData(subjectId, {
          onSuccess: () => {
            refetch();
            setFireDownload(false);
          },
        });
      }
    } catch (error) {
      console.error('error1', error);
      displayError('Failed to download PDF');
    }

    // Uncomment and implement if needed
    // if (coverpageDownload?.message) {
    //   deleteData(subjectId, {
    //     onSuccess: () => {
    //       refetch();
    //     },
    //   });
    // }
  };

  useEffect(() => {
    if (coverpageDownload && coverpageDownload !== null && coverpageDownload !== undefined) {
      downloadPdf();
    }
  }, [coverpageDownload]);

  const handleDownloadCoverpage = async (id: number) => {
    setSubjectId(id);
    setFireDownload(true);
    if (coverpageDownload && coverpageDownload !== null && coverpageDownload !== undefined) {
      try {
        const { data } = await downloadcoverpage();
        if (data) {
          downloadPdf();
        }
      } catch (error) {
        console.error('Error downloading cover page:', error);
      }
    }
  };

  const handlePreview = async (url: any, name: string) => {
    const fileURL = `${fileUrl}${url}`;
    // const fileURL = ''
    setPreviewFile(fileURL);
    setIsPreviewOpen(true);
    setPdfName(name);
  };

  const closePreview = () => {
    if (previewFile) {
      URL.revokeObjectURL(previewFile);
    }
    setIsPreviewOpen(false);
    setPreviewFile(null);
  };

  const startDate = new Date(assessmentsDetails?.results[0].assessment_start_datetime);
  const endDate = new Date(assessmentsDetails?.results[0].assessment_end_datetime);

  // Display formatted date and time
  const startDateStr = formatDate(startDate);

  const endDateStr = formatDate(endDate);

  const handleChange = (newValue: string) => {
    setValue(newValue);
  };

  // const handleRowClick = (id: number, data: any) => {
  //   navigate(`/grading-process/assessment/subject-details/${id}?grade_class=${data?.grade_class_ids}`);
  // };

  return (
    <>
      <div>
        <PageTitle
          breadcrumbs={[
            { label: 'Assessment List', href: '/assessments/list' },
            {
              label: 'Assessment Subject Details',
              href: `/assessments/details/${subjectDetailsId?.subjectdetailsid?.id}`,
            },
          ]}
        >
          Assessment Subject Details
        </PageTitle>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-slate-500">
              <UIText>General Details</UIText>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <UILoader />
            ) : assessmentsDetails?.results?.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
                {[
                  {
                    label: (
                      <>
                        <UIText>Year</UIText>
                      </>
                    ),
                    value: assessmentsDetails.results[0].batch__start_year,
                  },
                  {
                    label: (
                      <>
                        <UIText>Grade</UIText>
                      </>
                    ),
                    value: assessmentsDetails.results[0].grade__grade_number,
                  },
                  {
                    label: (
                      <>
                        <UIText>Term</UIText>
                      </>
                    ),
                    value: assessmentsDetails.results[0].term__term_name,
                  },
                  {
                    label: (
                      <>
                        <UIText>Class</UIText>
                      </>
                    ),
                    value: assessmentsDetails.results[0].grade_class__name,
                  },
                  {
                    label: (
                      <>
                        <UIText>Assessment Name</UIText>
                      </>
                    ),
                    value: assessmentsDetails.results[0].assessment_name,
                  },
                  {
                    label: (
                      <>
                        <UIText>Start Date</UIText>
                      </>
                    ),
                    value: startDateStr,
                  },
                  {
                    label: (
                      <>
                        <UIText>End Date</UIText>
                      </>
                    ),
                    value: endDateStr,
                  },
                ].map((item, index) => (
                  <div key={index} className="bg-secondary shadow-md rounded-lg p-3">
                    <label className="text-sm text-muted-foreground">{item.label}</label>
                    <p className="mb-0">{item.value}</p>
                  </div>
                ))}
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
          <div className="px-4">
            <div className="flex justify-end items-center py-5 pb-0">
              {user?.role_name !== ROLE_NAME.STUDENT && user?.role_name !== ROLE_NAME.PARENT && (
                <div className="p-4 flex items-center">
                  <label className="px-2">
                    <UIText>Cover Page Order By</UIText>
                  </label>
                  <Select value={value} onChange={handleChange} style={{ width: 200 }} placeholder="Select Order">
                    <option value={''}>
                      <UIText>Admission Number</UIText>
                    </option>
                    <option value={'surname'}>
                      <UIText>Surname</UIText>
                    </option>
                  </Select>
                </div>
              )}

              {(user?.role_name !== ROLE_NAME.STUDENT && user?.role_name !== ROLE_NAME.PARENT && assessmentStatus) ==
                'upcoming' && (
                <CreateButton
                  redirectTo={`/add/subject/${params?.id}`}
                  checkPermission={false}
                  overrideText="Add Subject"
                />
              )}
            </div>
            <DynamicTable
              data={Array.isArray(getSubjectWiseAssessment?.results) ? getSubjectWiseAssessment?.results || [] : []}
              columns={filteredColumns}
              loading={isLoading}
              totalCount={getSubjectWiseAssessment?.totalCount || 0}
              // searchColumn="school_name"
              // searchPlaceholder="Search by School Name / EMIS Number"
              pageSize={pageQuery.limit}
              pageIndex={(pageQuery.page ?? 1) - 1}
              onPaginationChange={handlePaginationChange}
              // handleRowClick={handleRowClick}
            />
          </div>
        </Card>

        <UploadMemoAndQuestionModal
          open={openModel}
          setOpen={setOpenModel}
          assessmentSubjectId={subjectPdfId}
          refetch={refetch}
          pdfName={pdfName}
        />

        <Modal open={isPreviewOpen} onCancel={closePreview} footer={null} width={800} height={'auto'} className="p-0">
          <div className="p-0">
            <h2 className="text-lg font-semibold mb-4">{pdfName} Preview</h2>
            {previewFile && (
              <div className="h-[auto]">
                <PDFViewer url={previewFile} />
              </div>
            )}
          </div>
        </Modal>
      </div>
    </>
  );
}
