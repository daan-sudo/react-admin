import React, { useState, useEffect } from "react";
import { Avatar, Card, Row, Col, Tag, List } from "antd";
import {
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TeamOutlined,
  DesktopOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { useUserStore } from "@/stores/userStore";

interface WeatherInfo {
  location: { name: string };
  now: { text: string; temperature: string };
}

const stats = [
  {
    title: "总销售额",
    value: "￥126,560",
    tag: "月",
    color: "blue",
    rise: true,
    percent: 12,
  },
  {
    title: "访问量",
    value: "8,846",
    tag: "日",
    color: "green",
    rise: true,
    percent: 5,
  },
  {
    title: "支付笔数",
    value: "6,560",
    tag: "周",
    color: "orange",
    rise: false,
    percent: 2,
  },
  {
    title: "运营指数",
    value: "78%",
    tag: "年",
    color: "purple",
    rise: true,
    percent: 11,
  },
];

const navs = [
  { name: "用户管理", icon: <TeamOutlined />, color: "#69c0ff" },
  { name: "分析页", icon: <BarChartOutlined />, color: "#95de64" },
  { name: "商品管理", icon: <ShoppingOutlined />, color: "#ff9c6e" },
  { name: "系统设置", icon: <SettingOutlined />, color: "#b37feb" },
  { name: "工作台", icon: <DesktopOutlined />, color: "#5cdbd3" },
  { name: "发布", icon: <RocketOutlined />, color: "#ff85c0" },
];

const activities = [
  { user: "曲丽丽", action: "更新了", target: "项目进展", time: "刚刚" },
  { user: "付小小", action: "修改了", target: "系统参数", time: "1小时前" },
  { user: "林东东", action: "部署了", target: "后端服务", time: "昨天 10:20" },
];

const Home: React.FC = () => {
  const userInfo = useUserStore((s) => s.userInfo);
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo>({
    location: { name: "" },
    now: { text: "", temperature: "" },
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = "SDRb9BvOnW6kdIT41";
        const response = await fetch(
          `https://api.seniverse.com/v3/weather/now.json?key=${apiKey}&location=ip`,
        );
        if (response.status === 200) {
          const data = await response.json();
          const result = data?.results?.[0];
          if (result) setWeatherInfo(result);
        }
      } catch {
        // ignore weather errors
      }
    };
    fetchWeather();
  }, []);

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* 欢迎区域 */}
      <div
        className="p-6 rounded-lg shadow-sm flex items-center justify-between"
        style={{ backgroundColor: "var(--c-bg)" }}
      >
        <div className="flex items-center space-x-4">
          <Avatar size={64} src={userInfo?.avatar} icon={<UserOutlined />} />
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--c-text)" }}
            >
              早安，{userInfo?.nickName || userInfo?.username}
              ，开始您一天的工作吧！
            </h1>
            <p className="text-gray-500 mt-1">
              {userInfo?.department?.name || "研发部"} |{" "}
              {userInfo?.remark || "系统管理员"}
            </p>
            {weatherInfo.location.name && (
              <p className="text-gray-500 mt-1 font-bold">
                {weatherInfo.location.name}，今日天气{weatherInfo.now.text}，
                {weatherInfo.now.temperature}℃
              </p>
            )}
          </div>
        </div>
        <div className="flex space-x-8 text-right">
          <div>
            <div className="text-gray-400 text-sm mb-1">项目数</div>
            <div
              className="text-2xl font-semibold"
              style={{ color: "var(--c-text)" }}
            >
              12
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">待办项</div>
            <div
              className="text-2xl font-semibold"
              style={{ color: "var(--c-text)" }}
            >
              3 / 10
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">团队排名</div>
            <div
              className="text-2xl font-semibold"
              style={{ color: "var(--c-text)" }}
            >
              4 / 20
            </div>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16}>
        {stats.map((item, index) => (
          <Col span={6} key={index}>
            <Card
              bordered={false}
              className="hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-500">{item.title}</span>
                <Tag color={item.color}>{item.tag}</Tag>
              </div>
              <div
                className="text-3xl font-bold mt-4 mb-2"
                style={{ color: "var(--c-text)" }}
              >
                {item.value}
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <span>
                  周同比 {item.rise ? "↑" : "↓"} {item.percent}%
                </span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 访问量趋势 + 快捷导航/系统动态 */}
      <Row gutter={16}>
        <Col span={16}>
          <Card
            title={<span style={{ fontWeight: "bold" }}>访问量趋势</span>}
            bordered={false}
            className="h-full"
            extra={<a href="#">查看更多</a>}
          >
            <div className="h-64 w-full rounded flex items-center justify-center border border-dashed border-gray-300 text-gray-400">
              [此处集成 Echarts 或 Chart.js 统计图表]
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <div className="space-y-6">
            <Card
              title={<span style={{ fontWeight: "bold" }}>快捷导航</span>}
              bordered={false}
            >
              <div className="grid grid-cols-3 gap-4">
                {navs.map((nav) => (
                  <div
                    key={nav.name}
                    className="flex flex-col items-center p-2 hover:bg-blue-50 cursor-pointer rounded transition-colors"
                  >
                    <span className="text-xl mb-2" style={{ color: nav.color }}>
                      {nav.icon}
                    </span>
                    <span className="text-xs">{nav.name}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card
              title={<span style={{ fontWeight: "bold" }}>系统动态</span>}
              bordered={false}
            >
              <List
                itemLayout="horizontal"
                dataSource={activities}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=1" />
                      }
                      title={
                        <span className="text-sm">
                          {item.user} {item.action}{" "}
                          <a className="text-blue-500">{item.target}</a>
                        </span>
                      }
                      description={item.time}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
