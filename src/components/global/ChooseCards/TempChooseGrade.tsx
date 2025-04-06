import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoleBasedCurrentBatch } from '@/hooks/role-based-ids/use-rolebased-currentbatch';
import { requireMessage } from '@/lib/form_validations/formmessage';
import useGlobalState from '@/store';
import { Form, Input, Modal } from 'antd';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, FolderIcon } from 'lucide-react';
import { useState } from 'react';

// const colorSchemes = [
//   { baseColor: '#dcfce7', hoverColor: '#138713' }, // Lighter Green
//   { baseColor: '#fef9c3', hoverColor: '#B6923C' }, // Lighter Dark Yellow
//   { baseColor: '#ffedd5', hoverColor: '#632000' }, // Lighter Brown
//   // { baseColor: '#B11200', hoverColor: '#800D00' }, // Lighter Red
//   // { baseColor: '#E37400', hoverColor: '#AF5900' }, // Lighter Light Red
//   // { baseColor: '#FF9900', hoverColor: '#CC7A00' }, // Lighter Orange
// ];

const colorSchemes = [
  { baseColor: '#3DB047', hoverColor: '#1B7C22' }, // Lighter Green
  { baseColor: '#E6BC66', hoverColor: '#C49E44' }, // Lighter Dark Yellow
  { baseColor: '#C34141', hoverColor: '#950707' }, // Lighter Brown
  { baseColor: '#D47E33', hoverColor: '#BE6518' }, // Lighter Brown
  { baseColor: '#FFA552', hoverColor: '#F67820' }, // Lighter Brown
];

export default function TempChooseGrade({ step, setStep }: { step: number; setStep: (step: number) => void }) {
  const [modalTrue, setModalTrue] = useState(false);
  const [gradeModal, setGradeModal] = useState(false);
  const [form] = Form.useForm();

  const batch_id: any = useRoleBasedCurrentBatch();
  const setGradeId = useGlobalState((state) => state.setGradeId);

  const gradeListQuery = {
    list: [
      { id: '90', grade_number: 1 },
      { id: '91', grade_number: 2 },
      { id: '92', grade_number: 3 },
      { id: '93', grade_number: 4 },
      { id: '94', grade_number: 5 },
    ],
  };

  return (
    <>
      <div className="w-full p-1">
        <Card className="w-full">
          <CardHeader className="relative z-10">
            <CardTitle className="flex justify-between items-center">
              <div>Select a Grade</div>
              <div className="flex gap-4">
                <Button size="sm" onClick={() => setGradeModal(true)}>
                  Create Grade
                </Button>
                <Button size="sm" variant="nsc-secondary" onClick={() => setStep(step - 1)}>
                  <ChevronLeftIcon className="w-4 h-4" />
                  Back
                </Button>
              </div>
            </CardTitle>
            <CardDescription>Select a grade to view the quizzes and grades of the students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {gradeListQuery.list.map((grade, index) => {
                const { baseColor, hoverColor } = colorSchemes[index % colorSchemes.length];
                return (
                  <motion.div
                    key={grade.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.1, delay: index * 0.1 }}
                  >
                    <Card
                      className="relative overflow-hidden cursor-pointer group"
                      onClick={() => {
                        setGradeId(grade.id);
                        setStep(step + 1);
                      }}
                      style={{
                        color: 'black',
                        backgroundColor: baseColor,
                        transition: 'background-color 0.3s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverColor)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = baseColor)}
                    >
                      <CardHeader className="relative z-10">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 rounded-lg bg-white/20  group-hover:bg-white/40 transition-colors duration-300">
                            <FolderIcon className="w-6 h-6 text-gray-700" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{`Grade ${grade.grade_number}`}</h3>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <Modal open={modalTrue} onCancel={() => setModalTrue(false)} title="Delete Grade" centered>
        {/* Delete Confirmation */}
      </Modal>
      <Modal
        open={gradeModal}
        onCancel={() => setGradeModal(false)}
        title="Add Grade"
        centered
        onOk={() => setGradeModal(false)}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Grade Name"
            name="gradeName"
            rules={[{ required: true, message: requireMessage('grade name') }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
