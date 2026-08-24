import React, { useCallback, useMemo, useRef, useState } from 'react';
interface ArcSliderProps {
  min?: number;
  max?: number;
  step?: number;
  title?: string;
  defaultValue?: number;
  size?: number;
  onChange?: (value: number) => void;
}
/** 固定 270° 扇形，不使用 SVG */
const SLIDER_ANGLE = 270;
const START_ANGLE = 270 - SLIDER_ANGLE / 2;
const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};
const normalizeAngle = (angle: number) => {
  let result = angle % 360;
  if (result < 0) {
    result += 360;
  }
  return result;
};
export default function ArcSlider({
  min = 0,
  max = 9,
  step = 1,
  title = '雾量',
  defaultValue = min,
  size = 320,
  onChange
}: ArcSliderProps) {
  const range = Math.max(max - min, 0);
  const tickCount = step > 0 ? Math.floor(range / step) + 1 : 1;
  const [value, setValue] = useState(() => {
    if (range <= 0 || step <= 0) {
      return min;
    }
    const stepped = Math.round((defaultValue - min) / step) * step + min;
    return clamp(stepped, min, max);
  });
  const draggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const valueToAngle = useCallback(
    (current: number) => {
      if (range <= 0) {
        return START_ANGLE;
      }
      const ratio = clamp((current - min) / range, 0, 1);
      return START_ANGLE + ratio * SLIDER_ANGLE;
    },
    [min, range]
  );
  const angleToValue = useCallback(
    (currentAngle: number) => {
      if (range <= 0 || step <= 0) {
        return min;
      }
      const relativeAngle = clamp(normalizeAngle(currentAngle - START_ANGLE), 0, SLIDER_ANGLE);
      const rawValue = min + (relativeAngle / SLIDER_ANGLE) * range;
      const stepped = Math.round((rawValue - min) / step) * step + min;
      return clamp(stepped, min, max);
    },
    [min, max, range, step]
  );
  const getTouchAngle = useCallback((clientX: number, clientY: number) => {
    const element = containerRef.current;
    if (!element) {
      return 0;
    }
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    return normalizeAngle((Math.atan2(dy, dx) * 180) / Math.PI);
  }, []);
  const updateValue = useCallback(
    (clientX: number, clientY: number) => {
      const nextValue = angleToValue(getTouchAngle(clientX, clientY));
      setValue((prev) => {
        if (prev !== nextValue) {
          onChange?.(nextValue);
        }
        return nextValue;
      });
    },
    [angleToValue, getTouchAngle, onChange]
  );
  const getTouchPoint = (event: React.TouchEvent<HTMLDivElement>) => {
    return event.touches[0] || event.changedTouches[0];
  };
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    const touch = getTouchPoint(event);
    if (touch) {
      updateValue(touch.clientX, touch.clientY);
    }
  };
  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!draggingRef.current) {
      return;
    }
    const touch = getTouchPoint(event);
    if (touch) {
      updateValue(touch.clientX, touch.clientY);
    }
  };
  const handleTouchEnd = () => {
    draggingRef.current = false;
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let nextValue: number | null = null;
    if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
      nextValue = value - step;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
      nextValue = value + step;
    }
    if (event.key === 'Home') {
      nextValue = min;
    }
    if (event.key === 'End') {
      nextValue = max;
    }
    if (nextValue === null) {
      return;
    }
    event.preventDefault();
    const clamped = clamp(nextValue, min, max);
    const stepped = step > 0 ? Math.round((clamped - min) / step) * step + min : min;
    setValue((prev) => {
      if (prev !== stepped) {
        onChange?.(stepped);
      }
      return stepped;
    });
  };
  const polarToCartesian = useCallback(
    (angleDeg: number, radius: number) => {
      const radians = (angleDeg * Math.PI) / 180;
      return { x: size / 2 + Math.cos(radians) * radius, y: size / 2 + Math.sin(radians) * radius };
    },
    [size]
  );
  const trackWidth = Math.max(4, size * 0.015);
  const ringSize = size * 0.94;
  const trackRadius = (ringSize - trackWidth) / 2;
  const tickLength = Math.max(9, size * 0.08);
  const tickWidth = Math.max(3, size * 0.04);
  const currentAngle = valueToAngle(value);
  const knobPosition = polarToCartesian(currentAngle, trackRadius);
  const progressAngle = range > 0 ? ((value - min) / range) * SLIDER_ANGLE : 0;
  const ringBackground =
    progressAngle <= 0
      ? `conic-gradient(from ${START_ANGLE + 90}deg, #D8DEE8 0deg ${SLIDER_ANGLE}deg, transparent ${SLIDER_ANGLE}deg 360deg)`
      : `conic-gradient(from ${START_ANGLE + 90}deg, #83B7FF 0deg ${progressAngle}deg, #D8DEE8 ${progressAngle}deg ${SLIDER_ANGLE}deg, transparent ${SLIDER_ANGLE}deg 360deg)`;
  const ticks = useMemo(() => {
    return Array.from({ length: Math.max(tickCount, 1) }, (_, index) => {
      const tickValue = Math.min(min + index * step, max);
      const tickAngle = valueToAngle(tickValue);
      const position = polarToCartesian(tickAngle, trackRadius - tickLength / 2);
      return {
        value: tickValue,
        angle: tickAngle,
        x: (position.x / size) * 100,
        y: (position.y / size) * 100
      };
    });
  }, [tickCount, min, step, max, valueToAngle, polarToCartesian, trackRadius, tickLength, size]);
  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label={title}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value} / ${max}`}
      className="relative select-none touch-none outline-none"
      style={{ width: size, height: size }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onKeyDown={handleKeyDown}
    >
      {/* 浅色圆盘 */}
      <div
        className="absolute inset-0 rounded-full bg-white shadow-[0_18px_40px_rgba(0,0,0,0.08)]
          ring-1 ring-slate-200/70"
      />
      {/* 细轨道 + 蓝色进度：conic-gradient 圆环，无 SVG */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ width: ringSize, height: ringSize, background: ringBackground }}
      >
        <div
          className="absolute rounded-full bg-white"
          style={{ top: trackWidth, right: trackWidth, bottom: trackWidth, left: trackWidth }}
        />
      </div>
      {/* 档位刻度：沿半径向内延伸 */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ width: ringSize * 0.94, height: ringSize * 0.94 }}
      >
        {ticks.map((tick) => (
          <div
            key={tick.value}
            className="absolute"
            style={{
              left: `${tick.x}%`,
              top: `${tick.y}%`,
              width: tickLength,
              height: tickWidth,
              transform: `translate(-50%, -50%) rotate(${tick.angle}deg)`,
              background: tick.value <= value ? '#83B7FF' : '#C8D0DC',
              borderRadius: Math.max(1, tickWidth / 2)
            }}
          />
        ))}
      </div>
      {/* 滑动圆钮 */}
      <div
        className="pointer-events-none absolute z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2
          rounded-full border-[3px] border-[#83B7FF] bg-white shadow-[0_4px_10px_rgba(0,0,0,0.18)]"
        style={{
          left: `${(knobPosition.x / size) * 100}%`,
          top: `${(knobPosition.y / size) * 100}%`
        }}
      />
      {/* 中间内容：只显示标题，不显示档位数字 */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
      >
        <div className="text-xl text-black">{value}</div>
        <span className="mt-2 text-sm font-medium text-slate-500">{title}</span>
      </div>
    </div>
  );
}
