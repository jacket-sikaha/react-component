import LineChartGroup from '../../components/line-chart-group';

function LineChartGroupPage() {
  const data = [
    {
      name: '广东省',
      data: [0, 0, 276941.5, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      name: '上海市',
      data: [0, 0, 831.9, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      name: '陕西省',
      data: [0, 0, 146468.2, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      name: '四川省',
      data: [0, 0, 272705.1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      name: '贵州省',
      data: [0, 0, 90800.9, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      name: '安徽省',
      data: [0, 0, 29206.9, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      name: '内蒙古自治区',
      data: [0, 0, 1546.1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      name: '宁夏回族自治区',
      data: [0, 0, 6868.1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      name: '山西省',
      data: [0, 0, 0.4, 0, 0, 10, 0, 0, 0, 0, 0, 0]
    },
    {
      name: '云南省',
      data: [0, 0, 342.2, 0, 0, 0, 0, 0, 10, 0, 0, 0]
    }
  ];
  const xAxisData = [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月'
  ];

  return (
    // <div className="bg-white w-full max-w-[50rem] mx-auto h-full my-3 py-3 rounded-xl overflow-auto">
    <div className="bg-white w-full mx-auto h-full my-3 py-3 rounded-xl">
      <LineChartGroup
        loading={false}
        height={100}
        data={data}
        xAxisData={xAxisData}
        id={'water'}
        unit={'立方米 (m³)'}
      />
    </div>
  );
}

export default LineChartGroupPage;
