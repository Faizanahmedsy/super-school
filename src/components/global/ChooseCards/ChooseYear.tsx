import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useBatchList } from '@/services/assessments/assessments.hook';
import useGlobalState from '@/store';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, FolderIcon } from 'lucide-react';

const colorSchemes = [
  {
    color: 'from-fuchsia-400 to-fuchsia-400',
    lightColor: 'bg-fuchsia-100',
  },
  {
    color: 'from-blue-400 to-blue-400',
    lightColor: 'bg-blue-100',
  },
  {
    color: 'from-cyan-400 to-cyan-400',
    lightColor: 'bg-cyan-100',
  },
  {
    color: 'from-emerald-400 to-emerald-400',
    lightColor: 'bg-emerald-100',
  },
  {
    color: 'from-violet-400 to-violet-400',
    lightColor: 'bg-violet-100',
  },
  {
    color: 'from-orange-400 to-orange-400',
    lightColor: 'bg-orange-100',
  },
  {
    color: 'from-rose-400 to-rose-400',
    lightColor: 'bg-rose-100',
  },
];

export default function ChooseYear({ step, setStep }: { step: number; setStep: (step: number) => void }) {
  const user: any = useGlobalState((state) => state.user);

  // const params: any = {
  //   school_id: user.school.id,
  // };

  const params: any = {
    sort: 'desc',
  };

  const { data: yeardata } = useBatchList({ ...params });
  const setBatchId = useGlobalState((state) => state.setBatchId);

  // Function to get color scheme based on index
  const getColorScheme = (index: number) => {
    return colorSchemes[index % colorSchemes.length];
  };

  return (
    <div className="w-full p-1">
      <Card className="w-full">
        <CardHeader className="relative z-10">
          <CardTitle className="flex justify-between items-center">
            <div>Select a Year</div>
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
        <CardContent className="px-6">
          {yeardata?.list?.length ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {yeardata.list.map((batch: { id: string; start_year: string }, index: number) => {
                const { color, lightColor } = getColorScheme(index);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.1, delay: index * 0.1 }}
                    className="w-full"
                  >
                    <Card
                      className="relative overflow-hidden cursor-pointer group w-full"
                      onClick={() => {
                        setBatchId(batch.id);
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
                        <div className="flex items-center justify-between space-x-4">
                          <div className="flex justify-center items-center gap-4">
                            <div
                              className={`p-3 rounded-lg ${lightColor} group-hover:bg-white/20 transition-colors duration-300`}
                            >
                              <FolderIcon className="w-6 h-6 text-gray-700" />
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-gray-900 transition-colors duration-300">
                                {batch.start_year}
                              </div>
                            </div>
                          </div>
                          <div>
                            <ChevronRightIcon className="w-5 h-5 text-gray-400 transition-colors duration-300 transform group-hover:translate-x-1" />
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
    </div>
  );
}
