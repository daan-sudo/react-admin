export const storage = {
  get<T = string>(key: string): T | undefined {
    const item = localStorage.getItem(key);
    if (item === null) return undefined;
    try {
      return JSON.parse(item) as T;
    } catch {
      return item as T;
    }
  },
  set(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string) {
    localStorage.removeItem(key);
  },
  clear() {
    localStorage.clear();
  },
};

export const session = {
  get(key: string): string | undefined {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : undefined;
  },
  set(key: string, value: unknown) {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string) {
    sessionStorage.removeItem(key);
  },
  clear() {
    sessionStorage.clear();
  },
};
