import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/* ══════════════════════════════════════════════════════════════════
 *  一、颜色基础工具(纯函数,无副作用)
 * ══════════════════════════════════════════════════════════════════ */

/** HSL → RGB。h: 0..360, s/l: 0..1,返回 0..255 整数 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hh = (((h % 360) + 360) % 360) / 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hh * 6) % 2) - 1));
  const m = l - c / 2;
  let r1 = 0,
    g1 = 0,
    b1 = 0;
  if (hh < 1 / 6) {
    r1 = c;
    g1 = x;
  } else if (hh < 2 / 6) {
    r1 = x;
    g1 = c;
  } else if (hh < 3 / 6) {
    g1 = c;
    b1 = x;
  } else if (hh < 4 / 6) {
    g1 = x;
    b1 = c;
  } else if (hh < 5 / 6) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }
  return [Math.round((r1 + m) * 255), Math.round((g1 + m) * 255), Math.round((b1 + m) * 255)];
}

/** RGB → #rrggbb */
function rgbToHex(r: number, g: number, b: number): string {
  const f = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
}

/** RGB → HSL。h: 0..360, s/l: 0..1 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0,
    s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      case bn:
        h = (rn - gn) / d + 4;
        break;
      default:
        break;
    }
    h *= 60;
  }
  return [h, s, l];
}

/** 解析默认色字符串,支持 #rgb / #rrggbb / rgb(r,g,b) */
function parseColor(input?: string): { r: number; g: number; b: number } | null {
  if (!input) return null;
  const s = input.trim();
  const hexMatch = s.match(/^#([0-9a-f]{3,8})$/i);
  if (hexMatch) {
    let hh = hexMatch[1];
    if (hh.length === 3)
      hh = hh
        .split('')
        .map((c) => c + c)
        .join('');
    if (hh.length >= 6) {
      return {
        r: parseInt(hh.slice(0, 2), 16),
        g: parseInt(hh.slice(2, 4), 16),
        b: parseInt(hh.slice(4, 6), 16)
      };
    }
  }
  const rgbMatch = s.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(/[,/ ]+/).map((p) => p.trim());
    if (parts.length >= 3) {
      const r = Number(parts[0]);
      const g = Number(parts[1]);
      const b = Number(parts[2]);
      if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
        return { r, g, b };
      }
    }
  }
  return null;
}

/* ══════════════════════════════════════════════════════════════════
 *  二、圆盘颜色模型(核心)—— 让「视觉」与「取色」严格一致
 * ══════════════════════════════════════════════════════════════════
 *
 *  【为什么之前会对不上】
 *  之前取色用 HSL(h,1,L) 计算,但 CSS 视觉是「径向白叠加圆锥彩虹」的
 *  RGB 线性混合,两套数学不一样,圆环颜色自然和背景错位。
 *
 *  【本模型的做法】
 *  圆盘上任意一点的颜色,统一用「纯色 + 按比例混白」定义:
 *
 *      color(p) = mix( white, HSL(hue,1,0.5), alpha(dist) )
 *              = alpha * (255,255,255) + (1-alpha) * 纯色
 *
 *  - hue   由「角度」决定,来自 conic-gradient(彩虹环)
 *  - alpha 由「离中心的距离」决定,来自 radial-gradient(中心白 → 边缘透明)
 *
 *  关键点:CSS 的 conic / radial 渐变停色点,和下面这段 JS 用
 *  *同一份数据 + 同一套插值算法* 生成,所以两者永远严格一致。
 * ══════════════════════════════════════════════════════════════════ */

/** 色相环主色(按 conic 顺时针顺序,每 60° 一个)。
 *  从 9 点钟(-90deg)起顺时针:红→品红→蓝→青→绿→黄。 */
const HUE_SEQUENCE = [0, 300, 240, 180, 120, 60];

/** 白色透明度沿半径的分布:[离中心比例 t, 白色透明度 alpha]。
 *  t=0 是圆心(全白),t=1 是边缘(纯色)。这是唯一的 alpha 数据源。 */
