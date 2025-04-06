import AppPageMeta from '@/app/components/AppPageMeta';
import PageTitle from '@/components/global/PageTitle';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Book, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GradeCircularProgress } from './GradeCircularProgress';

export default function StudentResultDetail() {
  const navigate = useNavigate();

  const data = {
    name: 'Jane Smith',
    rollNumber: '123456',
    DOB: '11th July 2003',
    School: "St. Mary's School",
    ExamYear: '2023',
    resultDetail: [
      {
        subject: 'Physics',
        maxMarks: 100,
        marksObtained: 84,
        grade: 'A',
      },
      {
        subject: 'Chemistry',
        maxMarks: 100,
        marksObtained: 73,
        grade: 'B',
      },
      {
        subject: 'Mathematics',
        maxMarks: 100,
        marksObtained: 59,
        grade: 'C',
      },
      {
        subject: 'Biology',
        maxMarks: 100,
        marksObtained: 52,
        grade: 'D',
      },
    ],
    totalMarks: 445,
    totalMaxMarks: 500,
    percentage: 89,
    result: 'Pass',
    division: 'First Division',
  };

  return (
    <div>
      <AppPageMeta title="Results List" />
      <PageTitle
        extraItem={
          <Button variant={'cust_01'} onClick={() => navigate('/feedback')}>
            View Feedback
          </Button>
        }
      >
        Results Details
      </PageTitle>
      {/* <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2">
            <DisplayData label={"Name"} value={data?.name} />
            <DisplayData label={"Roll Number"} value={data?.rollNumber} />
            <DisplayData label={"Date of Birth"} value={data?.DOB} />
            <DisplayData label={"School"} value={data?.School} />
            <DisplayData label={"Exam Year"} value={data?.ExamYear} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2">
            <DisplayData
              label={"Total Marks"}
              value={`${data?.totalMarks}/${data?.totalMaxMarks}`}
            />
            <DisplayData label={"Percentage"} value={`${data?.percentage}%`} />
            <DisplayData label={"Result"} value={data?.result} />
            <DisplayData label={"Division"} value={data?.division} />
          </CardContent>
        </Card>
      </div> */}
      <StudentResultCard data={data} />
    </div>
  );
}

// const DisplayData = ({ label, value }: { label: any; value: any }) => {
//   return (
//     <div className="flex gap-4">
//       <p className="font-semibold text-slate-600">{label}</p>
//       <p>{value}</p>
//     </div>
//   );
// };

const StudentResultCard = ({ data }: { data: any }) => {
  return (
    <Card className="w-full  mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Learner Result
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Book className="h-5 w-5 text-blue-500" />
              Learner Details
            </h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Name:</span> {data.name}
              </p>
              <p>
                <span className="font-medium">Roll Number:</span> {data.rollNumber}
              </p>
              <p>
                <span className="font-medium">School:</span> {data.School}
              </p>
              <p>
                <span className="font-medium">Exam Year:</span> {data.ExamYear}
              </p>
            </div>
          </div>
          <div className="">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-500" />
              Overall Result
            </h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Total Marks:</span> {data.totalMarks}/{data.totalMaxMarks}
              </p>
              <p>
                <span className="font-medium">Percentage:</span> {data.percentage}%
              </p>
              <p>
                <span className="font-medium">Result:</span> {data.result}{' '}
                {/* <Badge
                  className={cn(
                    data.result === "Pass"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  )}
                >
                  {data.result}
                </Badge> */}
              </p>
              <p>
                <span className="font-medium">Division:</span> {data.division}
              </p>
            </div>
          </div>
          <div className="flex">
            <div className="bg-teal-100 p-10 text-xl rounded-md">
              <div>
                <span className="text-teal-900 font-semibold"> Result:</span> {data?.result}
              </div>
              <div>
                <span className="text-teal-900 font-semibold"> Percentage:</span>
                <span>{data?.percentage} %</span>
              </div>
            </div>
            <GradeCircularProgress percentage={data.percentage} />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Subject-wise Results</h3>
          {data.resultDetail.map((subject: any, index: any) => (
            <SubjectResult key={index} {...subject} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const SubjectResult = ({
  subject,
  marksObtained,
  maxMarks,
  grade,
}: {
  subject: any;
  marksObtained: any;
  maxMarks: any;
  grade: any;
}) => {
  const percentage = (marksObtained / maxMarks) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-slate-700">{subject}</span>
        <Badge variant={grade === 'A' ? 'default' : grade === 'B' ? 'secondary' : 'outline'}>{grade}</Badge>
      </div>
      <Progress value={percentage} className={cn('h-2')} />
      <div className="flex justify-between text-sm text-slate-500 mt-1">
        <span>
          {marksObtained} out of {maxMarks}
        </span>
        <span>{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
};
