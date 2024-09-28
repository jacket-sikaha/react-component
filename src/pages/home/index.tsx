import { useState } from 'react';
import Loading from '../../components/loading';
import './test.module.css'; // 只跟引入方式有关，与文件名无关，现在还是普通导入不是css module
import styles from './test2.module.css'; // css module 导入

function Home() {
  console.warn('Home ');
  const [ccc, setccc] = useState(1);
  return (
    <>
      <div>Home</div>
      {/* <div>DIY组件库</div> */}
      <div className={styles.test}>test样式复用</div>
      <div className={styles.test}>test样式复用</div>
      <h3 className={styles.h3}>针对同一类标签类型的样式，设置其中一个样式都会生效</h3>
      <h3>针对同一类标签类型的样式，设置其中一个样式都会生效</h3>
      <div onClick={() => setccc(ccc + 1)}>{ccc}</div>
      <Loading></Loading>
    </>
  );
}

export default Home;
