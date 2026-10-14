#!/usr/bin/env bash
# ==============================================================================
# A-LAND｜预览环境安全回滚脚本 (Gate D6 加固版)
# ==============================================================================
# 最高原则 (D6-02)：
#   1. 立即取消 f8c74019 作为默认安全回滚目标；严禁回滚至任何未包含 Pages Functions、
#      _routes.json、内容审核门禁、离线求助保护及 D6 安全封印的历史版本。
#   2. 回滚目标必须在 scripts/rollback-whitelist.json 的 approvedSafeTargets 白名单内，
#      且通过 Git Tree 静态与契约完整性双重校验。
#   3. 执行回滚前必须检查 Git 工作区是否干净，严禁无提示覆盖未提交或未追踪文件。
#   4. 回滚生成前向提交后，必须重新执行完整质量门禁 (tsc + vitest + vite build + /api/* Fail-Closed)；
#      任何测试失败立即中止并回退本地提交，严禁推送。
#
# 用法:
#   bash scripts/rollback-preview.sh --target <VERIFIED_SAFE_GIT_SHA> [--dry-run | --apply] [--push]
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GIT_WORKDIR="${A_LAND_GIT_WORKDIR:-/home/voga/A-LAND}"
DEPS_NODE_MODULES="${A_LAND_DEPS_DIR:-/tmp/qingyu_deps/node_modules}"
WHITELIST_FILE="${A_LAND_ROLLBACK_WHITELIST:-${SCRIPT_DIR}/rollback-whitelist.json}"

TARGET_SHA=""
MODE="dry-run"
DO_PUSH="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      TARGET_SHA="${2:-}"
      shift 2
      ;;
    --dry-run)
      MODE="dry-run"
      shift
      ;;
    --apply)
      MODE="apply"
      shift
      ;;
    --push)
      DO_PUSH="true"
      shift
      ;;
    *)
      echo "[ERROR] 未知参数: $1" >&2
      echo "用法: $0 --target <VERIFIED_SAFE_GIT_SHA> [--dry-run | --apply] [--push]" >&2
      exit 1
      ;;
  esac
done

if [[ -z "$TARGET_SHA" ]]; then
  echo "[FATAL] 必须显式指定 --target <VERIFIED_SAFE_GIT_SHA>（已取消 f8c74019 默认回滚目标，请查阅 scripts/rollback-whitelist.json）" >&2
  exit 1
fi

if [[ ! -d "$GIT_WORKDIR/.git" ]]; then
  echo "[FATAL] Git 工作目录不存在或未初始化: ${GIT_WORKDIR}" >&2
  exit 1
fi

# 1. 分支保护检查：仅允许在 preview 分支执行
CURRENT_BRANCH="$(git -C "$GIT_WORKDIR" rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT_BRANCH" != "preview" ]]; then
  echo "[FATAL] 当前分支为 '${CURRENT_BRANCH}'，回滚脚本仅允许在 'preview' 分支执行（严禁触碰 main 或 public-hold）！" >&2
  exit 1
fi

# 2. 工作区干净检查：禁止无提示覆盖未提交文件
DIRTY_STATUS="$(git -C "$GIT_WORKDIR" status --porcelain --untracked-files=normal)"
if [[ -n "$DIRTY_STATUS" ]]; then
  echo "[FATAL] Git 工作区不干净！检测到未提交或未追踪的文件变更，禁止无提示覆盖：" >&2
  echo "$DIRTY_STATUS" >&2
  exit 1
fi

# 3. 解析完整 40 位 Commit SHA
if ! RESOLVED_SHA="$(git -C "$GIT_WORKDIR" rev-parse --verify "${TARGET_SHA}^{commit}" 2>/dev/null)"; then
  echo "[FATAL] 目标提交在 Git 仓库中不存在: ${TARGET_SHA}" >&2
  exit 1
fi

# 4. 校验回滚白名单与黑名单 (D6-02: 严禁回滚至 f8c74019 等不安全历史版本)
if [[ ! -f "$WHITELIST_FILE" ]]; then
  echo "[FATAL] 找不到安全回滚白名单配置文件: ${WHITELIST_FILE}" >&2
  exit 1
fi

WHITELIST_CHECK="$(node -e '
const fs = require("fs");
const whitelist = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
const target = process.argv[2];

if (target.startsWith("f8c74019")) {
  console.error("[REJECT] f8c74019 已被永久取消回滚资格：缺少 Cloudflare Pages Functions、_routes.json 及 D6 安全封印。");
  process.exit(2);
}

