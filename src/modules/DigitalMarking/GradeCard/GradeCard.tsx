import UiCardV2 from '@/components/global/Card/UiCardV2';
import PageTitle from '@/components/global/PageTitle';
import { useNavigate } from 'react-router-dom';

export default function GradeCard() {
  const navigate = useNavigate();
  const data = [
    { grade: '8th', bgColor: 'bg-blue-200' },
    { grade: '9th', bgColor: 'bg-green-200' },
    { grade: '10th', bgColor: 'bg-red-200' },
    { grade: '11th', bgColor: 'bg-purple-200' },
  ];

  return (
    <>
      <PageTitle
        breadcrumbs={[
          { label: 'Year List', href: '/memo' },
          { label: 'Grade List', href: '/memo/gradelist' },
        ]}
      >
        Grade List
      </PageTitle>
      <div className="grid md:grid-cols-4 gap-4">
        {data.map((item) => (
          <UiCardV2
            key={item.grade}
            componentName="gradeList"
            grade={item.grade}
            bgColor={item.bgColor}
            onClick={() => navigate('/memo/subject')}
          />
        ))}
      </div>
    </>
  );
}
