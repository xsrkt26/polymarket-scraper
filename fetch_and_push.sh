#!/bin/bash
# 从 GitHub Releases 读取最新报告并推送到企业微信

REPO="xsrkt26/polymarket-scraper"
CHAT_ID="aibY2r-rXTKG9AJ1bKpoPbL69AcynSnoUvy"
# GitHub Token - 从环境变量读取
TOKEN="${GITHUB_TOKEN:-}"

echo "$(date): 获取最新 Polymarket 报告..."

# 获取最新 Release
LATEST_RELEASE=$(curl -s -H "Authorization: token $TOKEN" \
  "https://api.github.com/repos/$REPO/releases/latest")

# 提取报告内容
REPORT_BODY=$(echo "$LATEST_RELEASE" | jq -r '.body')

if [ -n "$REPORT_BODY" ] && [ "$REPORT_BODY" != "null" ]; then
  echo "✅ 获取到报告,准备推送..."
  
  # 推送到企业微信群
  openclaw message send \
    --channel openclaw-wecom-bot \
    --target "$CHAT_ID" \
    --message "$REPORT_BODY"
  
  if [ $? -eq 0 ]; then
    echo "✅ 消息已推送到企业微信群"
  else
    echo "❌ 推送失败"
  fi
else
  echo "⚠️ 未找到报告"
fi
