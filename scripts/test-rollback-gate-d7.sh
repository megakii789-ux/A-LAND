#!/usr/bin/env bash
# ==============================================================================
# A-LAND｜Gate D7-01 回滚门禁四项真实故障注入独立验证脚本 (scripts/test-rollback-gate-d7.sh)
# ==============================================================================
# D7-01 要求：
#   - 模拟 tsc 失败，必须拒绝回滚；
#   - 模拟 Vitest 失败，必须拒绝回滚；
#   - 模拟 Pages 503 契约失败，必须拒绝回滚；
#   - 模拟 Vite 构建失败，必须拒绝回滚；
#   - 要求失败后工作区及 HEAD 恢复正确，且不得发生 Git Push；
#   - 不允许只检查最终脚本退出码而不注入真实失败。
# ==============================================================================

set -euo pipefail

SOURCE_GIT_DIR="${A_LAND_GIT_WORKDIR:-/home/voga/A-LAND}"
DEPS_NODE_MODULES="${A_LAND_DEPS_DIR:-/tmp/qingyu_deps/node_modules}"
TMP_ROOT="$(mktemp -d /tmp/a-land-d7-rollback-suite.XXXXXX)"
BARE_REMOTE="${TMP_ROOT}/remote-origin.git"
WORK_CLONE="${TMP_ROOT}/work-clone"

cleanup() {
  rm -rf "$TMP_ROOT"
}
trap cleanup EXIT

echo "=================================================================="
echo " A-LAND Gate D7-01 回滚质量门禁四项真实故障注入验证套件"
echo " 隔离测试沙箱: ${TMP_ROOT}"
echo "=================================================================="

# 1. 初始化隔离的 Bare Remote 与工作克隆，使 --push 可真实测试是否发生远端推送
git clone --bare "$SOURCE_GIT_DIR" "$BARE_REMOTE" >/dev/null 2>&1
git clone "$BARE_REMOTE" "$WORK_CLONE" >/dev/null 2>&1
git -C "$WORK_CLONE" checkout preview >/dev/null 2>&1
git -C "$WORK_CLONE" config user.name "Gate D7 Auditor"
git -C "$WORK_CLONE" config user.email "auditor@a-land.local"

# 同步当前最新脚本与测试到隔离克隆并生成一个基准提交作为当前 HEAD
cp "${SOURCE_GIT_DIR}/scripts/rollback-preview.sh" "${WORK_CLONE}/scripts/rollback-preview.sh"
cp "${SOURCE_GIT_DIR}/scripts/generate-version-json.mjs" "${WORK_CLONE}/scripts/generate-version-json.mjs"
cp "${SOURCE_GIT_DIR}/scripts/rollback-whitelist.json" "${WORK_CLONE}/scripts/rollback-whitelist.json"

if [[ ! -e "${WORK_CLONE}/node_modules" && -d "$DEPS_NODE_MODULES" ]]; then
  ln -s "$DEPS_NODE_MODULES" "${WORK_CLONE}/node_modules"
fi

(cd "$WORK_CLONE" && node scripts/generate-version-json.mjs --mode template >/dev/null)
git -C "$WORK_CLONE" add -A
git -C "$WORK_CLONE" commit --allow-empty -m "chore(d7-test): baseline head before rollback fault injection" >/dev/null
git -C "$WORK_CLONE" push origin preview >/dev/null 2>&1

PRE_HEAD="$(git -C "$WORK_CLONE" rev-parse HEAD)"
PRE_REMOTE_HEAD="$(git --git-dir="$BARE_REMOTE" rev-parse refs/heads/preview)"
SAFE_TARGET_SHA="6e6a381b46fe15e087b7dafec4481a9965657468"

echo "基准工作区 HEAD       : ${PRE_HEAD}"
echo "基准远端 origin/preview: ${PRE_REMOTE_HEAD}"
echo "目标白名单回滚 SHA    : ${SAFE_TARGET_SHA}"