const ALPHA_STOPS: ReadonlyArray<readonly [number, number]> = [
  [0.0, 1.0], // 圆心:100% 白
  [0.25, 0.9], // 25% 半径:90% 白
  [0.5, 0.55], // 50% 半径:55% 白
  [0.75, 0.2], // 75% 半径:20% 白
  [1.0, 0.0] // 边缘:0% 白(纯色)
];

/** 根据离中心比例 t(0..1)线性插值出白色透明度 alpha(1..0,单调递减) */
function getAlpha(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  for (let i = 0; i < ALPHA_STOPS.length - 1; i++) {
    const [t0, a0] = ALPHA_STOPS[i];
    const [t1, a1] = ALPHA_STOPS[i + 1];
    if (clamped <= t1) {
      // 线性插值(注意 alpha 随 t 递减)
      return a0 + ((a1 - a0) * (clamped - t0)) / (t1 - t0);
    }
  }
  return ALPHA_STOPS[ALPHA_STOPS.length - 1][1];
}

/** getAlpha 的反函数:由 alpha 反查 t,用于 defaultColor 逆向定位 */
function invertAlpha(alpha: number): number {
  const a = Math.max(0, Math.min(1, alpha));
  for (let i = 0; i < ALPHA_STOPS.length - 1; i++) {
    const [t0, a0] = ALPHA_STOPS[i];
    const [t1, a1] = ALPHA_STOPS[i + 1];
    // alpha 落在 [a1, a0](递减)区间内
    if (a <= a0 && a >= a1) {
      return t0 + ((t1 - t0) * (a0 - a)) / (a0 - a1);
    }
  }
  return a >= ALPHA_STOPS[0][1] ? 0 : 1;
}

/** 生成 CSS 径向渐变(中心白 → 边缘透明)。
 *  用 closest-side 让 100% 恰好等于半径,与 JS 的 t 定义一一对应。 */
function buildRadialGradient(): string {
  const stops = ALPHA_STOPS.map(([t, a]) => `rgba(255,255,255,${a}) ${(t * 100).toFixed(2)}%`).join(
    ', '
  );
  return `radial-gradient(circle closest-side at center, ${stops})`;
}

/** 生成 CSS 圆锥渐变(彩虹环)。主色与 hslToRgb 共用同一函数,
 *  而 conic 在相邻主色之间做 RGB 线性插值——这恰好等于 HSL 色相插值,
 *  所以环上任意角度都与取色公式精确一致。 */
function buildConicGradient(): string {
  const stops = HUE_SEQUENCE.map((hue, i) => {
    const [r, g, b] = hslToRgb(hue, 1, 0.5);
    return `rgb(${r},${g},${b}) ${i * 60}deg`;
  });
  // 首尾闭合:补一个红在 360deg
  const [r0, g0, b0] = hslToRgb(HUE_SEQUENCE[0], 1, 0.5);
  stops.push(`rgb(${r0},${g0},${b0}) 360deg`);
  return `conic-gradient(from -90deg, ${stops.join(', ')})`;
}

/** 圆盘背景 = 径向白(上层)+ 圆锥彩虹(下层)。第一个 background 在上层。 */
const DISC_BG = `${buildRadialGradient()}, ${buildConicGradient()}`;

/**
 * 极坐标 (hue, t) → 圆心相对坐标 (dx, dy)。
 * 采用「12 点 = 0°、顺时针」的 conic 角度体系:
 *   conic 角度 θ 与 hue 的关系:hue = (270 − θ) mod 360
 *   反过来:θ = (270 − hue) mod 360
 * 因此 dx = r·sin(θ),dy = −r·cos(θ)。
 */
function polarToXY(hue: number, t: number, radius: number): { x: number; y: number } {
  const thetaDeg = (((270 - hue) % 360) + 360) % 360;
  const theta = (thetaDeg * Math.PI) / 180;
  const r = t * radius;
  return {
    x: r * Math.sin(theta),
    y: -r * Math.cos(theta)
  };
}

/**
 * 圆心相对坐标 (dx, dy) → 极坐标 (hue, t)。
 * 是 polarToXY 的逆运算。
 */
