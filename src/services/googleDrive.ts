import { getAccessToken } from './googleAuth';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
}

// SEC-04: Google Drive 云端备份强制关闭 (Fail Closed)
// 保护儿童隐私，禁止将天气、想念、特征或观察数据上传到未经审核的云端服务

export const listDriveFiles = async (_query?: string, _pageSize: number = 20): Promise<DriveFile[]> => {
  throw new Error('CLOUD_BACKUP_DISABLED: 云端备份功能已关闭，保护儿童与家庭隐私。');
};

export const uploadDriveFile = async (
  _name: string,
  _content: string,
  _mimeType: string = 'application/json'
): Promise<DriveFile> => {
  throw new Error('CLOUD_BACKUP_DISABLED: 云端备份功能已关闭，禁止上传儿童与家庭数据。');
};

export const getDriveFileContent = async (_fileId: string): Promise<string> => {
  throw new Error('CLOUD_BACKUP_DISABLED: 云端备份功能已关闭。');
};

export const deleteDriveFile = async (_fileId: string): Promise<void> => {
  throw new Error('CLOUD_BACKUP_DISABLED: 云端备份功能已关闭，禁止自动或未审核删除云端文件。');
};

