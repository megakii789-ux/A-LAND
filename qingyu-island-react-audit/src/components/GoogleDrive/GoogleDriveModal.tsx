import React from 'react';
import { DialogFrame } from '../shared/DialogFrame';
interface Props { isOpen:boolean; onClose:()=>void; }
/** Cloud export is deliberately quarantined until scope, consent and payload review. */
export const GoogleDriveModal:React.FC<Props>=({isOpen,onClose})=>(
 <DialogFrame open={isOpen} onClose={onClose} title="云备份未启用" mode="adult" help={false}>
  <p>此版本不会请求 Google 授权或上传儿童数据。可在大人工作台导出明确列出的少量本机设置。</p>
 </DialogFrame>
);
