import TableDeleteBtn from '@/components/custom/Table/TableDeleteBtn';
import TableEditBtn from '@/components/custom/Table/TableEditBtn';
import { capitalizeFirstLetter } from '@/lib/common-functions';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { useDeleteLessonPlan } from '@/modules/PersonaisedLearning/LessonPlan/action/lesson-plan.action';
import { ColumnDef } from '@tanstack/react-table';
import { Form, Modal } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ViewLessonPlanPdfModal from '../components/list/ViewLessonPlanPdfModal';
import { toast } from 'sonner';
import { displayError } from '@/lib/helpers/errorHelpers';

export const useLessonPlanColumns = (forRole: string, query: any) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [editId, setEditId] = useState<number>();
  const [openPdf, setOpenPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const deleteLessonPlan = useDeleteLessonPlan();

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'subject_name',
      header: 'Subject',
    },
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'activity_type',
      header: 'Timeline',
      cell: (info) => capitalizeFirstLetter(info.row.original.activity_type),
    },
    {
      accessorKey: 'grade_name',
      header: 'Grade',
    },
    {
      accessorKey: 'grade_class_name',
      header: 'Class',
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date',
    },
    {
      accessorKey: 'end_date',
      header: 'End Date',
    },
    {
      accessorKey: 'end_date',
      header: 'Activity',
      cell: (info) => (
        <>
          <div>
            <ViewLessonPlanPdfModal info={info.row.original} />
          </div>
        </>
      ),
    },
    {
      header: 'Actions',
      cell: (info) => (
        <div className="flex gap-2">
          <TableEditBtn
            onClick={() => {
              navigate(`/lesson-plan/add?editid=${info.row.original.id}`);
            }}
            checkPermission={false}
          />
          <TableDeleteBtn
            onClick={() => {
              Modal.confirm({
                title: 'Delete Lesson Plan',
                content: 'Are you sure you want to delete this lesson plan?',
                centered: true,
                onOk: () => {
                  deleteLessonPlan.mutate(info.row.original.id, {
                    onSuccess: () => {
                      displayError('Lesson Plan deleted successfully');
                      query.refetch();
                    },
                  });
                },
                onCancel: () => {
                  // Optionally handle the cancel logic, but it will close the modal by default
                },
              });
            }}
            checkPermission={false}
          />
        </div>
      ),
    },
  ];

  // Remove the Actions column if the role is STUDENT
  // if (forRole === ROLE_NAME.STUDENT) {
  //   columns.pop();
  // }

  return columns;
};
