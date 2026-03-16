export enum ResultEnum {
  SUCCESS = 200,
  CREATED = 201,
  ERROR = 500,
  TIMEOUT = 408,
}

export enum HttpCodeEnum {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,
}

export enum StorageKeyEnum {
  ACCESS_TOKEN = "ACCESS_TOKEN",
  REFRESH_TOKEN = "REFRESH_TOKEN",
  USER_INFO = "USER_INFO",
}
