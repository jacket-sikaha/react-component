import { useState } from "react";
import TDTMapComp, { LocationProps } from "../tdt-map";
import { Input } from "antd";
import { LocalActivityOutlined } from "@mui/icons-material";
import ReactDOM from "react-dom";

export type TDTMapInputProps = {
  value?: LocationProps;
  onChange?: (val: LocationProps) => void;
  component: string | null;
};

function TDTMapInput({ value, onChange, component }: TDTMapInputProps) {
  const { longitude, latitude, address } = value ?? {};
  const [showBasic, setShowBasic] = useState(false);

  const divRef = component ? document.querySelector("#divRef") : null;
  return (
    <>
      <div className="flex items-center">
        <Input
          type="text"
          onChange={(address) =>
            onChange?.({ address: address.target.value, longitude, latitude })
          }
        />
        <LocalActivityOutlined
          className="text-base"
          onClick={() => {
            setShowBasic(true);
          }}
        />
      </div>
      {showBasic &&
        divRef &&
        ReactDOM.createPortal(
          <TDTMapComp
            value={value}
            visible={showBasic}
            onClose={() => {
              setShowBasic(false);
            }}
            onChange={onChange}
          />,
          divRef
        )}
    </>
  );
}

export default TDTMapInput;
