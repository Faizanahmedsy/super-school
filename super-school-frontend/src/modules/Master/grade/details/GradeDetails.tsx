import PageTitle from '@/components/global/PageTitle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentsListTable from '@/modules/Management/students/components/list/studentsLIstTable';
import TeacherListTable from '@/modules/Management/Teachers/components/list/TeacherListTable';
import { Card, Col, Row } from 'antd';

const GradeDetails = () => {
  const data = {
    id: 1,
    name: '12th',
    institute_name: 'alexander',
    grade_number: 1,
    institute_id: 2,
    user_id: 1,
  };

  return (
    <div>
      <PageTitle
        breadcrumbs={[
          { label: 'Grade List', href: '/grade/list' },
          { label: 'Grade Details', href: '/grade/details' },
        ]}
      >
        Grade Details
      </PageTitle>
      <div className="space-y-4">
        <div className="teacher-details-container">
          <Card className="teacher-details-card" styles={{ body: { padding: '24px' } }} title="Grade Details">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div className="detail-item">
                  <strong>Name:</strong> {data?.name}
                </div>
              </Col>
              <Col span={8}>
                <div className="detail-item">
                  <strong>Grade Number:</strong> {data?.grade_number}
                </div>
              </Col>
              <Col span={8}>
                <div className="detail-item">
                  <strong>School Name:</strong> {data?.institute_name}
                </div>
              </Col>
            </Row>
          </Card>
        </div>

        <Card>
          <Tabs defaultValue="teacher">
            <TabsList>
              <TabsTrigger value="teacher">Teacher</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
            </TabsList>
            <TabsContent value="teacher">
              <TeacherListTable />
            </TabsContent>
            <TabsContent value="students">
              <StudentsListTable />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default GradeDetails;
