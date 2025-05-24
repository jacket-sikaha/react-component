import InfiniteScroll from './components/drop-down-load';

function PrefScrollListlist() {
  // ！！！特殊情况
  // 无限滚动组件被包裹在一个固定高度的 <div> 容器中
  // Intersection Observer 默认观察的是目标元素是否进入浏览器视口
  // 当用户滚动到容器底部时
  // 容器内部的触发元素（observerTarget）出现在该元素浏览器视口内，而且threshold的阈值相对于浏览器视口可见度符合，就能触发加载

  // parentClass 自行设定观察目标元素可见性的视口参照物

  return (
    <div className="flex flex-col h-[160vh] items-center w-full p-5 border">
      <div className="test-scroll w-full p-5 border overflow-y-auto h-96">
        <InfiniteScroll
          //   parentClass="test-scroll"
          fetchData={async (page) => {
            const res = await new Promise((resolve) => {
              console.log('FETCH DATA');
              setTimeout(() => {
                resolve(123);
              }, 1000);
            });
            return new Array(10).fill(0).map((_, index) => ({
              id: index + page * 10,
              title: `Item ${index + page * 10}`
            }));
          }}
        />
      </div>
    </div>
  );
}

export default PrefScrollListlist;
