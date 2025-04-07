import StrengthCard from '@/components/custom/cards/StrengthCard';
import { GradientSingleChart } from '@/components/custom/charts/GradientSingleChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const exams = [
  {
    subject: 'Maths',
    topic: 'Calculus',
    date: '06-05-2024',
  },
  {
    subject: 'Physics',
    topic: 'Quantum Mechanics',
    date: '07-05-2024',
  },
  {
    subject: 'Chemistry',
    topic: 'Organic Reactions',
    date: '08-05-2024',
  },
  {
    subject: 'Biology',
    topic: 'Cell Division',
    date: '09-05-2024',
  },
  {
    subject: 'English',
    topic: 'Essay Writing',
    date: '10-05-2024',
  },
];

const weaknesses = [
  {
    subject: 'Maths',
    topic: 'Calculus',
  },
  {
    subject: 'Physics',
    topic: 'Quantum Mechanics',
  },
  {
    subject: 'Chemistry',
    topic: 'Organic Reactions',
  },
  {
    subject: 'Biology',
    topic: 'Cell Division',
  },
  {
    subject: 'English',
    topic: 'Essay Writing',
  },
];

const results = [
  {
    subject: 'Maths',
    score: '85%',
    grade: 'B+',
  },
  {
    subject: 'Physics',
    score: '90%',
    grade: 'A',
  },
  {
    subject: 'Chemistry',
    score: '70%',
    grade: 'C+',
  },
  {
    subject: 'Biology',
    score: '78%',
    grade: 'B',
  },
  {
    subject: 'English',
    score: '88%',
    grade: 'B+',
  },
];

const OldStudentDashboard = () => {
  return (
    <>
      <div className="grid md:grid-cols-2 gap-4 w-full">
        <Card>
          <CardHeader>
            <CardTitle>Latest Exam Results</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>List of student results by subject.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Subject</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.subject}>
                    <TableCell className="font-medium">{result.subject}</TableCell>
                    <TableCell>{result.score}</TableCell>
                    <TableCell>{result.grade}</TableCell>
                    <TableCell className="text-right">
                      <button className="btn btn-outline mr-2">View Feedback</button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle>11th Mid Sem Assessment Timetable</CardTitle>
            <CardDescription>Assessment Date: 05-05-2024</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Exam schedule for 11th mid-semester.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Subject</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Assessment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.subject}>
                    <TableCell className="font-medium">{exam.subject}</TableCell>
                    <TableCell>{exam.topic}</TableCell>
                    <TableCell>{exam.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card> */}

        <GradientSingleChart
          title="Academic Performance"
          description="Academic performance across exams"
          data={[
            { exam: '7th End Sem 2010', marks: 40 },
            { exam: '8th Mid Sem 2011', marks: 35 },
            { exam: '8th End Sem 2011', marks: 33 },
            { exam: '9th Mid Sem 2012', marks: 20 },
            { exam: '9th End Sem 2012', marks: 30 },
            { exam: '10th End Sem 2013', marks: 25 },
          ]}
        />
        <StrengthCard
          title="Top 5 Strength across all subjects"
          description="List of top 5 areas of strength"
          className="border-none bg-white"
          data={['English Grammar', 'Thermo Dynamics', 'Calculus']}
        />

        <Card>
          <CardHeader>
            <CardTitle>Weakness</CardTitle>
            <CardDescription>List of areas of weakness</CardDescription>
            <CardContent className="p-0">
              <Table>
                <TableCaption>List of the student's weaknesses by subject.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Subject</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weaknesses.map((weakness) => (
                    <TableRow key={weakness.subject}>
                      <TableCell className="font-medium">{weakness.subject}</TableCell>
                      <TableCell>{weakness.topic}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant={'outline'} size={'sm'}>
                          View Suggestions
                        </Button>
                        <Button variant={'outline'} size={'sm'}>
                          Take Quiz
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    </>
  );
};

export default OldStudentDashboard;
