export enum MenuType {
  Directory = 1,
  Menu = 2,
  Button = 3,
}

export interface Menu {
  id: string | number | undefined;
  name: string;
  path?: string;
  icon?: string;
  children?: Menu[];
  orderNum?: number;
  createTime?: string;
  type?: number;
}

export interface MenuListQuery {
  name: string;
  path: string;
  createTime?: string[];
  createTimeStart?: string;
  createTimeEnd?: string;
}

export interface MenuCreate {
  id?: string;
  type: number;
  name: string;
  path: string;
  icon: string;
  parentId: string | undefined;
  orderNum: number;
  permission?: string;
}

export interface RoleQuery {
  id?: string;
  pageSize: number;
  current: number;
  name?: string;
  code?: string;
  createTime?: string[];
  createTimeStart?: string;
  createTimeEnd?: string;
}

export interface Role {
  id: number;
  name: string;
  code: string;
  createTime?: string;
  remark: string;
  orderNum: number;
}

export interface RoleCreate {
  id?: number;
  name: string;
  code: string;
  remark: string;
  orderNum: number;
  menuIds: number[];
}

export interface RoleRes {
  total: number;
  records: Role[];
  current: number;
  pageSize: number;
}

export interface UserQuery {
  username: string;
  status: string;
}

export interface User {
  id: number;
  username: string;
  nickName: string;
  avatar: string;
  email: string;
  phone: string;
  sex: number;
  status: number;
  createTime?: string;
  roles: { id: number; name: string }[];
  department?: { name: string };
}

export interface UserResponse {
  total: number;
  records: User[];
  current: number;
  pageSize: number;
}
