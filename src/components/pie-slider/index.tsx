import { useCallback, useEffect, useRef, useState } from 'react';

function PieSlider({ value = 0, onChange = (val: number) => {} }) {
  const _mode = ['mode1', 'mode2', 'mode3', 'mode4', 'mode5', 'mode6'].map((str, index) => {
    return { label: str, value: index };
  });
  const getY = (x: number) =>
    -((x - rectRef.current.width / 2) * (x - rectRef.current.width / 2)) / 500;
  const [position, setPosition] = useState(() =>
    new Array(6).fill({
      dx: 0,
      dy: 0
    })
  );
  const flagRef = useRef(false);
  const startPos = useRef(position.slice());

  const startX = useRef(0);
  const rectRef = useRef({
    width: 0,
    height: 0
  });
  const [movementDistance, setMovementDistance] = useState(0);
  const curVal = value - movementDistance;

  const renderPie = useCallback(() => {
    const tmp = _mode.findIndex((item) => item.value === value);
    console.log('tmp:', tmp);
    console.log(' _mode[tmp]111111111:', _mode[tmp]);
    const res = _mode.map((item, index) => ({
      dx: (rectRef.current.width / 4) * (index + Math.abs(tmp - 2) * Math.pow(-1, tmp > 2 ? 1 : 0)),
      dy: getY(
        (rectRef.current.width / 4) * (index + Math.abs(tmp - 2) * Math.pow(-1, tmp > 2 ? 1 : 0))
      )
    }));
    setPosition(() => res);
  }, [value]);

  useEffect(() => {
    const pieSliderRect = document.querySelector('.pie-slider')?.getBoundingClientRect();
    const thumbRect = document.querySelector('.pie-slider-thumb')?.getBoundingClientRect();
    if (!pieSliderRect || !thumbRect) {
      return;
    }
    rectRef.current = {
      width: Math.round(pieSliderRect.width - thumbRect.width),
      height: Math.round(pieSliderRect.height - thumbRect.height)
    };
    renderPie();
  }, [renderPie, value]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-2xl">
        movementDistance:{movementDistance < 0 ? '向左' : '向右'}
        {Math.abs(movementDistance)}
      </div>
      <div className="text-2xl text-center">
        <div>curVal:{_mode[curVal].label}</div>
        <div>index:{curVal}</div>
      </div>
      <div
        className="pie-slider relative h-36 w-screen border-2"
        onTouchStart={(e) => {
          flagRef.current = true;
          startPos.current = position.map((item) => {
            return {
              dx: e.touches[0].clientX - item.dx,
              dy: e.touches[0].clientY - item.dy
            };
          });
          startX.current = e.touches[0].clientX;
        }}
        onTouchMove={(e) => {
          console.log('e.touches[0].clientX:', e.touches[0].clientX);

          if (!flagRef.current) return;
          const dxTemp = position.map((item, idx) => {
            return {
              dx: e.touches[0].clientX - startPos.current[idx].dx,
              dy: e.touches[0].clientY - startPos.current[idx].dy
            };
          });
          const move = Math.round(
            (e.touches[0].clientX - startX.current) / rectRef.current.width / 0.25
          );
          //  根据当前值的位置判断移动距离是否超出范围
          const idx = _mode.findIndex((item) => item.value === value);
          if ((move > idx && move > 0) || (_mode.length - 1 - idx + move < 0 && move < 0)) {
            setMovementDistance(() => (move > 0 ? idx : _mode.length - 1 - idx));
            flagRef.current = false;
            return;
          }
          setMovementDistance(move);
          setPosition(() =>
            dxTemp.map((item) => ({
              dx: item.dx,
              dy: getY(item.dx)
            }))
          );
        }}
        onTouchEnd={(e) => {
          console.log('onTouchEnd:');
          flagRef.current = false;
          onChange(_mode[curVal].value);
          setMovementDistance(0);
          renderPie();
        }}
      >
        {position.map((item, index) => (
          <div
            key={index}
            className="pie-slider-thumb absolute bottom-0 left-0 right-0 size-16 border bg-red-300"
            style={{
              transform: `translate3d(${item.dx}px, ${item.dy}px, 0)`,
              visibility: item !== undefined ? 'visible' : 'hidden'
            }}
          >
            <div className="flex h-full flex-col items-center justify-center">
              <svg
                className="size-6"
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                >
                  <path d="M20.925 13.163A8.998 8.998 0 0 0 12 3a9 9 0 0 0 0 18M9 10h.01M15 10h.01" />
                  <path d="M9.5 15c.658.64 1.56 1 2.5 1s1.842-.36 2.5-1m.5 4l2 2l4-4" />
                </g>
              </svg>
              <div className="text-center">{_mode[index].label}</div>
            </div>
          </div>
        ))}
        <div className="absolute flex h-full w-full justify-center">
          <div
            className="h-full w-24 bg-blue-400 opacity-70"
            style={{ clipPath: 'polygon(20% 30%, 80% 30%, 100% 100%, 0% 100%)' }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default PieSlider;
