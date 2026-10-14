#!/usr/bin/env bash
# ==============================================================================
# A-LAND｜Google Drive 源码 -> 本机 Git 工作副本 安全同步与门禁验证脚本 (Gate D0 / D4)
# ==============================================================================
# 用法:
#   bash scripts/sync-gdrive-to-git.sh --dry-run   # 仅执行 dry-run 并输出同步清单与差异
#   bash scripts/sync-gdrive-to-git.sh --apply     # 执行同步 + TypeScript + Vitest + Vite Build + 密钥扫描
#   bash scripts/sync-gdrive-to-git.sh --apply --commit "chore(preview): sync verified snapshot"
# ==============================================================================

set -euo pipefail

SOURCE_DIR="${A_LAND_SOURCE_DIR:-/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间}"
GIT_WORKDIR="${A_LAND_GIT_WORKDIR:-/home/voga/A-LAND}"
DEPS_NODE_MODULES="${A_LAND_DEPS_DIR:-/tmp/qingyu_deps/node_modules}"

MODE="dry-run"
COMMIT_MSG=""
DO_PUSH="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      MODE="dry-run"
      shift
      ;;
    --apply)
      MODE="apply"
      shift
      ;;
    --commit)
      COMMIT_MSG="${2:-}"
      if [[ -z "$COMMIT_MSG" ]]; then
        echo "[ERROR] --commit 需要提供提交说明" >&2
        exit 1
      fi
      shift 2
      ;;
    --push)
      DO_PUSH="true"
      shift
      ;;
    *)
      echo "[ERROR] 未知参数: $1" >&2
      echo "用法: $0 [--dry-run | --apply] [--commit <message>] [--push]" >&2
      exit 1
      ;;
  esac
done

echo "=================================================================="
echo " A-LAND 同步与发布门禁流水线 (Mode: ${MODE})"
echo " 源目录 (Google Drive): ${SOURCE_DIR}"
echo " 目标 Git 工作副本    : ${GIT_WORKDIR}"
echo "=================================================================="

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "[FATAL] 源目录不存在: $SOURCE_DIR" >&2
  exit 1
fi

if [[ ! -d "$GIT_WORKDIR/.git" ]]; then
  echo "[FATAL] Git 工作副本不存在或未初始化 .git: $GIT_WORKDIR" >&2
  exit 1
fi

CURRENT_BRANCH="$(git -C "$GIT_WORKDIR" rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" || "$CURRENT_BRANCH" == "public-hold" ]]; then
  echo "[FATAL] 最高原则拦截：当前分支为 '${CURRENT_BRANCH}'，严禁自动覆盖 main 或 public-hold！请切换至 preview 分支。" >&2
  exit 1
fi

RSYNC_EXCLUDES=(
  --exclude='.git/'
  --exclude='node_modules'
  --exclude='node_modules/'
  --exclude='dist'
  --exclude='dist/'
  --exclude='server.js'
  --exclude='bun.lock'
  --exclude='.wrangler/'
  --exclude='.vercel/'
  --exclude='.netlify/'
  --exclude='coverage/'
  --exclude='playwright-report/'
  --exclude='test-results/'
  --exclude='.DS_Store'
  --exclude='*.log'
  --exclude='*.pem'
  --exclude='*.key'
  --exclude='*.p12'
  --exclude='*.sqlite*'
  --exclude='.env'
  --exclude='.env.local'
  --exclude='.env.development*'
  --exclude='.env.test*'
  --exclude='.env.production*'
  --exclude='!.env.example'
)

echo ""
echo "[Step 1/6] 执行 rsync dry-run 校验 (基于 SHA/checksum 比较)..."
DRY_RUN_OUTPUT="$(rsync -avnc --itemize-changes --delete "${RSYNC_EXCLUDES[@]}" "${SOURCE_DIR}/" "${GIT_WORKDIR}/")"
echo "$DRY_RUN_OUTPUT"

if [[ "$MODE" == "dry-run" ]]; then
  echo ""
  echo "[DRY-RUN 完成] 未对 ${GIT_WORKDIR} 做任何文件修改。"
  echo "如需实际同步并执行门禁校验，请运行: bash scripts/sync-gdrive-to-git.sh --apply"
  exit 0
fi

echo ""
echo "[Step 2/6] 同步 Google Drive 源码至本机 Git 工作副本 (${GIT_WORKDIR})..."
rm -f "${SOURCE_DIR}/bun.lock"
rsync -avc --delete "${RSYNC_EXCLUDES[@]}" "${SOURCE_DIR}/" "${GIT_WORKDIR}/"
# 确保工作副本中不残留旧版 bun.lock
rm -f "${GIT_WORKDIR}/bun.lock"

