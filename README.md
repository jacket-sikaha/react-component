# react-component
react组件封装收集

http://dog.lee-sikaha.cloudns.ch/

## 使用技术

React + React-router + TS + MUI

## 文件结构规范

```markdown
src/
├── assets/            // 存放静态资源文件，如图片、字体等
├── components/        // 存放可复用的 UI 组件
│   ├── Button/
│   │   ├── Button.js   // 组件实现
│   │   ├── Button.css  // 样式文件
│   │   └── index.js    // 入口文件，导出组件
│   └── ...
├── pages/             // 存放页面组件
│   ├── Home/
│   │   ├── Home.js    // 页面实现
│   │   ├── Home.css   // 样式文件
│   │   └── index.js   // 入口文件，导出页面组件
│   └── ...
├── services/          // 存放与后端交互的服务文件
├── utils/             // 存放通用的工具函数、帮助函数等
├── App.js             // 应用的根组件
├── index.js           // 应用的入口文件
└── ...
```

