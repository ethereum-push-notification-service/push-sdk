import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../../../../restapi/package.json');
const version = packageJson.version;

const addSdkVersionHeader = (
  config?: AxiosRequestConfig
): AxiosRequestConfig => {
  const headers = { ...config?.headers, 'X-JS-SDK-VERSION': version };
  return { ...config, headers };
};

const checkForDeprecationHeader = <T = any>(
  response: AxiosResponse<T>
): AxiosResponse<T> => {
  const deprecationNotice = response.headers['x-deprecation-notice'];
  if (deprecationNotice) {
    const method = response.config.method?.toUpperCase();
    const path = response.config.url;
    console.warn(
      `%cDeprecation Notice%c Method: ${method}, Path: ${path}, Notice: ${deprecationNotice}`,
      'color: white; background-color: red; font-weight: bold; padding: 2px 4px;',
      'color: red; font-weight: bold;'
    );
  }
  return response;
};

const axiosGet = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return axios
    .get<T>(url, addSdkVersionHeader(config))
    .then((response) => checkForDeprecationHeader(response));
};

const axiosPost = async <T = any>(
  url: string,
  data: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return axios
    .post<T>(url, data, addSdkVersionHeader(config))
    .then((response) => checkForDeprecationHeader(response));
};

const axiosPut = async <T = any>(
  url: string,
  data: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return axios
    .put<T>(url, data, addSdkVersionHeader(config))
    .then((response) => checkForDeprecationHeader(response));
};

const axiosDelete = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return axios
    .delete<T>(url, addSdkVersionHeader(config))
    .then((response) => checkForDeprecationHeader(response));
};

export { axiosGet, axiosPost, axiosPut, axiosDelete };
