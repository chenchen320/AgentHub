## 1. 技术栈选择
为了平衡开发效率与课题的先进性，建议采用以下技术组合：

| **维度** | **技术选型** | **选择理由** |
| --- | --- | --- |
| **前端** | **React 18 + Tailwind CSS** | 课题要求 React ；Tailwind 可快速搭建 IM 界面，减少样式开发负担。 |
| **后端** | **Node.js (NestJS 或 Express)** | 你已熟悉 Node.js ；非阻塞 I/O 适合处理 WebSocket 实时长连接。 |
| **数据库** | **PostgreSQL + Prisma (ORM)** | 存储结构化数据（会话、任务流）的首选，Prisma 能提供优秀的类型安全。 |
| **实时通讯** | **Socket.io** | 成熟的 WebSocket 封装，处理多会话并行与消息实时推送 。 |
| **AI 调度** | **Vercel AI SDK / LangChain** | 快速构建“统一适配器层”，简化对 Claude、Codex 的调用 。 |


---

## 2. 项目结构
采用 **Monorepo（单仓）** 或清晰的 **前后端分离** 结构，方便管理复杂的代码逻辑：

Plaintext

```plain
agenthub/
├── apps/
│   ├── web/                # React 前端应用
│   │   ├── src/
│   │   │   ├── components/ # IM聊天框、Diff显示器、预览窗
│   │   │   ├── hooks/      # useSocket, useAgent
│   │   │   └── store/      # 会话状态管理 (Zustand/Redux)
│   └── server/             # Node.js 后端应用
│       ├── src/
│       │   ├── agents/     # Orchestrator 逻辑、角色 Prompt 模板
│       │   ├── adapters/   # Claude, Codex 适配器实现
│       │   └── socket/     # WebSocket 事件处理逻辑
├── packages/
│   └── shared/             # 前后端公用的类型定义 (TS Interfaces)
└── docker-compose.yml      # 一键启动数据库与环境
```

---

## 3. 数据模型 (Schema)
你需要存储的核心数据主要用于管理“工作记忆”和“任务执行轨迹”：

+ **User (用户)**: `id`, `name`, `avatar`, `created_at`
+ **Conversation (会话)**: `id`, `title`, `user_id`, `status` (已完成/执行中)
+ **Message (消息)**: `id`, `conversation_id`, `role` (user/agent), `content`, `agent_type`
+ **AgentTask (任务拆解项)**: `id`, `conversation_id`, `title`, `status` (pending/doing/done), `result_code`
+ **FileSnapshot (代码快照)**: `id`, `task_id`, `file_path`, `content_diff`, `is_accepted`

---

## 4. 关键技术点与难点 (原认知监控点)
在开发过程中，以下几点是决定课题质量的关键，也是容易产生“脑雾”的地方：

### 4.1 Orchestrator 任务拆解逻辑
+ **难点**：如何让 AI 稳定地输出可解析的任务步骤。
+ **对策**：使用 **Structured Outputs**（结构化输出）。在 Prompt 中强制要求 AI 返回 JSON 格式，包含 `tasks` 数组，每个任务包含 `id` 和 `description`。

### 4.2 代码 Diff 的精准展示
+ **难点**：AI 有时只返回修改片段，有时返回全文。
+ **对策**：集成 `diff-match-patch` 算法库。前端使用 `react-diff-viewer` 渲染。逻辑流为：`获取当前文件内容` + `AI 生成内容` -> `计算差异` -> `可视化展示`。

### 4.3 沙盒预览的安全性与隔离
+ **难点**：直接运行 AI 生成的代码可能导致主页面崩溃或被攻击。
+ **对策**：使用 **Iframe** 并设置 `sandbox` 属性进行基础隔离 。进阶方案可调研 `WebContainers`，在浏览器内存中运行虚拟的 Node.js 环境。

### 4.4 统一适配器 (Adapter Pattern)
+ **难点**：不同模型（Claude vs OpenAI）的 API 调用参数完全不同。
+ **对策**：定义一个 `BaseAgentAdapter` 抽象类，要求所有模型实现必须具备 `sendMessage` 和 `streamResponse` 方法。这样当你切换模型时，上层业务逻辑无需改动 。

