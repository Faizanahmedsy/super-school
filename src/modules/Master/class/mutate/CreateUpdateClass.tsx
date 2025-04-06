import AppPageMeta from '@/app/components/AppPageMeta';
import PageTitle from '@/components/global/PageTitle';
import { Button, Form } from 'antd';

export default function CreateUpdateClass({ editMode = false }: { editMode?: boolean }) {
  const [form] = Form.useForm();
  return (
    <>
      <AppPageMeta title={editMode ? 'Edit' : 'Create' + ' ' + 'Admin'} />
      <PageTitle
        extraItem={
          <>
            <Button onClick={form.submit}>Submit</Button>
          </>
        }
        breadcrumbs={[{ label: 'Class List', href: '/class/list' }, { label: `${editMode ? 'Edit' : 'Create'} Class` }]}
      >
        {`${editMode ? 'Edit' : 'Create'} Class`}
      </PageTitle>
    </>
  );
}
