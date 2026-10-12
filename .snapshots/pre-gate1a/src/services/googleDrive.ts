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

// List files from Google Drive
export const listDriveFiles = async (query?: string, pageSize: number = 20): Promise<DriveFile[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('请先使用 Google 账号登录');

  let url = `https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}&fields=files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink)&orderBy=modifiedTime desc`;
  if (query) {
    url += `&q=${encodeURIComponent(query)}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `获取云端硬盘文件失败: ${response.status}`);
  }

  const data = await response.json();
  return data.files || [];
};

// Upload or create a file in Google Drive (multipart upload for metadata + content)
export const uploadDriveFile = async (
  name: string,
  content: string,
  mimeType: string = 'application/json'
): Promise<DriveFile> => {
  const token = await getAccessToken();
  if (!token) throw new Error('请先使用 Google 账号登录');

  const metadata = {
    name,
    mimeType
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
    content +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `上传文件至 Google 云端硬盘失败: ${response.status}`);
  }

  return await response.json();
};

// Download / read content of a text or JSON file
export const getDriveFileContent = async (fileId: string): Promise<string> => {
  const token = await getAccessToken();
  if (!token) throw new Error('请先使用 Google 账号登录');

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`读取文件内容失败: ${response.status}`);
  }

  return await response.text();
};

// Delete a file from Google Drive (MUST be wrapped with user confirmation dialog!)
export const deleteDriveFile = async (fileId: string): Promise<void> => {
  const token = await getAccessToken();
  if (!token) throw new Error('请先使用 Google 账号登录');

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `删除文件失败: ${response.status}`);
  }
};
