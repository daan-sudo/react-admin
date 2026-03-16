import request from "@/utils/request";
import type {
  Menu,
  MenuListQuery,
  MenuCreate,
  RoleQuery,
  RoleRes,
  RoleCreate,
  UserQuery,
  UserResponse,
} from "@/types/system";

// ===== 菜单管理 =====
export function getMenuListApi(params?: MenuListQuery): Promise<Menu[]> {
  return request({ url: "/system/menuList", method: "get", params });
}

export function getUserMenuApi(userId: string): Promise<Menu[]> {
  return request({
    url: "/system/menu/listByUser",
    method: "get",
    params: { userId },
  });
}

export function createMenuApi(data: MenuCreate): Promise<string> {
  return request({ url: "/system/menu/add", method: "post", data });
}

export function updateMenuApi(data: MenuCreate): Promise<string> {
  return request({ url: "/system/menu/update", method: "post", data });
}

export function deleteMenuApi(id: string): Promise<string> {
  return request({ url: "/system/menu/delete", method: "post", data: { id } });
}

// ===== 角色管理 =====
export function getRoleListApi(params?: RoleQuery): Promise<RoleRes> {
  return request({ url: "/system/roleList", method: "get", params });
}

export function createRoleApi(data: RoleCreate): Promise<string> {
  return request({ url: "/system/role/add", method: "post", data });
}

export function updateRoleApi(data: RoleCreate): Promise<string> {
  return request({ url: "/system/role/update", method: "post", data });
}

export function deleteRoleApi(id: number): Promise<string> {
  return request({ url: "/system/role/delete", method: "post", data: { id } });
}

// ===== 用户管理 =====
export function getUserListApi(
  params?: UserQuery & { pageSize: number; current: number },
): Promise<UserResponse> {
  return request({ url: "/system/user/list", method: "get", params });
}

export function getDeptListApi(): Promise<unknown[]> {
  return request({ url: "/system/dept/list", method: "get" });
}

export function createUserApi(data: unknown): Promise<string> {
  return request({ url: "/system/user/add", method: "post", data });
}

export function updateUserApi(data: unknown): Promise<string> {
  return request({ url: "/system/user/update", method: "post", data });
}

export function uploadApi(data: FormData): Promise<{ url: string }> {
  return request({ url: "/system/upload/avatar", method: "post", data });
}
