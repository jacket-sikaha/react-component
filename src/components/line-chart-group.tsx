import { EChartsOption } from 'echarts';
import { LineChart } from 'echarts/charts';
import {
  DatasetComponent,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  TransformComponent
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { useCallback, useEffect, useRef } from 'react';

export type FaultReportChartData = {
  name: string;
  stack?: string;
  data: number[];
};

echarts.use([
  LabelLayout,
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
  DatasetComponent,
  TransformComponent,
  UniversalTransition,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
  DataZoomComponent,
  LineChart
]);

type Props = {
  id: string;
  unit: string;
  width?: number;
  height: number;
  color?: string;
  data: FaultReportChartData[];
  xAxisData: string[];
  loading: boolean;
  theme?: 'light' | 'dark';
};

function LineChartGroup({
  id,
  theme = 'light',
  width,
  unit,
  xAxisData,
  height,
  data,
  loading
}: Props) {
  const chartRef = useRef<echarts.ECharts>();
  const yAxis = data.map((_, index) => {
    return {
      type: 'value',
      gridIndex: index
    };
  });
  const xAxis = data.map((_, index) => {
    return {
      axisTick: {
        alignWithLabel: true
      },
      show: index === data.length - 1,
      gridIndex: index,
      data: xAxisData
    };
  });
  const grid = data.map((_, index) => {
    return {
      top: (height + 30) * index + 100,
      height
    };
  });
  const series = data.map(({ name, data }, i) => {
    return {
      name,
      type: 'line',
      label: {
        show: true,
        formatter: (params: { value: any }) => {
          return params.value;
        }
      },
      emphasis: {
        focus: 'series'
      },
      data,
      xAxisIndex: i,
      yAxisIndex: i
    };
  });
  const h = (height + 30) * data.length + 100 + height;
  console.log('h:', h);
  const setData = (chartLoading: boolean) => {
    chartRef.current?.setOption<EChartsOption>(
      {
        title: {
          show: !chartLoading && data.length === 0,
          text: '暂无数据',
          left: 'center',
          top: 'center',
          textStyle: {
            color: 'grey',
            fontSize: 16,
            fontWeight: 'normal'
          }
        },
        legend: {},
        tooltip: {
          trigger: 'axis',
          yAxisIndex: [0, data.length - 1],
          valueFormatter(value, dataIndex) {
            return `${value ?? 0} ${unit ?? ''}`;
          }
        },
        dataZoom: [
          {
            show: true,
            realtime: true,
            xAxisIndex: data.map((_, index) => index),
            start: 65,
            end: 85
          },
          {
            type: 'inside',
            realtime: true,
            xAxisIndex: data.map((_, index) => index),
            start: 65,
            end: 85
          }
        ],
        grid,
        yAxis,
        xAxis,
        series: [...series]
      },
      true
    );
  };

  const initChart = useCallback(() => {
    chartRef.current?.dispose();
    chartRef.current = echarts.init(document.getElementById(`chart-${id}`)!, theme, { height: h });
    setData(true);
  }, []);

  useEffect(() => {
    initChart();
  }, []);

  useEffect(() => {
    setData(loading);
    chartRef.current?.resize({
      height: h
    });
  }, [data]);

  useEffect(() => {
    if (loading) {
      chartRef.current?.showLoading({ text: '加载中', fontSize: 16 });
    } else {
      chartRef.current?.hideLoading();
    }
  }, [loading]);

  return (
    <div id={`chart-${id}`} className="flex justify-center mx-auto" style={{ width, height: h }} />
  );
}
export default LineChartGroup;
