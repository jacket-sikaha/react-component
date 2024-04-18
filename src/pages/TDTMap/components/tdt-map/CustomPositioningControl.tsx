import LocationSearchingOutlinedIcon from "@mui/icons-material/LocationSearchingOutlined";
import { useEffect, useRef, useState } from "react";
import { GeolocationResult, TDTGeolocation, TDTMap } from "./@type/TDT";
import { ControlPosition } from "./@type/enum";

const customControl = new T.Control({
  position: ControlPosition.T_ANCHOR_BOTTOM_LEFT,
});
const lo = new T.Geolocation();

// 自定义控件采用react实现方式
export default function CustomPositioningControl(props: {
  map: TDTMap | undefined;
}) {
  const { map } = props;
  const [showBasic, setShowBasic] = useState(false);
  const locationSearching = useRef<HTMLDivElement>(null);
  //创建定位对象
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
      map?.centerAndZoom(e.lnglat, 15);
      const marker = new T.Marker(e.lnglat);
      map?.addOverLay(marker);
    }
    if (tmp.getStatus() === 1) {
      map?.centerAndZoom(e.lnglat, e?.level ?? 16);
      const marker = new T.Marker(e.lnglat);
      map?.addOverLay(marker);
    }
  };

  useEffect(() => {
    map?.addEventListener("addcontrol", (e) => {
      // 控件加载完成再显示
      setShowBasic(true);
    });
    customControl.onAdd = function () {
      this.buttonControl = locationSearching.current as HTMLDivElement;
      this.buttonControl.onclick = (e) => {
        // 这种事件注册方式才能比map的点击事件先执行，不然无法通过stopPropagation阻止冒泡
        e.stopPropagation();
        lo.getCurrentPosition(getCurrentPositionCallback);
      };
      return this.buttonControl;
    };
    customControl.onRemove = function () {
      if (this.buttonControl) this.buttonControl.onclick = null;
      // 移除控件时要释放，map调用removeControl方法时才会执行
      delete this.buttonControl;
    };
    map?.addControl(customControl);

    return () => {
      setShowBasic(false);
      map?.removeControl(customControl);
      map?.removeEventListener("addcontrol", () => void 0);
    };
  }, [map]); // 每次visible改变，map也会跟着变化，保证使用最新的map值创建控件

  return (
    <div
      className={`rounded-lg bg-white p-1 border cursor-pointer max-w-fit my-2 mx-3 ${
        showBasic ? "visible" : "invisible"
      }`}
      ref={locationSearching}
      //   onClick={(e) => {
      //     e.stopPropagation();
      // 这种方式貌似是等组件完全加载完毕再注册事件，因此在初始化map的时候就注册的点击事件执行后他才执行
      //     lo.getCurrentPosition(getCurrentPositionCallback);
      //   }}
    >
      <LocationSearchingOutlinedIcon color="primary" />
    </div>
  );
}
