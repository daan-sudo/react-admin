import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Table, Tooltip, Space, Divider, Popover, Checkbox } from "antd";
import {
  ReloadOutlined,
  SettingOutlined,
  FullscreenOutlined,
} from "@ant-design/icons";
import type { TableProps } from "antd";

interface Column {
  title: string;
  dataIndex?: string;
  key?: string;
  width?: number | string;
  align?: "left" | "center" | "right";
  fixed?: "left" | "right";
  visible?: boolean;
  render?: (value: unknown, record: unknown, index: number) => React.ReactNode;
  [key: string]: unknown;
}

interface CommonTableProps {
  title?: string;
  columns: Column[];
  dataSource: unknown[];
  loading?: boolean;
  showPagination?: boolean;
  pagination?: TableProps<unknown>["pagination"];
  rowSelection?: TableProps<unknown>["rowSelection"];
  extra?: React.ReactNode;
  onRefresh?: () => void;
  renderBodyCell?: (
    column: Column,
    record: unknown,
    index: number,
  ) => React.ReactNode | undefined;
}

const CommonTable: React.FC<CommonTableProps> = ({
  title = "数据列表",
  columns,
  dataSource,
  loading = false,
  showPagination = true,
  pagination,
  rowSelection,
  extra,
  onRefresh,
  renderBodyCell,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(300);

  // 列设置
  const [localColumns, setLocalColumns] = useState(
    columns.map((col) => ({ ...col, visible: col.visible ?? true })),
  );

  // 当 columns prop 变化时，同步更新 localColumns
  useEffect(() => {
    setLocalColumns(
      columns.map((col) => ({ ...col, visible: col.visible ?? true })),
    );
  }, [columns]);

  const isAllVisible = localColumns.every((col) => col.visible);
  const isIndeterminate = useMemo(() => {
    const visibleCount = localColumns.filter((col) => col.visible).length;
    return visibleCount > 0 && visibleCount < localColumns.length;
  }, [localColumns]);

  const displayColumns: Column[] = useMemo(() => {
    const visibleCols = localColumns
      .filter((col) => col.visible !== false)
      .map((col) => {
        if (renderBodyCell) {
          return {
            ...col,
            render: (value: unknown, record: unknown, index: number) => {
              const custom = renderBodyCell(col, record, index);
              if (custom !== undefined) return custom;
              return col.render
                ? col.render(value, record, index)
                : (value as React.ReactNode);
            },
          };
        }
        return col;
      });
    return [
      {
        title: "序号",
        key: "index",
        width: 70,
        align: "center" as const,
        fixed: "left" as const,
        render: (_: unknown, __: unknown, index: number) => index + 1,
      },
      ...visibleCols,
    ];
  }, [localColumns, renderBodyCell]);

  // 全选/取消
  const toggleAll = (checked: boolean) => {
    setLocalColumns((prev) =>
      prev.map((col) => ({ ...col, visible: checked })),
    );
  };

  // 重置列
  const resetColumns = () => {
    setLocalColumns(columns.map((col) => ({ ...col, visible: true })));
  };

  // 全屏
  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // 动态计算滚动高度
  const handleResize = useCallback(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;
    const parentHeight = parent.offsetHeight;
    const titleBarHeight = 65;
    const paddingHeight = 32;
    const tableHeaderHeight = 47;
    const paginationHeight = showPagination ? 56 : 0;
    const remainingHeight =
      parentHeight -
      titleBarHeight -
      paddingHeight -
      tableHeaderHeight -
      paginationHeight;
    setScrollY(remainingHeight > 150 ? remainingHeight : 150);
  }, [showPagination]);

  useEffect(() => {
    handleResize();
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(handleResize);
    });
    if (containerRef.current?.parentElement) {
      observer.observe(containerRef.current.parentElement);
    }
    return () => observer.disconnect();
  }, [handleResize]);

  // 列设置内容
  const columnSettingContent = (
    <div className="min-w-[180px]">
      <div className="flex justify-between border-b pb-2 mb-2">
        <Checkbox
          checked={isAllVisible}
          indeterminate={isIndeterminate}
          onChange={(e) => toggleAll(e.target.checked)}
        >
          列展示
        </Checkbox>
        <a onClick={resetColumns} className="text-sm">
          重置
        </a>
      </div>
      {localColumns.map((col, index) => (
        <div
          key={col.dataIndex || col.key || index}
          className="flex items-center py-1 px-2 rounded hover:bg-gray-50"
        >
          <Checkbox
            checked={col.visible}
            onChange={(e) => {
              setLocalColumns((prev) =>
                prev.map((c, i) =>
                  i === index ? { ...c, visible: e.target.checked } : c,
                ),
              );
            }}
          >
            {col.title}
          </Checkbox>
        </div>
      ))}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="rounded-md shadow-sm flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: "var(--c-bg)" }}
    >
      {/* 标题栏 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#00b96b] rounded-full"></div>
          <span
            className="text-[14px] font-bold"
            style={{ color: "var(--c-text)" }}
          >
            {title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {extra}
          {extra && <Divider type="vertical" />}
          <Space size={12}>
            <Tooltip title="刷新">
              <ReloadOutlined
                className="cursor-pointer text-gray-500 hover:text-green-500"
                onClick={onRefresh}
              />
            </Tooltip>
            <Popover
              content={columnSettingContent}
              title="列设置"
              trigger="click"
              placement="bottomRight"
            >
              <Tooltip title="列设置">
                <SettingOutlined className="cursor-pointer text-gray-500 hover:text-green-500" />
              </Tooltip>
            </Popover>
            <Tooltip title="全屏">
              <FullscreenOutlined
                className="cursor-pointer text-gray-500 hover:text-green-500"
                onClick={toggleFullscreen}
              />
            </Tooltip>
          </Space>
        </div>
      </div>

      {/* 表格 */}
      <div className="flex-1 p-4 min-h-0 overflow-hidden">
        <Table
          columns={displayColumns as TableProps<unknown>["columns"]}
          dataSource={dataSource as unknown[]}
          pagination={showPagination ? pagination : false}
          rowSelection={rowSelection}
          loading={loading}
          size="middle"
          scroll={{ x: "max-content", y: scrollY }}
          rowKey="id"
        />
      </div>
    </div>
  );
};

export default CommonTable;
