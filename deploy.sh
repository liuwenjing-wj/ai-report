#!/bin/bash
# AI 知识月度报告 - 一键部署/更新脚本
# 用法: bash deploy.sh [HTML文件路径]
# 示例: bash deploy.sh /path/to/ai-knowledge-report-july.html
# 无参数时: 仅部署 JSON 数据文件 + 刷新 index.html 缓存标记

set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
GITHUB_USER="liuwenjing-wj"
GITHUB_REPO="ai-report"
PAGES_URL="https://${GITHUB_USER}.github.io/${GITHUB_REPO}/"

HTML_FILE="${1:-}"
BUILD_ID=$(date '+%Y%m%d%H%M%S')

cd "$REPO_DIR"

# ---- 处理 HTML 文件 ----
if [ -n "$HTML_FILE" ]; then
  if [ ! -f "$HTML_FILE" ]; then
    echo "❌ 文件不存在: $HTML_FILE"
    exit 1
  fi
  # 检测是否为骨架 HTML（含 BUILD_ID 占位符）
  if grep -q 'BUILD_ID' "$HTML_FILE" 2>/dev/null; then
    echo "📄 更新骨架文件并注入缓存标记..."
    sed "s/BUILD_ID/${BUILD_ID}/g" "$HTML_FILE" > "${REPO_DIR}/index.html"
  else
    echo "📄 复制报告文件..."
    cp "$HTML_FILE" "${REPO_DIR}/index.html"
  fi
else
  # 无 HTML 参数: 仅刷新现有 index.html 的缓存标记
  if [ -f "${REPO_DIR}/index.html" ]; then
    if grep -q 'BUILD_ID' "${REPO_DIR}/index.html" 2>/dev/null; then
      sed -i '' "s/BUILD_ID/${BUILD_ID}/g" "${REPO_DIR}/index.html"
    elif grep -q 'v=[0-9]' "${REPO_DIR}/index.html" 2>/dev/null; then
      # 替换已有的版本号
      sed -i '' "s/v=[0-9]*/v=${BUILD_ID}/g" "${REPO_DIR}/index.html"
    fi
  else
    echo "❌ 没有找到 index.html"
    exit 1
  fi
fi

# ---- 同步 CSS/JS 源文件（如果传入的目录包含这些文件）----
if [ -n "$HTML_FILE" ]; then
  SRC_DIR="$(dirname "$HTML_FILE")"
  [ -f "${SRC_DIR}/style.css" ] && cp "${SRC_DIR}/style.css" "${REPO_DIR}/style.css"
  [ -f "${SRC_DIR}/app.js" ] && cp "${SRC_DIR}/app.js" "${REPO_DIR}/app.js"
fi

# ---- 检查是否有变更 ----
CHANGED=0
for f in index.html style.css app.js updates.json news.json articles.json skills.json; do
  if [ -f "$f" ]; then
    if ! git diff --quiet "$f" 2>/dev/null; then CHANGED=1; break; fi
    if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then :; else
      if git ls-files --others --exclude-standard "$f" | grep -q "$f"; then CHANGED=1; break; fi
    fi
  fi
done
if [ "$CHANGED" -eq 0 ]; then
  echo "✅ 没有变更需要部署"
  echo "🔗 在线地址: $PAGES_URL"
  exit 0
fi

# ---- 提交 ----
echo "📦 提交变更..."
git add index.html
[ -f style.css ] && git add style.css
[ -f app.js ] && git add app.js
[ -f updates.json ] && git add updates.json
[ -f news.json ] && git add news.json
[ -f articles.json ] && git add articles.json
[ -f skills.json ] && git add skills.json
git commit -m "更新报告: $(date '+%Y-%m-%d %H:%M')"

echo "🚀 推送到 GitHub..."
git push origin main

echo "✅ 部署完成！"
echo "🔗 在线地址: $PAGES_URL"
echo "⏱  首次部署需1-2分钟生效，更新通常30秒内生效"
