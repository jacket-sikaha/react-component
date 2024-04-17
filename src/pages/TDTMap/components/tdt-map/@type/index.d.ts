// declare module "TDT" {
//   import { LocalSearch } from "./LocalSearch";
//   import { Geolocation, LngLat, Marker, Polyline, TDTMap } from "./lib";

//   export const Map: TDTMap;
//   export const LocalSearch: LocalSearch;
//   export const Geolocation: Geolocation;
//   export const LngLat: LngLat;
//   export const Marker: Marker;
//   export const Polyline: Polyline;
// }

// api url: http://lbs.tianditu.gov.cn/api/js4.0/class.html
declare namespace T {
  // import {
  //   TDTGeolocation,
  //   LngLat,
  //   Marker,
  //   Polyline,
  //   TDTMap,
  //   InfoWindow,
  //   Geocoder,
  // } from "./TDT";
  // import { LocalSearch } from "./LocalSearch";

  const Map: typeof import("./TDT").TDTMap;

  const Geolocation: typeof import("./TDT").TDTGeolocation;

  const Geocoder: typeof import("./TDT").Geocoder;

  const LngLat: typeof import("./TDT").LngLat;

  const Marker: typeof import("./TDT").Marker;

  const Polyline: typeof import("./TDT").Polyline;

  const LocalSearch: new (
    map: TDTMap,
    opt?: LocalSearchOptions
  ) => import("./LocalSearch").LocalSearch;

  const InfoWindow: new (
    container: string | HTMLElement,
    opt?: InfoWindowOptions
  ) => import("./TDT").InfoWindow;

  const Control: typeof import("./TDT").Control;
}
