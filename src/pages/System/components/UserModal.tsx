import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Row,
  Col,
  Avatar,
  Button,
  Radio,
  TreeSelect,
  Select,
  message,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import {
  createUserApi,
  updateUserApi,
  getDeptListApi,
  getRoleListApi,
} from "@/api/system";
import AvatarModal from "./AvatarModal";
import type { User, Role } from "@/types/system";

interface UserModalProps {
  open: boolean;
  record?: User;
  onClose: () => void;
  onSuccess: () => void;
}

const UserModal: React.FC<UserModalProps> = ({
  open,
  record,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deptTreeData, setDeptTreeData] = useState<unknown[]>([]);
  const [roleOptions, setRoleOptions] = useState<Role[]>([]);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  const isEdit = !!record?.id;

  // 获取部门和角色数据
  useEffect(() => {
    if (open) {
      const fetchOptions = async () => {
        try {
          const [depts, roles] = await Promise.all([
            getDeptListApi(),
            getRoleListApi({ pageSize: 1000, current: 1 }),
          ]);
          setDeptTreeData(depts);
          setRoleOptions(roles.records);
        } catch (error) {
          console.error("加载选项数据失败:", error);
        }
      };
      fetchOptions();

      if (record) {
        form.setFieldsValue({
          ...record,
          roleIds: record.roles?.map((r) => r.id) || [],
        });
        setAvatarUrl(record.avatar || "");
      } else {
        form.resetFields();
        form.setFieldsValue({ sex: 1, status: 1 });
        setAvatarUrl("");
      }
    }
  }, [open, record, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      const data = { ...values, avatar: avatarUrl };

      if (isEdit) {
        await updateUserApi({ ...data, id: record?.id });
      } else {
        await createUserApi(data);
      }

      message.success("操作成功");
      onSuccess();
    } catch (error) {
      console.error("提交失败:", error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const onAvatarSuccess = (url: string) => {
    setAvatarUrl(url);
    setAvatarModalOpen(false);
  };

  return (
    <>
      <Modal
        open={open}
        title={isEdit ? "编辑用户" : "新增用户"}
        onOk={handleOk}
        onCancel={onClose}
        confirmLoading={confirmLoading}
        width={800}
        destroyOnClose
      >
        <div className="max-h-[65vh] overflow-y-auto px-4">
          <Form form={form} layout="vertical" className="mt-4">
            <Row gutter={16}>
              <Col span={24} className="flex justify-center mb-6">
                <div className="text-center">
                  <Avatar size={80} src={avatarUrl} icon={<UserOutlined />} />
                  <div className="mt-2">
                    <Button
                      size="small"
                      onClick={() => setAvatarModalOpen(true)}
                    >
                      {isEdit ? "修改头像" : "上传头像"}
                    </Button>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="用户名"
                  name="username"
                  rules={[{ required: true, message: "请输入用户名" }]}
                >
                  <Input placeholder="请输入用户名" disabled={isEdit} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="用户昵称" name="nickName">
                  <Input placeholder="请输入昵称" />
                </Form.Item>
              </Col>
              {!isEdit && (
                <Col span={12}>
                  <Form.Item
                    label="密码"
                    name="password"
                    rules={[{ required: true, message: "请输入密码" }]}
                  >
                    <Input.Password placeholder="请输入密码" />
                  </Form.Item>
                </Col>
              )}
              <Col span={12}>
                <Form.Item label="手机号" name="phone">
                  <Input placeholder="请输入手机号" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="邮箱" name="email">
                  <Input placeholder="请输入邮箱" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="归属部门"
                  name="deptId"
                  rules={[{ required: true, message: "请选择归属部门" }]}
                >
                  <TreeSelect
                    style={{ width: "100%" }}
                    dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                    treeData={deptTreeData as never}
                    placeholder="请选择部门"
                    fieldNames={{
                      label: "name",
                      value: "id",
                      children: "children",
                    }}
                    allowClear
                    treeDefaultExpandAll
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="角色"
                  name="roleIds"
                  rules={[
                    {
                      required: true,
                      type: "array",
                      message: "请至少选择一个角色",
                    },
                  ]}
                >
                  <Select
                    mode="multiple"
                    style={{ width: "100%" }}
                    placeholder="请选择角色"
                    options={roleOptions.map((r) => ({
                      label: r.name,
                      value: r.id,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="性别" name="sex">
                  <Radio.Group>
                    <Radio value={1}>男</Radio>
                    <Radio value={0}>女</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="状态" name="status">
                  <Radio.Group>
                    <Radio value={1}>正常</Radio>
                    <Radio value={0}>禁用</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
      <AvatarModal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        onSuccess={onAvatarSuccess}
        currentAvatar={avatarUrl}
      />
    </>
  );
};

export default UserModal;
