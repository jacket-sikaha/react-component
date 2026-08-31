import ArcSlider from '@/components/ArcSlider';
import ArcSliderOrigin from '@/components/ArcSlider-origin';
import { useCallback, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  小工具：把多行字符串渲染成 <pre> 代码块                              */
/* ------------------------------------------------------------------ */
function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [code]);

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={handleCopy}
        className="!absolute right-3 top-3 z-10 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 opacity-0 transition hover:!bg-slate-50 group-hover:opacity-100"
      >
        {copied ? '已复制' : '复制'}
      </button>
      <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  小工具：API 属性行                                                  */
/* ------------------------------------------------------------------ */
function PropRow({
  name,
  type,
  def,
  desc
}: {
  name: string;
  type: string;
  def: string;
  desc: string;
}) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-3 pr-4 font-mono text-sm text-indigo-600">{name}</td>
      <td className="py-3 pr-4 font-mono text-xs text-slate-500">{type}</td>
      <td className="py-3 pr-4 font-mono text-xs text-slate-400">{def}</td>
      <td className="py-3 text-sm text-slate-600">{desc}</td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  小工具：区段标题                                                    */
/* ------------------------------------------------------------------ */
function SectionTitle({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mb-1 scroll-mt-20 text-lg font-bold tracking-tight text-slate-900">
      {children}
    </h2>
  );
}

/* ------------------------------------------------------------------ */
/*  核心代码片段（从组件源码中抽取关键思路，精简展示）                     */
/* ------------------------------------------------------------------ */
const CODE_ANGLE = [
  '// 1. 坐标->角度：以圆心为原点，用 atan2 求指针角度',
  'const getPointerAngle = (clientX, clientY) => {',
  '  const rect = containerRef.current.getBoundingClientRect();',
  '  const cx = rect.left + rect.width / 2;',
  '  const cy = rect.top + rect.height / 2;',
  '  const dx = clientX - cx;',
  '  const dy = clientY - cy;',
  '  return normalizeAngle((Math.atan2(dy, dx) * 180) / Math.PI);',
  '};',
  '',
  '// 2. 角度->数值：将 0~270度 线性映射回 min~max，再按 step 对齐',
  'const angleToValue = (currentAngle) => {',
  '  const rel = clamp(normalizeAngle(currentAngle - START_ANGLE), 0, SLIDER_ANGLE);',
  '  const raw = min + (rel / SLIDER_ANGLE) * range;',
  '  const stepped = Math.round((raw - min) / step) * step + min;',
  '  return clamp(stepped, min, max);',
  '};'
].join('\n');

const CODE_CONIC = [
  '// 3. 用 CSS conic-gradient 画环形进度（无需 SVG）',
  'const progressAngle = range > 0 ? ((value - min) / range) * SLIDER_ANGLE : 0;',
  '',
  'const ringBackground =',
  '  "conic-gradient(from " + (START_ANGLE + 90) + "deg," +',
  '  "#83B7FF 0deg " + progressAngle + "deg," +       // 蓝色进度',
  '  "#D8DEE8 " + progressAngle + "deg " + SLIDER_ANGLE + "deg," + // 灰色轨道',
  '  "transparent " + SLIDER_ANGLE + "deg 360deg)";    // 270~360 留空'
].join('\n');

const CODE_CONTROLLED = [
  '// 4. 受控/非受控合并：传入 value 即受控',
  'const isControlled = controlledValue !== undefined;',
  'const [internalValue, setInternalValue] = useState(defaultValue);',
  '',
  '// 渲染时取实际值：受控取外部 value，非受控取内部 state',
  'const value = isControlled ? clamp(controlledValue, min, max) : internalValue;',
  '',
  '// setValue 仅在非受控时更新内部 state',
  'const setValue = (next) => {',
  '  if (!isControlled) setInternalValue(next);',
  '};',
  '',
  '// 拖拽/键盘触发后，通过 onChange 通知外部',
  'const updateValue = (clientX, clientY) => {',
  '  const nextValue = angleToValue(getPointerAngle(clientX, clientY));',
  '  setValue(nextValue);',
  '  if (nextValue !== value) onChange?.(nextValue);',
  '};'
].join('\n');

const CODE_USAGE = [
  '// 非受控（默认）：只需 defaultValue + onChange',
  '<ArcSlider min={0} max={9} step={1} defaultValue={3} onChange={v => console.log(v)} />',
  '',
  '// 受控：传入 value，外部完全控制数值',
  'const [val, setVal] = useState(3);',
  '<ArcSlider min={0} max={9} value={val} onChange={setVal} />'
].join('\n');