const revoked = (whitelist.revokedUnsafeTargets || []).find(
  item => target === item.sha || target.startsWith(item.sha) || item.sha.startsWith(target)
);
if (revoked) {
  console.error(`[REJECT] 目标版本 ${target} 位于已吊销不安全列表: ${revoked.reason}`);
  process.exit(2);
}

const approved = (whitelist.approvedSafeTargets || []).find(
  item => (typeof item === "string" ? item === target : item.sha === target)
);
if (!approved) {
  console.error(`[REJECT] 目标版本 ${target} 不在已验收安全版本白名单 (approvedSafeTargets) 内！`);
  process.exit(3);
}
console.log("WHITELIST_OK");
' "$WHITELIST_FILE" "$RESOLVED_SHA" 2>&1)" || {
  echo "[FATAL] 安全回滚白名单拦截：" >&2
  echo "$WHITELIST_CHECK" >&2
  exit 1
}

# 5. 静态校验目标 Commit Tree 是否具备完整的安全组件与契约
echo "[Check] 正在核验目标版本 ${RESOLVED_SHA:0:12} 的安全文件树与契约完整性..."
REQUIRED_PATHS=(
  "functions/api/[[path]].ts"
  "functions/api/health.ts"
  "public/_routes.json"
  "public/_headers"
  "public/sw.js"
  "src/domain/cognitive/ContentAuditRegistry.ts"
  "src/domain/hug/offlineHugService.ts"
  "src/domain/privacy/parentAccess.ts"
)

for req_path in "${REQUIRED_PATHS[@]}"; do
  if ! git -C "$GIT_WORKDIR" cat-file -e "${RESOLVED_SHA}:${req_path}" 2>/dev/null; then
    echo "[FATAL] 目标版本 ${RESOLVED_SHA} 缺失关键安全文件: ${req_path}，拒绝回滚！" >&2
    exit 1
  fi
done

# 核验目标版本中的 /api/[[path]].ts 包含 503 与 mode: 'local-only-verified'
CATCHALL_CONTENT="$(git -C "$GIT_WORKDIR" show "${RESOLVED_SHA}:functions/api/[[path]].ts")"
if ! grep -q "status: 503" <<<"$CATCHALL_CONTENT" || ! grep -q "mode: 'local-only-verified'" <<<"$CATCHALL_CONTENT"; then
  echo "[FATAL] 目标版本 ${RESOLVED_SHA} 的 functions/api/[[path]].ts 不满足统一 503 + mode='local-only-verified' 契约，拒绝回滚！" >&2
  exit 1
fi

# 核验目标版本中的 public/_routes.json 拦截 /api/*
ROUTES_CONTENT="$(git -C "$GIT_WORKDIR" show "${RESOLVED_SHA}:public/_routes.json")"
if ! grep -q '"/api/\*"' <<<"$ROUTES_CONTENT"; then
  echo "[FATAL] 目标版本 ${RESOLVED_SHA} 的 public/_routes.json 未包含 /api/* 路由保护，拒绝回滚！" >&2
  exit 1
fi

# 核验目标版本中的 public/sw.js 已关闭私有预览 HTML 离线缓存
SW_CONTENT="$(git -C "$GIT_WORKDIR" show "${RESOLVED_SHA}:public/sw.js")"
if ! grep -q "PRECACHE_DISABLED_IN_PRIVATE_PREVIEW" <<<"$SW_CONTENT"; then
  echo "[FATAL] 目标版本 ${RESOLVED_SHA} 的 public/sw.js 未关闭私有预览 HTML 离线缓存 (D6-03)，拒绝回滚！" >&2
  exit 1
fi

CURRENT_SHA="$(git -C "$GIT_WORKDIR" rev-parse HEAD)"
echo "=================================================================="
echo " A-LAND 预览分支受控安全回滚 (Mode: ${MODE})"
echo " 当前分支      : ${CURRENT_BRANCH}"
echo " 当前 HEAD     : ${CURRENT_SHA}"
echo " 目标安全基线  : ${RESOLVED_SHA}"
echo " 白名单校验    : PASS (WHITELIST_OK + Tree Contracts Verified)"
echo "=================================================================="

echo ""
echo "[Diff Preview] 从当前 HEAD (${CURRENT_SHA:0:12}) 回退至 ${RESOLVED_SHA:0:12} 的文件变更摘要:"
git -C "$GIT_WORKDIR" diff --stat "$CURRENT_SHA" "$RESOLVED_SHA"

