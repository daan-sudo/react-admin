import React, { useState, useEffect, useCallback } from "react";
import {
  Form,
  Input,
  Row,
  Col,
  Button,
  Space,
  DatePicker,
  Flex,
  Popconfirm,
  message,
} from "antd";
import SearchCard from "@/components/SearchCard";
import CommonTable from "@/components/CommonTable";
import RoleModal from "./components/RoleModal";
import { getRoleListApi, deleteRoleApi } from "@/api/system";
import type { Role } from "@/types/system";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const RoleSystem: React.FC = () => {
  const [dataSource, setDataSource] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Role | undefined>();
  const [searchData, setSearchData] = useState({
    name: "",
    code: "",
    createTimeStart: undefined as string | undefined,
    createTimeEnd: undefined as string | undefined,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ["10", "20", "30", "40", "50"],
    showTotal: (total: number) => `共 ${total} 条`,
  });

  const getRoleList = useCallback(
    async (page?: number, pageSize?: number) => {
      setLoading(true);
      try {
        const res = await getRoleListApi({
          ...searchData,
          pageSize: pageSize || pagination.pageSize,
          current: page || pagination.current,
        });
        setDataSource(res.records);
        setPagination((prev) => ({
          ...prev,
          total: res.total,
        }));
      } finally {
        setLoading(false);
      }
    },
    [searchData, pagination.current, pagination.pageSize],
  );

  useEffect(() => {
    getRoleList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => getRoleList(1);

  const handleReset = () => {
    setSearchData({
      name: "",
      code: "",
      createTimeStart: undefined,
      createTimeEnd: undefined,
    });
    getRoleList(1);
  };

  const handleAdd = () => {
    setEditRecord(undefined);
    setModalOpen(true);
  };

  const handleEdit = (record: Role) => {
    setEditRecord(record);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteRoleApi(id);
      message.success("删除成功");
      getRoleList();
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
    { title: "角色名称", dataIndex: "name", key: "name", width: 100 },
    { title: "角色编码", dataIndex: "code", key: "code", width: 100 },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
      width: 200,
    },
    { title: "角色描述", dataIndex: "remark", key: "remark", width: 200 },
    { title: "排序", dataIndex: "orderNum", key: "orderNum", width: 100 },
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
      width: 150,
      fixed: "right" as const,
    },
  ];

  const renderBodyCell = (column: { dataIndex?: string }, record: unknown) => {
    const r = record as Role;
    switch (column.dataIndex) {
      case "createTime":
        return <span>{dayjs(r.createTime).format("YYYY-MM-DD HH:mm:ss")}</span>;
      case "action":
        return (
          <Space>
            <Popconfirm
              title="确定删除吗?"
              okText="确定"
              cancelText="取消"
              onConfirm={() => handleDelete(r.id)}
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
      <SearchCard title="角色管理搜索">
        <Form layout="vertical">
          <Row gutter={10}>
            <Col span={6}>
              <Form.Item label="角色名称">
                <Input
                  value={searchData.name}
                  onChange={(e) =>
                    setSearchData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="请输入角色名称"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="角色编码">
                <Input
                  value={searchData.code}
                  onChange={(e) =>
                    setSearchData((prev) => ({ ...prev, code: e.target.value }))
                  }
                  placeholder="请输入角色编码"
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
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          showPagination
          pagination={{
            ...pagination,
            onChange: (page: number, pageSize: number) => {
              setPagination((prev) => ({ ...prev, current: page, pageSize }));
              getRoleList(page, pageSize);
            },
          }}
          onRefresh={() => getRoleList()}
          extra={
            <Button type="primary" onClick={handleAdd}>
              + 新增角色
            </Button>
          }
          renderBodyCell={renderBodyCell}
        />
      </div>

      <RoleModal
        open={modalOpen}
        record={editRecord}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          getRoleList();
        }}
      />
    </div>
  );
};

export default RoleSystem;
