# GATE1A_R2 变更清单与源码证据 (Change Manifest)

**基线提交**: `a02b5a92089d477b64246bce0fe6a5fcf80d20c0`  
**执行角色**: 安全架构师、React/TypeScript 工程师、未成年人隐私审计员  
**整改模式**: CONTROLLED P0 REMEDIATION (3D 资产保护与 P0 安全闭环)  

---

## 1. 3D 资产基线保护确认

以下 5 个 3D 核心文件已被完整确认存在、未受篡改并保持引用完备：

| 文件路径 | SHA-256 哈希值 | 实际引用位置 |
| :--- | :--- | :--- |
| `src/components/common/Interactive3DCard.tsx` | `cec08d5e80f729b1212d85f86fbebb0bf0cad013d80f239f94f5e280c7125c01` | `LocationCard.tsx`, `IslandHome.tsx`, `ParentMedalsWall.tsx`, `MedalsModal.tsx`, `ParentingPocketTips.tsx` |
| `src/components/common/Interactive3DMedalToken.tsx` | `fc339ae3f61733f64f53126e7fade735cf00b9ee9fe791bed009d732aa2bda5f` | `MedalsModal.tsx`, `ParentMedalsWall.tsx` |
| `src/components/ParentCoach/CognitiveDimension3DArtifact.tsx` | `0e19fae0d7f8e48970840663d6cbcba333af256924c6149f3e10957a293ef755` | `CognitiveDevelopmentEncyclopedia.tsx` |
| `src/components/ChildIsland/Organic3DBreathingSphere.tsx` | `c64bef353a429f9b9eed5801e6be8f6985a024f08688d0c79e8c2c9cf9e9c083` | `CalmSpace.tsx` |
| `src/tests/interactive3D.test.ts` | `2b3710dc0a6184b3c514028cfe2adb361a382e8351d654fa4569bd47b077c2f6` | Vitest 测试套件 (`npx vitest run src/tests/interactive3D.test.ts`) |

### 快照保护状态
- 快照目录 `.snapshots/pre-gate1a/` 与 `.snapshots/gate1a_r2_baseline/` 已在 `.gitignore` 中配置排除规则，禁止提交至主分支或递归打包膨胀。
- 本轮未新增任何 3D 动画、未增加视觉主题、未重做首页、未引入 WebGL/Three.js。

---

## 2. P0 安全缺陷整改对照证据清单

### SEC-01｜不可信身份令牌与服务端 API 默认关闭 (Fail Closed)
- **修改前位置与证据**: `server.ts` 原 33-51 行包含 `extractSession`，直接将客户端伪造的 `Authorization: Bearer <base64>` 解析为带有 `uid`, `role`, `familyId` 的可信会话，允许未经验证的客户端越权调用私有接口。
- **修改后位置**: `server.ts`
  - 彻底移除 `extractSession`。
  - 保留 `/api/health` 提供无敏感数据的健康探针。
  - 所有 `/api/*` 私有端点实施 Fail Closed 拦截，统一返回 HTTP 503 `API_DISABLED_PENDING_VERIFIED_AUTH`，不接受客户端声明的任何身份或角色。
- **文件哈希**: `0d9cc2e564891db50f70ee73868b789d90f0968a5b2630d2afe1dface91d3891`

### SEC-02｜Firestore 授权隔离与 research_events 客户端禁用
- **修改前位置与证据**: `firestore.rules` 第 54 行在 `child_records/{recordId}` 中存在松散的 `allow write: if !(request.resource.data.keys().hasAny(['rawVoice', 'drawingCanvas', 'audioBlob']));`，因规则采用 OR 逻辑导致无认证写入漏洞；第 80-87 行允许客户端凭 `isResearcher() || isCaregiver()` 全局读写删除 `research_events`。
- **修改后位置**: `firestore.rules`
  - 修复 `child_records`：移除独立 `allow write`，严格限定为 `matchesFamily(familyId) && (isChildDevice() || isCaregiver())` 且字段黑名单约束，禁止删除。
  - `research_events` 实施 Fail Closed：客户端读写默认拒绝（`allow read, write: if false;`），待可信服务端数据管线建立。
