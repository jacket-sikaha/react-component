import { useEffect, useRef } from 'react';

export const useEchartResize = (target?: Element, action?: any) => {
  const resizeObserver = useRef<ResizeObserver>(null);
  useEffect(() => {
    resizeObserver.current = new ResizeObserver(() => {
      action();
    });
    target && resizeObserver.current.observe(target);
    return () => {
      target && resizeObserver.current?.unobserve(target);
    };
  }, []);
};
