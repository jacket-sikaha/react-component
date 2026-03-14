import { App as AntdApp, ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Outlet } from 'react-router-dom';
import './App.css';
import Layout from './components/layout';
// 创建一个 client
const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider>
          <AntdApp>
            <div className="flex h-svh flex-col">
              <div className="flex-1">
                <Outlet />
              </div>
            </div>
            <div className="fixed bottom-12 left-6 z-10">
              <Layout />
            </div>
          </AntdApp>
        </ConfigProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