- **文件哈希**: `a86fff7d93041693d133493a4262f918d9c17f41019f49dc0079e27c81760b8d`

### SEC-03｜儿童求助必须反映真实通信状态
- **修改前位置与证据**:
  - `offlineHugService.ts` 只要 `navigator.onLine` 为 true 即返回 `CommunicationStatus.SENT` 并生成 `hug_${Date.now()}`，在无远程中继服务时向儿童虚报“已发送”。
  - `HugSupportEntry.tsx` 暴露 6 个状态模拟按钮，直通生产视图。
  - `offlineHugService.ts` 刷新时将旧模拟 `SENT` 恢复为真实送达。
- **修改后位置**:
  - `src/domain/hug/offlineHugService.ts`: 引入 `hasVerifiedRemoteRelay` 参数（当前默认 false）。无真实中继时严格返回 `SEND_FAILED`；`restoreActiveState` 对旧模拟状态强制降级为 `SEND_FAILED`。
  - `src/domain/hug/hugStateMapper.ts`: Canonical State 1 明确陈述：“这里不会发消息。网络未接通或无远程通道。你可以直接去找身边信任的大人。”
  - `src/components/ChildIsland/HugSupportEntry.tsx`: 彻底移除开发模拟按钮；展示非身体接触式陪伴建议（找大人陪坐、说说话、找老师）；本地结束按钮更新为“我身边有大人了（关闭提示）”，说明本地关闭不代表远程到场证据。
- **文件哈希**:
  - `offlineHugService.ts`: `cff66c9ae14c17086057a030b0b609ac4bb998980dc3f4ec1d0268b0cbb7ecbe`
  - `hugStateMapper.ts`: `88bbe2c9c4851d76f330a17d51db184303c01900136746d839f6cdbb2b148d2c`
  - `HugSupportEntry.tsx`: `2d8965da48caad17027a8b2e6c1108acff3f6a515250a3f3b3279bb20a049aa6`

### SEC-04｜完整关闭未经审核的云备份
- **修改前位置与证据**:
  - `googleAuth.ts` 请求包括 `drive`, `drive.scripts`, `photos` 在内的 13 项过宽 OAuth 权限。
  - `GoogleDriveModal.tsx` 打包上传 `childQuotes`, `missNotes`, `weatherHistory`, `parentObservations` 等儿童敏感表达。
  - `googleDrive.ts` 包含全量上传与物理删除 API。
- **修改后位置**:
  - `src/services/googleAuth.ts`: 清空 `SCOPES`；`googleSignIn` 阻断并抛出 `CLOUD_BACKUP_DISABLED`。
  - `src/services/googleDrive.ts`: 所有 Drive API 均实施 Fail Closed 拦截并报错。
  - `src/components/GoogleDrive/GoogleDriveModal.tsx`: 重构为“数据安全与云备份状态”说明弹窗，明确展示云备份已关闭；仅提供“导出本地非敏感配置 (.json)”且附带未加密下载风险警示；不上传任何数据，不静默删除用户云端历史文件。
  - `src/components/Navbar.tsx`: 导航入口文案从“云端备份”修正为“数据说明”。
- **文件哈希**:
  - `googleAuth.ts`: `fa29d62dd4677fb48752dd6e8e8d5460b2a167a6b227c0d504a9f7645b7bd2b3`
  - `googleDrive.ts`: `8ba3a06591f60377e649c7ae6523045a3e0b88c6c36b3b2ea0a8362fc3a66568`
  - `GoogleDriveModal.tsx`: `fce33f349d38cee08ef2deb830ed5a9f8bb5b18e8bd84be3d8966590403c1cd8`
  - `Navbar.tsx`: `b0c1684c5b199a35f4518c2f0437b05fb43bb64c7801c849e109fe1bd98cbdea`

