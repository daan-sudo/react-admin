import axios from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { message } from "antd";
import { useUserStore } from "@/stores/userStore";
import { HttpCodeEnum, ResultEnum } from "@/enums/httpEnum";

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class RequestHandler {
  private static isRefreshing = false;
  private static requests: Array<(token: string) => void> = [];

  public static readonly service = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API || "/api",
    timeout: 10000,
  });

  static init() {
    // 请求拦截器
    this.service.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = useUserStore.getState().token.access_token;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
    );

    // 响应拦截器
    this.service.interceptors.response.use(
      (response: AxiosResponse) => {
        const { code, data, message: msg } = response.data;
        if (code === ResultEnum.SUCCESS || code === ResultEnum.CREATED) {
          return data;
        }
        message.error(msg || "业务请求错误");
        return Promise.reject(new Error(msg || "Error"));
      },
      async (error) => {
        const { response, config } = error;
        const status = response?.status;

        // 1. 处理 401: Token 刷新逻辑
        if (
          status === HttpCodeEnum.UNAUTHORIZED &&
          !(config as RetryConfig)._retry
        ) {
          return this.handle401(config);
        }

        // 2. 根据状态码处理
        if (response) {
          this.handleErrorStatus(status, response);
        }

        return Promise.reject(error);
      },
    );
  }

  // 401 刷新逻辑
  private static async handle401(config: RetryConfig) {
    const userStore = useUserStore.getState();

    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.requests.push((token: string) => {
          config.headers.Authorization = `Bearer ${token}`;
          resolve(this.service(config));
        });
      });
    }

    config._retry = true;
    this.isRefreshing = true;

    try {
      const rt = userStore.token.refresh_token;
      const { data: res } = await axios.post(`${config.baseURL}/user/refresh`, {
        refreshToken: rt,
      });
      const { access_token, refresh_token } = res.data;

      userStore.setTokens(access_token, refresh_token);

      this.requests.forEach((cb) => cb(access_token));
      this.requests = [];
      return this.service(config);
    } catch (err) {
      userStore.clearAuth();
      window.location.href = "/login";
      return Promise.reject(err);
    } finally {
      this.isRefreshing = false;
    }
  }

  // 多状态码处理
  private static handleErrorStatus(status: number, response: AxiosResponse) {
    switch (status) {
      case HttpCodeEnum.FORBIDDEN:
        message.error("没有权限访问");
        break;
      case HttpCodeEnum.NOT_FOUND:
        message.error("请求资源不存在");
        break;
      case HttpCodeEnum.SERVER_ERROR:
        message.error("服务器内部错误，请联系管理员");
        break;
      default:
        message.error(response.data?.message || "请求失败");
    }
  }
}

RequestHandler.init();
export default RequestHandler.service;
