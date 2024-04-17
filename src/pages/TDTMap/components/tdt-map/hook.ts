import { useRef, useState } from "react";
import {
  Area,
  LineData,
  LocalSearch,
  LocalSearchResult,
  Pois,
  Statistics,
  Suggests,
} from "./@type/LocalSearch";
import { useForm } from "antd/es/form/Form";
import {
  Marker,
  TDTGeolocation,
  GeolocationResult,
  TDTMap,
  LngLat,
  GeocoderResult,
} from "./@type/TDT";
import { message } from "antd";
import { LocationProps } from ".";

let map: TDTMap;
let localSearch: LocalSearch;

type PoisType = Pois & { marker: Marker; winHtml: string };

export const useTDTMap = (value?: LocationProps) => {
  const [refreshList, setRefreshList] = useState<PoisType[]>([]);
  const [refreshHasMore, setRefreshHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [typeList, setTypeList] = useState(0);
  const otherList = useRef<unknown[]>([]);
  const [form] = useForm();
  const { longitude, latitude, address } = value ?? {};

  function onLoad() {
    const node = document.querySelector("#mapDiv");
    if (!node) {
      return;
    }
    //初始化地图对象
    map = new T.Map("mapDiv");
    //设置显示地图的中心点和级别
    const center = new T.LngLat(longitude ?? 116.40969, latitude ?? 39.89945);
    map.centerAndZoom(center, 12);

    const config = {
      pageCapacity: 10, //每页显示的数量
      onSearchComplete: localSearchResult, //接收数据的回调函数
    };
    //创建搜索对象
    localSearch = new T.LocalSearch(map, config);

    //创建地址解析对象
    const geocode = new T.Geocoder();
    map.addEventListener("click", function (e) {
      // 使用逆地理编码接口获得详细信息，用鼠标点击地图获得详细信息
      geocode.getLocation(e.lnglat, clickToGetAddressCallback(e.lnglat));
    });

    if (!!longitude && !!latitude && !!address) {
      // 组件传的props参数都有效时,就按传入参数进行渲染，否则就按定位显示
      setTypeList(1);
      setRefreshHasMore(false);
      const { list } = parseList([
        {
          address,
          name: "",
          lonlat: [longitude, latitude].join(","),
          phone: "",
          poiType: "",
        },
      ]);
      setRefreshList([...list]);
      return;
    }
    //创建定位对象
    const lo = new T.Geolocation();
    const getCurrentPositionCallback = function (
      this: TDTGeolocation,
      e: GeolocationResult | null
    ) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const tmp = this;
      if (!tmp || !e) {
        return;
      }
      if (tmp.getStatus() === 0) {
        map.centerAndZoom(e.lnglat, 15);
        const marker = new T.Marker(e.lnglat);
        map.addOverLay(marker);
      }
      if (tmp.getStatus() === 1) {
        map.centerAndZoom(e.lnglat, e?.level ?? 16);
        const marker = new T.Marker(e.lnglat);
        map.addOverLay(marker);
      }
    };
    lo.getCurrentPosition(getCurrentPositionCallback);

    // //创建比例尺控件对象
    // const scale = new T.Control.Scale();
    // //添加比例尺控件
    // map.addControl(scale);
  }

  function localSearchResult(result: LocalSearchResult) {
    const ResultType = parseInt(result.getResultType());
    setTypeList(ResultType);
    if (ResultType !== 1) {
      //清空地图及搜索列表
      map.clearOverLays();
      setRefreshHasMore(false);
      refreshList.forEach(({ marker }) => {
        marker.removeEventListener("click", () => void 0);
      });
    }

    // console.log({
    //   ResultType,
    //   getPois: result.getPois(),
    //   getStatistics: result.getStatistics(),
    //   getArea: result.getArea(),
    //   getSuggests: result.getSuggests(),
    //   getPrompt: result.getPrompt(),
    //   getLineData: result.getLineData(),
    // });

    //根据返回类型解析搜索结果
    switch (ResultType) {
      case 1:
        //解析点数据结果
        pois(result.getPois(), map);
        break;
      case 2:
        //解析推荐城市
        otherList.current = statistics(result.getStatistics(), map);
        break;
      case 3:
        //解析行政区划边界
        area(result.getArea(), map);
        break;
      case 4:
        //解析建议词信息
        otherList.current = suggests(result.getSuggests(), map);
        break;
      case 5:
        //解析公交信息
        otherList.current = lineData(result.getLineData(), map);
        break;
    }
    setLoading(false);
  }

  //解析点数据结果
  function pois(obj: false | Pois[], map?: TDTMap) {
    const total = localSearch.getCountNumber() ?? 0;
    const pageIndex = localSearch.getPageIndex();
    const countPage = localSearch.getCountPage();

    if (obj && map) {
      // 对于只有一页结果或处在第一页情况,都是新搜索结果
      if (pageIndex === 1) {
        //清空上一次的地图标注
        map.clearOverLays();
        refreshList.forEach(({ marker }) => {
          marker.removeEventListener("click", () => void 0);
        });
        const { zoomArr, list } = parseList(obj);
        //显示地图的最佳级别
        map.setViewport(zoomArr);
        setRefreshList([...list]);
        if (pageIndex === countPage) {
          setRefreshHasMore(false);
          return;
        }
      } else if (obj.length + refreshList.length > total) {
        setRefreshHasMore(false);
        return;
      }
      setRefreshHasMore(true);
      const { zoomArr, list } = parseList(obj);
      //显示地图的最佳级别
      map.setViewport(zoomArr);
      //显示搜索结果
      refreshList.push(...list);
      setRefreshList([...refreshList]);
    }
  }

  const onSearch = () => {
    if (loading) {
      return;
    }
    const val = form.getFieldValue("keyword");
    val && localSearch.search(val);
    setLoading(true);
  };

  const onLoadMore = () => {
    if (loading) {
      return;
    }
    localSearch?.nextPage();
    setLoading(true);
  };

  const destroy = () => {
    map?.clearOverLays();
    refreshList.forEach(({ marker }) => {
      marker.removeEventListener("click", () => void 0);
    });
    setRefreshHasMore(true);
    setRefreshList([]);
    form.resetFields();
    otherList.current = [];
    setTypeList(0);
  };

  const clickToGetAddressCallback = ({ lng, lat }: LngLat) => {
    return (result: GeocoderResult) => {
      if (result.getStatus() == 0) {
        console.log("详细信息如下：", result.getAddressComponent(), lng, lat);
        //清空地图及搜索列表
        map?.clearOverLays();
        setRefreshHasMore(false);
        setTypeList(1);
        refreshList.forEach(({ marker }) => {
          marker.removeEventListener("click", () => void 0);
        });
        const { list } = parseList([
          {
            address: result.getAddress(),
            name: "",
            lonlat: [lng, lat].join(","),
            phone: "",
            poiType: "",
          },
        ]);
        setRefreshList([...list]);
      } else {
        message.info("服务器返回状态：" + result.getStatus());
        message.info("服务器返回响应信息：" + result.getMsg());
      }
    };
  };

  return {
    refreshList,
    refreshHasMore,
    typeList,
    otherList,
    form,
    onLoad,
    onSearch,
    onLoadMore,
    destroy,
  };
};

