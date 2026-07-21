#!/bin/bash
# AI 知识月度报告 - 一键部署/更新脚本
# 用法: bash deploy.sh [HTML文件路径]
# 示例: bash deploy.sh /path/to/ai-knowledge-report-july.html

set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
GITHUB_USER="liuwenjing-wj"
GITHUB_REPO="ai-report"
PAGES_URL="https://${GITHUB_USER}.github.io/${GITHUB_REPO}/"

# 获取传入的HTML文件路径，默认使用当前目录下的 index.html
HTML_FILE="${1:-}"

if [ -n "$HTML_FILE" ] && [ -f "$HTML_FILE" ]; then
  echo "📄 复制报告文件..."
  cp "$HTML_FILE" "${REPO_DIR}/index.html"
elif [ -n "$HTML_FILE" ] && [ ! -f "$HTML_FILE" ]; then
  echo "❌ 文件不存在: $HTML_FILE"
  exit 1
else
  if [ ! -f "${REPO_DIR}/index.html" ]; then
    echo "❌ 没有找到 index.html，请传入HTML文件路径"
    echo "用法: bash deploy.sh /path/to/report.html"
    exit 1
  fi
fi

cd "$REPO_DIR"

# 检查是否有变更
if git diff --quiet index.html 2>/dev/null && git diff --quiet updates.json 2>/dev/null && git diff --quiet news.json 2>/dev/null && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  echo "✅ 没有变更需要部署"
  echo "🔗 在线地址: $PAGES_URL"
  exit 0
fi

echo "📦 提交变更..."
git add index.html
[ -f updates.json ] && git add updates.json
[ -f news.json ] && git add news.json
git commit -m "更新报告: $(date '+%Y-%m-%d %H:%M')"

echo "🚀 推送到 GitHub..."
git push origin main

echo "✅ 部署完成！"
echo "🔗 在线地址: $PAGES_URL"
echo "⏱  首次部署需1-2分钟生效，更新通常30秒内生效"
