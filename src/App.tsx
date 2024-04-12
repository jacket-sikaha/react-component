import "./App.css";
import Layout from "./components/layout";
import { Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
// 创建一个 client
const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <div className="w-full h-full">
          <Outlet />
        </div>
        <div className="fixed bottom-8 z-10 left-2">
          <Layout />
        </div>
      </QueryClientProvider>
    </>
  );
}

export default App;
