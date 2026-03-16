import React, { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined, SafetyOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "@/stores/themeStore";
import { useUserStore } from "@/stores/userStore";
import { getCaptchaApi, loginApi } from "@/api/user";
import ThemeChange from "@/components/ThemeChange";
import "./Login.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dark = useThemeStore((s) => s.dark);
  const setTokens = useUserStore((s) => s.setTokens);
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  // const [num, setNum] = useState(0);
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaKey, setCaptchaKey] = useState("");

  const getCaptcha = async () => {
    try {
      const res = await getCaptchaApi();
      setCaptchaKey(res.captchaKey);
      setCaptchaSvg(res.svg);
    } catch {
      // ignore
    }
  };
  // const handleClick = () => {
  //   setNum(num + 1);
  // };
  // useEffect(() => {
  //   console.log(num);
  // }, [num]);
  useEffect(() => {
    getCaptcha();
  }, []);

  const handleLogin = async () => {
    try {
      const values = await form.validateFields();
      console.log(values, "values");
      setIsLoading(true);
      const res = await loginApi({
        username: values.username,
        password: values.password,
        captcha: values.captcha,
        captchaKey,
      });
      message.success("登录成功");
      setTokens(res.access_token, res.refresh_token);
      // debugger;
      navigate("/home");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`login-container ${dark ? "dark" : ""}`}
      style={{ backgroundColor: dark ? "#0a0a0a" : "#f0f2f5" }}
    >
      <header className="fixed top-0 w-full flex justify-end p-6 z-50">
        <ThemeChange />
      </header>

      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>
      {dark && <div className="bg-glow bg-glow-3"></div>}

      <div className="login-card">
        <div className="text-center mb-8">
          <h2
            className="text-[28px] font-bold mb-2"
            style={{ color: dark ? "#fff" : "#333" }}
          >
            清风后台管理系统
          </h2>
          <p className="text-sm text-gray-500">欢迎回来，请登录您的账号</p>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={{ username: "admin", password: "123456" }}
          className="login-form"
        >
          <Form.Item
            label={<span style={{ color: dark ? "#fff" : "#333" }}>账号</span>}
            name="username"
            rules={[{ required: true, message: "请输入账号" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入账号"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: dark ? "#fff" : "#333" }}>密码</span>}
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={
              <span style={{ color: dark ? "#fff" : "#333" }}>验证码</span>
            }
            name="captcha"
            rules={[{ required: true, message: "请输入验证码" }]}
          >
            <div className="flex gap-3">
              <Input
                prefix={<SafetyOutlined />}
                placeholder="请输入"
                size="large"
                className="flex-1"
              />
              <div
                className="captcha-img"
                dangerouslySetInnerHTML={{ __html: captchaSvg }}
                onClick={getCaptcha}
                title="点击刷新"
              ></div>
            </div>
          </Form.Item>

          <Button
            loading={isLoading}
            type="primary"
            block
            size="large"
            className="submit-btn mt-4"
            onClick={handleLogin}
          >
            进入系统
          </Button>
          {/* <Button onClick={handleClick}>点击</Button> */}
        </Form>
      </div>
    </div>
  );
};

export default Login;
