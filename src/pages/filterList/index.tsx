import FilterList from './components/filter-list';
import { useListHook } from './hook';

const tabList = ['11', '22', '33'];
const FilterListPage = () => {
  const filterListSetting = useListHook();
  return (
    <>
      <FilterList tabList={tabList} filterListSetting={filterListSetting} isRepairPage />
    </>
  );
};

export default FilterListPage;
