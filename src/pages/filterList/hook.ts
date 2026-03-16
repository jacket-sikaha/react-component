import { Toast } from '@nutui/nutui-react';
import { Dayjs } from 'dayjs';
import { useState } from 'react';
import { getArticle } from '../../services/article';

type filterParams = {
  status: number;
  beginDate: Dayjs;
  endDate: Dayjs;
};

export function useListHook() {
  const [refreshList, setRefreshList] = useState<ArticleDatatype[]>([]);

  const [refreshHasMore, setRefreshHasMore] = useState(true);

  const fetchData = async ({ status, beginDate, endDate }: filterParams, isInit = false) => {
    const res = await getArticle({
      limit: 10,
      offset: isInit ? 0 : refreshList.length,
      beginDate: beginDate.format(),
      endDate: endDate.format(),
      status
    });
    try {
      const [records, count] = [res.data ?? [], 9999];
      return { records, count };
    } catch (error) {
      Toast.show('获取数据失败' + error);
      return null;
    }
  };

  const loadMore = async (filters: filterParams) => {
    if (!refreshHasMore) {
      return;
    }
    const res = await fetchData(filters, false);
    if (!res) {
      setRefreshHasMore(false);
      return;
    }
    const { records, count } = res;
    setRefreshHasMore(records.length + refreshList.length < count);
    refreshList.push(...records);
    setRefreshList([...refreshList].map(({ id, ...rest }, idx) => ({ ...rest, id: idx })));
  };

  const handleFilterChange = async (filters: filterParams) => {
    const res = await fetchData(filters, true);
    if (!res) {
      setRefreshHasMore(false);
      setRefreshList([]);
      return;
    }
    const { records, count } = res;
    setRefreshHasMore(records.length < count);
    setRefreshList([...records]);
  };

  const debounce = (
    fn: (filters: filterParams) => Promise<void>,
    delay = 300
  ): ((arg?: any) => Promise<void>) => {
    let timer: any = null;
    return (...args: any) => {
      if (timer) {
        clearTimeout(timer);
      }
      return new Promise((resolve, reject) => {
        timer = setTimeout(() => {
          // eslint-disable-next-line prefer-spread
          fn.apply(null, args)
            .then((result) => {
              resolve(result);
            })
            .catch((err) => {
              reject(err);
              Toast.show('获取数据失败' + err);
            });
          timer = null;
        }, delay);
      });
    };
  };

  // 因为scroll事件特性，难免会一次触发多次loadmore，因此需要防抖处理
  const refreshLoadMore = debounce(loadMore);

  return {
    refreshList,
    refreshHasMore,
    refreshLoadMore,
    handleFilterChange
  };
}
