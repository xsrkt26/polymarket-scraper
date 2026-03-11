# 🚀 5 分钟快速部署指南

## 前置准备

- GitHub 账号
- 企业微信群机器人 Webhook URL

## 步骤 1: 创建 GitHub 仓库 (2 分钟)

### 选项 A: Web 界面 (推荐)

1. 访问 https://github.com/new
2. 填写:
   - Repository name: `polymarket-scraper`
   - Description: "Polymarket 市场数据每日推送"
   - 选择 Public 或 Private
3. 勾选 "Add a README file"
4. 点击 "Create repository"

### 选项 B: 使用 GitHub CLI

```bash
gh repo create polymarket-scraper --public --description "Polymarket daily report"
```

## 步骤 2: 上传代码 (2 分钟)

### 方法 A: Web 界面上传

1. 在仓库页面,点击 "Add file" → "Create new file"
2. 文件名输入: `.github/workflows/daily-report.yml`
3. 复制粘贴 `daily-report.yml` 的内容
4. 点击 "Commit changes"
5. 重复以上步骤,创建:
   - `polymarket_api.js`
   - `package.json`
6. 上传完成!

### 方法 B: Git 命令行

在 `/root/.openclaw/workspace` 目录执行:

```bash
# 初始化仓库
git init
git add .github/ polymarket_api.js package.json README.md .gitignore
git commit -m "Initial commit: Polymarket daily scraper"

# 连接到 GitHub (替换 YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/polymarket-scraper.git

# 推送代码
git branch -M main
git push -u origin main
```

## 步骤 3: 配置 Webhook (1 分钟)

### 获取企业微信 Webhook

1. 在企业微信群,点击右上角 "..." → "添加群机器人"
2. 选择 "自定义机器人"
3. 输入机器人名称: "Polymarket 小助手"
4. 复制 Webhook 地址 (长这样):
   ```
   https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

### 设置 GitHub Secret

1. 打开你的 GitHub 仓库
2. 点击 Settings → Secrets and variables → Actions
3. 点击 "New repository secret"
4. 填写:
   - Name: `WECOM_WEBHOOK`
   - Secret: 粘贴你的 Webhook URL
5. 点击 "Add secret"

## 步骤 4: 启动定时任务 (<1 分钟)

1. 进入仓库 → 点击 "Actions" 标签
2. 如果看到提示,点击 "I understand my workflows, go ahead and enable them"
3. 完成!

## 步骤 5: 立即测试 (1 分钟)

不等到明天 9:30,现在就测试:

1. Actions → 左侧选择 "Polymarket Daily Report"
2. 点击右侧 "Run workflow" 下拉菜单
3. 点击绿色的 "Run workflow" 按钮
4. 等待 30 秒 - 2 分钟
5. 刷新页面,查看运行状态
6. 检查企业微信群是否收到消息

### 如果测试成功 ✅

你会在企业微信群看到类似这样的消息:

```
📊 Polymarket 市场动向
📅 日期: 2026-03-11
⏰ 生成时间: 20:30:45
🔌 数据源: Gamma Events

🔥 TOP 30 市场:
...
```

### 如果测试失败 ❌

1. 进入 Actions → 点击失败的运行
2. 点击 "scrape-and-report" 展开日志
3. 查看具体错误:
   - `WECOM_WEBHOOK is not set` → Secret 名称拼写错误
   - `404` → Webhook URL 错误或过期
   - `API failed` → Polymarket API 暂时不可用,等待重试

## 完成! 🎉

从现在开始,每天北京时间 9:30 你都会收到推送!

---

## 常用操作

### 修改推送时间

编辑 `.github/workflows/daily-report.yml`:

```yaml
schedule:
  - cron: '30 1 * * *'  # UTC 1:30 = 北京时间 9:30
```

改成你想要的时间 (记住转换时区: 北京时间 - 8 = UTC)

### 暂停推送

Actions → Polymarket Daily Report → 右侧三个点 → Disable workflow

### 恢复推送

Actions → Polymarket Daily Report → Enable workflow

### 查看历史推送

Actions → 点击任意一次运行 → Artifacts → 下载数据文件

---

## 问题排查

### 没有收到推送

- ✅ 检查 Actions 是否成功运行 (绿色勾勾)
- ✅ 检查企业微信机器人是否被移除
- ✅ 检查 Webhook URL 是否过期

### 推送内容为空

- 可能是 Polymarket API 临时不可用
- 查看 Actions 日志中的错误信息

### 想要推送到多个群

在 Settings → Secrets 添加更多 Webhook:
- `WECOM_WEBHOOK_2`
- `WECOM_WEBHOOK_3`

然后修改 workflow 增加推送步骤。

---

**总耗时**: < 10 分钟  
**运行成本**: 免费  
**维护成本**: 0

祝使用愉快! 🚀
