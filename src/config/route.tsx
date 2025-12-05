import App from '@/App.tsx';
import Home from '@/pages/home/index';
import { Suspense, lazy } from 'react';
// import ScrollList from '../pages/scrollList/index.tsx';
// import Theme from "../pages/theme/index";
// import FilterList from "../pages/filterList/index.tsx";

// const Home = () => import("../pages/home.tsx");
// react router6 + react lazy 延迟加载的正确写法
const FilterList = lazy(() => import('@/pages/filterList'));
const Theme = lazy(() => import('@/pages/theme'));
const LineChartGroupPage = lazy(() => import('@/pages/line-chart-group'));
const PrefScrollListlist = lazy(() => import('@/pages/pref-scroll-list/index.tsx'));
const ScrollList = lazy(() => import('@/pages/scrollList/index'));
const TDTMap = lazy(() => import('@/pages/TDTMap/index'));
const PDF = lazy(() => import('@/pages/pdf-view/index'));
const PieSlider = lazy(() => import('@/pages/slider/index'));

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
      },
      {
        path: 'slist',
        name: '向上滚动加载的list',
        element: (
          <Suspense fallback={<h1>loading</h1>}>
            <ScrollList />
          </Suspense>
        )
      },
      {
        path: 'pref-slist',
        name: '优化向下滚动加载的list',
        element: (
          <Suspense fallback={<h1>loading</h1>}>
            <PrefScrollListlist />
          </Suspense>
        )
      },
      {
        path: 'line-chart-group',
        name: '纵向排列的多y轴单x轴图表',
        element: (
          <Suspense fallback={<h1>loading</h1>}>
            <LineChartGroupPage />
          </Suspense>
        )
      },
      {
        path: 'pdf',
        name: 'PDF 预览',
        element: (
          <Suspense fallback={<h1>loading</h1>}>
            <PDF />
          </Suspense>
        )
      },
      {
        path: 'pie-slider',
        name: '扇形滑动选择器+圆形滚动条',
        element: (
          <Suspense fallback={<h1>loading</h1>}>
            <PieSlider />
          </Suspense>
        )
      }
    ]
  }
];