### SEC-05｜儿童本地数据最小化与历史数据隔离
- **修改前位置与证据**: `AppContext.tsx` 第 155-185 行将 `childQuotes` (自由语言), `missNotes` (私密想念), `parentObservations` (私密观察), `todayWeather`, `weatherHistory` 自动通过 `localStorage.setItem` 持久化在设备本地。
- **修改后位置**: `src/context/AppContext.tsx`
  - 确立保存边界：敏感数据（自由表达、私密想念、情绪天气、自省笔记）默认纯内存态，会话结束即释放，不写入本地磁盘。
  - 本地仅保存受控的最小非敏感设置（已完成叶片 ID、勋章标记、日程轮换安排、静音与陪伴层级）至 `aland_safe_non_sensitive_settings_v1`。
  - 历史敏感存储隔离：检查 `LEGACY_STORAGE_KEY`，在家长工作台显式提供一键清理历史敏感缓存功能，不静默删除无关数据。
- **文件哈希**: `582172909fb91afc0601ea7b5225e54a6b181556fd170af4f691ca2c51c1f059`

### SEC-06｜成人入口与权限说明 (本机 PIN 防误入)
- **修改前位置与证据**: `ParentGateModal.tsx` 原第 14-16 行使用固定加法题（7 + 8 = 15）作为唯一的成人防护机制，6 岁儿童极易识破或误触进入。
- **修改后位置**:
  - 新建 `src/domain/privacy/parentAccess.ts`: 基于 PBKDF2 (SHA-256 / 210,000 次哈希加盐) 的本机 PIN 验证；连续 5 次错误触发 60 秒临时锁定；提供内存态 `hasParentAccess()`、`lockParentAccess()`。
  - 重写 `src/components/ParentGateModal.tsx`: 引导首次设置/校验 6-12 位防误触 PIN，禁止全同数字；明确标示声明“本机 PIN 仅为防止儿童误触的端侧屏障，不等于法律监护人身份或云端接口授权凭证”。
  - `src/components/Navbar.tsx`: 离开成人工作台时立即调用 `lockParentAccess()`；监听 `visibilitychange` 事件，页面隐藏或切后台时自动重置锁定并退回儿童视图。
- **文件哈希**:
  - `parentAccess.ts`: `5ace1cd562b2a3de61a8d152ea9b70a30299ff18595988bc65d67821dd635660`
  - `ParentGateModal.tsx`: `f09d89625cdd5c049073960abe327255a9060c55c36d077f1bbedc1809dbe1c7`

### SEC-07｜停止未经验证的心理推断与评分
- **修改前位置与证据**:
  - `weeklyReportService.ts` 原 75-80 行计算伪科学的 `emotionalStabilityScore` (72-98 分数值)；原 138-154 行根据点击次数妄下“孩子心理受 XX 主导”等诊断性结论。
  - `ParentDashboard.tsx` 原 96-135 行向 `/api/parent/weekly-report` 请求 AI 心理学推断分析。
  - `WeeklyReportView.tsx` 原 206 行将求助次数标注为“高依恋安全感”。
- **修改后位置**:
  - `src/services/weeklyReportService.ts`: 废除数值心理评分（设为 0 并明确标记不予打分）；周报核心反馈改为客观行为实践记录（如完成思考工具次数、心晴记录分布），绝不给出诊断性结论。
  - `src/components/ParentCoach/ParentDashboard.tsx`: 移除向云端调用 AI 生成心理分析的请求，完全基于端侧循证模板本地生成。
  - `src/components/ParentCoach/WeeklyReportView.tsx`: 修正第四项指标为“探索与互动记录”，移除“高依恋安全感”等心理标签。
- **文件哈希**:
  - `weeklyReportService.ts`: `f94d913c6a5f760e9fe10ba292c02cab4b1a75638dc98113a10edaa99a82fa5e`
  - `ParentDashboard.tsx`: `80566c8a56a45280970c40c9566451baa756b8e6148efac70c73808df121c51b`
  - `WeeklyReportView.tsx`: `42e69662a93e766d03ae8c776595856b3f7b54f5baae3a3336b889676fe7916c`
