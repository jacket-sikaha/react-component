import { useState } from "react";
import TDTMapComp from "./components/tdt-map";
import { Cell } from "@nutui/nutui-react";

function TDTMapPage() {
  const [showBasic, setShowBasic] = useState(false);
  return (
    <div className="w-full p-2">
      <Cell
        title="展示弹出层"
        onClick={() => {
          setShowBasic(true);
        }}
      />
      <TDTMapComp
        // value={{
        //   address: "灯湖东路20号保利MALL首层1S106",
        //   latitude: 23,
        //   longitude: 113,
        // }}
        visible={showBasic}
        onClose={() => {
          setShowBasic(false);
        }}
        onChange={(val) => {
          console.log(val);
        }}
      />
    </div>
  );
}

export default TDTMapPage;
