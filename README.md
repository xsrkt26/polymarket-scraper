# Polymarket Daily Scraper

[![Daily Report](https://github.com/YOUR_USERNAME/polymarket-scraper/actions/workflows/daily-report.yml/badge.svg)](https://github.com/YOUR_USERNAME/polymarket-scraper/actions/workflows/daily-report.yml)

每天自动获取 Polymarket 最新市场动向,推送到企业微信群。

## 🚀 功能

- ⏰ 每天北京时间 9:30 自动运行
- 📊 获取 TOP 30 市场数据
- 💬 自动推送到企业微信群
- 📁 保存历史数据备份

## 📦 部署步骤

### 1. Fork/创建仓库

1. 登录 GitHub
2. 点击右上角 "+" → "New repository"
3. 仓库名: `polymarket-scraper` (或任意名称)
4. 设置为 Public 或 Private
5. 创建仓库

### 2. 上传代码

将以下文件上传到仓库:

```
polymarket-scraper/
├── .github/
│   └── workflows/
│       └── daily-report.yml
├── polymarket_api.js
├── package.json
└── README.md
```

**方法 A: Web 界面上传**
- 在 GitHub 仓库页面点击 "Add file" → "Upload files"
- 拖拽所有文件上传

**方法 B: Git 命令行**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/polymarket-scraper.git
git push -u origin main
```

### 3. 配置 Webhook Secret

1. 获取企业微信群机器人 Webhook 地址:
   - 在企业微信群中添加机器人
   - 复制 Webhook URL (格式: `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxx`)

2. 在 GitHub 仓库设置 Secret:
   - 进入仓库 → Settings → Secrets and variables → Actions
   - 点击 "New repository secret"
   - Name: `WECOM_WEBHOOK`
   - Value: 粘贴你的 Webhook URL
   - 点击 "Add secret"

### 4. 启用 Actions

1. 进入仓库 → Actions 标签
2. 如果提示启用 workflows,点击 "I understand my workflows, go ahead and enable them"
3. 找到 "Polymarket Daily Report" workflow
4. 点击 "Enable workflow"

### 5. 测试运行

手动触发测试:

1. 进入 Actions → Polymarket Daily Report
2. 点击 "Run workflow" → "Run workflow"
3. 等待运行完成 (约 1-2 分钟)
4. 检查企业微信群是否收到消息

## 🔧 配置选项

### 修改运行时间

编辑 `.github/workflows/daily-report.yml`:

```yaml
on:
  schedule:
    # 修改这一行的 cron 表达式
    # 格式: '分 时 日 月 周' (UTC 时间)
    # 北京时间 = UTC + 8
    - cron: '30 1 * * *'  # 北京时间 9:30
```

示例:
- 早上 8:00: `'0 0 * * *'`
- 晚上 20:00: `'0 12 * * *'`
- 每天两次 (9:30 和 18:30): 添加两个 cron 行

### 修改市场数量

编辑 `polymarket_api.js`,找到:

```javascript
params: {
  limit: 30,  // 改成你想要的数量
  ...
}
```

## 📊 数据格式

推送到企业微信的消息格式:

```
📊 Polymarket 市场动向
📅 日期: 2026-03-11
⏰ 生成时间: 09:30:00
🔌 数据源: Gamma Events

🔥 TOP 30 市场:

1. Will Trump announce 2024 campaign by March?
   💰 交易量: $2,450,000
   📈 Yes: 72% | No: 28%
   🏷️ 类别: Politics

2. Bitcoin above $100k by April?
   ...
```

## 🐛 故障排查

### Actions 运行失败

1. 检查 Logs:
   - Actions → 点击失败的运行 → 查看详细日志

2. 常见问题:
   - ❌ `WECOM_WEBHOOK` 未设置 → 检查 Secrets 配置
   - ❌ API 连接失败 → 等待重试,或检查 Polymarket 状态
   - ❌ Webhook 调用失败 → 检查 URL 是否正确

### 没有收到消息

1. 检查企业微信机器人是否正常
2. 检查 Webhook URL 是否过期
3. 手动运行 workflow 测试

### 修改后不生效

- Actions 使用的是仓库中的代码,本地修改需要 push 到 GitHub

## 🔒 安全说明

- Webhook URL 通过 GitHub Secrets 加密存储
- 代码仓库可以设置为 Private
- Actions 运行日志不会泄露 Webhook 地址

## 📝 维护

### 查看历史数据

- Actions → 选择运行记录 → Artifacts → 下载备份文件

### 暂停任务

- Actions → Polymarket Daily Report → Disable workflow

### 恢复任务

- Actions → Polymarket Daily Report → Enable workflow

## 🆘 支持

如有问题,检查以下内容:

1. ✅ Webhook URL 是否正确
2. ✅ GitHub Actions 是否启用
3. ✅ Cron 时间是否配置正确
4. ✅ Polymarket API 是否可访问

---

**首次部署时间**: 约 15-30 分钟  
**运行成本**: 免费 (GitHub Actions 免费额度: 2000 分钟/月)  
**维护成本**: 几乎为 0
