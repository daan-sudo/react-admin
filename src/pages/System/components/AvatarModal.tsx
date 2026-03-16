import React, { useState } from "react";
import { Modal, Upload, Button, Space, message } from "antd";
import { uploadApi } from "@/api/system";

interface AvatarModalProps {
  open: boolean;
  currentAvatar?: string;
  onClose: () => void;
  onSuccess: (url: string) => void;
}

const AvatarModal: React.FC<AvatarModalProps> = ({
  open,
  currentAvatar,
  onClose,
  onSuccess,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatar || "");
  const [file, setFile] = useState<File | null>(null);

  React.useEffect(() => {
    if (open) {
      setPreviewUrl(currentAvatar || "");
      setFile(null);
    }
  }, [open, currentAvatar]);

  const beforeUpload = (f: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(f);
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    setFile(f);
    return false; // 阻止自动上传
  };

  const handleUpload = async () => {
    if (!file) {
      message.warning("请先选择图片");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file, "avatar.png");
      const res = await uploadApi(formData);
      onSuccess(res.url || (res as unknown as string));
    } catch {
      message.error("上传失败");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="上传头像"
      onCancel={onClose}
      width={600}
      footer={
        <Space>
          <Upload
            beforeUpload={beforeUpload}
            showUploadList={false}
            accept="image/*"
          >
            <Button>选择图片</Button>
          </Upload>
          <Button type="primary" loading={uploading} onClick={handleUpload}>
            上传并保存
          </Button>
        </Space>
      }
    >
      <div className="h-[400px] w-full bg-gray-100 rounded flex items-center justify-center overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="avatar preview"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <span className="text-gray-400">请选择图片</span>
        )}
      </div>
    </Modal>
  );
};

export default AvatarModal;
