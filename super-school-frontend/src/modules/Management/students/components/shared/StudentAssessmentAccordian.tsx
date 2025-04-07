import UILoader from '@/components/custom/loaders/UILoader';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { capitalizeFirstLetter } from '@/lib/common-functions';
import { cn } from '@/lib/utils';
import { useStrengthsAndWeaknesses } from '@/modules/PersonaisedLearning/PracticeExercises/action/personalized-learning.action';
import { StudIndividualAssessment } from '@/modules/PersonaisedLearning/PracticeExercises/types/practice-exercises.types';
import useGlobalState from '@/store';
import { Modal } from 'antd';
import dayjs from 'dayjs';
import { Eye } from 'lucide-react';
import { useState } from 'react';

export default function StudentAssessmentAccordion({
  data,
  studentData,
  isPending,
}: {
  data: StudIndividualAssessment[];
  studentData: {};
  isPending?: boolean;
}) {
  const filterData = useGlobalState((state) => state.filterData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalName, setModalNale] = useState('');
  const [details, setDetails] = useState<string[]>([]);

  // const studentStrengthWeakness = useStrengthsAndWeaknesses({
  //   term: 1,
  //   grade: filterData?.grade?.id,
  //   subject: filterData?.subject?.id,
  // });

  const showModal = (name: string, data: any) => {
    setModalNale(name);
    setDetails(data);

    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="grid grid-cols-1 gap-6 p-1">
      {isPending ? (
        <>
          <UILoader />
        </>
      ) : (
        <>
          {data.length > 0 ? (
            <>
              {data.map((exam: any, idx) => (
                <Accordion type="single" collapsible className="w-full bg-secondary rounded-xl px-4 pt-3" key={exam.id}>
                  <AccordionItem value={idx.toString()}>
                    <AccordionTrigger className="h-10 hover:border-none">
                      <div className="flex justify-between items-center w-full">
                        <div className="flex gap-6 items-center">
                          <div className="text-xl font-semibold text-gray-900">{exam.assessment_name}</div>
                        </div>
                        {/* <div className="flex gap-5 justify-center items-center">
                      <div className="px-4">
                        Final Grade: <span>{exam.average_mark}</span>
                      </div>
                    </div> */}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-4 gap-4 w-full">
                        {/* <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="text-lg font-semibold text-gray-900">Performance</div>
                      <div>{exam.batch}</div>
                    </div> */}
                        {/* {exam?.subjects?.map((subject: any) => {
                      return (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="text-lg font-semibold text-gray-900">Subject</div>
                          <div>{subject.subject_name}</div>
                        </div>
                      );
                    })} */}

                        {exam.top_performing_subject && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="text-lg font-semibold text-gray-900">Top Performing Subject</div>
                            <div>{exam.top_performing_subject.subject_name}</div>
                          </div>
                        )}
                        {exam.low_performing_subject && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="text-lg font-semibold text-gray-900">Low Performing Subject</div>
                            <div>{exam.low_performing_subject.subject_name}</div>
                          </div>
                        )}
                        {exam.assessment_start_datetime && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                              <div className="text-lg font-semibold text-gray-900">Start Date</div>
                              <div>{dayjs(exam.assessment_start_datetime).format('DD-MM-YYYY')}</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                              <div className="text-lg font-semibold text-gray-900">End Date</div>
                              <div>{dayjs(exam.assessment_end_datetime).format('DD-MM-YYYY')}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {exam.status === 'upcoming' && (
                        <Badge variant="outline" className="text-gray-500">
                          Upcoming
                        </Badge>
                      )}
                      {exam.subjects && (
                        <div className="grid grid-cols-1 gap-4">
                          <div className="bg-white p-4">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Subject Name</TableHead>
                                  <TableHead>Marks</TableHead>
                                  <TableHead>Percentage</TableHead>
                                  <TableHead>Achivement Level</TableHead>
                                  <TableHead>Strength </TableHead>
                                  <TableHead>Weakness</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {exam.subjects.length > 0 ? (
                                  <>
                                    {exam.subjects.map((subject: any) => (
                                      <TableRow key={subject.id}>
                                        <TableCell className="font-medium">{subject.subject_name}</TableCell>
                                        <TableCell>{`${subject?.obtained_mark}/${subject?.actual_mark}`}</TableCell>
                                        <TableCell>{parseFloat(subject?.percentage).toFixed(2)}</TableCell>
                                        <TableCell>
                                          {subject?.achievement_level ? subject?.achievement_level : '-'}
                                        </TableCell>
                                        <TableCell>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            className={cn('text-gray-500')}
                                            onClick={() => showModal('Strength', subject?.top_strength_tags)}
                                          >
                                            <Eye size={16} />
                                          </Button>
                                        </TableCell>
                                        <TableCell>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            className={cn('text-gray-500')}
                                            onClick={() => showModal('Weakness', subject?.top_weakness_tags)}
                                          >
                                            <Eye size={16} />
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </>
                                ) : (
                                  <div className="w-full mt-3">No Result Available</div>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
              <Modal
                title={`${modalName} Details`}
                open={isModalOpen}
                centered={true}
                onCancel={handleCancel}
                footer={null}
              >
                {details.length > 0 && (
                  <ol>
                    {details.map((item, index) => (
                      <li key={index}>
                        {index + 1}. {capitalizeFirstLetter(item)}
                      </li>
                    ))}
                  </ol>
                )}
              </Modal>
            </>
          ) : (
            <>"No Result Available"</>
          )}
        </>
      )}
    </div>
  );
}
