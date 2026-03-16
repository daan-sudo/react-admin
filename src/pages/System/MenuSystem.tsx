import React, { useState, useEffect, useCallback } from "react";
import {
  Form,
  Input,
  Row,
  Col,
  Button,
  Space,
  Tag,
  DatePicker,
  Flex,
  Popconfirm,
  message,
} from "antd";
import SearchCard from "@/components/SearchCard";
import CommonTable from "@/components/CommonTable";
import MenuModal from "./components/MenuModal";
import { getMenuListApi, deleteMenuApi } from "@/api/system";
import type { Menu } from "@/types/system";
import { MenuType } from "@/types/system";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const MenuSystem: React.FC = () => {
  const [tableData, setTableData] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Menu | undefined>();
  const [searchData, setSearchData] = useState({
    name: "",
    path: "",
    createTimeStart: undefined as string | undefined,
    createTimeEnd: undefined as string | undefined,
  });

  const getMenuList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMenuListApi(searchData as never);
      setTableData(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [searchData]);

  useEffect(() => {
    getMenuList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => getMenuList();

  const handleReset = () => {
    setSearchData({
      name: "",
      path: "",
      createTimeStart: undefined,
      createTimeEnd: undefined,
    });
    getMenuList();
  };

  const handleAdd = () => {
    setEditRecord(undefined);
    setModalOpen(true);
  };

  const handleEdit = (record: Menu) => {
    setEditRecord(record);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMenuApi(id);
      message.success("删除成功");
      getMenuList();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDateChange = (_: unknown, dateStrings: [string, string]) => {
    setSearchData((prev) => ({
      ...prev,
      createTimeStart: dateStrings[0] || undefined,
      createTimeEnd: dateStrings[1] || undefined,
    }));
  };

  const columns = [
    { title: "菜单类型", dataIndex: "type", key: "type", width: 100 },
    { title: "菜单名称", dataIndex: "name", key: "name", width: 100 },
    { title: "路由路径", dataIndex: "path", key: "path", width: 100 },
    { title: "图标", dataIndex: "icon", key: "icon", width: 100 },
    { title: "排序", dataIndex: "orderNum", key: "orderNum", width: 100 },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
      width: 200,
    },
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
      width: 150,
      fixed: "right" as const,
    },
  ];

  const renderBodyCell = (column: { dataIndex?: string }, record: unknown) => {
    const r = record as Menu;
    switch (column.dataIndex) {
      case "name":
        return <span className="font-medium text-green-600">{r.name}</span>;
      case "type":
        if (r.type === MenuType.Directory) return <Tag color="green">目录</Tag>;
        if (r.type === MenuType.Menu) return <Tag color="cyan">菜单</Tag>;
        if (r.type === MenuType.Button) return <Tag color="blue">按钮</Tag>;
        return null;
      case "createTime":
        return <span>{dayjs(r.createTime).format("YYYY-MM-DD")}</span>;
      case "action":
        return (
          <Space>
            <Popconfirm
              title="确定删除吗?"
              okText="确定"
              cancelText="取消"
              onConfirm={() => handleDelete(r.id as string)}
            >
              <Button danger size="small">
                删除
              </Button>
            </Popconfirm>
            <Button type="primary" size="small" onClick={() => handleEdit(r)}>
              编辑
            </Button>
          </Space>
        );
      default:
        return undefined;
    }
  };

  return (
    <div className="flex h-full flex-col">
      <SearchCard title="菜单管理搜索">
        <Form layout="vertical">
          <Row gutter={10}>
            <Col span={6}>
              <Form.Item label="菜单名称">
                <Input
                  value={searchData.name}
                  onChange={(e) =>
                    setSearchData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="请输入菜单名称"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="路由路径">
                <Input
                  value={searchData.path}
                  onChange={(e) =>
                    setSearchData((prev) => ({ ...prev, path: e.target.value }))
                  }
                  placeholder="请输入路由名称"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="创建时间">
                <RangePicker onChange={handleDateChange} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label=" ">
                <Flex justify="end">
                  <Space>
                    <Button onClick={handleReset}>重置</Button>
                    <Button type="primary" onClick={handleSearch}>
                      搜索
                    </Button>
                  </Space>
                </Flex>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </SearchCard>

      <div className="flex-1 min-h-0 overflow-hidden">
        <CommonTable
          title="菜单列表"
          columns={columns}
          dataSource={tableData}
          loading={loading}
          showPagination={false}
          onRefresh={getMenuList}
          extra={
            <Button type="primary" onClick={handleAdd}>
              + 新增菜单
            </Button>
          }
          renderBodyCell={renderBodyCell}
        />
      </div>

      <MenuModal
        open={modalOpen}
        record={editRecord}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          handleReset();
        }}
      />
    </div>
  );
};

export default MenuSystem;
