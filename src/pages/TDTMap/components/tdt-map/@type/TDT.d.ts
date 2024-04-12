export declare class TDTMap {
  constructor(container: string | HTMLElement, opt?: MapOptions);

  centerAndZoom(lnglat: LngLat, zoom: number);

  addOverLay(overlay: OverLay);

  setViewport(view: Array<LngLat>);

  panTo(lnglat: LngLat);

  clearOverLays(): void;
}

export declare class TDTGeolocation {
  getCurrentPosition: (
    callback: (res: GeolocationResult | null) => void,
    options?: TDTGeolocation
  ) => void;
  getStatus: () => number;
}

export declare class LngLat {
  constructor(lng: number, lat: number);
}

export declare class Marker {
  constructor(lnglat: LngLat);

  openInfoWindow(infowin: InfoWindow);

  addEventListener(event: string, handler: () => void);
  removeEventListener(event: string, handler: () => void);
}

export declare class Polyline {
  constructor(points: Array<LngLat>, opt?: PolylineOptions);
}

export declare class InfoWindow {
  constructor(container: string | HTMLElement, opt?: InfoWindowOptions);
}

export type LngLat = {
  lng: number;
  lat: number;
};

export type GeolocationResult = {
  lnglat: LngLat;
  accuracyNumber: number;
  level?: number;
};

type MapOptions = {
  // "EPSG:900913"	指定地图的投影方式，目前支持的地图投影方式有：EPSG:900913(墨卡托投影)，EPSG:4326(大地平面投影)。
  projection?: string;
  // 地图允许展示的最小级别。
  minZoom?: number;
  // 地图允许展示的最大级别。
  maxZoom?: number;
  // 当这个选项被设置后，地图被限制在给定的地理边界内，当用户平移将地图拖动到视图以外的范围时会出现弹回的效果，并且也不允许缩小视图到给定范围以外的区域（这取决于地图的尺寸）。使用setMaxBounds方法可以动态地设置这种约束。
  maxBounds?: any;
  // 地图的初始化中心点。
  center?: LngLat;
  // 地图的初始化级别。
  zoom?: number;
};

type PolylineOptions = {
  color: string; // 折线颜色。
  weight: number; // 折线的宽度，以像素为单位。
  opacity: number; // 折线的透明度（范围0-1 之间）
  lineStyle: string; // 拆线的样式（solid或dashed）
};

type InfoWindowOptions = {
  minWidth?: number; //	50	弹出框的最小宽度。
  maxWidth?: number; //	300	弹出框的最大宽度。
  maxHeight?: number; //	null	设置后，如果内容超过弹出窗口的给定高度则产生一个可以滚动的容器。
  autoPan?: boolean; //	false	是否开启信息窗口打开时地图自动移动（默认关闭）。
  closeButton?: boolean; //	true	控制弹出窗口中出现的关闭按钮。
  offset?: Point; //	Point(0, 7)	弹出窗口位置的补偿值。在同一图层中打开弹出窗口时对于控制锚点比较有用。
  autoPanPadding?: Point; //	Point(5, 5)	在地图视图自动平移产生后弹出窗口和地图视图之间的边缘。
  closeOnClick?: boolean; //	false	是否开启点击地图关闭信息窗口（默认关闭）。
};
