# 从这里开始：0.6.2-audit.1 状态

本目录是用户指定 Google Drive React 工程的本地修订副本，**不是上一轮单文件 HTML 工程**。
原 Drive 目录未被覆盖。本版是可审阅、可应用的源码补丁，不是已经运行验收的商业成品。

阅读顺序：
1. `PIXEL_AND_CONTRACT_AUDIT_2026-10-09.md`：证据、问题、修正及局限。
2. `LOCAL_REVIEW_CONTRACTS.md`：当前生效边界。
3. `RELEASE_READINESS.md`：哪些检查执行、哪些没执行。
4. 根目录 `README.md`：在具备依赖的环境复跑。

`audit/baseline-docs`、原 `test-results` 和原 `tests/screenshots` 都是历史证据。
`audit/layout-fixture` 是带水印的静态 HTML/CSS 样张，不是实际 React 运行截图。
不要把源码整改、静态截图或纯函数测试换算为生产发布资格。
