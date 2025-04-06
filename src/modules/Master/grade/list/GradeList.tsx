import AppsContainer from '@/app/components/AppsContainer';
import IntlMessages from '@/app/helpers/IntlMessages';
import CreateButton from '@/components/custom/buttons/CreateButton';
import TableViewBtn from '@/components/custom/Table/TableViewBtn';
import ChooseClass from '@/components/global/ChooseCards/ChooseClass';
import ChooseGrade from '@/components/global/ChooseCards/ChooseGrade';
import ChooseYear from '@/components/global/ChooseCards/ChooseYear';
import TanstackTable from '@/components/global/CustomTable';
import TableDeleteBtn from '@/components/custom/Table/TableDeleteBtn';
import TableEditBtn from '@/components/custom/Table/TableEditBtn';
import { Exam } from '@/modules/Management/exams/examTypes';
import { useExamDeleteById } from '@/services/management/exams/exams.hook';
import { useQueryClient } from '@tanstack/react-query';
import { Row } from '@tanstack/react-table';
import { Card } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GradeList = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);

  // const [page, setPage] = useState<number>(1);
  // const [limit, setLimit] = useState<number>(10);
  // const [sort, _] = useState<"asc" | "desc">("desc");

  const [deleteId, setId] = useState<number>(0);

  // const [pagequery, setPageQuery] = useState<string>({
  //   page: 1,
  //   limit: 10,
  //   sort: "desc",

  // });
  const queryclient = useQueryClient();

  const { mutate: deleteExam } = useExamDeleteById(deleteId, queryclient);

  const columns: any = [
    {
      accessorKey: 'name',
      header: 'Class Name',
    },
    {
      accessorKey: 'grade',
      header: 'Grade',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: Row<Exam> }) => (
        <div className="flex space-x-2">
          <TableViewBtn onClick={() => navigate('/exams/details')} />
          <TableEditBtn onClick={() => handleEdit(row.original.id)} />

          <TableDeleteBtn onClick={() => handleDelete(row.original.id)} />
        </div>
      ),
    },
  ];
  const data = [
    {
      name: '8th A',
      grade: '8th',
    },
    {
      name: '10th B',
      grade: '10th',
    },
    {
      name: '9th A',
      grade: '9th',
    },
    {
      name: '8th B',
      grade: '8th',
    },
    {
      name: '11th C',
      grade: '11th',
    },
    {
      name: '11th A',
      grade: '11th',
    },
  ];

  const handleEdit = (id: number) => {
    navigate(`/exams/update/${id}`, { state: { key: 'edit' } });
  };

  const handleDelete = (id: number) => {
    deleteExam();
    setId(id);
  };

  // Pagination handlers
  // const handleNextPage = () => setPage((prev) => prev + 1);
  // const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));
  // const handleLimitChange = (newLimit: number) => setLimit(newLimit);
  return (
    <Card className="py-5">
      <div className="flex justify-between">
        <p className="text-2xl font-bold text-slate-600 mb-5">
          <IntlMessages id="page-title.gradeList" />
        </p>
        <CreateButton
          moduleName="grade"
          // action="add"
          redirectTo="/grade/add"
        />
      </div>

      <AppsContainer title={''} fullView={true} type="bottom">
        {step == 1 && <ChooseYear step={step} setStep={setStep} />}
        {step == 2 && <ChooseGrade step={step} setStep={setStep} />}
        {step == 3 && <ChooseClass step={step} setStep={setStep} />}
        {step == 4 && data && <TanstackTable showSearchBar={true} data={data} columns={columns} />}
      </AppsContainer>
    </Card>
  );
};

export default GradeList;