assert_post_failure_invariants() {
  local case_name="$1"
  local rc="$2"
  local log_file="$3"
  local expected_fail_marker="$4"
  local forbidden_next_marker="$5"

  if [[ "$rc" -eq 0 ]]; then
    echo "[FAIL] ${case_name}: 预期回滚脚本返回非零退出码，实际返回 0！" >&2
    cat "$log_file" >&2
    exit 1
  fi

  if ! grep -Fq "$expected_fail_marker" "$log_file"; then
    echo "[FAIL] ${case_name}: 未在输出日志中检测到预期失败标记 '${expected_fail_marker}'！" >&2
    cat "$log_file" >&2
    exit 1
  fi

  if [[ -n "$forbidden_next_marker" ]] && grep -Fq "$forbidden_next_marker" "$log_file"; then
    echo "[FAIL] ${case_name}: 门禁失败后未立即中止，仍执行了后续步骤 '${forbidden_next_marker}'！" >&2
    cat "$log_file" >&2
    exit 1
  fi

  local after_head
  after_head="$(git -C "$WORK_CLONE" rev-parse HEAD)"
  if [[ "$after_head" != "$PRE_HEAD" ]]; then
    echo "[FAIL] ${case_name}: 失败后本地 HEAD 未恢复！预期 ${PRE_HEAD}，实际 ${after_head}" >&2
    exit 1
  fi

  local dirty_state
  dirty_state="$(git -C "$WORK_CLONE" status --porcelain --untracked-files=normal)"
  if [[ -n "$dirty_state" ]]; then
    echo "[FAIL] ${case_name}: 失败后本地 Git 工作区存在残留脏文件：" >&2
    echo "$dirty_state" >&2
    exit 1
  fi

  local after_remote_head
  after_remote_head="$(git --git-dir="$BARE_REMOTE" rev-parse refs/heads/preview)"
  if [[ "$after_remote_head" != "$PRE_REMOTE_HEAD" ]]; then
    echo "[FAIL] ${case_name}: 严重安全事故！门禁失败后仍然发生了 Git Push (remote=${after_remote_head})！" >&2
    exit 1
  fi

  echo "  [PASS] ${case_name}: exit_code=${rc} | 命中 '${expected_fail_marker}' | 立即阻断后续步骤 | HEAD=${after_head:0:12} 已恢复 | 工作区干净 | 远端零推送 (remote=${after_remote_head:0:12})"
}

# ==============================================================================
# Case 1: 注入真实 TypeScript (tsc --noEmit) 类型错误 (TS2322)
# ==============================================================================
echo ""
echo "[Case 1/4] 注入真实 TypeScript 编译错误 (src/main.tsx TS2322)..."
FAULT_SCRIPT_1="${TMP_ROOT}/inject-tsc-fault.sh"
cat > "$FAULT_SCRIPT_1" <<'EOF'
#!/usr/bin/env bash
echo 'const __d7InjectedTypeError: number = "INVALID_STRING_ASSIGNED_TO_NUMBER_TS2322";' >> "$1/src/main.tsx"
EOF
chmod +x "$FAULT_SCRIPT_1"

LOG_1="${TMP_ROOT}/case1-tsc.log"
RC_1=0
A_LAND_GIT_WORKDIR="$WORK_CLONE" A_LAND_D7_FAULT_INJECT_SCRIPT="$FAULT_SCRIPT_1" \
  bash "${WORK_CLONE}/scripts/rollback-preview.sh" --target "$SAFE_TARGET_SHA" --apply --push >"$LOG_1" 2>&1 || RC_1=$?

assert_post_failure_invariants \
  "Case 1 (Real tsc --noEmit failure)" \
  "$RC_1" \
  "$LOG_1" \
  "[GATE-FAIL] Step 1/4 TypeScript 类型检查失败" \
  "-> [2/4] Vitest"

# ==============================================================================
# Case 2: 注入真实 Vitest 单元测试断言失败
# ==============================================================================
echo ""
echo "[Case 2/4] 注入真实 Vitest 领域单元测试失败 (src/tests/weather.test.ts)..."
FAULT_SCRIPT_2="${TMP_ROOT}/inject-vitest-fault.sh"
cat > "$FAULT_SCRIPT_2" <<'EOF'
#!/usr/bin/env bash
cat >> "$1/src/tests/weather.test.ts" <<'INNER'
import { it as d7It, expect as d7Expect } from 'vitest';
d7It('Gate D7 injected real unit test failure', () => {
  d7Expect('REAL_VITEST_STATE').toBe('INJECTED_FAILURE');
});
INNER
EOF
chmod +x "$FAULT_SCRIPT_2"

