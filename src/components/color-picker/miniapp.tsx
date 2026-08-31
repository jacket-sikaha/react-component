import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DISC_BG,
  colorToPolar,
  parseColor,
  polarToColor,
  polarToXY,
  rgbToHex,
  rgbToHsl,
  xyToPolar,
  type ColorPickerProps,
  type ColorValue
} from './color-model';

/* ══════════════════════════════════════════════════════════════════
 *  ColorPicker(小程序兼容版)—— 不依赖 PointerEvent
 *
 *  与 Web 版(index.tsx)的差异只有「事件层」,颜色模型完全共用:
 *
 *  ┌──────────────┬──────────────────┬───────────────────────────┐
 *  │ 能力         │ Web 版           │ 小程序版(本文件)         │
 *  ├──────────────┼──────────────────┼───────────────────────────┤
 *  │ 按下         │ onPointerDown    │ onTouchStart              │
 *  │ 拖动         │ onPointerMove    │ onTouchMove               │
 *  │ 抬起         │ onPointerUp      │ onTouchEnd                │
 *  │ 取消         │ onPointerCancel  │ onTouchCancel             │
 *  │ 坐标         │ e.clientX/Y      │ e.touches[0].clientX/Y    │
 *  │ 抬起坐标     │ e.clientX/Y      │ e.changedTouches[0]       │
 *  │ 拖出圆外不丢 │ setPointerCapture│ touch 天然只跟手,touchend │
 *  │ 元素定位     │ getBoundingClientRect │ 注入 getRect(见下)    │
 *  └──────────────┴──────────────────┴───────────────────────────┘
 *
 *  【元素定位如何适配小程序】
 *  小程序没有 getBoundingClientRect,拿元素位置要用
 *  `wx.createSelectorQuery().select('.xxx').boundingClientRect()`。
 *  因此本组件暴露一个可选的 `getRect` prop,由宿主环境注入:
 *
 *      <MiniappColorPicker
 *        getRect={() => {
 *          // 小程序里这样取(以 Taro 为例):
 *          // return new Promise(resolve =>
 *          //   Taro.createSelectorQuery().select('#disc').boundingClientRect(r => resolve(r)).exec()
 *          // );
 *          // 简单同步写法示例:
 *          return { left: 100, top: 200 };
 *        }}
 *      />
 *
 *  不传 getRect 时,回退到 H5 的 getBoundingClientRect,便于 Web 端预览。
 *
 *  【阻止页面滚动】
 *  圆盘已加 `touch-action: none`(见 className),H5 下可阻止触摸滚动;
 *  原生小程序里若需要,可再在外层用 catchtouchmove 拦截冒泡。
 * ══════════════════════════════════════════════════════════════════ */

export interface MiniappColorPickerProps extends ColorPickerProps {
  /** 获取圆盘元素在页面/视口中的位置(left/top)。
   *  小程序端传入 createSelectorQuery 的实现;H5 端可不传。 */
  getRect?: () => { left: number; top: number } | null;
}