/* ------------------------------------------------------------------ */
/*  受控演示：外部 state 控制 value，滑块与按钮联动                      */
/* ------------------------------------------------------------------ */
function ControlledDemo() {
  const [val, setVal] = useState(3);

  return (
    <div className="flex flex-col items-center gap-4">
      <ArcSlider
        min={0}
        max={9}
        step={1}
        value={val}
        title="受控档位"
        size={260}
        onChange={setVal}
      />
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: 10 }, (_, i) => i).map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setVal(i)}
            className={
              'h-9 w-9 rounded-lg text-sm font-semibold transition ' +
              (i === val
                ? '!bg-indigo-500 !text-white'
                : 'border border-slate-300 bg-white text-slate-600 hover:!bg-slate-50')
            }
          >
            {i}
          </button>
        ))}
      </div>
      <p className="text-sm text-slate-500">
        点击上方按钮或拖动圆环，
        <code className="rounded bg-slate-100 px-1 font-mono text-xs">value</code>{' '}
        同步更新，典型的受控组件用法
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  主页面                                                              */
/* ------------------------------------------------------------------ */
function TestArcSlider() {
  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            UI Component Showcase
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            ArcSlider · 圆弧滑动选择器
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            一个基于 React + Tailwind 的圆形/扇形滑动选择器组件。使用 conic-gradient 绘制环形进度，
            通过 Pointer / Touch 事件捕获拖拽，支持键盘操作与受控模式，无需 SVG 依赖。
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">React 18</span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">Tailwind CSS</span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">conic-gradient</span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">PointerEvent</span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">a11y / ARIA</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-6 py-12">
        {/* -- 1. 实时预览 -- */}
        <section>
          <SectionTitle id="preview">1. 实时预览</SectionTitle>
          <p className="mb-6 text-sm text-slate-500">
            拖动圆环上的旋钮，或用键盘上下左右调整数值。两个版本可对比交互手感。
          </p>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
              <span className="text-xs font-medium text-slate-400">ArcSlider · Pointer 版</span>
              <ArcSlider min={0} max={9} step={1} defaultValue={4} title="雾量" size={300} />
            </div>
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
              <span className="text-xs font-medium text-slate-400">
                ArcSlider-origin · Touch 版
              </span>
              <ArcSliderOrigin min={0} max={9} step={1} defaultValue={4} title="风速" size={300} />
            </div>
          </div>
        </section>
        {/* -- 2. 受控模式演示 -- */}
        <section>
          <SectionTitle id="controlled">2. 受控模式（value props）</SectionTitle>
          <p className="mb-6 text-sm text-slate-500">
            传入 <code className="rounded bg-slate-100 px-1 font-mono text-xs">value</code>{' '}
            后组件变为受控模式， 外部完全控制数值。点击下方按钮可联动滑块，反之拖动滑块也会更新外部
            state。
          </p>
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
            <ControlledDemo />
          </div>
        </section>

        {/* -- 3. 不同配置示例 -- */}
        <section>
          <SectionTitle id="variants">3. 不同配置示例</SectionTitle>
          <p className="mb-6 text-sm text-slate-500">
            调整{' '}
            <code className="rounded bg-slate-100 px-1 font-mono text-xs">
              min / max / step / size / title
            </code>{' '}
            即可适配各种场景。
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <ArcSlider min={0} max={100} step={10} defaultValue={30} title="湿度" size={200} />
              <span className="text-xs text-slate-400">0-100 / step 10</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <ArcSlider min={1} max={5} step={1} defaultValue={3} title="风速" size={200} />
              <span className="text-xs text-slate-400">1-5 / step 1</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <ArcSlider min={0} max={9} step={1} defaultValue={0} title="亮度" size={200} />
              <span className="text-xs text-slate-400">0-9 / size 200</span>
            </div>
          </div>
        </section>
        {/* -- 4. 两个版本对比 -- */}
        <section>
          <SectionTitle id="compare">4. 两个版本对比</SectionTitle>
          <p className="mb-6 text-sm text-slate-500">
            两个版本功能一致，主要区别在事件机制与刻度样式。
          </p>
          <div className="overflow-hidden rounded-2xl ring-1 ring-slate-100">
            <table className="w-full bg-white text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">特性</th>
                  <th className="px-4 py-3 font-medium">ArcSlider（Pointer 版）</th>
                  <th className="px-4 py-3 font-medium">ArcSlider-origin（Touch 版）</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-700">事件机制</td>
                  <td className="px-4 py-3 text-slate-600">PointerEvent（setPointerCapture）</td>
                  <td className="px-4 py-3 text-slate-600">TouchEvent（touchstart/move/end）</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-700">PC 鼠标</td>
                  <td className="px-4 py-3 text-green-600">原生支持</td>
                  <td className="px-4 py-3 text-slate-400">仅触屏</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-700">移动端</td>
                  <td className="px-4 py-3 text-green-600">支持</td>
                  <td className="px-4 py-3 text-green-600">支持（兼容小程序）</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-700">刻度样式</td>
                  <td className="px-4 py-3 text-slate-600">圆点刻度</td>
                  <td className="px-4 py-3 text-slate-600">短线段刻度（沿半径延伸）</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-700">圆环大小</td>
                  <td className="px-4 py-3 text-slate-600">size * 0.76</td>
                  <td className="px-4 py-3 text-slate-600">size * 0.94</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-700">受控 value</td>
                  <td className="px-4 py-3 text-green-600">支持</td>
                  <td className="px-4 py-3 text-green-600">支持</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* -- 5. API 属性表 -- */}
        <section>
          <SectionTitle id="api">5. API 属性</SectionTitle>
          <p className="mb-6 text-sm text-slate-500">两个版本共享相同的 Props 接口。</p>
          <div className="overflow-hidden rounded-2xl ring-1 ring-slate-100">
            <table className="w-full bg-white">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">属性</th>
                  <th className="px-4 py-3 font-medium">类型</th>
                  <th className="px-4 py-3 font-medium">默认值</th>
                  <th className="px-4 py-3 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                <PropRow name="min" type="number" def="0" desc="最小值" />
                <PropRow name="max" type="number" def="9" desc="最大值" />
                <PropRow name="step" type="number" def="1" desc="步长，拖拽与键盘均按此对齐" />
                <PropRow name="defaultValue" type="number" def="min" desc="非受控模式初始值" />
                <PropRow
                  name="value"
                  type="number"
                  def="-"
                  desc="受控模式当前值，传入即切换为受控组件"
                />
                <PropRow name="title" type="string" def="雾量" desc="中心标题文字" />
                <PropRow name="size" type="number" def="320" desc="组件像素尺寸（正方形）" />
                <PropRow
                  name="onChange"
                  type="(value: number) => void"
                  def="-"
                  desc="数值变化回调"
                />
              </tbody>
            </table>
          </div>
        </section>
        {/* -- 6. 实现思路 -- */}
        <section>
          <SectionTitle id="design">6. 实现思路</SectionTitle>
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">整体架构</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                组件以 270° 固定扇形为基准，缺口朝正下方。核心是三条转换链路：
                <span className="font-medium text-slate-700"> 角度↔数值</span>、
                <span className="font-medium text-slate-700"> 角度→坐标</span>、
                <span className="font-medium text-slate-700"> 数值→进度色</span>。 全程不使用
                SVG，仅靠 div + CSS conic-gradient 实现圆环，降低了依赖与渲染开销。
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                    1
                  </span>
                  <span className="text-sm font-semibold text-slate-700">指针角度</span>
                </div>
                <p className="text-sm text-slate-500">
                  拖拽时取容器中心，用 atan2(dy, dx) 将坐标转为 0~360° 角度。
                </p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                    2
                  </span>
                  <span className="text-sm font-semibold text-slate-700">角度映射</span>
                </div>
                <p className="text-sm text-slate-500">
                  偏移起始角后，将 0~270° 线性映射回 min~max，再按 step 取整对齐。
                </p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                    3
                  </span>
                  <span className="text-sm font-semibold text-slate-700">环形渲染</span>
                </div>
                <p className="text-sm text-slate-500">
                  conic-gradient 三段着色：蓝色进度 → 灰色轨道 → transparent
                  缺口，内嵌白圆挖空中心。
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">受控 / 非受控合并</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                组件内部维护{' '}
                <code className="rounded bg-slate-100 px-1 font-mono text-xs">internalValue</code>，
                若外部传入{' '}
                <code className="rounded bg-slate-100 px-1 font-mono text-xs">value</code>{' '}
                则切换为受控模式： 渲染取外部值，setValue 不写内部 state，仅通过 onChange
                通知。这就是 React 社区常见的 "可控 + 非可控" 双模式模式，让开发者按需选择。
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">核心公式回顾</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                <p>
                  from 225deg ← 永远不变，起点固定在左下角(from Xdeg = 把起点从“12 点”顺时针转 X 度)
                </p>
                <p>蓝色 0° → progressAngle°</p>
                <p>灰色 progressAngle° → 270°</p>
                <p>透明 270° → 360° ← 永远不变，90° 缺口</p>
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">关键点</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                组件内部用的“数学角度”(0° = 正右方)
              </p>
              <p className="text-sm leading-relaxed text-slate-500">
                CSS conic-gradient 用的角度(0° = 正上方)
              </p>
              <p>两套体系差 90°(数学的 0° 指右，CSS 的 0° 指上)：CSS 角度 = 数学角度 + 90°</p>
            </div>
          </div>
        </section>

        {/* -- 7. 核心代码 -- */}
        <section>
          <SectionTitle id="code">7. 核心代码</SectionTitle>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">7.1 角度 ↔ 数值转换</h3>
              <CodeBlock code={CODE_ANGLE} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">
                7.2 conic-gradient 环形进度
              </h3>
              <CodeBlock code={CODE_CONIC} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">7.3 受控 / 非受控合并</h3>
              <CodeBlock code={CODE_CONTROLLED} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">7.4 使用示例</h3>
              <CodeBlock code={CODE_USAGE} />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-xs text-slate-400">
          ArcSlider Component Showcase · React + Tailwind CSS · conic-gradient + PointerEvent
        </div>
      </footer>
    </div>
  );
}

export default TestArcSlider;
