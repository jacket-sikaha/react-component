import type { LineData, Statistics, Suggests } from '@/types/LocalSearch';
import { CloseOutlined } from '@mui/icons-material';
import { InfiniteLoading } from '@nutui/nutui-react';
import { Button, Form } from 'antd';
import { useEffect } from 'react';
import ListItem from '../list-item';
import CustomPositioningControl from './component/CustomPositioningControl';
import WithPromptInput from './component/Select';
import { useTDTMap } from './hook';

export type LocationProps = {
  longitude: number;
  latitude: number;
  address: string;
};

type TDTMapProps = {
  value?: LocationProps;
  // 这两个都不传props，默认该组件一直显示
  visible?: boolean;
  onClose?: () => void;
  onChange?: (val: LocationProps | unknown) => void;
  closeIcon?: boolean;
};

function TDTMapComp({ value, visible = true, closeIcon = true, onClose, onChange }: TDTMapProps) {
  const {
    refreshList,
    refreshHasMore,
    typeList,
    otherList,
    form,
    map,
    onLoad,
    onSearch,
    onLoadMore,
    destroy,
    handleSelectct
  } = useTDTMap(value);

  // useEffect回调：首次渲染不会进行清理，会在下一次更新渲染，清除上一次的副作用；
  useEffect(() => {
    visible && onLoad();
    return () => {
      destroy();
    };
  }, [visible]);

  if (!visible) {
    return <Form className="hidden" form={form} />;
  }

  return (
    <div
      id="map-scroll"
      className="absolute left-0 right-0 top-0 z-[999] h-full w-full bg-slate-600 p-2"
    >
      {closeIcon && (
        <div className="my-1 flex">
          <span onClick={onClose}>
            <CloseOutlined />
          </span>
        </div>
      )}
      <Form form={form} className="mb-2 flex items-center">
        <Form.Item name="keyword" className="my-auto w-[75%]">
          <WithPromptInput map={map} updateListAfterChange={handleSelectct} />
        </Form.Item>
        <Button style={{ width: 80, marginLeft: 20 }} htmlType="button" onClick={onSearch}>
          搜索
        </Button>
      </Form>
      <div id="mapDiv" className="mb-2 h-1/2 border" />
      <InfiniteLoading
        pullingText={'松开刷新'}
        loadingText={'加载中'}
        // target="map-scroll"
        hasMore={refreshHasMore}
        onLoadMore={onLoadMore}
      >
        {typeList !== 1 ? (
          <div>{showOtherlist(typeList, otherList.current)}</div>
        ) : (
          refreshList.map((item, index) => {
            const { name, address } = item;
            return (
              <ListItem
                key={index}
                onClick={() => {
                  // const markerInfoWin = new T.InfoWindow(winHtml, {
                  //   autoPan: true,
                  // });
                  // marker.openInfoWindow(markerInfoWin);
                  onChange?.(item);
                  onClose?.();
                }}
                name={name}
                address={address}
              />
            );
          })
        )}
      </InfiniteLoading>
      <CustomPositioningControl map={map} />
    </div>
  );
}

export default TDTMapComp;

const showOtherlist = (type: number, list: unknown[]) => {
  switch (type) {
    case 2: {
      //解析推荐城市
      const l = list as Statistics['priorityCitys'];
      return (
        <div>
          {l.map(({ adminCode, adminName, count, lonlat }) => (
            <div key={adminCode}>
              {adminName} ({count}) --- {lonlat}
            </div>
          ))}
        </div>
      );
    }
    case 4: {
      //解析建议词信息
      const l = list as Suggests[];
      return (
        <div>
          {l.map(({ address, name, gbCode }, idx) => (
            <ListItem key={gbCode + idx} name={name} address={address} />
          ))}
        </div>
      );
    }
    case 5: {
      //解析公交信息
      const l = list as (LineData & { lineDataHtml: string })[];
      return (
        <div>
          {l.map(({ uuid, name, lineDataHtml }) => (
            <ListItem key={uuid} name={name} address={lineDataHtml} />
          ))}
        </div>
      );
    }
    default:
      return;
  }
};
