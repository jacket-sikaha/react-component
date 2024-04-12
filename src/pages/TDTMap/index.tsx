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
