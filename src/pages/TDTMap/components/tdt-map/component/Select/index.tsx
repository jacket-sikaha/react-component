import { Select, Spin } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

import { debounce } from '@mui/material';
import { LocationProps } from '../..';
import { LocalSearch, LocalSearchResult } from '../../@type/LocalSearch';
import { TDTMap } from '../../@type/TDT';

type SuggestsValueType = {
  key?: number;
  label: React.ReactNode;
  value: string;
};

function keywordSearch(keyword: string, ls?: LocalSearch) {
  if (!ls) return;
  ls.search(keyword, 4);
}

interface withPromptInputProps {
  map: TDTMap | undefined;
  value?: LocationProps;
  onChange?: (val: LocationProps) => void;
  updateListAfterChange?: (val: LocationProps) => void;
}

const WithPromptInput: React.FC<withPromptInputProps> = ({
  map,
  value,
  onChange,
  updateListAfterChange
}: withPromptInputProps) => {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<SuggestsValueType[]>([]);
  //   const [value1, setValue1] = useState<string>();
  const localsearch = useRef<LocalSearch>();

  const localSearchResult = (res: LocalSearchResult) => {
    const result = res.getSuggests();
    let list: SuggestsValueType[] = [];
    if (result) {
      list = result
        .filter(({ lonlat }) => {
          return !!lonlat;
        })
        .map(({ name, address, lonlat }, idx) => {
          return {
            key: idx,
            // 以省略号 (…) 截断溢出的文本还需要使用overflow-hidden
            label: <div className="overflow-hidden text-ellipsis">{name}</div>,
            value: [address + name, lonlat].join('-')
          };
        });
    }
    setOptions(list);
    setFetching(false);
  };

  const debounceSearch = debounce((value) => {
    if (!value) return;
    keywordSearch(value, localsearch.current);
    setFetching(true);
    onChange?.({ address: value, latitude: 0, longitude: 0 });
  }, 500);

  useEffect(() => {
    if (!map) return;
    const config = {
      pageCapacity: 10, //每页显示的数量
      onSearchComplete: localSearchResult //接收数据的回调函数
    };
    //创建搜索对象
    localsearch.current = new T.LocalSearch(map, config);
  }, [map]);

  return (
    <Select
      value={value?.address}
      showSearch
      placeholder="input address"
      filterOption={false}
      onSearch={debounceSearch}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      dropdownStyle={{ width: '100%' }}
      options={options}
      onChange={(val: string) => {
        const [address, lonlat] = val.split('-');
        const [longitude, latitude] = lonlat.split(',').map((s) => parseFloat(s));
        onChange?.({ address, latitude, longitude });
        updateListAfterChange?.({ address, latitude, longitude });
      }}
      labelRender={(props) => {
        // 找不到关键词选项失去焦点后不清空内容
        if (props.label) {
          return props.value;
        }
        return <span>{value?.address}</span>;
      }}
    />
  );
};

export default WithPromptInput;
