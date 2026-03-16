import React, { useState, useEffect, useCallback } from "react";
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Avatar,
  Flex,
} from "antd";
import SearchCard from "@/components/SearchCard";
import CommonTable from "@/components/CommonTable";
import UserModal from "./components/UserModal";
import { getUserListApi } from "@/api/system";
import type { User } from "@/types/system";
import dayjs from "dayjs";

const UserSystem: React.FC = () => {
  const [dataSource, setDataSource] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<User | undefined>();
  const [searchData, setSearchData] = useState({ username: "", status: "" });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ["10", "20", "30", "40", "50"],
    showTotal: (total: number) => `共 ${total} 条`,
  });

  const getUserList = useCallback(
    async (page?: number, pageSize?: number) => {
      setLoading(true);
      try {
        const res = await getUserListApi({
          ...searchData,
          pageSize: pageSize || pagination.pageSize,
          current: page || pagination.current,
        });
        setDataSource(res.records);
        setPagination((prev) => ({
          ...prev,
          total: res.total,
          current: res.current,
        }));
      } finally {
        setLoading(false);
      }
    },
    [searchData, pagination.current, pagination.pageSize],
  );

  useEffect(() => {
    getUserList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => getUserList(1);
  const handleReset = () => {
    setSearchData({ username: "", status: "" });
    getUserList(1);
  };

  const handleAdd = () => {
    setEditRecord(undefined);
    setModalOpen(true);
  };

  const handleEdit = (record: User) => {
    setEditRecord(record);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    console.log("delete", id);
  };

  const formatRole = (roles: { id: number; name: string }[]) => {
    return roles?.map((item) => item.name).join(",") || "";
  };

  const columns = [
    { title: "用户名", dataIndex: "username", key: "username", width: 100 },
    { title: "昵称", dataIndex: "nickName", key: "nickName", width: 100 },
    { title: "头像", dataIndex: "avatar", key: "avatar", width: 100 },
    { title: "性别", dataIndex: "sex", key: "sex", width: 100 },
    { title: "状态", dataIndex: "status", key: "status", width: 100 },
    { title: "邮箱", dataIndex: "email", key: "email", width: 200 },
    { title: "角色", dataIndex: "roles", key: "roles", width: 100 },
    { title: "手机号", dataIndex: "phone", key: "phone", width: 140 },
    { title: "部门", dataIndex: "department", key: "department", width: 100 },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
      width: 100,
    },
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
      width: 160,
      fixed: "right" as const,
    },
  ];

  const renderBodyCell = (column: { dataIndex?: string }, record: unknown) => {
    const r = record as User;
    switch (column.dataIndex) {
      case "avatar":
        return <Avatar src={r.avatar} />;
      case "sex":
        return r.sex === 1 ? (
          <Tag color="green">男</Tag>
        ) : (
          <Tag color="red">女</Tag>
        );
      case "status":
        return r.status === 1 ? (
          <Tag color="green">正常</Tag>
        ) : (
          <Tag color="red">禁用</Tag>
        );
      case "createTime":
        return <span>{dayjs(r.createTime).format("YYYY-MM-DD")}</span>;
      case "department":
        return <span>{r.department?.name}</span>;
      case "roles":
        return <span>{formatRole(r.roles)}</span>;
      case "action":
        return (
          <Space>
            <Button danger size="small" onClick={() => handleDelete(r.id)}>
              删除
            </Button>
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
      <SearchCard title="用户管理搜索">
        <Form layout="vertical">
          <Row gutter={10}>
            <Col span={8}>
              <Form.Item label="用户名">
                <Input
                  value={searchData.username}
                  onChange={(e) =>
                    setSearchData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder="请输入用户名"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="状态">
                <Select
                  value={searchData.status}
                  onChange={(val) =>
                    setSearchData((prev) => ({ ...prev, status: val }))
                  }
                  placeholder="请选择状态"
                >
                  <Select.Option value="">全部</Select.Option>
                  <Select.Option value="1">正常</Select.Option>
                  <Select.Option value="0">禁用</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
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
              getUserList(page, pageSize);
            },
          }}
          onRefresh={() => getUserList()}
          extra={
            <Button type="primary" onClick={handleAdd}>
              + 新增用户
            </Button>
          }
          renderBodyCell={renderBodyCell}
        />
      </div>

      <UserModal
        open={modalOpen}
        record={editRecord}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          getUserList();
        }}
      />
    </div>
  );
};

export default UserSystem;
