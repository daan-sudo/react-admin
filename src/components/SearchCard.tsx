import React, { useState, useRef, useCallback } from "react";
import { Button, Card } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";

interface SearchCardProps {
  title?: string;
  extra?: React.ReactNode;
  children?: React.ReactNode;
}

const SearchCard: React.FC<SearchCardProps> = ({
  title = "筛选查询",
  extra,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;

    if (isExpanded) {
      // 收起
      el.style.height = el.scrollHeight + "px";
      el.style.opacity = "1";
      requestAnimationFrame(() => {
        el.style.transition = "all 0.3s ease-in-out";
        el.style.height = "0";
        el.style.opacity = "0";
      });
    } else {
      // 展开
      el.style.height = "0";
      el.style.opacity = "0";
      el.style.display = "block";
      requestAnimationFrame(() => {
        el.style.transition = "all 0.3s ease-in-out";
        el.style.height = el.scrollHeight + "px";
        el.style.opacity = "1";
        const handler = () => {
          el.style.height = "auto";
          el.removeEventListener("transitionend", handler);
        };
        el.addEventListener("transitionend", handler);
      });
    }
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <Card
      bordered={false}
      className="!mb-4 shadow-sm"
      styles={{ body: { padding: "12px 16px" } }}
    >
      <div className="flex items-center justify-between">
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
          <Button
            type="link"
            size="small"
            onClick={handleToggle}
            className="!flex items-center !p-0"
          >
            <span className="mr-1 text-[13px] text-gray-500">
              {isExpanded ? "收起" : "展开"}
            </span>
            {isExpanded ? (
              <UpOutlined className="text-[10px]" />
            ) : (
              <DownOutlined className="text-[10px]" />
            )}
          </Button>
        </div>
      </div>
      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
      >
        <div className="pt-4">{children}</div>
      </div>
    </Card>
  );
};

export default SearchCard;
