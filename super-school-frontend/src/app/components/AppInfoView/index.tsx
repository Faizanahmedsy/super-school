import { useEffect } from 'react';

import AppLoader from '../AppLoader';

import {
  useInfoViewActionsContext,
  useInfoViewContext,
} from '@/app/context/AppContextProvider/InfoViewContextProvider';
import { displayError } from '@/lib/helpers/errorHelpers';
import { displaySuccess } from '@/lib/helpers/successHelpers';

const AppInfoView = () => {
  const { loading, error, displayMessage } = useInfoViewContext();
  const { clearInfoView } = useInfoViewActionsContext();

  useEffect(() => {
    if (error) {
      displayError(error);
      clearInfoView();
    }
  }, [error]);

  useEffect(() => {
    if (displayMessage) {
      displaySuccess(displayMessage);
      clearInfoView();
    }
  }, [displayMessage]);

  return <>{loading ? <AppLoader /> : null}</>;
};

export default AppInfoView;