if [[ "$MODE" == "dry-run" ]]; then
  echo ""
  echo "[DRY-RUN 完成] 白名单与安全契约核验全部通过，未修改 Git 历史或工作区。"
  echo "如需执行前向回滚提交并运行全量门禁，请追加 --apply 参数。"
  exit 0
fi

echo ""
echo "[Rollback Apply] 使用已验收目标提交 ${RESOLVED_SHA} 的树状态生成前向回滚提交 (不使用 force push)..."
# 保留当前最新的白名单配置，防止回滚后丢失新近登记的白名单记录
SAVED_WHITELIST="$(cat "$WHITELIST_FILE")"
git -C "$GIT_WORKDIR" read-tree --reset -u "$RESOLVED_SHA"
printf '%s\n' "$SAVED_WHITELIST" > "${GIT_WORKDIR}/scripts/rollback-whitelist.json"

# 重新挂载 node_modules 软链接供质量门禁执行（.gitignore 已排除 node_modules）
if [[ ! -e "${GIT_WORKDIR}/node_modules" && -d "$DEPS_NODE_MODULES" ]]; then
  ln -s "$DEPS_NODE_MODULES" "${GIT_WORKDIR}/node_modules"
fi

# 重新生成包含回滚溯源元数据的 public/version.json
if [[ -f "${GIT_WORKDIR}/scripts/generate-version-json.mjs" ]]; then
  (cd "$GIT_WORKDIR" && node scripts/generate-version-json.mjs --rollback-from "$CURRENT_SHA" --rollback-to "$RESOLVED_SHA")
fi

git -C "$GIT_WORKDIR" add -A
git -C "$GIT_WORKDIR" commit --allow-empty -m "revert(preview): forward rollback preview tree to D6-verified snapshot ${RESOLVED_SHA:0:12}"
NEW_HEAD="$(git -C "$GIT_WORKDIR" rev-parse HEAD)"

# 刷新提交后的真实 commitSha 到 version.json 并 amend 该回滚提交
if [[ -f "${GIT_WORKDIR}/scripts/generate-version-json.mjs" ]]; then
  (cd "$GIT_WORKDIR" && node scripts/generate-version-json.mjs --commit-sha "$NEW_HEAD" --rollback-from "$CURRENT_SHA" --rollback-to "$RESOLVED_SHA")
  git -C "$GIT_WORKDIR" add public/version.json
  git -C "$GIT_WORKDIR" commit --amend --no-edit
  NEW_HEAD="$(git -C "$GIT_WORKDIR" rev-parse HEAD)"
fi

echo ""
echo "[Quality Gate] 回滚提交 ${NEW_HEAD:0:12} 已生成，正在执行强制质量门禁验证..."
run_post_rollback_gate() {
  echo "  -> [1/4] TypeScript 类型检查 (tsc --noEmit)..."
  (cd "$GIT_WORKDIR" && ./node_modules/.bin/tsc --noEmit)
  echo "  -> [2/4] Vitest 全量安全与领域测试 (vitest run)..."
  (cd "$GIT_WORKDIR" && ./node_modules/.bin/vitest run)
  echo "  -> [3/4] 专项验证回滚后 /api/* 仍然 Fail-Closed 503 (cloudflarePagesAdapter.test.ts)..."
  (cd "$GIT_WORKDIR" && ./node_modules/.bin/vitest run tests/domain/cloudflarePagesAdapter.test.ts)
  echo "  -> [4/4] Vite 生产构建与零密钥扫描 (vite build)..."
  (cd "$GIT_WORKDIR" && ./node_modules/.bin/vite build)
  rm -rf "${GIT_WORKDIR}/dist"
}

if ! run_post_rollback_gate; then
  echo "[FATAL] 回滚后质量门禁测试失败！正在自动撤销本次回滚提交并恢复至 ${CURRENT_SHA}，严禁推送！" >&2
  git -C "$GIT_WORKDIR" reset --hard "$CURRENT_SHA"
  exit 1
fi

echo "[PASS] 回滚提交 ${NEW_HEAD} 已通过全部质量门禁（TypeScript + Vitest + Vite Build + /api/* Fail-Closed 503）！"

if [[ "$DO_PUSH" == "true" ]]; then
  echo "[Push] 推送已验证回滚提交至 origin/preview (无 --force)..."
  git -C "$GIT_WORKDIR" push origin preview
fi
