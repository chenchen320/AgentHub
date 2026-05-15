# AgentHub

AgentHub 是一个集成了多 Agent 协作的 IM 式全栈开发平台。通过自然语言驱动，实现从需求拆解、代码生成、Diff 校验到沙盒预览的全流程自动化。

## 🚀 核心特性

- **Orchestrator (任务协调器)**：智能拆解复杂需求，生成线性化任务流。
- **多 Agent 协作**：支持 `@Coder`、`@Reviewer` 等不同角色在同一个会话中协同工作。
- **代码 Diff 校验**：可视化展示 AI 修改建议，红绿对比确保代码安全可控。
- **Live Preview**：基于 Iframe 的实时预览，即时反馈开发效果。
- **Monorepo 架构**：采用单仓管理，实现前后端类型定义的完美共享。

## 🛠️ 技术栈

- **前端**：React 18 + TypeScript + Tailwind CSS
- **后端**：Node.js (Express) + Socket.io
- **数据库**：PostgreSQL + Prisma ORM
- **通讯**：WebSocket 实时双向通讯

## 📦 项目结构

```text
agenthub/
├── apps/
│   ├── web/                # 前端应用 (Vite + React)
│   └── server/             # 后端应用 (Express + Socket.io)
├── packages/
│   └── shared/             # 前后端共享类型定义与工具函数
├── prisma/                 # 数据库 Schema 与迁移记录
└── package.json            # 根目录配置与工作区管理
```

## 🚥 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/chenchen320/AgentHub.git
cd AgentHub
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
在 `apps/server` 目录下创建 `.env` 文件：
```env
DATABASE_URL="your_postgresql_url"
PORT=3001
```

### 4. 启动开发环境
```bash
npm run dev
```

## 🛡️ 安全与原认知
- **二次确认**：所有对本地文件系统的写入操作必须经过用户 Confirm。
- **任务导图**：自动生成任务执行逻辑图，辅助用户理解 AI 决策过程。

---

