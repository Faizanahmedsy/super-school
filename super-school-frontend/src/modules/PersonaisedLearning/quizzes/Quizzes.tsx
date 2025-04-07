import * as React from 'react';
import { Card, CardHeader, CardFooter, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { FolderIcon, ChevronRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTitle from '@/components/global/PageTitle';

export default function Quizzes() {
  const navigate = useNavigate();
  const [_, setHoveredCard] = React.useState(null);

  const data = [
    {
      year: '7th',
      totalStudents: 156,
      gradRate: '94',
      color: 'from-blue-500 to-blue-600',
      lightColor: 'bg-blue-200',
    },
    {
      year: '8th',
      totalStudents: 189,
      gradRate: '96',
      color: 'from-emerald-500 to-emerald-600',
      lightColor: 'bg-emerald-200',
    },
    {
      year: '9th',
      totalStudents: 201,
      gradRate: '95',
      color: 'from-violet-500 to-violet-600',
      lightColor: 'bg-violet-200',
    },
    {
      year: '10th',
      totalStudents: 178,
      gradRate: '97',
      color: 'from-orange-500 to-orange-600',
      lightColor: 'bg-orange-200',
    },
    {
      year: '11th',
      totalStudents: 212,
      gradRate: '93',
      color: 'from-rose-500 to-rose-600',
      lightColor: 'bg-rose-200',
    },
  ];
  return (
    <>
      <PageTitle breadcrumbs={[{ label: 'Select Grades ', href: '/batch/list' }]}>Quizzes</PageTitle>

      <Card className="">
        <CardHeader className="relative z-10">
          <CardTitle>Select a Grade</CardTitle>
          <CardDescription>Select a grade to view the quizzes and grades of the students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.map((batch, index) => (
              <motion.div
                key={batch.year}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  className="relative overflow-hidden cursor-pointer group"
                  onMouseEnter={() => setHoveredCard(batch.year as any)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => navigate('/quiz/subject')}
                >
                  <div
                    className={`absolute inset-0 ${batch.lightColor} transition-opacity duration-300 group-hover:opacity-0`}
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${batch.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  />

                  <CardHeader className="relative z-10">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-lg ${batch.lightColor} group-hover:bg-white/20 transition-colors duration-300`}
                      >
                        <FolderIcon className="w-6 h-6 text-gray-700 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-white transition-colors duration-300">
                          {batch.year}
                        </h3>
                      </div>
                    </div>
                  </CardHeader>

                  <CardFooter className="relative z-10">
                    <div className="w-full flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-white transition-colors duration-300">
                          {batch.gradRate} Students
                        </p>
                      </div>
                      <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300 transform group-hover:translate-x-1" />
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