LOG_2="${TMP_ROOT}/case2-vitest.log"
RC_2=0
A_LAND_GIT_WORKDIR="$WORK_CLONE" A_LAND_D7_FAULT_INJECT_SCRIPT="$FAULT_SCRIPT_2" \
  bash "${WORK_CLONE}/scripts/rollback-preview.sh" --target "$SAFE_TARGET_SHA" --apply --push >"$LOG_2" 2>&1 || RC_2=$?

assert_post_failure_invariants \
  "Case 2 (Real Vitest failure)" \
  "$RC_2" \
  "$LOG_2" \
  "[GATE-FAIL] Step 2/4 Vitest 领域测试失败" \
  "-> [3/4] 专项验证回滚后 /api/*"

# ==============================================================================
# Case 3: 注入真实 Pages /api/* 503 契约失败 (修改 functions/api/[[path]].ts 状态码与 mode)
# ==============================================================================
echo ""
echo "[Case 3/4] 注入真实 Pages /api/* 503 契约破坏 (functions/api/[[path]].ts 返回 200 且缺失 local-only-verified)..."
FAULT_SCRIPT_3="${TMP_ROOT}/inject-503-contract-fault.sh"
cat > "$FAULT_SCRIPT_3" <<'EOF'
#!/usr/bin/env bash
sed -i "s/status: 503/status: 200/g" "$1/functions/api/[[path]].ts"
sed -i "s/local-only-verified/broken-contract-mode/g" "$1/functions/api/[[path]].ts"
EOF
chmod +x "$FAULT_SCRIPT_3"

LOG_3="${TMP_ROOT}/case3-503-contract.log"
RC_3=0
A_LAND_GIT_WORKDIR="$WORK_CLONE" A_LAND_D7_FAULT_INJECT_SCRIPT="$FAULT_SCRIPT_3" \
  bash "${WORK_CLONE}/scripts/rollback-preview.sh" --target "$SAFE_TARGET_SHA" --apply --push >"$LOG_3" 2>&1 || RC_3=$?

assert_post_failure_invariants \
  "Case 3 (Real Pages 503 contract failure)" \
  "$RC_3" \
  "$LOG_3" \
  "[GATE-FAIL] Step 3/4 Pages /api/* 503 契约测试失败" \
  "-> [4/4] Vite 生产构建"

# ==============================================================================
# Case 4: 注入真实 Vite 构建失败 (src/main.tsx 引入不存在的 CSS 资源导致 Rollup/Rolldown 打包失败)
# ==============================================================================
echo ""
echo "[Case 4/4] 注入真实 Vite 构建打包失败 (src/main.tsx 缺失静态样式模块)..."
FAULT_SCRIPT_4="${TMP_ROOT}/inject-vite-build-fault.sh"
cat > "$FAULT_SCRIPT_4" <<'EOF'
#!/usr/bin/env bash
sed -i '1i // @ts-ignore\nimport "./__d7_nonexistent_broken_bundle_asset__.css";' "$1/src/main.tsx"
EOF
chmod +x "$FAULT_SCRIPT_4"

LOG_4="${TMP_ROOT}/case4-vite-build.log"
RC_4=0
A_LAND_GIT_WORKDIR="$WORK_CLONE" A_LAND_D7_FAULT_INJECT_SCRIPT="$FAULT_SCRIPT_4" \
  bash "${WORK_CLONE}/scripts/rollback-preview.sh" --target "$SAFE_TARGET_SHA" --apply --push >"$LOG_4" 2>&1 || RC_4=$?

assert_post_failure_invariants \
  "Case 4 (Real Vite build failure)" \
  "$RC_4" \
  "$LOG_4" \
  "[GATE-FAIL] Step 4/4 Vite 生产构建失败" \
  "[PASS] 回滚提交"

echo ""
echo "=================================================================="
echo " [ALL 4 D7-01 FAULT INJECTION TESTS PASSED] 回滚门禁完备性验证通过！"
echo "=================================================================="
