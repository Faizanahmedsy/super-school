import PageTitle from '@/components/global/PageTitle';
import StudyMaterialMainList from './Study-Material-Teacher/StudyMaterialMainList';

export default function TeacherStudyMaterial() {
  return (
    <>
      <PageTitle extraItem={<></>}>Study Material</PageTitle>

      <div className="space-y-4">
        <StudyMaterialMainList />
      </div>
    </>
  );
}
