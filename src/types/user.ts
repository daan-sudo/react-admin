export interface Captcha {
  captchaKey: string;
  svg: string;
}

export interface LoginData {
  username: string;
  password: string;
  captchaKey: string;
  captcha: string;
}

export interface UserInfo {
  username: string;
  avatar: string;
  email: string;
  phone: string;
  role: unknown;
  id: string;
  deptId: string;
  department: { name: string } | null;
  remark: string;
  createTime: string;
  nickName: string;
  sex: number;
}

export interface Token {
  access_token: string;
  refresh_token: string;
}
