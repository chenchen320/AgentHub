/**
 * AgentHub 共享类型定义
 */

// Agent 角色类型
export enum AgentType {
  ORCHESTRATOR = 'orchestrator',
  CODER = 'coder',
  REVIEWER = 'reviewer',
  USER = 'user'
}

// 消息角色
export type MessageRole = 'user' | 'assistant' | 'system';

// 基础消息接口
export interface ChatMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  agentType?: AgentType;
  createdAt: string;
}

// 任务状态
export enum TaskStatus {
  PENDING = 'pending',
  DOING = 'doing',
  DONE = 'done',
  FAILED = 'failed'
}

// 原子任务接口 (由 Orchestrator 拆解)
export interface AgentTask {
  id: string;
  conversationId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  resultCode?: string;
  createdAt: string;
}

// 文件 Diff 快照
export interface FileSnapshot {
  id: string;
  taskId: string;
  filePath: string;
  contentDiff: string;
  isAccepted: boolean;
  createdAt: string;
}

// 会话状态
export interface Conversation {
  id: string;
  title: string;
  userId: string;
  status: 'active' | 'completed';
  createdAt: string;
}
