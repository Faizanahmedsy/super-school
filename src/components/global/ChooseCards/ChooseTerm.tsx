import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { cn } from '@/lib/utils';
import { useTermList } from '@/services/master/term/term.action';

import useGlobalState from '@/store';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, FolderIcon } from 'lucide-react';

// Color combinations array - using term-appropriate colors
const colorSchemes = [
  {
    color: 'from-blue-400 to-blue-400',
    lightColor: 'bg-blue-100',
  },
  {
    color: 'from-indigo-400 to-indigo-400',
    lightColor: 'bg-indigo-100',
  },
  {
    color: 'from-cyan-400 to-cyan-400',
    lightColor: 'bg-cyan-100',
  },
  {
    color: 'from-emerald-400 to-emerald-400',
    lightColor: 'bg-emerald-100',
  },
];

export default function ChooseTerm({ step, setStep }: { step: number; setStep: (step: number) => void }) {
  // const subject_id = useGlobalState((state) => state.subject_id);
  // const grade_id = useGlobalState((state) => state.grade_id);
  const batch_id: any = useRoleBasedCurrentBatch();
  const params: any = {
    sort: 'desc',
  };
  const { data: termList } = useTermList({ ...params, batch_id: batch_id ?? undefined });
  const setTermId = useGlobalState((state) => state.setTermId);

  // Function to get color scheme based on index
  const getColorScheme = (index: number) => {
    return colorSchemes[index % colorSchemes.length];
  };

  return (
    <>
      <Card className="">
        <CardHeader className="relative z-10">
          <CardTitle className="flex justify-between items-center">
            <div>Select a Term</div>
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
          {termList?.list?.length ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.isArray(termList?.list) &&
                termList?.list?.length > 0 &&
                termList?.list.map((term: { id: string; term_name: string }, index: number) => {
                  const { color, lightColor } = getColorScheme(index);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.1, delay: index * 0.1 }}
                    >
                      <Card
                        className="relative overflow-hidden cursor-pointer group"
                        onClick={() => {
                          setTermId(term.id);
                          setStep(step + 1);
                        }}
                      >
                        <div
                          className={`absolute inset-0 ${lightColor} transition-opacity duration-300 group-hover:opacity-0`}
                        />
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                        />

                        <CardHeader className="relative z-10">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`p-3 rounded-lg ${lightColor} group-hover:bg-white/20 transition-colors duration-300`}
                            >
                              <FolderIcon className="w-6 h-6 text-gray-700" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 transition-colors duration-300">
                                {term.term_name}
                              </h3>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </motion.div>
                  );
                })}
            </div>
          ) : (
            <div className="flex justify-center items-center h-20 text-gray-500">No data found</div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
