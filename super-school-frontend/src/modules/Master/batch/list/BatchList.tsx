import data from '@/app/components/AppLanguageSwitcher/data.tsx';
import UIPrimaryButton from '@/components/custom/buttons/UIPrimaryButton';
import PageTitle from '@/components/global/PageTitle';
import { CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Card } from 'antd';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

export default function BatchsList() {
  const navigate = useNavigate();
  return (
    <>
      <PageTitle breadcrumbs={[{ label: 'Batch List', href: '/batch/list' }]}>Batch List</PageTitle>
      <div className="grid md:grid-cols-4 gap-4">
        {data.map((item) => (
          <Card>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
            </CardContent>
            <CardFooter>
              <UIPrimaryButton icon={<MdOutlineRemoveRedEye size={18} />} onClick={() => navigate('/batch/details')}>
                Details
              </UIPrimaryButton>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
