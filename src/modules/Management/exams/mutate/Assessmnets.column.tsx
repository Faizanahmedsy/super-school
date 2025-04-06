import TableViewBtn from '@/components/custom/Table/TableViewBtn';
import TableDeleteBtn from '@/components/custom/Table/TableDeleteBtn';
import TableEditBtn from '@/components/custom/Table/TableEditBtn';
import { capitalizeFirstLetter, formatDate, formatTerm } from '@/lib/common-functions';
import { MODULE } from '@/lib/helpers/authHelpers';
import { cn } from '@/lib/utils';
import { useAssessmentDelete, useAssessmentList } from '@/services/assessments/assessments.hook';
import useGlobalState from '@/store';
import { Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import React from 'react';

export const assessmentColumns: any = [
  {
    accessorKey: 'assessment_name',
    header: 'Assessment Name',
    cell: (info: any) => {
      const subjectName = capitalizeFirstLetter(info.getValue());
      return (
        <div className="gap-2">
          <span>{subjectName ? subjectName : '-'}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'assessment_subjects',
    header: 'Subject Name',
    cell: (info: any) => {
      const subjectList = info.getValue();
      return (
        <div className="flex flex-col gap-2">
          {subjectList.length > 0
            ? subjectList.map((subject: any, index: number) => (
                <span key={index}>
                  {subject.subject_name}
                  {index !== subjectList.length - 1 && ','}
                  <br />
                </span>
              ))
            : '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'assessment_subjects',
    header: 'Paper Title',
    cell: (info: any) => {
      const subjectList = info.getValue();
      return (
        <div className="flex flex-col gap-2">
          {subjectList.length > 0
            ? subjectList.map((subject: any, index: number) => (
                <span key={index}>
                  {subject.paper_title}
                  {index !== subjectList.length - 1 && ','}
                  <br />
                </span>
              ))
            : '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'term__term_name',
    header: 'Term',
    cell: (info: any) => {
      const termName = info.getValue();
      return <span>{termName ? formatTerm(termName) : '-'}</span>;
    },
  },
  {
    accessorKey: 'grade__grade_number',
    header: 'Grade',
    cell: (info: any) => {
      const gradeNumber = info.getValue();
      return <span>{gradeNumber ? gradeNumber : '-'}</span>;
    },
  },
  {
    accessorKey: 'grade_class__name',
    header: 'Class',
    cell: (info: any) => {
      const classNames = info.getValue();

      return <div className="flex items-center gap-2">{classNames ? classNames : '-'}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info: any) => {
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
          {capitalizeFirstLetter(info.getValue())}
        </span>
      );
    },
  },
  {
    accessorKey: 'assessment_start_datetime',
    header: 'Date',
    cell: (info: any) => {
      const date = new Date(info.getValue());
      return formatDate(date);
    },
  },
  {
    header: 'Actions',
    cell: (info: any) => <ActionsCell info={info} />,
  },
];

const ActionsCell = ({ info }: { info: any }) => {
  const status = info.row.original.status;
  const setCurrentStep = useGlobalState((state) => state.setCurrentStep);
  const { refetch } = useAssessmentList({});
  const setSubjectDetailsId = useGlobalState((state: any) => state.setSubjectDetailsId);
  const { mutate: deleteAssessments } = useAssessmentDelete();
  const navigate = useNavigate();

  const handleDetails = () => {
    const data = info.row.original;
    navigate(`/assessments/details/${data?.id}`);
    setSubjectDetailsId({
      subjectdetailsid: {
        id: data?.id,
      },
      gradeclass: {
        id: data?.grade_class,
      },
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentStep(1);
    const id = info.row.original.id;
    navigate(`/assessments/update/${id}`, { state: { key: 'edit' } });
    refetch();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const id = info.row.original.id;
    Modal.confirm({
      centered: true,
      title: 'Are you sure you want to delete?',
      okText: 'yes',
      onOk: async () => {
        deleteAssessments(id, {
          onSuccess: () => {
            refetch();
          },
        });
      },
    });
  };

  return (
    <div className="flex gap-2">
      {status == 'ongoing' || status == 'completed' || status == 'cancelled' ? (
        <div className="flex gap-2 cursor-not-allowed">
          <TableViewBtn onClick={handleDetails} />
          <TableEditBtn
            onClick={handleEdit}
            Disabled={status == 'ongoing' || status == 'completed' || status == 'cancelled' ? true : false}
          />
          <TableDeleteBtn
            onClick={handleDelete}
            Disabled={status == 'ongoing' || status == 'completed' || status == 'cancelled' ? 'true' : 'false'}
          />
        </div>
      ) : (
        <div className="flex gap-2">
          <TableViewBtn onClick={handleDetails} />
          <TableEditBtn
            className="z-index:999;"
            onClick={handleEdit}
            moduleName={MODULE.ASSESSMENTS}
            checkPermission={true}
          />
          <TableDeleteBtn onClick={handleDelete} checkPermission={true} moduleName={MODULE.ASSESSMENTS} />
        </div>
      )}
    </div>
  );
};
