#!/bin/bash
# AI 知识报告 - 自动部署脚本
# 由定时任务调用，将 updates.json 和 index.html 推送到 GitHub Pages
set -e

DEPLOY_DIR="/Users/shuangxin/.qoderwork/workspace/mqubidnz0p75xck1/ai-report-deploy"
cd "$DEPLOY_DIR"

# 确保远程URL包含token认证
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [[ ! "$REMOTE_URL" == *"ghp_"* ]]; then
  # 从环境变量或配置文件获取token
  TOKEN="${GITHUB_TOKEN:-}"
  if [ -z "$TOKEN" ] && [ -f "$DEPLOY_DIR/.github-token" ]; then
    TOKEN=$(cat "$DEPLOY_DIR/.github-token")
  fi
  if [ -n "$TOKEN" ]; then
    git remote set-url origin "https://liuwenjing-wj:${TOKEN}@github.com/liuwenjing-wj/ai-report.git"
  fi
fi

git add updates.json index.html 2>/dev/null || true

# 检查是否有变更
if git diff --cached --quiet 2>/dev/null; then
  echo "no-changes"
  exit 0
fi

git commit -m "每日更新: $(date '+%Y-%m-%d %H:%M')" --quiet
git push origin main --quiet

echo "deployed"
