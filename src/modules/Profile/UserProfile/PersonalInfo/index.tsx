import UIProfileDetails from '@/components/commoncomponents/UiProfileDetails';
import useGetRole from '@/hooks/role-based-access/useGetRole';

const PersonalInfo = () => {
  const role = useGetRole();

  return (
    <>
      <UIProfileDetails role={'learnerprofile'} />
    </>
  );
};

export default PersonalInfo;
