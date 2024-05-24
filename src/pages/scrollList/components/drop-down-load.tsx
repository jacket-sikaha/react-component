import { useEffect, useRef, useState } from 'react';

const addItem = async (list: number[]) => {
  const tmp = new Array(10)
    .fill(0)
    .map((v, i) => i + list.length)
    .reverse();
  await new Promise((resolve, reject) => {
    setTimeout(resolve, 1000);
  });
  return [...tmp, ...list];
};
let tmp = [0, 0, 0];
function DropDownLoad() {
  const div = useRef<HTMLDivElement>(null);
  const ele = useRef<HTMLDivElement>(null);
  const downwarp = useRef<HTMLDivElement>(null);
  const [loadingH, setLoadingH] = useState(0);
  const [loading, setLoading] = useState(false);
  const [moveFlag, setMoveFlag] = useState(false);
  const [list, setList] = useState(
    new Array(10)
      .fill(0)
      .map((v, i) => i)
      .reverse()
  );

  useEffect(() => {
    if (!ele.current) {
      return;
    }
    ele.current.addEventListener('touchstart', function (e) {
      e.stopPropagation();
      const { clientY, pageY, screenY } = e.changedTouches[0];
      tmp = [clientY, pageY, screenY];
      setMoveFlag(true);
    });

    ele.current.addEventListener('touchend', async function (e) {
      e.stopPropagation();
      // 能看到loading，只有在屏幕顶部才进行加载数据
      if (div.current && div.current.scrollTop === 0 && loadingH > 0 && loading) {
        const item = await addItem(list);
        setList([...item]);
      }
      setLoading(false);
      setLoadingH(0);
      setMoveFlag(false);
    });
  }, [loadingH, list]);

  return (
    // 子元素的滚动溢出影响其父级元素的滚动---overscroll-contain解决
    <div className={`m-4 w-[200px] h-96 bg-green-400 overflow-y-auto overscroll-contain`} ref={div}>
      <div id="refreshText" className="bg-purple-400" style={{ height: loadingH }} ref={downwarp}>
        {loading && <div>loading </div>}
      </div>
      <div
        id="refreshContainer"
        ref={ele}
        onTouchMove={(e) => {
          if (!moveFlag) {
            return;
          }
          const { clientY, pageY, screenY } = e.changedTouches[0];
          const [clientY1, pageY1, screenY1] = tmp;
          const h = Math.round(clientY - clientY1);
          // const q = Math.round(pageY - pageY1);
          // const h2 = Math.round(screenY - screenY1);
          console.log('div.current?.scrollTop', div.current?.scrollTop);
          // console.log('h', h);
          // 避免增加的组件高度导致多余的滚动而无法缩回loading组件
          div.current!.scrollTop = div.current!.scrollTop - loadingH;
          if (h > 0) {
            setLoadingH(() => Math.min(h, 60));
            setLoading(true);
          } else {
            setLoadingH(() => Math.max(loadingH + h, 0));
            if (Math.max(loadingH + h, 0) === 0) {
              setLoading(false);
            }
          }
        }}
      >
        {list.map((o) => {
          return (
            <div key={o} className="h-[50px] border">
              {o}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DropDownLoad;
