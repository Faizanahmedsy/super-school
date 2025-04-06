import TanstackTable from '@/components/global/CustomTable';
import PageTitle from '@/components/global/PageTitle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function InstantGrades() {
  const [step, setStep] = useState(1);
  // const [openManualCorrectionModal, setOpenManualCorrectionModal] =
  //   useState(false);

  const navigate = useNavigate();

  const data = [
    { name: 'John Doe', reviewRequired: true, num: 1 },
    { name: 'Jane Smith', reviewRequired: false, num: 2 },
    { name: 'Michael Johnson', reviewRequired: true, num: 3 },
    { name: 'Emily Davis', reviewRequired: false, num: 4 },
    { name: 'William Brown', reviewRequired: true, num: 5 },
    { name: 'Olivia Wilson', reviewRequired: false, num: 6 },
  ];

  const gradeData = [
    { name: 'John Doe', marks: 40, num: 1, grade: 'A' },
    { name: 'Jane Smith', marks: 30, num: 2, grade: 'B' },
    { name: 'Michael Johnson', marks: 20, num: 3, grade: 'C' },
    { name: 'Emily Davis', marks: 10, num: 4, grade: 'D' },
    { name: 'William Brown', marks: 40, num: 5, grade: 'A' },
    { name: 'Olivia Wilson ', marks: 30, num: 6, grade: 'B' },
  ];

  const gradeColumns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: any) => <span>{row.original.name}</span>,
    },
    {
      accessorKey: 'marks',
      header: 'Marks',
      cell: ({ row }: any) => <span>{row.original.marks}</span>,
    },
    {
      accessorKey: 'grade',
      header: 'Grade',
      cell: ({ row }: any) => <span>{row.original.grade}</span>,
    },
  ];

  const columns: ColumnDef<(typeof data)[0]>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: any) => <span>{row.original.name}</span>,
    },
    {
      header: 'Flagged for Review',
      cell: ({ row }: any) => {
        const isFlagged = row.original.reviewRequired;
        return (
          <div
            className={cn(
              'w-fit px-4 py-1 rounded-full text-sm',
              isFlagged ? 'bg-red-200 text-red-900' : 'bg-green-200 text-green-900'
            )}
          >
            {isFlagged ? 'Yes' : 'No'}
          </div>
        );
      },
    },
    {
      accessorKey: 'reviewRequired',
      header: 'Review Status',
      cell: ({ row }: any) => {
        const needsReview = row.original.reviewRequired;
        return (
          <Button
            variant={'outline'}
            className={cn('', needsReview && 'bg-rose-700 text-rose-50')}
            onClick={() => {
              // setOpenManualCorrectionModal(true);
              navigate(`/marked-answerscript/instant-grades/review/${row.original.num}`);
              if (needsReview) {
                // Do something
              } else {
                // Do something else
              }
            }}
          >
            Review {needsReview && '*'}
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <div>
        <PageTitle>Grading</PageTitle>

        <div className="flex justify-between px-8">
          <div
            className={cn(
              'text-slate-500  border-slate-300 border px-4 py-2 rounded-full font-bold',
              step === 1 && 'text-primary border-primary border px-4 py-2 rounded-full font-bold'
            )}
          >
            Step 1 : Manual Review
          </div>
          <div
            className={cn(
              'text-slate-500  border-slate-300  border px-4 py-2 rounded-full font-bold',

              step === 2 && 'text-primary border-primary border px-4 py-2 rounded-full font-bold'
            )}
          >
            Step 2 : Results
          </div>
        </div>
        {step === 1 && <TanstackTable data={data} columns={columns} />}
        {step === 2 && <TanstackTable data={gradeData} columns={gradeColumns} />}

        <div className={cn('flex justify-between px-5', step == 1 && 'justify-end')}>
          {step === 2 && (
            <Button
              variant="outline"
              onClick={() => {
                setStep(1);
              }}
            >
              Previous
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setStep(2);
            }}
          >
            Next
          </Button>
        </div>
      </div>

      {/* <CorrectionModal
        openManualCorrectionModal={openManualCorrectionModal}
        setOpenManualCorrectionModal={setOpenManualCorrectionModal}
      /> */}
    </>
  );
}
