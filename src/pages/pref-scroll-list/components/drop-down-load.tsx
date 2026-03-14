import { useCallback, useEffect, useRef, useState } from 'react';

const InfiniteScroll = ({ fetchData, parentClass = '' }: { fetchData: (page: number) => Promise<any[]>; parentClass?: string }) => {
  const [items, setItems] = useState < any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef(null);

  // 获取数据函数
  const loadItems = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const newItems = await fetchData(page);
      setItems((prev) => [...prev, ...newItems]);
      setHasMore(newItems.length > 0);
      setPage((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading, fetchData]);

  // 初始化加载和Observer设置
  useEffect(() => {
    loadItems(); // 初始加载
  }, []);

  // 观察器配置
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        console.log('entries:', entries);
        if (entries[0].isIntersecting && hasMore) {
          loadItems();
        }
      },
      {
        // 用作视口的元素，用于检查目标的可见性
        root: parentClass ? document.querySelector(`.${parentClass}`) : null,
        threshold: 0.7
      } // 元素相对于root可见达到 70%  时触发
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, loadItems, hasMore]);

  return (
    <div className="divide-y-2">
      {/* 内容列表 */}
      {items.map((item, index) => (
        <div className="p-4" key={index}>
          {item.title}
        </div>
      ))}

      {/* 加载触发元素 */}
      <div ref={observerTarget} style={{ height: '120px' }}></div>

      {/* 加载状态反馈 */}
      {isLoading && <div>加载中...</div>}
      {!hasMore && <div>没有更多内容了</div>}
    </div>
  );
};

export default InfiniteScroll;
