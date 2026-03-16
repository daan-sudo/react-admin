import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Row,
  Col,
  Radio,
  InputNumber,
  TreeSelect,
  message,
} from "antd";
import { getMenuListApi, createMenuApi, updateMenuApi } from "@/api/system";
import type { Menu } from "@/types/system";

interface MenuModalProps {
  open: boolean;
  record?: Menu;
  onClose: () => void;
  onSuccess: () => void;
}

const MenuModal: React.FC<MenuModalProps> = ({
  open,
  record,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [treeData, setTreeData] = useState<Menu[]>([]);
  const [menuType, setMenuType] = useState(1);

  const isEdit = !!record?.id;

  useEffect(() => {
    if (open) {
      // 获取菜单树
      const fetchTree = async () => {
        try {
          const res = await getMenuListApi();
          setTreeData([{ id: 0, name: "根节点(0)" }, ...res]);
        } catch {
          // ignore
        }
      };
      fetchTree();

      if (record) {
        form.setFieldsValue(record);
        setMenuType(record.type || 1);
      } else {
        form.resetFields();
        form.setFieldsValue({ type: 1, orderNum: 0 });
        setMenuType(1);
      }
    }
  }, [open, record, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);

      if (isEdit) {
        await updateMenuApi({ ...values, id: record?.id });
      } else {
        await createMenuApi(values);
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
      title={isEdit ? "编辑菜单" : "新增菜单"}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={confirmLoading}
      width={650}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="菜单类型"
              name="type"
              rules={[{ required: true, message: "请选择类型" }]}
            >
              <Radio.Group
                buttonStyle="solid"
                onChange={(e) => setMenuType(e.target.value)}
              >
                <Radio.Button value={1}>目录</Radio.Button>
                <Radio.Button value={2}>菜单</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="上级菜单" name="parentId">
              <TreeSelect
                showSearch
                style={{ width: "100%" }}
                dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                placeholder="请选择上级菜单"
                allowClear
                treeDefaultExpandAll
                treeData={treeData as never}
                fieldNames={{
                  label: "name",
                  value: "id",
                  children: "children",
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="图标" name="icon">
              <Input placeholder="请输入图标名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="菜单名称"
              name="name"
              rules={[{ required: true, message: "请输入菜单名称" }]}
            >
              <Input placeholder="请输入菜单名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="显示排序" name="orderNum">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          {menuType !== 3 && (
            <Col span={12}>
              <Form.Item label="路由路径" name="path">
                <Input placeholder="如: /system" />
              </Form.Item>
            </Col>
          )}
          {menuType !== 1 && (
            <Col span={12}>
              <Form.Item label="权限标识" name="permission">
                <Input placeholder="如: sys:menu:add" />
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    </Modal>
  );
};

export default MenuModal;
