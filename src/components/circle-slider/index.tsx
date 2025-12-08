import { useEffect, useRef, useState } from 'react';

function CircleSlider({ value = 50, min = 30, max = 60, onChange = (v) => {} }) {
  const [position, setPosition] = useState({
    dx: 0,
    dy: 0
  });
  const [flag, setFlag] = useState(false);
  const startPos = useRef({
    dx: 0,
    dy: 0
  });
  const [radius, setRadius] = useState(0);
  const [center, setCenter] = useState(0);
  const [percent, setPercent] = useState(0);

  const InitialRadian = Math.PI * 0.6;

  const angleRadians2Percent = (rawAngleRadians: number) => {
    if (rawAngleRadians > InitialRadian) {
      return (rawAngleRadians - InitialRadian) / (Math.PI * 2);
    }
    return (Math.PI + Math.PI * (1 - 0.6) + rawAngleRadians) / (Math.PI * 2);
  };

  useEffect(() => {
    const slider = document.querySelector('.slider')?.getBoundingClientRect();
    const sliderBall = document.querySelector('.slider__ball')?.getBoundingClientRect();
    if (!slider || !sliderBall) {
      return;
    }
    const radius = slider.width / 2;
    const center = radius - sliderBall.width / 2;
    setRadius(() => radius);
    setCenter(() => center);
    const percent = (Math.max(value, min) - min) / (max - min);
    const radian = InitialRadian + percent * Math.PI * 2 * 0.9;
    console.log('radian:', angleRadians2Percent(radian), percent / 100);
    setPosition({
      dx: Math.round(radius + radius * Math.cos(radian)),
      dy: Math.round(radius + radius * Math.sin(radian))
    });
    setPercent(() => Math.round(angleRadians2Percent(radian) * 100));
  }, [value]);

  const handleMove = (dxTemp: number, dyTemp: number) => {
    if (!flag) return;
    // 计算拖动的弧度值
    const rawAngleRadians = Math.atan2(dyTemp - center, dxTemp - center);
    console.log('rawAngleRadians:', rawAngleRadians);
    const percent = angleRadians2Percent(rawAngleRadians);
    if (percent >= 0.9) {
      return;
    }
    setPercent(() => Math.round(percent * 100));
    // 根据角度和半径计算新的位置
    setPosition({
      dx: Math.round(radius + radius * Math.cos(rawAngleRadians)),
      dy: Math.round(radius + radius * Math.sin(rawAngleRadians))
    });
  };
  const handleMoveEnd = () => {
    setFlag(false);
    onChange(Math.round(((max - min) / 90) * percent + min));
  };

  return (
    <>
      <div className="relative flex items-center justify-center rounded-full p-6 shadow-[0_0_2rem_#f97316]">
        <div className="relative box-border flex size-56 justify-center overflow-hidden rounded-full p-2">
          <div
            className="slider z-20 flex size-full items-center justify-center rounded-full border-2 border-[#757575]"
            onTouchStart={(e) => {
              setFlag(true);
              startPos.current = {
                dx: e.touches[0].clientX - position.dx,
                dy: e.touches[0].clientY - position.dy
              };
            }}
            onTouchMove={(e) => {
              const dxTemp = e.touches[0].clientX - startPos.current.dx;
              const dyTemp = e.touches[0].clientY - startPos.current.dy;
              handleMove(dxTemp, dyTemp);
            }}
            onTouchEnd={handleMoveEnd}
            onMouseDown={(e) => {
              setFlag(true);
              startPos.current = {
                dx: e.clientX - position.dx,
                dy: e.clientY - position.dy
              };
            }}
            onMouseMove={(e) => {
              const dxTemp = e.clientX - startPos.current.dx;
              const dyTemp = e.clientY - startPos.current.dy;
              handleMove(dxTemp, dyTemp);
            }}
            onMouseUp={handleMoveEnd}
          >
            <div
              className="slider__ball border-solid absolute left-0 top-0 size-4 rounded-full border-2 bg-white"
              style={{
                transform: `translate3d(${position.dx}px, ${position.dy}px, 0)`
              }}
            />

            <div className="percent flex flex-col items-center gap-3 text-white">
              <div className="text-xl">设置温度</div>
              <div className="text-4xl font-bold">{value} ℃</div>
            </div>
          </div>
          <div className="overlay absolute bottom-4 left-4 right-4 top-4 z-10 rounded-full bg-gradient-to-tl from-[#f97b2c] to-[#f6b25e]"></div>
          <div
            className="half__1 absolute origin-[50%_100%] left-0 top-0 z-[1] h-1/2 w-full bg-[#fa853c]"
            style={{
              transform: `rotate(${(0.6 - 1) * 180}deg)`
            }}
          ></div>
          <div
            className="half__2 origin-[50%_100%] absolute left-0 top-0 z-[2] h-1/2 w-full"
            style={{
              backgroundColor: percent / 100 > 0.5 ? '#fa853c' : 'white',
              transform: `rotate(${(percent / 100 > 0.5 ? (360 * percent) / 100 - 180 : (360 * percent) / 100) + (0.6 - 1) * 180}deg)`
            }}
          ></div>
        </div>
        {/* <img
          className="absolute top-10 size-56 rotate-180 object-contain opacity-80"
          src={'../../assets/water.png'}
          alt=""
        /> */}
        {flag && (
          // 整合滚动条只有0.9的长度来显示0-100%
          <div className="absolute -top-20 z-50 flex size-14 items-center justify-center rounded-md border-2 bg-white text-xl text-black">
            {Math.round(((max - min) / 90) * percent + min)}℃
          </div>
        )}
      </div>
    </>
  );
}

export default CircleSlider;
