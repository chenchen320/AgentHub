# AgentHub：多 Agent 协作开发平台 · AI 开发指令

## 项目概述

AgentHub 是一个集成多 Agent 协作的 IM 式开发平台，通过自然语言驱动实现从需求拆解到代码部署的全流程自动化。  

- **前端**：React 18 + TypeScript + Tailwind CSS  
- **后端**：Node.js (Express) + Socket.io  
- **数据库**：PostgreSQL + Prisma  
- **AI 调度**：Vercel AI SDK / LangChain  
- **实时通信**：WebSocket (Socket.io)  

## 开发规范

- 使用 TypeScript 严格模式，禁止使用 `any`，所有 API 请求/响应、Socket 事件、组件 Props 必须定义类型。
- 组件使用函数式组件 + Hooks，禁止使用类组件。
- 前端状态管理使用 Zustand（轻量，适合多会话场景）。
- 后端采用分层架构：`controller` → `service` → `repository`（Prisma）。
- 所有 AI 调用必须通过 `adapters/` 层统一封装，上层逻辑不感知具体模型。
- 代码差异展示必须基于 `diff-match-patch` 算法计算，使用 `react-diff-viewer` 渲染。
- 用户对 AI 写入文件系统的操作必须经过二次确认（Confirm 弹窗）。
- 支持流式响应（Streaming），AI 返回内容需逐块推送到前端。

## 代码风格

- 使用 ESLint + Prettier（配置继承 `@antfu/eslint-config` 或 `standard`）。

- 组件文件使用 `PascalCase`（如 `ChatWindow.tsx`）。

- 函数/变量使用 `camelCase`（如 `sendMessage`）。

- 常量使用 `UPPER_SNAKE_CASE`（如 `MAX_RETRY_COUNT`）。

- 数据库模型名使用 `PascalCase`，字段名使用 `camelCase`。

- 前端目录结构：
  
  src/  
  components/ # 通用组件  
  features/ # 功能模块（chat、diff、preview等）  
  hooks/ # 自定义 Hook（useSocket, useAgent）  
  store/ # Zustand store  
  types/ # 全局类型定义  
  utils/ # 工具函数

- 后端项目目录
  
  src/  
  adapters/ # AI 模型适配器（Claude, Codex）  
  agents/ # Orchestrator 及角色 Prompt  
  socket/ # [Socket.io](https://socket.io/) 事件处理  
  services/ # 业务逻辑  
  prisma/ # 数据库模型
  
  ## 测试要求
  
  - 每个功能完成后手动测试（提供测试用例清单）。
  - 重点验证场景：
  - 多会话并行时上下文隔离。
  - AI 生成代码 Diff 与本地文件对比的正确性。
  - 流式响应时 UI 不卡顿。
  - 用户拒绝写入后文件系统未被修改。
  - 边界情况：
  - AI 返回非 JSON 格式时 Orchestrator 的错误处理。
  - 网络断连时 WebSocket 自动重连。
  - 超大代码块（>5000 行）的 Diff 渲染性能。
  
  ## 注意事项
  
  - 优先实现 P0/MVP 功能：React 聊天界面、单模型 API 接入、基础代码块展示。
  - 保持代码简洁，避免过度抽象（例如初期不需要引入微前端或 Serverless）。
  - 移动端适配：使用 Tailwind 响应式类，确保三栏布局在小屏可折叠（左侧/右侧可滑动显示）。
  - 安全性：所有用户输入（包括 AI 生成内容）在渲染前需进行 XSS 过滤。
  - 原认知支撑：在 Orchestrator 执行任务拆解时，前端需展示“任务思维导图”或进度清单，帮助用户理解 AI 决策。
  - 环境变量：敏感信息（API Key、数据库连接串）使用 `.env` 文件，不得硬编码。
