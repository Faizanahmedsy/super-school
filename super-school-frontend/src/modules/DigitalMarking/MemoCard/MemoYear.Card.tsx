// import UiCardV1 from "@/components/global/card/UiCardV1";
// import PageTitle from "@/components/global/PageTitle";
// import { useNavigate } from "react-router-dom";

// export default function MemoYearCard() {
//   const navigate = useNavigate();
//   const data = [
//     {
//       title: "2015",
//       subtitle: "156 students",
//       description: "94% graduation rate",
//       color: "from-blue-400 to-blue-400",
//       lightColor: "bg-blue-100",
//     },
//     {
//       title: "2016",
//       subtitle: "189 students",
//       description: "96% graduation rate",
//       color: "from-emerald-400 to-emerald-400",
//       lightColor: "bg-emerald-100",
//     },
//     {
//       title: "2017",
//       subtitle: "201 students",
//       description: "95% graduation rate",
//       color: "from-violet-400 to-violet-400",
//       lightColor: "bg-violet-100",
//     },
//     {
//       title: "2018",
//       subtitle: "178 students",
//       description: "97% graduation rate",
//       color: "from-orange-400 to-orange-400",
//       lightColor: "bg-orange-200",
//     },
//     {
//       title: "2019",
//       subtitle: "212 students",
//       description: "93% graduation rate",
//       color: "from-rose-400 to-rose-400",
//       lightColor: "bg-rose-100",
//     },
//   ];

//   return (
//     <div>
//       <PageTitle
//         breadcrumbs={[
//           { label: "Dashboard", href: "/dashboard" },
//           { label: "Year List", href: "/memo" },
//         ]}
//       >
//         Year List
//       </PageTitle>

//       <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {data.map((batch) => (
//           <UiCardV1
//             key={batch.title}
//             title={batch.title}
//             componentName="grade"
//             description={batch.description}
//             subtitle={batch.subtitle}
//             color={batch.color}
//             lightColor={batch.lightColor}
//             onClick={() => navigate("/memo/gradelist")}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';
import CreateButton from '@/components/custom/buttons/CreateButton';
import TableViewBtn from '@/components/custom/Table/TableViewBtn';
import ChooseSubject from '@/components/global/ChooseCards/ChooseSubject';
import TempChooseGrade from '@/components/global/ChooseCards/TempChooseGrade';
import NewChooseYear from '@/components/global/ChooseCardsNew/NewChooseYear';
import TanstackTable from '@/components/global/CustomTable';
import PageTitle from '@/components/global/PageTitle';
import TableEditBtn from '@/components/custom/Table/TableEditBtn';
import { ACTION, MODULE } from '@/lib/helpers/authHelpers';
import { useExamDeleteById } from '@/services/management/exams/exams.hook';
import { useQueryClient } from '@tanstack/react-query';
import { Row } from '@tanstack/react-table';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TableDeleteBtn from '@/components/custom/Table/TableDeleteBtn';
// import { Button } from "antd";

const ExamsList = () => {
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
      header: 'Assessment Name',
    },
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: Row<any> }) => (
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
      name: '10th Std Maths Mid Sem Summer 2025',
      date: '10-10-2025',
    },
    {
      name: '10th Std Science Final Exam Winter 2025',
      date: '15-12-2025',
    },
    {
      name: '9th Std English Mid Sem Spring 2025',
      date: '05-03-2025',
    },
    {
      name: '8th Std History Final Exam Autumn 2025',
      date: '25-09-2025',
    },
    {
      name: '11th Std Physics Mid Sem Winter 2025',
      date: '20-11-2025',
    },
    {
      name: '11th Std Chemistry Final Exam Summer 2025',
      date: '30-06-2025',
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
    <>
      <AppPageMeta title="Exams List" />
      <PageTitle
        extraItem={<CreateButton moduleName={MODULE.ASSESSMENTS} action={ACTION.ADD} redirectTo="/exams/add" />}
      >
        Memo List
      </PageTitle>
      <AppsContainer title={''} fullView={true} type="bottom">
        {step == 1 && <NewChooseYear step={step} setStep={setStep} />}
        {step == 2 && <TempChooseGrade step={step} setStep={setStep} />}
        {step == 3 && <ChooseSubject step={step} setStep={setStep} />}
        {step == 4 && data && <TanstackTable showSearchBar={true} data={data} columns={columns} />}
      </AppsContainer>
    </>
  );
};

export default ExamsList;
