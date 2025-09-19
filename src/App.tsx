import { QueryClient, QueryClientProvider } from 'react-query';
import { Outlet } from 'react-router-dom';
import './App.css';
import Layout from './components/layout';
// 创建一个 client
const queryClient = new QueryClient();
// if (typeof Promise.withResolvers === 'undefined') {
//   Promise.withResolvers = function () {
//     let resolve, reject;
//     const promise = new Promise((res, rej) => {
//       resolve = res;
//       reject = rej;
//     });
//     return { promise, resolve, reject };
//   };
// }
function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <div className="flex flex-col h-svh">
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
        <div className="fixed bottom-12 left-6 z-10">
          <Layout />
        </div>
      </QueryClientProvider>
    </>
  );
}

export default App;