//解析推荐城市
const statistics = (obj: false | Statistics, map?: TDTMap) => {
  if (obj && map) {
    return obj.priorityCitys;
  }
  return [];
};

//解析行政区划边界
const area = (obj: false | Area, map?: TDTMap) => {
  if (obj && map) {
    const pointsArr = [];
    const { points, lonlat } = obj;
    if (points) {
      for (const { region } of points) {
        const regionLngLats = [];
        const regionArr = region.split(",");
        for (const regionCoords of regionArr) {
          const [lng, lat] = regionCoords.split(" ");
          const lnglat = new T.LngLat(+lng, +lat);
          regionLngLats.push(lnglat);
          pointsArr.push(lnglat);
        }
        const line = new T.Polyline(regionLngLats, {
          color: "blue",
          weight: 3,
          opacity: 1,
          lineStyle: "dashed",
        });
        map.addOverLay(line);
      }
      map.setViewport(pointsArr);
    }
    if (lonlat) {
      const [lng, lat] = lonlat.split(",");
      map.panTo(new T.LngLat(+lng, +lat));
    }
  }
};

//解析建议词信息
const suggests = (obj: false | Suggests[], map?: TDTMap) => {
  if (obj && map) {
    // 建议词提示，如果搜索类型为公交规划建议词或公交站搜索时，返回结果为公交信息的建议词。
    return obj;
  }
  return [];
};

//解析公交信息
const lineData = (obj: false | LineData[], map?: TDTMap) => {
  if (obj && map) {
    return obj.map(({ name, stationNum }, idx) => {
      const lineDataHtml = `${name}   共${stationNum}站`;
      return { ...obj[idx], lineDataHtml };
    });
  }
  return [];
};

const parseList = (obj: Pois[]) => {
  //坐标数组，设置最佳比例尺时会用到
  const zoomArr: LngLat[] = [];
  const list = [];
  for (let i = 0; i < obj.length; i++) {
    //名称
    const name = obj[i].name;
    //地址
    const address = obj[i].address;
    //坐标
    const lnglatArr = obj[i].lonlat.split(",");
    const lnglat = new T.LngLat(+lnglatArr[0], +lnglatArr[1]);

    const winHtml = `名称:${name}<br/>地址:${address}`;
    //创建标注对象
    const marker = new T.Marker(lnglat);
    //地图上添加标注点
    map.addOverLay(marker);
    //注册标注点的点击事件
    const markerInfoWin = new T.InfoWindow(winHtml, {
      autoPan: true,
    });
    marker.addEventListener("click", () => {
      marker.openInfoWindow(markerInfoWin);
    });
    list.push({ ...obj[i], marker, winHtml });
    zoomArr.push(lnglat);
  }
  return { zoomArr, list };
};
