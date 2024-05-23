import DropDownLoad from './components/drop-down-load';
import RollingLoad from './components/rolling-load';

function ScrollList() {
  return (
    <div className="flex justify-around flex-wrap">
      <div className="m-3">
        <div>向上滚动加载</div>
        <RollingLoad />
      </div>
      <div className="m-3">
        <div>下拉加载</div>
        <DropDownLoad />
      </div>
    </div>
  );
}

export default ScrollList;
