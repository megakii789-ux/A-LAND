#!/usr/bin/env bash
# ==============================================================================
# A-LAND｜Gate D6 分支防意外推送保护与受控更新 Hook 安装脚本 (scripts/install-git-hooks.sh)
# ==============================================================================
# D6-04 要求：
#   - 为 main、public-hold 建立防意外推送保护；
#   - 对 preview 建立受控更新规则（禁止 --force，推送前校验关键安全契约文件与质量门禁标记）。
# ==============================================================================

set -euo pipefail

GIT_WORKDIR="${A_LAND_GIT_WORKDIR:-/home/voga/A-LAND}"

if [[ ! -d "$GIT_WORKDIR/.git" ]]; then
  echo "[WARN] Git 目录不存在 ($GIT_WORKDIR/.git)，跳过本地 Git Hook 安装。" >&2
  exit 0
fi

HOOK_PATH="$GIT_WORKDIR/.git/hooks/pre-push"

cat > "$HOOK_PATH" <<'EOF'
#!/usr/bin/env bash
# A-LAND Gate D6 Pre-Push Protection Hook
set -euo pipefail

remote="$1"
url="$2"

zero_sha="0000000000000000000000000000000000000000"

while read -r local_ref local_sha remote_ref remote_sha; do
  if [[ "$local_sha" == "$zero_sha" ]]; then
    echo "[GATE-D6 BLOCKED] 严禁删除远端分支: $remote_ref" >&2
    exit 1
  fi

  # 1. 严禁推送至 main 或 master 或 public-hold
  if [[ "$remote_ref" == "refs/heads/main" || "$remote_ref" == "refs/heads/master" ]]; then
    echo "[GATE-D6 BLOCKED] 最高安全红线拦截：严禁向受保护主分支 ($remote_ref) 推送代码！" >&2
    exit 1
  fi

  if [[ "$remote_ref" == "refs/heads/public-hold" ]]; then
    if [[ "${ALLOW_PUBLIC_HOLD_UPDATE:-false}" != "true" ]]; then
      echo "[GATE-D6 BLOCKED] 防意外推送保护：public-hold 生产占位分支已锁定，严禁意外更新！" >&2
      exit 1
    fi
  fi

  # 2. 对 preview 分支执行受控更新检查
  if [[ "$remote_ref" == "refs/heads/preview" ]]; then
    # 检查是否为非快进强制推送 (non-fast-forward / --force)
    if [[ "$remote_sha" != "$zero_sha" ]]; then
      if ! git merge-base --is-ancestor "$remote_sha" "$local_sha" 2>/dev/null; then
        echo "[GATE-D6 BLOCKED] 严禁对 preview 分支执行非快进或强制推送 (--force)！必须使用前向提交 (forward commit)。" >&2
        exit 1
      fi
    fi

    # 检查关键安全文件是否存在于目标提交树中
    for req_file in "functions/api/[[path]].ts" "functions/api/health.ts" "public/_routes.json" "public/sw.js" "public/version.json" "scripts/rollback-whitelist.json"; do
      if ! git cat-file -e "${local_sha}:${req_file}" 2>/dev/null; then
        echo "[GATE-D6 BLOCKED] 目标提交 (${local_sha:0:12}) 缺失关键安全文件: ${req_file}" >&2
        exit 1
      fi
    done

    # 检查 functions/api/[[path]].ts 必须包含 mode: 'local-only-verified'
    if ! git show "${local_sha}:functions/api/[[path]].ts" | grep -q "local-only-verified"; then
      echo "[GATE-D6 BLOCKED] 目标提交 (${local_sha:0:12}) 的 functions/api/[[path]].ts 缺少统一 503 mode 字段！" >&2
      exit 1
    fi

    # 检查 public/sw.js 必须禁用私有预览 HTML 离线缓存
    if ! git show "${local_sha}:public/sw.js" | grep -q "PRECACHE_DISABLED_IN_PRIVATE_PREVIEW = true"; then
      echo "[GATE-D6 BLOCKED] 目标提交 (${local_sha:0:12}) 的 public/sw.js 未关闭私有预览 HTML 离线缓存！" >&2
      exit 1
    fi

    # 检查 ContentAuditRegistry.ts 未被静默篡改为 PASSED
    if git show "${local_sha}:src/domain/cognitive/ContentAuditRegistry.ts" | grep -q "auditStatus: 'PASSED'"; then
      echo "[GATE-D6 BLOCKED] 目标提交 (${local_sha:0:12}) 违反儿童内容审核红线：发现未经授权的 PASSED 种子状态！" >&2
      exit 1
    fi
  fi
done

echo "[GATE-D6 Pre-Push] 分支保护与安全契约检查通过 -> 允许推送至 ${remote}."
exit 0
EOF

chmod +x "$HOOK_PATH"
echo "[install-git-hooks] 已在 ${HOOK_PATH} 安装 Gate D6 pre-push 分支保护钩子。"
