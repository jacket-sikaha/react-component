import { Button, Form, Input } from "antd";
import { LineData, Statistics, Suggests } from "./@type/LocalSearch";
import { InfiniteLoading, Loading } from "@nutui/nutui-react";
import { CloseOutlined } from "@mui/icons-material";
import ListItem from "../list-item";
import { useEffect } from "react";
import { useTDTMap } from "./hook";

type TDTMapProps = {
  visible: boolean;
  onClose: () => void;
  onChange?: (val: unknown) => void;
};

function TDTMapComp({ visible, onClose, onChange }: TDTMapProps) {
  const {
    refreshList,
    refreshHasMore,
    typeList,
    otherList,
    form,
    onLoad,
    onSearch,
    onLoadMore,
    destroy,
  } = useTDTMap();

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
    <div className="bg-slate-600 w-full h-full z-[999] absolute top-0 left-0 right-0 p-2">
      <div className="flex justify-end">
        <span onClick={onClose}>
          <CloseOutlined />
        </span>
      </div>
      <div id="mapDiv" className="border h-1/2 mb-2" />
      <Form form={form} className="flex items-center">
        <Form.Item name="keyword" className="my-auto">
          <Input placeholder="input address" allowClear />
        </Form.Item>
        <Button
          style={{ width: 80, marginLeft: 20 }}
          htmlType="button"
          onClick={onSearch}
        >
          搜索
        </Button>
      </Form>
      <InfiniteLoading
        pullingText={<Loading>松开刷新</Loading>}
        loadingText={<Loading>加载中</Loading>}
        target="scroll"
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
                  onClose();
                }}
                name={name}
                address={address}
              />
            );
          })
        )}
      </InfiniteLoading>
    </div>
  );
}

export default TDTMapComp;

const showOtherlist = (type: number, list: unknown[]) => {
  switch (type) {
    case 2: {
      //解析推荐城市
      const l = list as Statistics["priorityCitys"];
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
