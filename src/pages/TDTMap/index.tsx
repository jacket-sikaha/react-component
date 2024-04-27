import { useRef, useState } from "react";
import TDTMapComp from "./components/tdt-map";
import { Cell } from "@nutui/nutui-react";
import { Form } from "antd";
import TDTMapInput from "./components/address-input";

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
        value={{
          address: "灯湖东路20号保利MALL首层",
          latitude: 23,
          longitude: 113,
        }}
        visible={showBasic}
        onClose={() => {
          setShowBasic(false);
        }}
        onChange={(val) => {
          console.log(val);
        }}
      />
      {/*  解决html的form元素嵌套问题  */}
      {/* 就是以类似图表库组件挂载形式，将内容放在和最外层form没有嵌套关系的div即可 */}
      {/* <form>
          <div>
            <form>
              <input />
            </form>
          </div>
      </form> */}
      <div>组件要挂载的目标dom</div>
      <div id="divRef" />
      <Form
        onValuesChange={(changedValues) => {
          console.log("val", changedValues);
        }}
      >
        <Form.Item label="详细地址" name="address">
          <TDTMapInput component={"divRef"} />
        </Form.Item>
      </Form>
    </div>
  );
}

export default TDTMapPage;
