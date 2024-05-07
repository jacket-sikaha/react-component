import { Suspense, lazy } from 'react';
import App from '../App.tsx';
import TDTMap from '../pages/TDTMap/index.tsx';
import Home from '../pages/home/index';
// import Theme from "../pages/theme/index";
// import FilterList from "../pages/filterList/index.tsx";

// const Home = () => import("../pages/home.tsx");
// react router6 + react lazy 延迟加载的正确写法
const FilterList = lazy(() => import('../pages/filterList'));
const Theme = lazy(() => import('../pages/theme'));

export const DefaultRoutes = [
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: 'home',
                name: '主页',
                element: <Home />
            },
            {
                path: 'filterList',
                name: '条件筛选+无限滚动列表',
                element: (
                    <Suspense fallback={<h1>loading</h1>}>
                        <FilterList />
                    </Suspense>
                )
                // lazy: () => <FilterList />,
            },
            {
                path: 'theme',
                name: '多种主题切换',
                element: (
                    <Suspense fallback={<h1>loading</h1>}>
                        {/* 这里的Suspense就是只对Theme起作用 */}
                        <Theme />
                    </Suspense>
                )
            },
            {
                path: 'map',
                name: '地图定位+搜索位置',
                element: (
                    <Suspense fallback={<h1>loading</h1>}>
                        <TDTMap />
                    </Suspense>
                )
            }
        ]
    }
];
