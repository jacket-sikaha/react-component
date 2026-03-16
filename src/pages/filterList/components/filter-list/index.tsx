import { Cell, DatePicker, InfiniteLoading, Tabs } from '@nutui/nutui-react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { type CSSProperties, useEffect, useState } from 'react';
import { ListItem } from '../filter-list-item';
import './index.css';
dayjs.extend(customParseFormat);

type FilterListProps = {
  workOrderType?: number;
  tabList: string[];
  filterListSetting: {
    refreshList: any[];
    refreshHasMore: boolean;
    refreshLoadMore: (arg?: any) => Promise<void>;
    handleFilterChange: (filters: any) => Promise<void>;
  };
  isRepairPage?: boolean;
  className?: string;
  style?: CSSProperties;
};

function FilterList(props: FilterListProps) {
  const { tabList, filterListSetting, className, style } = props;
  const { refreshList, refreshHasMore, refreshLoadMore, handleFilterChange } = filterListSetting;

  const [status, setTab2value] = useState(0);
  const [date, setDate] = useState([dayjs().subtract(1, 'month'), dayjs()]);
  const [beginDate, endDate] = date;
  const [sPicker, setSPicker] = useState(false);
  const [ePicker, setEPicker] = useState(false);
  const confirm = (values: (string | number)[], flag: boolean) => {
    const val = dayjs(values.join('-'), 'YYYY-MM-DD-HH-mm');
    const newDate = flag ? [val, date[1]] : [date[0], val];
    setDate(newDate);
    const [beginDate, endDate] = newDate;
    handleFilterChange({
      status,
      beginDate,
      endDate
    });
  };

  useEffect(() => {
    handleFilterChange({
      status,
      beginDate,
      endDate
    });
  }, []);

  return (
    <div className={className} style={style}>
      <Cell
        title="日期区间"
        description={
          <div className="flex justify-center text-sm">
            <div className="mx-2" onClick={() => setSPicker(true)}>
              {beginDate.format('YY-MM-DD HH:mm')}
            </div>
            ~
            <div className="mx-2" onClick={() => setEPicker(true)}>
              {endDate.format('YY-MM-DD HH:mm')}
            </div>
          </div>
        }
      />
      <DatePicker
        title="起始日期时间选择"
        visible={sPicker}
        type="datetime"
        endDate={endDate.toDate()}
        onClose={() => setSPicker(false)}
        onConfirm={(_: any, values: (string | number)[]) => confirm(values, true)}
      />
      <DatePicker
        title="结束日期时间选择"
        visible={ePicker}
        startDate={beginDate.toDate()}
        endDate={dayjs().toDate()}
        type="datetime"
        onClose={() => setEPicker(false)}
        onConfirm={(_: any, values: (string | number)[]) => confirm(values, false)}
      />

      <Tabs
        value={status}
        tabStyle={{ position: 'sticky', top: '0px', zIndex: 11 }}
        onChange={(val) => {
          setTab2value(val as number);
          const status = +val;
          handleFilterChange({ status, beginDate, endDate });
        }}
      >
        {tabList.map((title, i) => {
          return (
            <Tabs.TabPane title={title} key={i} value={i}>
              <InfiniteLoading
                pullingText={'松开刷新'}
                loadingText={'加载中'}
                target="refreshScroll"
                pullRefresh
                hasMore={refreshHasMore}
                onLoadMore={() =>
                  refreshLoadMore({
                    status,
                    beginDate,
                    endDate
                  })
                }
                onRefresh={() =>
                  handleFilterChange({
                    status,
                    beginDate,
                    endDate
                  })
                }
              >
                {refreshList.map((item, index) => {
                  return <ListItem key={item.id ?? index} item={item} />;
                })}
              </InfiniteLoading>
            </Tabs.TabPane>
          );
        })}
      </Tabs>
    </div>
  );
}

export default FilterList;
