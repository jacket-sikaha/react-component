import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ArcSliderProps {
  min?: number;
  max?: number;
  step?: number;
  title?: string;
  defaultValue?: number;
  value?: number;
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
  value,
  size = 320,
  onChange
}: ArcSliderProps) {
  const range = Math.max(max - min, 0);
  const tickCount = step > 0 ? Math.floor(range / step) + 1 : 1;

  const [internalValue, setInternalValue] = useState(() => {
    if (range <= 0 || step <= 0) {
      return min;
    }

    const stepped = Math.round(((value || defaultValue) - min) / step) * step + min;

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

  const getPointerAngle = useCallback((clientX: number, clientY: number) => {
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
      const nextValue = angleToValue(getPointerAngle(clientX, clientY));

      setInternalValue((prev) => {
        if (prev !== nextValue) {
          onChange?.(nextValue);
        }

        return nextValue;
      });
    },
    [angleToValue, getPointerAngle, onChange]
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateValue(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) {
      updateValue(event.clientX, event.clientY);
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // 指针捕获可能已被浏览器释放，忽略即可
    }
  };

  const polarToCartesian = useCallback(
    (angleDeg: number, radius: number) => {
      const radians = (angleDeg * Math.PI) / 180;

      return {
        x: size / 2 + Math.cos(radians) * radius,
        y: size / 2 + Math.sin(radians) * radius
      };
    },
    [size]
  );

  const trackWidth = Math.max(4, size * 0.015);
  const ringSize = size * 0.76;
  const trackRadius = (ringSize - trackWidth) / 2;
  const currentAngle = valueToAngle(internalValue);
  const knobPosition = polarToCartesian(currentAngle, trackRadius);
  const progressAngle = range > 0 ? ((internalValue - min) / range) * SLIDER_ANGLE : 0;

  const ringBackground =
    progressAngle <= 0
      ? `conic-gradient(from ${START_ANGLE + 90}deg, #D8DEE8 0deg ${SLIDER_ANGLE}deg, transparent ${SLIDER_ANGLE}deg 360deg)`
      : `conic-gradient(from ${START_ANGLE + 90}deg, #83B7FF 0deg ${progressAngle}deg, #D8DEE8 ${progressAngle}deg ${SLIDER_ANGLE}deg, transparent ${SLIDER_ANGLE}deg 360deg)`;

  const ticks = useMemo(() => {
    return Array.from({ length: Math.max(tickCount, 1) }, (_, index) => {
      const tickValue = Math.min(min + index * step, max);
      const tickAngle = valueToAngle(tickValue);
      const position = polarToCartesian(tickAngle, trackRadius);

      return {
        value: tickValue,
        x: (position.x / size) * 100,
        y: (position.y / size) * 100
      };
    });
  }, [tickCount, min, step, max, valueToAngle, polarToCartesian, trackRadius, size]);

  useEffect(() => {
    if (!value) {
      return;
    }
    setInternalValue(value);
  }, [value]);

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label={title}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={internalValue}
      aria-valuetext={`${internalValue} / ${max}`}
      className="relative touch-none select-none outline-none"
      style={{
        width: size,
        height: size
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* 浅色圆盘 */}
      <div
        className="absolute inset-0 rounded-full bg-white shadow-[0_18px_40px_rgba(0,0,0,0.08)]
          ring-1 ring-slate-200/70"
      />

      {/* 细轨道 + 蓝色进度：conic-gradient 圆环，无 SVG */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: ringSize,
          height: ringSize,
          background: ringBackground
        }}
      >
        <div
          className="absolute rounded-full bg-white"
          style={{
            top: trackWidth,
            right: trackWidth,
            bottom: trackWidth,
            left: trackWidth
          }}
        />
      </div>

      {/* 10 个档位点 */}
      {ticks.map((tick) => (
        <div
          key={tick.value}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${tick.x}%`,
            top: `${tick.y}%`,
            width: Math.max(5, size * 0.016),
            height: Math.max(5, size * 0.016),
            background: tick.value <= internalValue ? '#83B7FF' : '#C8D0DC'
          }}
        />
      ))}

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
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xl text-black">{value}</div>
        <span className="mt-2 text-sm font-medium text-slate-500">{title}</span>
      </div>
    </div>
  );
}
