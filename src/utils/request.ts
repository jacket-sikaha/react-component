import axios, { type AxiosRequestConfig } from 'axios';

const AXIOS_INSTANCE = axios.create({
  //   baseURL: "https://127.0.0.1/api/",
  timeout: 3000
  //   headers: { "X-Custom-Header": "foobar" },
});

const request = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token
  }).then(({ data }) => data);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

// 请求拦截器
AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    // 在发送请求之前对请求配置进行处理
    // 可以添加请求头、验证等操作
    return config;
  },
  (error) => {
    // 请求错误处理
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
AXIOS_INSTANCE.interceptors.response.use(
  (response) => {
    // 对响应数据进行处理
    // 可以进行数据转换、错误处理等操作
    return response.data;
  },
  (error) => {
    // 响应错误处理
    console.error('Response interceptor error:', error);
    return Promise.reject(error);
  }
);

export default request;
