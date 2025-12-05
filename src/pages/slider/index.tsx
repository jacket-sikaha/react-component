import CircleSlider from '@/components/circle-slider';
import PieSlider from '@/components/pie-slider';
import { useState } from 'react';

function SliderPage() {
  const [sliderValue, setSliderValue] = useState(40);
  const [pieSliderValue, setPieSliderValue] = useState(5);
  return (
    <div className="w-screen justify-center h-full flex flex-col gap-10 items-center">
      <div className="flex justify-center items-center bg-white w-full h-80">
        <CircleSlider value={sliderValue} onChange={setSliderValue} />
      </div>
      <div className="flex justify-center items-center overflow-hidden">
        <PieSlider
          value={pieSliderValue}
          onChange={(v) => {
            console.log('v:', v);
            setPieSliderValue(v);
          }}
        />
      </div>
    </div>
  );
}

export default SliderPage;
