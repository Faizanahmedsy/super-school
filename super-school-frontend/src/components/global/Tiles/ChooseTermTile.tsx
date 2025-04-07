import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTerm } from '@/lib/common-functions';
import { cn } from '@/lib/utils';
import { useTermList } from '@/services/master/term/term.action';
import useGlobalState from '@/store';
import { Spin } from 'antd';
import { ChevronLeftIcon } from 'lucide-react';
import { UITitlesV2 } from '../Card/UITilesV2';
import UIText from '../Text/UIText';

const colorSchemes = [
  {
    color: 'bg-[#1B7C22]',
    lightColor: 'bg-[#3DB047]',
  },
  {
    color: 'bg-[#C49E44]',
    lightColor: 'bg-[#E6BC66]',
  },
  {
    color: 'bg-[#950707]',
    lightColor: 'bg-[#C34141]',
  },
  {
    color: 'bg-[#BE6518]',
    lightColor: 'bg-[#D47E33]',
  },
];

export default function ChooseTermTile({ step, setStep }: { step: number; setStep: (step: number) => void }) {
  // const batch_id: any = useRoleBasedCurrentBatch();
  const params: any = {
    sort: 'desc',
  };
  const setFilterData = useGlobalState((state) => state.setFilterData);
  const filterData = useGlobalState((state) => state.filterData);

  const { data: termList, isLoading } = useTermList({
    ...params,
    student_count: true,
    batch_id: filterData.batch?.id ?? undefined,
    grade_id: filterData.grade?.id ?? undefined,
  });
  // const setTermId = useGlobalState((state) => state.setTermId);

  // Function to get color scheme based on index
  const getColorScheme = (index: number) => {
    return colorSchemes[index % colorSchemes.length];
  };

  return (
    <>
      <Card className="">
        <CardHeader className="relative z-10">
          <CardTitle className="flex justify-between items-center">
            <div>
              <UIText>Select a Term</UIText>
            </div>
            <Button
              size="sm"
              variant="nsc-secondary"
              className={cn(step === 1 && 'hidden')}
              onClick={() => {
                if (step > 1) {
                  setStep(step - 1);
                }
              }}
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Back
            </Button>
          </CardTitle>
          <CardDescription>{/* Select a grade to view the quizzes and grades of the students */}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-4 gap-6">
            {termList?.list?.map((term: any, index: number) => {
              const { color, lightColor } = getColorScheme(index);
              return (
                <UITitlesV2
                  key={index}
                  title={formatTerm(term.term_name)}
                  color={color}
                  lightColor={lightColor}
                  onClick={() => {
                    setFilterData({
                      ...filterData,
                      term: {
                        id: String(term.id),
                        name: term.term_name,
                      },
                    });
                    setStep(step + 1);
                  }}
                />
              );
            })}

            {termList?.list?.length === 0 && (
              <>
                <div className="flex items-center justify-center col-span-full min-h-72">
                  <p className="text-lg font-medium text-gray-600">No terms found</p>
                </div>
              </>
            )}
            {isLoading && (
              <div className="flex items-center justify-center col-span-full min-h-72">
                <Spin />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
