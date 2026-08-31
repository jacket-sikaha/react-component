import ColorPicker, { type ColorValue } from '@/components/color-picker';
import MiniappColorPicker from '@/components/color-picker/miniapp';
import { useState } from 'react';

function TestColorPicker() {
  const [color, setColor] = useState<ColorValue>({
    r: 255,
    g: 82,
    b: 82,
    h: 0,
    s: 1,
    l: 0.5,
    hex: '#FF5252'
  });

  const [logs, setLogs] = useState<string[]>([]);

  const handleChange = (c: ColorValue) => {
    setColor(c);
  };

  const handleComplete = (c: ColorValue) => {
    setLogs((prev) =>
      [
        `${new Date().toLocaleTimeString()} ▶ ${c.hex.toUpperCase()}  rgb(${c.r}, ${c.g}, ${c.b})`,
        ...prev
      ].slice(0, 8)
    );
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 px-6 py-10 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 lg:flex-row lg:items-start">
        <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900 dark:shadow-black/40">
          <h2 className="mb-1 text-base font-semibold">Web 版(PointerEvent)</h2>
          <p className="mb-4 text-xs text-slate-500">
            鼠标按下拖动白色圆环,即可选择颜色。
          </p>
          <ColorPicker
            defaultColor="#ff5252"
            onChange={handleChange}
            onChangeComplete={handleComplete}
            showInfo={false}
          />

          <div className="my-6 border-t border-dashed border-slate-300 dark:border-slate-700" />

          <h2 className="mb-1 text-base font-semibold">小程序版(Touch 事件)</h2>
          <p className="mb-4 text-xs text-slate-500">
            不依赖 PointerEvent,用 touchstart / touchmove / touchend。请在移动端或 DevTools
            设备模拟模式下测试。
          </p>
          <MiniappColorPicker
            defaultColor="#00C9A7"
            onChange={handleChange}
            onChangeComplete={handleComplete}
            showInfo={false}
          />
        </section>

        <section className="flex-1 space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900 dark:shadow-black/40">
            <h3 className="mb-3 text-sm font-semibold">当前选中</h3>
            <div className="flex items-center gap-4">
              <div
                className="h-20 w-20 rounded-xl ring-1 ring-black/10"
                style={{ backgroundColor: color.hex }}
              />
              <div className="space-y-1 font-mono text-sm">
                <div>HEX&nbsp;&nbsp;{color.hex.toUpperCase()}</div>
                <div>
                  RGB&nbsp;&nbsp;({color.r}, {color.g}, {color.b})
                </div>
                <div>
                  HSL&nbsp;&nbsp;{Math.round(color.h)}°, {Math.round(color.s * 100)}%,{' '}
                  {Math.round(color.l * 100)}%
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900 dark:shadow-black/40">
            <h3 className="mb-3 text-sm font-semibold">onChangeComplete 历史</h3>
            <ul className="space-y-1 font-mono text-xs text-slate-500">
              {logs.length === 0 && <li className="italic">暂无记录</li>}
              {logs.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900 dark:shadow-black/40">
            <h3 className="mb-3 text-sm font-semibold">不同初始色演示</h3>
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
              <div>
                <div className="text-xs text-slate-500">#00C9A7 (青绿)</div>
                <ColorPicker defaultColor="#00C9A7" size={160} />
              </div>
              <div>
                <div className="text-xs text-slate-500">#4263EB (蓝紫)</div>
                <ColorPicker defaultColor="#4263EB" size={160} />
              </div>
              <div>
                <div className="text-xs text-slate-500">#FFD43B (黄)</div>
                <ColorPicker defaultColor="#FFD43B" size={160} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default TestColorPicker;
