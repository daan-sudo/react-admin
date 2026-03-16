import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Row, Col, InputNumber, Tree, message } from "antd";
import { createRoleApi, updateRoleApi, getMenuListApi } from "@/api/system";
import type { Role, Menu } from "@/types/system";

interface RoleModalProps {
  open: boolean;
  record?: Role;
  onClose: () => void;
  onSuccess: () => void;
}

const RoleModal: React.FC<RoleModalProps> = ({
  open,
  record,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [menuTreeData, setMenuTreeData] = useState<Menu[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);

  const isEdit = !!record?.id;

  useEffect(() => {
    if (open) {
      const fetchMenuTree = async () => {
        try {
          const res = await getMenuListApi();
          setMenuTreeData(res);
        } catch (error) {
          console.error("加载菜单树失败:", error);
        }
      };
      fetchMenuTree();

      if (record) {
        form.setFieldsValue(record);
        setCheckedKeys(
          (record as unknown as { menuIds: number[] }).menuIds || [],
        );
      } else {
        form.resetFields();
        form.setFieldsValue({ orderNum: 0 });
        setCheckedKeys([]);
      }
    }
  }, [open, record, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);

      const data = { ...values, menuIds: checkedKeys };

      if (isEdit) {
        await updateRoleApi({ ...data, id: record?.id });
      } else {
        await createRoleApi(data);
      }

      message.success("操作成功");
      onSuccess();
    } catch (error) {
      console.error("验证失败:", error);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "编辑角色" : "新增角色"}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={confirmLoading}
      width={800}
      destroyOnClose
    >
      <div className="max-h-[60vh] overflow-y-auto px-4">
        <Form form={form} layout="vertical" className="mt-4">
          <Row>
            <Col span={12}>
              <Form.Item
                label="角色名称"
                name="name"
                rules={[{ required: true, message: "请输入角色名称" }]}
              >
                <Input style={{ width: "90%" }} placeholder="请输入角色名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="角色编码"
                name="code"
                rules={[{ required: true, message: "请输入角色编码" }]}
              >
                <Input style={{ width: "90%" }} placeholder="请输入角色编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="显示排序" name="orderNum">
                <InputNumber min={0} style={{ width: "90%" }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="角色描述" name="remark">
                <Input.TextArea placeholder="请输入角色描述" rows={4} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="菜单权限">
                <div className="rounded-md p-4 max-h-[300px] overflow-auto">
                  <Tree
                    checkable
                    checkedKeys={checkedKeys}
                    onCheck={(keys) => setCheckedKeys(keys as React.Key[])}
                    treeData={menuTreeData as never}
                    fieldNames={{ title: "name", key: "id" }}
                    selectable={false}
                    defaultExpandAll
                  />
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};

export default RoleModal;