# 安装 Gate D6 分支防意外推送保护钩子
bash "${GIT_WORKDIR}/scripts/install-git-hooks.sh"

# 动态生成真实构建溯源元数据 public/version.json 并回写至源目录保持一致
(cd "$GIT_WORKDIR" && node scripts/generate-version-json.mjs)
cp "${GIT_WORKDIR}/public/version.json" "${SOURCE_DIR}/public/version.json"

# 确保 node_modules 可用（用于本机工作副本门禁验证，已由 .gitignore 排除，不纳入 Git 追踪）
if [[ ! -e "${GIT_WORKDIR}/node_modules" && -d "$DEPS_NODE_MODULES" ]]; then
  ln -s "$DEPS_NODE_MODULES" "${GIT_WORKDIR}/node_modules"
fi

echo ""
echo "[Step 3/6] 执行 Git Diff 与敏感文件拦截检查..."
FORBIDDEN_TRACKED="$(git -C "$GIT_WORKDIR" status --porcelain | awk '{print $2}' | grep -E '(^|/)\.env($|\.)|\.pem$|\.key$|(^|/)(node_modules|dist)($|/)' | grep -v '\.env\.example$' || true)"
if [[ -n "$FORBIDDEN_TRACKED" ]]; then
  echo "[FATAL] 检测到疑似敏感文件或构建产物进入工作区追踪范围:" >&2
  echo "$FORBIDDEN_TRACKED" >&2
  exit 1
fi

git -C "$GIT_WORKDIR" status --short

echo ""
echo "[Step 4/6] 执行 Gate D2/D4/D6 门禁：TypeScript 类型检查 (tsc --noEmit)..."
(cd "$GIT_WORKDIR" && ./node_modules/.bin/tsc --noEmit)
echo "[PASS] TypeScript 类型检查通过 (0 errors)。"

echo ""
echo "[Step 5/6] 执行 Gate D2/D4/D6 门禁：Vitest 单元测试与内容安全门禁验证..."
(cd "$GIT_WORKDIR" && ./node_modules/.bin/vitest run)
echo "[PASS] Vitest 全部测试套件通过。"

echo ""
echo "[Step 6/6] 执行 Gate D2/D3/D4/D6 门禁：Vite 静态构建与 Bundle 密钥扫描..."
(cd "$GIT_WORKDIR" && ./node_modules/.bin/vite build)

# 扫描构建产物 dist/ 是否包含真实 API Token、私钥或 .env 文件
LEAK_MATCHES="$(grep -RInE 'AIzaSy[0-9A-Za-z_-]{33}|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|sk-[0-9A-Za-z]{20,}' "${GIT_WORKDIR}/dist" || true)"
if [[ -n "$LEAK_MATCHES" ]]; then
  echo "[FATAL] 构建产物 dist/ 中检测到疑似密钥泄露，立即终止流水线！" >&2
  echo "$LEAK_MATCHES" >&2
  exit 1
fi

# 清理构建产物 dist/ 以保持 Git 工作区干净（dist 在 .gitignore 中）
rm -rf "${GIT_WORKDIR}/dist"
echo "[PASS] Vite 构建成功且 dist/ 零密钥泄露。"

if [[ -n "$COMMIT_MSG" ]]; then
  echo ""
  echo "[Git Commit] 提交变更到分支 '${CURRENT_BRANCH}'..."
  git -C "$GIT_WORKDIR" add -A
  git -C "$GIT_WORKDIR" commit -m "$COMMIT_MSG"
  NEW_SHA="$(git -C "$GIT_WORKDIR" rev-parse HEAD)"
  echo "[PASS] 已生成提交: ${NEW_SHA}"

  if [[ "$DO_PUSH" == "true" ]]; then
    echo "[Git Push] 推送分支 '${CURRENT_BRANCH}' 至 origin (严禁 --force)..."
    git -C "$GIT_WORKDIR" push origin "$CURRENT_BRANCH"
  fi
fi

echo ""
echo "=================================================================="
echo " [SUCCESS] 同步与全部本地发布门禁验证通过！"
echo " 当前分支: ${CURRENT_BRANCH}"
echo " 当前 HEAD: $(git -C "$GIT_WORKDIR" rev-parse HEAD)"
echo "=================================================================="