const MiniappColorPicker: React.FC<MiniappColorPickerProps> = ({
  size = 280,
  defaultColor = '#ff5252',
  onChange,
  onChangeComplete,
  className = '',
  showInfo = true,
  style,
  getRect
}) => {
  const discRef = useRef<HTMLDivElement | null>(null);
  const wasDraggingRef = useRef(false);

  // 惰性初始化:defaultColor → 极坐标 (hue, t)
  const [initial] = useState<{ hue: number; t: number }>(() => {
    const parsed = parseColor(defaultColor);
    if (!parsed) return { hue: 0, t: 1 };
    return colorToPolar(parsed.r, parsed.g, parsed.b);
  });
  const [hue, setHue] = useState<number>(initial.hue);
  const [distRatio, setDistRatio] = useState<number>(initial.t); // 0=中心,1=边缘
  const [isDragging, setIsDragging] = useState(false);

  const radius = size / 2;

  /* 解析圆盘元素位置:优先用注入的 getRect(小程序),否则回退 DOM API(H5) */
  const resolveRect = useCallback((): { left: number; top: number } | null => {
    if (getRect) return getRect();
    const el = discRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { left: rect.left, top: rect.top };
  }, [getRect]);

  /* touch 坐标(相对页面)→ 极坐标 */
  const updateFromTouch = useCallback(
    (clientX: number, clientY: number) => {
      const rect = resolveRect();
      if (!rect) return;
      const { hue: h, t } = xyToPolar(
        clientX - rect.left - radius,
        clientY - rect.top - radius,
        radius
      );
      setHue(h);
      setDistRatio(t);
    },
    [resolveRect, radius]
  );

  /* touch 事件:按下即定位,移动持续定位,抬起结束 */
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // 小程序 touchstart 里 touches 含当前手指
    const touch = e.touches.item(0);
    if (!touch) return;
    setIsDragging(true);
    updateFromTouch(touch.clientX, touch.clientY);
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const touch = e.touches.item(0);
    if (!touch) return;
    updateFromTouch(touch.clientX, touch.clientY);
  };
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    // 注意:touchend 时 e.touches 已为空,要用 changedTouches 取最后落点
    const touch = e.changedTouches.item(0);
    if (touch && isDragging) {
      updateFromTouch(touch.clientX, touch.clientY);
    }
    if (isDragging) setIsDragging(false);
  };

  /* 当前颜色:极坐标 → RGB,再由 RGB 反算真实 HSL 供外部使用 */
  const current = useMemo<ColorValue>(() => {
    const [r, g, b] = polarToColor(hue, distRatio);
    const [h, s, l] = rgbToHsl(r, g, b);
    return {
      r,
      g,
      b,
      h: Math.round(h * 10) / 10,
      s: Math.round(s * 1000) / 1000,
      l: Math.round(l * 1000) / 1000,
      hex: rgbToHex(r, g, b)
    };
  }, [hue, distRatio]);

  useEffect(() => {
    onChange?.(current);
  }, [current, onChange]);

  useEffect(() => {
    if (wasDraggingRef.current && !isDragging) {
      onChangeComplete?.(current);
    }
    wasDraggingRef.current = isDragging;
  }, [isDragging, current, onChangeComplete]);

  /* 圆环指示器位置:极坐标 → 圆心坐标 → 绝对定位 */
  const { x: indicatorX, y: indicatorY } = polarToXY(hue, distRatio, radius);

  const rgbText = `rgb(${current.r}, ${current.g}, ${current.b})`;

  /* ============== 渲染(全部 div + Tailwind) ============== */
  return (
    <div
      className={[
        'inline-flex select-none flex-col items-center gap-3',
        'font-sans text-[13px] text-slate-100',
        className
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: size + 24, ...style }}
    >
      {/* 圆盘 - 纯 div,背景用 DISC_BG 合成 */}
      <div
        ref={discRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className={[
          'relative cursor-crosshair touch-none rounded-full outline-none',
          'ring-1 ring-white/10',
          'shadow-[0_6px_18px_rgba(0,0,0,0.4)]'
        ].join(' ')}
        style={{ width: size, height: size, background: DISC_BG }}
      >
        {/* 白色圆环指示器 */}
        <div
          className={[
            'pointer-events-none absolute rounded-full border-2 border-white',
            'transition-[width,height,box-shadow] duration-75',
            isDragging
              ? 'h-[20px] w-[20px] shadow-[0_0_0_2px_rgba(77,171,247,0.6),0_4px_10px_rgba(0,0,0,0.5)]'
              : 'h-[18px] w-[18px] shadow-[0_2px_6px_rgba(0,0,0,0.45)]'
          ].join(' ')}
          style={{
            left: radius + indicatorX,
            top: radius + indicatorY,
            transform: 'translate(-50%, -50%)',
            backgroundColor: current.hex
          }}
        />
      </div>

      {/* 信息条 */}
      {showInfo && (
        <div
          className={[
            'flex items-center gap-2.5 px-2.5 py-2',
            'box-border w-full',
            'rounded-lg border border-slate-700 bg-slate-900'
          ].join(' ')}
        >
          <div
            className="h-7 w-7 shrink-0 rounded-md ring-1 ring-black/30"
            style={{ backgroundColor: current.hex }}
            aria-hidden
          />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="font-mono text-[13px] font-semibold tracking-wider text-slate-100">
              {current.hex.toUpperCase()}
            </div>
            <div className="font-mono text-[11px] tracking-tight text-slate-400">{rgbText}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniappColorPicker;
