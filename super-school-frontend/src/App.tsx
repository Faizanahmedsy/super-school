import AuthRoutes from '@/app/components/AuthRoutes';
import AppContextProvider from '@/app/context/AppContextProvider';
import { useThemeContext } from '@/app/context/AppContextProvider/ThemeContextProvider';
import AppLocaleProvider from '@/app/context/AppLocaleProvider';
import AppThemeProvider from '@/app/context/AppThemeProvider';
import AppAuthProvider from '@/app/core/AppAuthProvider';
import AppLayout from '@/app/core/AppLayout';
import { GlobalStyles } from '@/app/core/theme/GlobalStyle';
import { BrowserRouter } from 'react-router-dom';
import { Normalize } from 'styled-normalize';
import { Toaster } from 'sonner';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import './styles/global.css';
import './styles/index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAppColor from './hooks/use-app-color';
import { useEffect, useRef } from 'react';
import usePreventInspect from './hooks/security/use-prevent-inspect';

const queryClient = new QueryClient();

function App() {
  const { theme } = useThemeContext();

  const renderCount = useRef(0);

  renderCount.current += 1;
  useEffect(() => {
    console.log(`Test Mode: true, env: ${import.meta.env.VITE_ENV}, Render count: ${renderCount.current}`);
  }, []);

  //NSC: THIS HOOK IS USED TO CHANGE THE APP PRIMARY AND SECONDARY COLOR DYNAMICALLY
  useAppColor();

  // TODO: USE THIS LATER TO PREVENT INSPECT ELEMENT

  usePreventInspect();

  const apiUrl = import.meta.env.VITE_API_ENDPOINT;

  if (!apiUrl) {
    return (
      <>
        <h1>API URL is not defined. Please make sure to set your environment variables.</h1>
      </>
    );
    // throw new Error('API URL is not defined. Please make sure to set your environment variables.');
  }

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <AppContextProvider>
          <AppThemeProvider>
            <AppLocaleProvider>
              <BrowserRouter basename={import.meta.env.VITE_BASE_URL}>
                <AppAuthProvider>
                  <AuthRoutes>
                    <GlobalStyles theme={theme} />
                    <Normalize />
                    <AppLayout />
                    <Toaster position="top-center" richColors />
                  </AuthRoutes>
                </AppAuthProvider>
              </BrowserRouter>
            </AppLocaleProvider>
          </AppThemeProvider>
        </AppContextProvider>
      </QueryClientProvider>
    </>
  );
}
export default App;
