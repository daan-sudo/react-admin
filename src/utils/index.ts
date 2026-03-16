import dayjs from "dayjs";

/** 获取当前时间段问候语 */
export const timeFix = () => {
  const hour = dayjs().hour();
  if (hour < 9) return "早上好";
  if (hour <= 11) return "上午好";
  if (hour <= 13) return "中午好";
  if (hour <= 20) return "下午好";
  return "夜深了";
};

/** OSS URL 转代理 URL */
export const getProxyUrl = (url: string | undefined) => {
  if (!url) return "";
  return url.replace(
    "http://daan-pqf.oss-cn-beijing.aliyuncs.com",
    "/oss-resource",
  );
};
