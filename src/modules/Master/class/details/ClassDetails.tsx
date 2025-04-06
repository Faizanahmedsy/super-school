import PageTitle from '@/components/global/PageTitle';

const ClassDetails = () => {
  return (
    <div>
      <PageTitle
        breadcrumbs={[
          { label: 'Class List', href: '/class/list' },
          { label: 'Class Details', href: '/class/details' },
        ]}
      >
        Class Details
      </PageTitle>
    </div>
  );
};

export default ClassDetails;