function xyToPolar(dx: number, dy: number, radius: number): { hue: number; t: number } {
  const dist = Math.min(radius, Math.sqrt(dx * dx + dy * dy));
  // conic 角度:12 点 = 0°,顺时针增加
  const thetaDeg = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
  const hue = (270 - thetaDeg + 360) % 360;
  return { hue, t: dist / radius };
}

/**
 * 极坐标 (hue, t) → RGB。这是「取色」的核心:
 *   color = mix(white, 纯色, alpha) = alpha·白 + (1−alpha)·纯色
 * 与 CSS 渐变视觉完全一致。
 */
function polarToColor(hue: number, t: number): [number, number, number] {
  const alpha = getAlpha(t);
  const [pr, pg, pb] = hslToRgb(hue, 1, 0.5); // 边缘纯色
  return [
    Math.round(alpha * 255 + (1 - alpha) * pr),
    Math.round(alpha * 255 + (1 - alpha) * pg),
    Math.round(alpha * 255 + (1 - alpha) * pb)
  ];
}

/**
 * RGB → 极坐标 (hue, t)。用于 defaultColor 初始化:
 * 用最小二乘反解「混白比例 alpha」,再反查 t。
 * 注意:模型只能表达「纯色向白」的亮调颜色,灰/深色会落到最近似位置。
 */
function colorToPolar(r: number, g: number, b: number): { hue: number; t: number } {
  const [hue] = rgbToHsl(r, g, b);
  const [pr, pg, pb] = hslToRgb(hue, 1, 0.5); // 该色相的纯色
  // 解 alpha:目标色 T = alpha·白 + (1−alpha)·纯色 C
  // 令 D = C − 白,则 T = C − alpha·D → 最小二乘:alpha = −(T−C)·D / (D·D)
  const Dr = pr - 255,
    Dg = pg - 255,
    Db = pb - 255;
  const denom = Dr * Dr + Dg * Dg + Db * Db;
  let alpha = 1;
  if (denom > 1e-6) {
    const num = (r - pr) * Dr + (g - pg) * Dg + (b - pb) * Db;
    alpha = Math.max(0, Math.min(1, -num / denom));
  }
  return { hue, t: invertAlpha(alpha) };
}

/* ══════════════════════════════════════════════════════════════════
 *  三、类型定义
 * ══════════════════════════════════════════════════════════════════ */

export interface ColorValue {
  r: number;
  g: number;
  b: number;
  h: number; // 最终颜色的真实色相 0..360
  s: number; // 最终颜色的真实饱和度 0..1
  l: number; // 最终颜色的真实亮度 0..1
  hex: string;
}

export interface ColorPickerProps {
  /** 圆盘直径,默认 280 */
  size?: number;
  /** 默认颜色,支持 #rrggbb / #rgb / rgb() */
  defaultColor?: string;
  /** 拖拽/变化时实时回调 */
  /** 是否显示颜色信息 */
  showInfo?: boolean;
  /** 拖拽/变化时实时回调 */
  onChange?: (color: ColorValue) => void;
  /** 松开(完成一次选择)时回调 */
  onChangeComplete?: (color: ColorValue) => void;
  className?: string;
  style?: React.CSSProperties;
}

/* ══════════════════════════════════════════════════════════════════
 *  四、组件
 * ══════════════════════════════════════════════════════════════════ */

const ColorPicker: React.FC<ColorPickerProps> = ({
  size = 280,
  defaultColor = '#ff5252',
  onChange,
  onChangeComplete,
  className = '',
  showInfo = true,
  style
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

  /* 指针(客户端坐标)→ 极坐标 */
  const updateFromClientXY = useCallback(
    (clientX: number, clientY: number) => {
      const el = discRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const { hue: h, t } = xyToPolar(
        clientX - rect.left - radius,
        clientY - rect.top - radius,
        radius
      );
      setHue(h);
      setDistRatio(t);
    },
    [radius]
  );

  /* 指针事件:按下即定位,移动持续定位,抬起结束 */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId); // 拖出圆外也不丢
    setIsDragging(true);
    updateFromClientXY(e.clientX, e.clientY);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateFromClientXY(e.clientX, e.clientY);
  };
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
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

export default ColorPicker;
