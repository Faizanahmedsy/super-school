import UILoader from '@/components/custom/loaders/UILoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { formatTerm, isNonEmptyArray } from '@/lib/common-functions';
import { getColorScheme } from '@/lib/helpers/colors';
import { cn } from '@/lib/utils';
import { useTermList } from '@/services/master/term/term.action';
import useGlobalState from '@/store';
import { ChevronLeftIcon } from 'lucide-react';
import { UITitles } from '../Card/UITiles';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import UIText from '../Text/UIText';

export default function NewChooseTerm({ step, setStep }: { step: number; setStep: (step: number) => void }) {
  const setFilterData = useGlobalState((state) => state.setFilterData);
  const filterData = useGlobalState((state) => state.filterData);

  const user = useGlobalState((state) => state.user);

  let gradeId;

  if (user?.role_name === ROLE_NAME.STUDENT) {
    gradeId = user?.details?.grade?.id;
  } else {
    gradeId = filterData.grade?.id;
  }

  const schoolId = useRoleBasedSchoolId();
  const curBatchId = useRoleBasedCurrentBatch();

  // const batch_id: any = useRoleBasedCurrentBatch();
  const params: any = {
    sort: 'desc',
  };
  const { data: termData, isPending } = useTermList(
    {
      ...params,
      student_count: true,
      batch_id: curBatchId,
      grade_id: filterData.grade?.id,
      school_id: schoolId,
    },
    !!gradeId
  );

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
          <CardDescription>
            <UIText>Select a term to explore the associated data and insights.</UIText>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPending && (
            <div className="h-96 flex items-center justify-center">
              <UILoader />
            </div>
          )}
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {isNonEmptyArray(termData?.list) &&
              termData?.list?.map?.(
                (
                  term: {
                    id: string;
                    term_name: string;
                  },
                  index: number
                ) => {
                  const { color, lightColor } = getColorScheme(index);

                  return (
                    <UITitles
                      key={term.id}
                      title={
                        <>
                          <UIText>{formatTerm(term.term_name)}</UIText>
                        </>
                      }
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
                }
              )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
