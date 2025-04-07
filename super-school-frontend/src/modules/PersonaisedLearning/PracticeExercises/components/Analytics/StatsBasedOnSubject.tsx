import UILoader from '@/components/custom/loaders/UILoader';
import UIText from '@/components/global/Text/UIText';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import useIsFilterApplied from '@/hooks/use-Is-filter-applied';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { isNonEmptyArray } from '@/lib/common-functions';

import useGlobalState from '@/store';
import { useQuizAssessmentStrengthsAndWeaknesses } from '../../action/personalized-learning.action';
import { useEffect, useState } from 'react';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';

// const strengthsData = [
//   { question: 'What helped you excel in Geometry?', students: 10 },
//   { question: 'How do you approach solving Algebra problems?', students: 12 },

//   { question: 'What techniques improve your problem-solving skills?', students: 15 },
//   { question: 'How do you manage time effectively in exams?', students: 8 },
//   { question: 'What strategies have boosted your confidence in Maths?', students: 5 },
// ];

// const weaknessesData = [
//   { question: 'What challenges do you face in Algebra?', students: 10 },
//   { question: 'Which concepts in Geometry are hard to grasp?', students: 12 },
//   { question: 'How do you tackle difficulties in Probability?', students: 15 },
//   { question: 'What areas of Trigonometry need improvement?', students: 8 },
//   { question: 'What steps can help with understanding Calculus better?', students: 5 },
// ];

export default function StatsBasedOnSubject({
  type = 'subject_based',
}: {
  type?: 'subject_based' | 'grade_class_based';
}) {
  // HOOKS
  const batchId = useRoleBasedCurrentBatch();
  const isFilterApplied = useIsFilterApplied();
  const [gradeClassFilter, setGradeClassFilter] = useState({});
  const user = useGlobalState((state) => state.user);

  useEffect(() => {
    if (type === 'grade_class_based') {
      setGradeClassFilter({
        grade: isFilterApplied.grade ? filterData?.grade?.id : undefined,
        class: isFilterApplied.class ? filterData?.class?.id : undefined,
      });
    }
  }, [type]);

  // GLOBAL STATE
  const filterData = useGlobalState((state) => state.filterData);

  const quizAssessmentStrengthWeaknessQuery = useQuizAssessmentStrengthsAndWeaknesses({
    batch: batchId,
    grade: isFilterApplied.grade ? filterData?.grade?.id : undefined,
    term: isFilterApplied.term ? filterData?.term?.id : undefined,
    grade_class: isFilterApplied.class ? filterData?.class?.id : undefined,
    subject: isFilterApplied.subject ? filterData?.subject?.id : undefined,
    ...gradeClassFilter,
    ...(user?.role_name == ROLE_NAME.STUDENT && {
      student: user?.details?.id,
    }),
  });

  const strengths: string[] = quizAssessmentStrengthWeaknessQuery?.data?.strengths || [];

  const weaknesses: string[] = quizAssessmentStrengthWeaknessQuery?.data?.weaknesses || [];

  const renderStrengths = () => {
    if (quizAssessmentStrengthWeaknessQuery?.isPending) {
      return <UILoader />;
    }
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Top Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="">
                {strengths && isNonEmptyArray(strengths) ? (
                  strengths.slice(0, 5).map((item: string, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        {index + 1}. {item}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell>No data found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </>
    );
  };

  const renderWeaknesses = () => {
    if (quizAssessmentStrengthWeaknessQuery?.isPending) {
      return <UILoader />;
    }
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Top Weaknesses</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="">
                {weaknesses && isNonEmptyArray(weaknesses) ? (
                  weaknesses.slice(0, 5).map((item: string, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        {index + 1}. {item}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell>No data found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between">
            <div className="py-3">
              <UIText>{isFilterApplied?.subject ? filterData?.subject?.name : filterData?.subject?.name}</UIText>
            </div>
          </CardTitle>
          {/* <CardDescription>Based on your performance in various subjects, here are the stats</CardDescription> */}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {renderStrengths()}
            {renderWeaknesses()}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
