import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Avatar,
  Divider,
  Tabs,
  Form,
  Input,
  Radio,
  Button,
  message,
} from "antd";
import {
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useUserStore } from "@/stores/userStore";
import { useTabStore } from "@/stores/tabStore";
import { updateProfileApi, updatePwdApi } from "@/api/user";
import AvatarModal from "@/pages/System/components/AvatarModal";
import { useNavigate } from "react-router-dom";

const PersonalCenter: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = useUserStore((s) => s.userInfo);
  const clearAuth = useUserStore((s) => s.clearAuth);
  const getInfoApi = useUserStore((s) => s.getInfoApi);
  const closeAllTabs = useTabStore((s) => s.closeAllTabs);

  const [activeKey, setActiveKey] = useState("1");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // 初始化表单
  React.useEffect(() => {
    if (userInfo) {
      profileForm.setFieldsValue({
        nickName: userInfo.nickName,
        phone: userInfo.phone,
        email: userInfo.email,
        sex: userInfo.sex,
      });
    }
  }, [userInfo, profileForm]);

  // 修改资料
  const updateProfile = async () => {
    try {
      const values = await profileForm.validateFields();
      setSubmitLoading(true);
      await updateProfileApi(values);
      message.success("资料修改成功");
      getInfoApi();
    } finally {
      setSubmitLoading(false);
    }
  };

  // 修改密码
  const updatePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      setSubmitLoading(true);
      await updatePwdApi(values);
      message.success("密码修改成功，请重新登录");
      clearAuth();
      closeAllTabs();
      navigate("/login");
    } finally {
      setSubmitLoading(false);
    }
  };

  // 头像上传成功
  const onAvatarSuccess = (url: string) => {
    if (userInfo) {
      useUserStore.setState({
        userInfo: { ...userInfo, avatar: url },
      });
    }
    message.success("头像更新成功");
    setAvatarModalOpen(false);
  };

  const tabItems = [
    {
      key: "1",
      label: "基本资料",
      children: (
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={updateProfile}
          className="max-w-xl"
        >
          <Form.Item label="用户昵称" name="nickName">
            <Input />
          </Form.Item>
          <Form.Item
            label="手机号码"
            name="phone"
            rules={[
              { required: true, message: "请输入手机号码" },
              { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的11位手机号码" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: "请输入邮箱地址" },
              { type: "email", message: "请输入正确的邮箱格式" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="性别" name="sex">
            <Radio.Group>
              <Radio value={1}>男</Radio>
              <Radio value={0}>女</Radio>
            </Radio.Group>
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitLoading}>
            保存修改
          </Button>
        </Form>
      ),
    },
    {
      key: "2",
      label: "修改密码",
      children: (
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={updatePassword}
          className="max-w-xl"
        >
          <Form.Item label="旧密码" name="oldPassword">
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[{ required: true, min: 6, message: "密码长度不能少于6位" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            rules={[
              {
                validator: async (_, value) => {
                  const newPwd = passwordForm.getFieldValue("newPassword");
                  if (value && value !== newPwd) {
                    throw new Error("两次输入的密码不一致");
                  }
                },
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Button
            type="primary"
            danger
            htmlType="submit"
            loading={submitLoading}
          >
            重置密码
          </Button>
        </Form>
      ),
    },
  ];

  return (
    <div className="p-4 min-h-full">
      <Row gutter={16}>
        <Col span={8}>
          <Card title="个人信息" bordered={false} className="h-full">
            <div className="flex flex-col items-center py-6">
              <div
                className="relative group cursor-pointer"
                onClick={() => setAvatarModalOpen(true)}
              >
                <Avatar
                  size={120}
                  src={userInfo?.avatar}
                  icon={<UserOutlined />}
                />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <CameraOutlined className="text-white text-2xl" />
                </div>
              </div>
              <h2
                className="mt-4 text-xl font-bold"
                style={{ color: "var(--c-text)" }}
              >
                {userInfo?.username}
              </h2>
              <p className="text-gray-500">
                {userInfo?.remark || "暂无个人简介"}
              </p>
            </div>
            <Divider />
            <div className="px-4 space-y-3">
              <p>
                <EnvironmentOutlined /> 归属部门：
                {userInfo?.department?.name || "未分配"}
              </p>
              <p>
                <PhoneOutlined /> 手机号码：{userInfo?.phone || "未绑定"}
              </p>
              <p>
                <MailOutlined /> 邮箱地址：{userInfo?.email || "未绑定"}
              </p>
              <p>
                <CalendarOutlined /> 注册时间：
                {dayjs(userInfo?.createTime).format("YYYY-MM-DD")}
              </p>
            </div>
          </Card>
        </Col>

        <Col span={16}>
          <Card bordered={false}>
            <Tabs
              activeKey={activeKey}
              onChange={setActiveKey}
              items={tabItems}
            />
          </Card>
        </Col>
      </Row>

      <AvatarModal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        onSuccess={onAvatarSuccess}
        currentAvatar={userInfo?.avatar}
      />
    </div>
  );
};

export default PersonalCenter;
