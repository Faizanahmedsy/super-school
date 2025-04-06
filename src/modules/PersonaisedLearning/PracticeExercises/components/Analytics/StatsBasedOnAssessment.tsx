import UILoader from '@/components/custom/loaders/UILoader';
import UINoDataFound from '@/components/custom/UINoDataFound';
import RenderNullableValue, { ShowData } from '@/components/global/Text/RenderNullableValue';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAssessmentAnalytics } from '../../action/personalized-learning.action';
import useGlobalState from '@/store';
import { useRoleBasedLearnerId } from '@/hooks/role-based-ids/use-rolebased-learner-id';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';

export default function StatsBasedOnAssessment() {
  const user = useGlobalState((state) => state.user);
  const studentId = useRoleBasedLearnerId();
  const assessmentAnalyticsQuery = useAssessmentAnalytics({
    status: 'completed',
    ...(user?.role_name == ROLE_NAME.PARENT && {
      student_id: studentId ? studentId : undefined,
    }),
  });

  const assessmentData = () => {
    if (assessmentAnalyticsQuery.isPending) {
      return <UILoader />;
    }

    if (assessmentAnalyticsQuery.isError || !assessmentAnalyticsQuery.data) {
      return <UINoDataFound />;
    }

    return (
      <>
        {assessmentAnalyticsQuery.isSuccess &&
          Array.isArray(assessmentAnalyticsQuery.data.results) &&
          assessmentAnalyticsQuery?.data?.results?.map((assessment: any, index: any) => (
            <AccordionItem key={index} value={`item-${index + 1}`}>
              <AccordionTrigger>
                <RenderNullableValue value={assessment?.assessment_name} />
                {/* {assessment?.assessment_name} */}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Highest Performing Subject</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ShowData>{assessment?.top_performing_subject?.subject_name}</ShowData>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Lowest Performing Subject</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ShowData>{assessment?.low_performing_subject?.subject_name}</ShowData>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Average Marks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ShowData>{assessment?.average_mark}</ShowData>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Subjects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {assessment?.assessment_subjects.length == 0 ? (
                        <div className="flex items-center justify-center h-[200px]  w-full">
                          <UINoDataFound />
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Subject Name</TableHead>
                              <TableHead>Top Marks</TableHead>
                              <TableHead>Lowest Marks</TableHead>
                              <TableHead>Average Marks</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {assessment?.assessment_subjects.map((subject: any) => (
                              <TableRow key={subject.id}>
                                <TableCell className="font-medium">
                                  <ShowData>{subject?.subject_name ?? 'No data'}</ShowData>
                                </TableCell>
                                <TableCell>
                                  <ShowData>{subject?.highest_obtained_mark}</ShowData>
                                </TableCell>
                                <TableCell>
                                  <ShowData>{subject?.lowest_obtained_mark}</ShowData>
                                </TableCell>
                                <TableCell>
                                  <ShowData>{parseFloat(subject?.average_actual_mark).toFixed(2)}</ShowData>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
      </>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Stats Based On Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion
            type="single"
            collapsible
            className="w-full bg-secondary rounded-xl px-4 pt-3"
            defaultValue="item-1"
          >
            {assessmentData()}
          </Accordion>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </>
  );
}
