export declare class LocalSearch {
  constructor(map: TDTMap, opt?: LocalSearchOptions);
  // 搜索类型,1表示普通搜索;2表示视野内搜索;4表示普通建议词搜索;5表示公交规划建议词搜索;7表示 纯地名搜索(不搜公交线）;10表示拉框搜索
  search(keyword: string, type?: number);
  setSearchCompleteCallback(fun: LocalSearchOptions["onSearchComplete"]);

  getPageCapacity: () => number; //	返回每页容量。
  firstPage: () => void; //	检索第一页。
  nextPage: () => void; //	检索下一页
  previousPage: () => number; //	检索上一页。
  lastPage: () => void; //	检索最后一页。
  getCountNumber: () => number; //	返回总记录数。
  getCountPage: () => number; //	返回共分总页数。
  getPageIndex: () => number; //	返回当前页。
}

type LocalSearchOptions = {
  pageCapacity: number; // 每页容量
  onSearchComplete: (res: LocalSearchResult) => void; // 检索结束后的回调函数。
};

export type LocalSearchResult = {
  getResultType: () => string;
  getPois: () => Pois[] | false;
  getStatistics: () => Statistics | false;
  getArea: () => Area | false;
  getSuggests: () => Suggests[] | false;
  getPrompt: () => Prompt | false;
  getLineData: () => LineData[] | false;
};

type Pois = {
  phone: string; //电话
  lonlat: string; //坐标
  address: string; //地址
  name: string; //Poi点名称
  poiType: string; //poi类型（102表示公交站，普通poi 该参数可以不返回）
};

type Statistics = {
  priorityCitys: Region[]; //推荐显示城市
  keyword: string; //搜索的关键字
  countryCount: number; //搜索的国家数量
  citysCount: number; //搜索的城市数量
  allAdmins: Region[]; //各省包含信息集合
};

type Region = {
  count: string; //统计数量
  name: string; //城市名称
  adminName: string; //城市名称
  adminCode: number; //城市国标码
  childAdmins?: Region[]; //包括各市级集合
  lonlat?: string;
};

type Area = {
  level: string; //显示级别
  lonlat: string; //定位中心点坐标
  name: string; //名称
  points?: {
    region: string;
  }[]; //行政区边界坐标
  type: "1" | "2"; //1表示正常区域，2表示特殊区域
};

type Suggests = {
  address: string; //地址
  name: string; //名称
  gbCode: string; //国标码
};

type Prompt = (
  | {
      keyword: string; //关键字
      admins: {
        name: string; //搜索的行政区范围
        adminCode: number; //行政区码
      }[];
      type: 1 | 2;
    }
  | {
      admins: {
        name: string; //搜索的行政区范围
        adminCode: number; //行政区码
      }[];
      type: 3 | 4;
    }
)[];

type LineData = {
  poiType: string; // poi点的poi类型（poiType =102表示公交站，其它值表示普通poi）
  stationNum: string; //站数
  name: string; //线路名称
  uuid: string; //线路的id
};
