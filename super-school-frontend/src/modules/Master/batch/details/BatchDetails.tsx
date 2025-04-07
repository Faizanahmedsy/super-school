import PageTitle from '@/components/global/PageTitle';

const BatchDetails = () => {
  return (
    <div>
      <PageTitle
        breadcrumbs={[
          { label: 'Year List', href: '/batch/list' },
          { label: 'Year Details', href: '/batch/details' },
        ]}
      >
        Year Details
      </PageTitle>
    </div>
  );
};

export default BatchDetails;
