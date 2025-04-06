import UINoDataFound from '@/components/custom/UINoDataFound';
import RenderNullableValue from '@/components/global/Text/RenderNullableValue';
import UIText from '@/components/global/Text/UIText';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { useRoleBasedLearnerId } from '@/hooks/role-based-ids/use-rolebased-learner-id';
import { useRoleBasedSchoolId } from '@/hooks/role-based-ids/use-rolebased-school-id';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import { useStudentStats } from '@/modules/PersonaisedLearning/PracticeExercises/action/personalized-learning.action';
import useGlobalState from '@/store';
import { BookOpen, Frown, LayoutDashboard, Smile, Star } from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'; // Import Recharts components

const StudentPracticeDashboard = () => {
  // Replace the API call with dummy data
  // const studentAnalyticsQuery = {
  //   data: dummyStudentAnalyticsData,
  //   isLoading: false,
  //   isError: false,
  // };

  const curBatchId = useRoleBasedCurrentBatch();
  const user = useGlobalState((state) => state.user);
  const schoolId = useRoleBasedSchoolId();
  const studentId = useRoleBasedLearnerId();
  const studentAnalyticsQuery = useStudentStats({
    batch: curBatchId,
    // grade: filterData?.grade?.id,
    // term: filterData?.term?.id,
    school: schoolId,
    ...(user?.role_name == ROLE_NAME.PARENT && {
      student_id: studentId ? studentId : undefined,
    }),
  });

  // Colors for charts
  const COLORS = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B'];

  const chartData = studentAnalyticsQuery?.data?.subject_performance_insights || [];

  const formattedData = chartData.map((item) => ({
    subject_name: item.subject_name,
    positive: item.improvement_percentage >= 0 ? item.improvement_percentage : 0,
    negative: item.improvement_percentage < 0 ? item.improvement_percentage : 0,
  }));

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Top and Low Performing Subjects */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Smile className="w-6 h-6" />
              Top Performing Subjects
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {studentAnalyticsQuery.data && studentAnalyticsQuery.data?.top_performing_subjects.length !== 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={studentAnalyticsQuery.data.top_performing_subjects.map((subject) => ({
                    name: subject.subject_name,
                    value: subject.average_mark_percentage,
                  }))}
                  barSize={30}
                >
                  <XAxis dataKey="name" tick={{ fill: '#4B5563' }} />
                  <YAxis
                    tick={{ fill: '#4B5563' }}
                    label={{
                      value: 'Average Marks',
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Bar
                    name={'Top Performing Subject with Average Marks'}
                    dataKey="value"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <UINoDataFound />
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg  pb-3">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Frown className="w-6 h-6" />
              Low Performing Subjects
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {studentAnalyticsQuery.data && studentAnalyticsQuery?.data?.low_performing_subjects.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={studentAnalyticsQuery.data.low_performing_subjects.map((subject) => ({
                    name: subject.subject_name,
                    value: subject.average_mark_percentage,
                  }))}
                  barSize={30}
                >
                  <XAxis dataKey="name" tick={{ fill: '#4B5563' }} />
                  <YAxis
                    tick={{ fill: '#4B5563' }}
                    label={{
                      value: 'Average Marks',
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Bar
                    name={'Top Performing Subject With Average Marks'}
                    dataKey="value"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <UINoDataFound />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance Insights */}
      {/* <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-secondary to-secondary rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-primary">
            <BookOpen className="w-6 h-6" />
            Subject Performance Insights
          </CardTitle>
          <CardDescription className="text-primary">Detailed analysis of your academic performance</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {studentAnalyticsQuery?.data?.subject_performance_insights.map((subject) => (
              <Card key={subject.subject_name} className="shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-800">{subject.subject_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={[
                        { name: 'Average Mark', value: subject.average_mark_percentage },
                        { name: 'Improvement', value: subject.improvement_percentage },
                      ]}
                    >
                      <XAxis dataKey="name" tick={{ fill: '#4B5563' }} />
                      <YAxis
                        tick={{ fill: '#4B5563' }}
                        label={{
                          value: 'Average Marks',
                          angle: -90,
                          position: 'insideLeft',
                          style: { textAnchor: 'middle' },
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card> */}

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-secondary to-secondary rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-primary">
            <BookOpen className="w-6 h-6" />
            Quiz Performance Insights
          </CardTitle>
          <CardDescription className="text-primary">Detailed analysis of your academic performance</CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {formattedData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={formattedData}>
                <XAxis dataKey="subject_name" tick={{ fill: '#4B5563' }} />
                <YAxis
                  tick={{ fill: '#4B5563' }}
                  label={{
                    value: 'Improvement (%)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' },
                  }}
                  domain={['auto', 'auto']}
                />

                {/* Tooltip */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />

                <Legend />

                {/* Positive Bar */}
                <Bar dataKey="positive" fill="green" name="Positive Change" barSize={40} />

                {/* Negative Bar */}
                <Bar dataKey="negative" fill="red" name="Negative Change" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data available for performance insights.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentPracticeDashboard;
