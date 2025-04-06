import AppsContainer from '@/app/components/AppsContainer';
import CreateButton from '@/components/custom/buttons/CreateButton';
import PageTitle from '@/components/global/PageTitle';
import { ACTION, MODULE } from '@/lib/helpers/authHelpers';
import InstituteListTable from './InstituteListTable';
import useGlobalState from '@/store';
import { useNavigate } from 'react-router-dom';

export default function InstitutesList() {
  const setStep = useGlobalState((state) => state.setInstituteStep);
  const navigation = useNavigate();

  return (
    <>
      <PageTitle
        extraItem={
          <CreateButton
            moduleName={MODULE.INSTITUTE}
            action={ACTION.ADD}
            redirectTo="/school/add"
            overrideText="Add School"
            onClick={() => {
              setStep(1);
              navigation('/school/add');
            }}
          />
        }
      >
        School List
      </PageTitle>
      <AppsContainer title={''} fullView={true} type="bottom">
        <div className="p-4">
          <InstituteListTable />
        </div>
      </AppsContainer>
    </>
  );
}
