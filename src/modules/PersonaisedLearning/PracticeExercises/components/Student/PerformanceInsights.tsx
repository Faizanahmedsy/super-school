import UINoDataFound from '@/components/custom/UINoDataFound';
import RenderNullableValue from '@/components/global/Text/RenderNullableValue';
import UIText from '@/components/global/Text/UIText';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { isNonEmptyArray } from '@/lib/common-functions';
import useGlobalState from '@/store';
import { BookOpen, Frown, LayoutDashboard, Smile, Star, TrendingUp } from 'lucide-react';
import { useStudentStats } from '../../action/personalized-learning.action';
import { useRoleBasedLearnerId } from '@/hooks/role-based-ids/use-rolebased-learner-id';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const PerformanceInsights = () => {
  const user = useGlobalState((state) => state.user);
  const filterData = useGlobalState((state) => state.filterData);
  const studentId = useRoleBasedLearnerId();

  const curBatchId = useRoleBasedCurrentBatch();
  const schoolId = useRoleBasedSchoolId();

  const studentAnalyticsQuery = useStudentStats({
    batch: curBatchId,
    grade: filterData?.grade?.id,
    term: filterData?.term?.id,
    school: schoolId,
    ...(user?.role_name == ROLE_NAME.PARENT && {
      student_id: studentId ? studentId : undefined,
    }),
  });

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" />
            <UIText>Overview</UIText>
          </CardTitle>
        </CardHeader>
        <CardContent className="py-5">
          <div className="grid grid-cols-3">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="text-2xl font-bold">
                <RenderNullableValue value={studentAnalyticsQuery?.data?.overview.quizzes_generated} />
              </div>
              <UIText>Quizzes Generated</UIText>
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="text-2xl font-bold">
                <RenderNullableValue value={studentAnalyticsQuery?.data?.overview.quizzes_completed} />
              </div>
              <UIText>Quizzes Completed</UIText>
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="text-2xl font-bold">
                <RenderNullableValue value={`${studentAnalyticsQuery?.data?.overview.improvement_rate}%`} />
              </div>
              <UIText>Improvement Rate</UIText>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smile className="w-6 h-6 text-green-600" />
              Top Performing Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentAnalyticsQuery.data && studentAnalyticsQuery.data?.top_performing_subjects.length != 0 ? (
              studentAnalyticsQuery.data?.top_performing_subjects.map((subject) => (
                <div
                  key={subject.subject_name}
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">{subject.subject_name}</span>
                  <span className="text-green-600 font-bold">Avg Percentage {subject.average_mark_percentage} %</span>
                </div>
              ))
            ) : (
              <UINoDataFound />
            )}
          </CardContent>
        </Card>
        {/* {user.role_name == ROLE_NAME.STUDENT && (
          <div>
            {data && data?.data ? (
              <Accordion type="single" collapsible className="w-full bg-white rounded-xl px-4 pt-3">
                <AccordionItem value="strengths">
                  <AccordionTrigger className="h-10 hover:border-none">
                    <div className="flex justify-between items-center w-full">
                      <div className="font-semibold leading-none tracking-tight">Strengths</div>
                      <span>({data?.data?.strengths.length})</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {data?.data?.strengths.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {data?.data?.strengths.map((strength: string, index: number) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No Strengths Available</p>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="weaknesses">
                  <AccordionTrigger className="h-10 hover:border-none">
                    <div className="flex justify-between items-center w-full">
                      <div className="font-semibold leading-none tracking-tight">Weaknesses</div>
                      <span>({data?.data?.weaknesses.length})</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {data?.data?.weaknesses.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {data?.data?.weaknesses.map((weakness: string, index: number) => (
                          <li key={index}>{weakness}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No Weaknesses Available</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <p>No Result Available</p>
            )}
          </div>
        )} */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Frown className="w-6 h-6 text-red-600" />
              Low Performing Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isNonEmptyArray(studentAnalyticsQuery?.data?.low_performing_subjects) ? (
              studentAnalyticsQuery?.data?.low_performing_subjects.map((subject) => (
                <div
                  key={subject.subject_name}
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">{subject.subject_name}</span>
                  <span className="text-red-600 font-bold">Avg Percentage {subject.average_mark_percentage} %</span>
                </div>
              ))
            ) : (
              <UINoDataFound />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Existing Subject Performance Insights */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Quiz Performance Insights
          </CardTitle>
          <CardDescription>Detailed analysis of your academic performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {studentAnalyticsQuery?.data?.subject_performance_insights.map((subject) => (
              <div
                key={subject.subject_name}
                className="bg-gray-50 p-4 rounded-lg border hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">{subject.subject_name}</h3>
                  <TrendingUp
                    className={`w-5 h-5 ${subject.improvement_percentage > 60 ? 'text-green-500' : 'text-yellow-500'}`}
                  />
                </div>
                <div className="space-y-2">
                  <p>
                    Average Mark: <span className="font-bold">{subject.average_mark_percentage}%</span>
                  </p>
                  <p>
                    Improvement: <span className="text-green-600">{subject.improvement_percentage}%</span>
                  </p>
                  <Separator />
                  {/* Top Learners Section */}
                  <div className="mt-3">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Top Learners
                    </h4>
                    <div className="space-y-1 grid grid-cols-3 gap-3">
                      {subject.top_students.slice(0, 3).map((learner, index) => (
                        <div
                          key={learner.first_name}
                          className="flex justify-between items-center bg-white p-2 rounded-lg"
                        >
                          <div>
                            <span className="font-medium">{learner.first_name + learner.last_name}</span>
                            <span className="text-xs text-gray-500 ml-2">#{index + 1}</span>
                          </div>
                          <span className="text-green-600 font-bold">{learner.average_marks_percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceInsights;
