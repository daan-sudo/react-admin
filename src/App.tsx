import { RouterProvider } from "react-router-dom";
import { ConfigProvider, ConfigProviderProps, theme } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import { useThemeStore } from "@/stores/themeStore";
import router from "@/router";
import "dayjs/locale/zh-cn";
import dayjs from "dayjs";
import { useState } from "react";

dayjs.locale("zh-cn");

function App() {
  type Locale = ConfigProviderProps["locale"];
  const dark = useThemeStore((s) => s.dark);
  const [locale, setLocale] = useState<Locale>(zhCN);
  console.log(zhCN, "ddd");
  return (
    <ConfigProvider
      locale={locale}
      theme={{
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#21AA54",
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
