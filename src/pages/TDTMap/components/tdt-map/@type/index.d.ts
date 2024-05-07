import { LocalSearch } from './LocalSearch';
import {
    Control,
    Geocoder,
    InfoWindow,
    LngLat,
    Marker,
    Polyline,
    TDTGeolocation,
    TDTMap
} from './TDT';

// api url: http://lbs.tianditu.gov.cn/api/js4.0/class.html
declare global {
    declare namespace T {
        export const Map: new (container: string | HTMLElement, opt?: MapOptions) => TDTMap;

        export const Geolocation: new () => TDTGeolocation;

        export const Geocoder: new () => Geocoder;

        export const LngLat: new (lng: number, lat: number) => LngLat;

        export const Marker: new (lnglat: LngLat) => Marker;

        export const Polyline: new (points: Array<LngLat>, opt?: PolylineOptions) => Polyline;

        export const LocalSearch: new (map: TDTMap, opt?: LocalSearchOptions) => LocalSearch;

        export const InfoWindow: new (
            container: string | HTMLElement,
            opt?: InfoWindowOptions
        ) => InfoWindow;

        export const Control: new ({ position }: { position: ControlPosition }) => Control;
    }
}
