#!/usr/bin/env bash
# ==============================================================================
# A-LAND｜预览环境安全回滚脚本 (Gate D4 / D5)
# ==============================================================================
# 最高原则：
#   1. 严禁使用 git push --force 或 git reset --hard 改写远端历史
#   2. 严禁自动触碰或覆盖 main 分支
#   3. 通过在 preview 分支创建前向回滚提交 (forward rollback commit) 实现可审计回退
#
# 用法:
#   bash scripts/rollback-preview.sh --target <GIT_SHA> [--dry-run | --apply] [--push]
# ==============================================================================

set -euo pipefail

GIT_WORKDIR="${A_LAND_GIT_WORKDIR:-/home/voga/A-LAND}"
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
      echo "用法: $0 --target <GIT_SHA> [--dry-run | --apply] [--push]" >&2
      exit 1
      ;;
  esac
done

if [[ -z "$TARGET_SHA" ]]; then
  echo "[ERROR] 必须指定 --target <GIT_SHA> (例如已验证基线 f8c7401907b3fe5831c343b995b777254fdfe45d)" >&2
  exit 1
fi

CURRENT_BRANCH="$(git -C "$GIT_WORKDIR" rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT_BRANCH" != "preview" ]]; then
  echo "[FATAL] 当前分支为 '${CURRENT_BRANCH}'，回滚脚本仅允许在 'preview' 分支执行！" >&2
  exit 1
fi

if ! git -C "$GIT_WORKDIR" cat-file -e "${TARGET_SHA}^{commit}" 2>/dev/null; then
  echo "[FATAL] 目标提交不存在: ${TARGET_SHA}" >&2
  exit 1
fi

CURRENT_SHA="$(git -C "$GIT_WORKDIR" rev-parse HEAD)"
echo "=================================================================="
echo " A-LAND 预览分支安全回滚 (Mode: ${MODE})"
echo " 当前分支  : ${CURRENT_BRANCH}"
echo " 当前 HEAD : ${CURRENT_SHA}"
echo " 目标基线  : ${TARGET_SHA}"
echo "=================================================================="

echo ""
echo "[Diff Preview] 从当前 HEAD 回退至 ${TARGET_SHA} 的文件变更摘要:"
git -C "$GIT_WORKDIR" diff --stat "$CURRENT_SHA" "$TARGET_SHA"

if [[ "$MODE" == "dry-run" ]]; then
  echo ""
  echo "[DRY-RUN 完成] 未修改 Git 历史或工作区。"
  echo "如需执行前向回滚提交，请追加 --apply 参数。"
  exit 0
fi

echo ""
echo "[Rollback Apply] 使用目标提交 ${TARGET_SHA} 的树状态生成前向回滚提交 (不使用 force push)..."
git -C "$GIT_WORKDIR" read-tree --reset -u "$TARGET_SHA"
git -C "$GIT_WORKDIR" commit -m "revert(preview): rollback preview tree to verified snapshot ${TARGET_SHA:0:12}"

NEW_HEAD="$(git -C "$GIT_WORKDIR" rev-parse HEAD)"
echo "[PASS] 已创建前向回滚提交: ${NEW_HEAD}"

if [[ "$DO_PUSH" == "true" ]]; then
  echo "[Push] 推送回滚提交至 origin/preview (无 --force)..."
  git -C "$GIT_WORKDIR" push origin preview
fi
