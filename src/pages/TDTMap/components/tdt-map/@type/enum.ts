// 写在声明文件里的enum将只能作为类型使用，无法作为变量使用会报错
export enum ControlPosition {
    T_ANCHOR_TOP_LEFT = 'topleft',
    T_ANCHOR_TOP_RIGHT = 'topright',
    T_ANCHOR_BOTTOM_LEFT = 'bottomleft',
    T_ANCHOR_BOTTOM_RIGHT = 'bottomright' //控件将定位到地图的右下角。
}
