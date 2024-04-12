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
  // import { LocalSearch } from "./LocalSearch";
  // import { TDTGeolocation, LngLat, Marker, Polyline, TDTMap } from "./lib";

  export const Map: new (
    container: string | HTMLElement,
    opt?: MapOptions
  ) => TDTMap;

  export const Geolocation: new () => TDTGeolocation;

  export const LngLat: new (lng: number, lat: number) => LngLat;

  export const Marker: new (lnglat: LngLat) => Marker;

  export const Polyline: new (
    points: Array<LngLat>,
    opt?: PolylineOptions
  ) => Polyline;

  export const LocalSearch: new (
    map: TDTMap,
    opt?: LocalSearchOptions
  ) => LocalSearch;

  export const InfoWindow: new (
    container: string | HTMLElement,
    opt?: InfoWindowOptions
  ) => InfoWindow;
}
