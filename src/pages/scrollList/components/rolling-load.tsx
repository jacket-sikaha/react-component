import { debounce } from '@mui/material';
import { useLayoutEffect, useRef, useState } from 'react';

const addItem = async (list: number[]) => {
  const tmp = new Array(10)
    .fill(0)
    .map((v, i) => i + list.length)
    .reverse();
  await new Promise((resolve, reject) => {
    setTimeout(resolve, 5000);
  });
  return [...tmp, ...list];
};

function RollingLoad() {
  const div = useRef<HTMLDivElement>(null);
  const { scrollTop = 0, clientHeight = 0, scrollHeight = 0 } = div.current ?? {};
  const [scrollObj, setScrollObj] = useState({ scrollTop, clientHeight, scrollHeight });
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState(
    new Array(10)
      .fill(0)
      .map((v, i) => i)
      .reverse()
  );

  const scroll = debounce(async () => {
    if (!div.current || loading) return;
    const { scrollTop, clientHeight, scrollHeight } = div.current;
    console.log(111, { scrollTop, clientHeight, scrollHeight, r: scrollTop / scrollHeight });
    if (scrollTop / scrollHeight <= 0.16) {
      setLoading(true);
      const item = await addItem(list);
      setList(item);
      setScrollObj({ scrollTop, clientHeight, scrollHeight });
      setLoading(false);
    }
  }, 300);

  // 页面加载完执行完该函数再进一步渲染页面，避免出现滚动条闪烁
  useLayoutEffect(() => {
    if (!div.current || loading) return;
    div.current.scrollTop =
      scrollObj.scrollTop + 10 + div.current.scrollHeight - scrollObj.scrollHeight;
  }, [div.current?.scrollHeight]);

  return (
    <div className="m-4 h-96 w-[200px] overflow-y-auto bg-blue-400" ref={div} onScroll={scroll}>
      {loading && <div>loading </div>}
      {list.map((o, i) => {
        return (
          <div key={o} className="h-[50px] border">
            {o}
          </div>
        );
      })}
    </div>
  );
}

export default RollingLoad;
