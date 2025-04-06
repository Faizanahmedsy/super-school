import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGradeList } from '@/services/master/grade/grade.hook';
import useGlobalState from '@/store';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, FolderIcon } from 'lucide-react';
import { useState } from 'react';

const colorSchemes = [
  {
    color: 'from-blue-500 to-blue-600',
    lightColor: 'bg-blue-200',
  },
  {
    color: 'from-emerald-500 to-emerald-600',
    lightColor: 'bg-emerald-200',
  },
  {
    color: 'from-violet-500 to-violet-600',
    lightColor: 'bg-violet-200',
  },
  {
    color: 'from-orange-500 to-orange-600',
    lightColor: 'bg-orange-200',
  },
  {
    color: 'from-rose-500 to-rose-600',
    lightColor: 'bg-rose-200',
  },
  {
    color: 'from-cyan-500 to-cyan-600',
    lightColor: 'bg-cyan-200',
  },
  {
    color: 'from-purple-500 to-purple-600',
    lightColor: 'bg-purple-200',
  },
];

export default function ChooseGrade({ step, setStep }: { step: number; setStep: (step: number) => void }) {
  const [_, setHoveredCard] = useState(null);

  const term_id = useGlobalState((state) => state.term_id);
  const params: any = {
    sort: 'desc',
  };

  const { data: gradeListQuery } = useGradeList({ ...params, term_id: term_id ?? undefined });

  const setGradeId = useGlobalState((state) => state.setGradeId);

  const getColorScheme = (index: number) => {
    return colorSchemes[index % colorSchemes.length];
  };

  return (
    <>
      <div className="w-full p-1">
        <Card className="w-full">
          <CardHeader className="relative z-10">
            <CardTitle className="flex justify-between items-center">
              <div>Select a Grade</div>
              <div className="flex justify-center items-center gap-4">
                <Button size="sm" variant="nsc-secondary" onClick={() => setStep(step - 1)}>
                  <ChevronLeftIcon className="w-4 h-4" />
                  Back
                </Button>
              </div>
            </CardTitle>
            <CardDescription>Select a grade to view the quizzes and grades of the students</CardDescription>
          </CardHeader>
          <CardContent>
            {gradeListQuery?.list?.length ? (
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.isArray(gradeListQuery?.list) &&
                  gradeListQuery?.list?.length > 0 &&
                  gradeListQuery?.list.map(
                    (
                      batch: {
                        year: string;
                        id: string;
                        grade_number: string;
                      },
                      index: number
                    ) => {
                      const { color, lightColor } = getColorScheme(index);
                      return (
                        <motion.div
                          key={batch.year}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.1, delay: index * 0.1 }}
                        >
                          <Card
                            className="relative overflow-hidden cursor-pointer group z-5"
                            onMouseLeave={() => setHoveredCard(null)}
                            onClick={() => {
                              setGradeId(batch.id);
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
                                  <FolderIcon className="w-6 h-6 text-gray-700 " />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900  transition-colors duration-300">
                                    {batch.grade_number}
                                  </h3>
                                </div>
                              </div>
                            </CardHeader>
                          </Card>
                        </motion.div>
                      );
                    }
                  )}
              </div>
            ) : (
              <div className="flex justify-center items-center h-20 text-gray-500">No data found</div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
