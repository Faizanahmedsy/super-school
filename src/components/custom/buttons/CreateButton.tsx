import UIPrimaryButton from '@/components/custom/buttons/UIPrimaryButton';
import UIText from '@/components/global/Text/UIText';
import usePermission from '@/hooks/role-based-access/usePermissions';
import { capitalizeFirstLetter } from '@/lib/common-functions';
import { ROLE_NAME } from '@/lib/helpers/authHelpers';
import useGlobalState from '@/store';
import { BadgePlus } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

type CreateButtonProps = {
  checkPermission?: boolean;
  moduleName?: string;
  action?: 'add' | 'edit' | 'view' | 'delete';
  redirectTo?: string;
  overrideText?: string;
  onClick?: any;
};

const CreateButton: React.FC<CreateButtonProps> = ({
  checkPermission = true,
  moduleName = '',
  action = 'add',
  redirectTo,
  overrideText,
  onClick,
}) => {
  const navigate = useNavigate();

  const user = useGlobalState((state) => state.user);

  const permissionCheckResult = usePermission(checkPermission ? moduleName : '', checkPermission ? action : 'view');

  let shouldRenderButton = !checkPermission || permissionCheckResult;

  if (user?.role_name === ROLE_NAME.SUPER_ADMIN) {
    shouldRenderButton = true;
  }

  if (user?.role_name === ROLE_NAME.DEPARTMENT_OF_EDUCATION) {
    shouldRenderButton = false;
  }

  if (!shouldRenderButton) return null;

  return (
    <UIPrimaryButton
      className="rounded-full"
      onClick={() => {
        if (onClick) {
          onClick();
        } else if (redirectTo) {
          navigate(redirectTo);
        } else {
          console.error("Either 'onClick' or 'redirectTo' prop must be provided.");
        }
      }}
      icon={<BadgePlus size={18} />}
    >
      {overrideText ? <UIText>{overrideText}</UIText> : <UIText>{`Add ${capitalizeFirstLetter(moduleName)}`}</UIText>}
    </UIPrimaryButton>
  );
};

export default CreateButton;
