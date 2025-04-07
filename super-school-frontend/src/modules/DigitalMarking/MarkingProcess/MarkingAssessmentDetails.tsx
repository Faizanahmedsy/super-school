import UILoader from '@/components/custom/loaders/UILoader';
import TableViewBtn from '@/components/custom/Table/TableViewBtn';
import { DynamicTable } from '@/components/custom/tanstack-table/DynamicTable';
import PageTitle from '@/components/global/PageTitle';
import PdfViewer from '@/components/global/PdfViewer/PdfViewer';
import UIText from '@/components/global/Text/UIText';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { capitalizeFirstLetter, formatDate, formatTimeOnly } from '@/lib/common-functions';
import { cn } from '@/lib/utils';
import { useAssessmentDetails, useSubjectWiseAssessmentList } from '@/services/assessments/assessments.hook';
import { JANGO_PDF_ENDPOINT } from '@/services/endpoints';
import { QueryParams } from '@/services/types/params';
import useGlobalState from '@/store';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Modal, Spin, Tooltip } from 'antd';
import { useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
export default function MarkingAssessmentDetails() {
  const fileUrl = JANGO_PDF_ENDPOINT;

  const navigate = useNavigate();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const school_id = useRoleBasedSchoolId();
  const [pageQuery, setPageQuery] = useState<QueryParams>({
    page: 1,
    page_size: 10,
    search: '',
    city_id: '',
    state_id: '',
    school_id: school_id ? school_id : undefined,
  });
  const subjectDetailsId = useGlobalState((state) => state.subjectDetailsId);
  // const assessmentDetailsId = useGlobalState((state: any) => state.assessmentDetailsId);

  const { data: getSubjectWiseAssessment } = useSubjectWiseAssessmentList({
    assessment: subjectDetailsId.subjectdetailsid?.id,
    grade_class: subjectDetailsId.gradeclass?.id,
    school_id: school_id ? school_id : undefined,
  });

  const { data: assessmentsDetails, isLoading } = useAssessmentDetails(subjectDetailsId.subjectdetailsid?.id, {
    grade_class: subjectDetailsId.gradeclass?.id,
    school_id: school_id ? school_id : undefined,
  });

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPageQuery((prev) => ({
      ...prev,
      page: pageIndex + 1,
      page_size: pageSize,
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
    {
      accessorKey: 'ocr_status',
      header: 'Grading Status',
      cell: (info) => {
        return (
          <span
            className={cn(
              'px-2 py-1 rounded-full text-[12px] text-white',
              info.getValue() === 'completed' && '  bg-green-600',
              info.getValue() === 'in progress' && '  bg-orange-600',
              info.getValue() === 'not started' && '  bg-gray-600'
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
        const { question_paper } = info.row.original;
        return (
          <div className="cursor-pointer w-20">
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
        const { memorandom } = info.row.original;
        return (
          <div className="cursor-pointer w-20">
            <Tooltip title="Preview Memo">
              <FaFilePdf size={24} onClick={() => handlePreview(memorandom, 'Memo')} />
            </Tooltip>
          </div>
        );
      },
    },

    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: Row<any> }) => (
        <>
          <div className="flex space-x-2">
            <TableViewBtn
              onClick={() => {
                handleDetails(row.original?.id, row.original?.grade_class_ids);
              }}
            />
          </div>
        </>
      ),
    },
  ];

  const handleDetails = (id: number, gradeId: number) => {
    navigate(`/grading-process/assessment/subject-details/${id}?grade_class=${gradeId}`);
  };

  // const handleDelete = (id: number) => {
  //   Modal.confirm({
  //     centered: true,
  //     title: 'Are you sure you want to delete?',
  //     onOk: async () => {
  //       deleteAssessments(id, {
  //         onSuccess: () => {
  //           refetch();
  //         },
  //       });
  //     },
  //   });
  // };

  // const handleRowClick = (id: number, data: any) => {
  //   navigate(`/grading-process/assessment/subject-details/${id}?grade_class=${data?.grade_class_ids}`);
  // };

  const handlePreview = async (url: any, name: string) => {
    const fileURL = `${fileUrl}${url}`;

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
  // const endTimeStr = formatTime(endDate);

  return (
    <>
      <div>
        <PageTitle
          breadcrumbs={[
            { label: 'Marking Process', href: '/grading-process' },
            {
              label: 'Assessment Details',
              href: `/grading-process/assessment/details/${subjectDetailsId.subjectdetailsid?.id}`,
            },
          ]}
        >
          Assessment Details
        </PageTitle>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-slate-500">General Details</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <UILoader />
            ) : assessmentsDetails?.results?.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Year</UIText>
                  </label>
                  <p className="mb-0">{assessmentsDetails?.results[0].batch__start_year}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Grade</UIText>
                  </label>
                  <div className="mb-0">{assessmentsDetails?.results[0].grade__grade_number}</div>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Term</UIText>
                  </label>
                  <p className="mb-0">{assessmentsDetails?.results[0].term__term_name}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Class</UIText>
                  </label>
                  <p className="mb-0">{assessmentsDetails?.results[0].grade_class__name}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Assessment Name</UIText>
                  </label>
                  <p className="mb-0">{assessmentsDetails?.results[0].assessment_name}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>Start Date</UIText>
                  </label>
                  <p className="mb-0">{startDateStr}</p>
                </div>
                <div className="bg-secondary shadow-md rounded-lg p-4">
                  <label className="text-sm text-muted-foreground">
                    <UIText>End Date</UIText>
                  </label>
                  <p className="mb-0">{endDateStr}</p>
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
          <div className="px-4">
            <div className="flex justify-between items-center py-5 pb-0">
              <div className="text-base font-semibold text-slate-500">List of Subject Wise Assessment</div>
            </div>
            <DynamicTable
              data={Array.isArray(getSubjectWiseAssessment?.results) ? getSubjectWiseAssessment?.results || [] : []}
              columns={columns}
              totalCount={getSubjectWiseAssessment?.results.length}
              // searchColumn="school_name"
              // searchPlaceholder="Search by School Name / EMIS Number"
              loading={isLoading}
              pageSize={pageQuery.page_size}
              pageIndex={(pageQuery.page ?? 1) - 1}
              onPaginationChange={handlePaginationChange}
              // handleRowClick={handleRowClick}
            />
          </div>
        </Card>
        <Modal open={isPreviewOpen} onCancel={closePreview} footer={null} width={800} className="p-0">
          <div className="p-0">
            <h2 className="text-lg font-semibold mb-4">{pdfName} Preview</h2>
            {previewFile && (
              <div className="h-[auto]">
                <PdfViewer url={previewFile} />
              </div>
            )}
          </div>
        </Modal>
      </div>
    </>
  );
}
