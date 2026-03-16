import axios from 'axios';

type params = {
  status?: number;
  offset: number;
  limit: number;
  beginDate: any;
  endDate: any;
};

export const getArticle = ({ offset, limit, beginDate, endDate, status }: params) => {
  return axios({
    url: `https://jsonplaceholder.typicode.com/posts?s=${status}&o=${offset}&l=${limit}&b=${beginDate}&e=${endDate}`
  });
};
