import { AgentType } from '@agenthub/shared';
import type { ChatMessage } from '@agenthub/shared';

export interface StreamResponse {
  onChunk: (callback: (chunk: string) => void) => void;
  onComplete: (callback: (fullContent: string) => void) => void;
  onError: (callback: (error: any) => void) => void;
}

export abstract class BaseAgentAdapter {
  abstract name: string;
  
  /**
   * 发送流式对话请求
   * @param messages 历史消息上下文
   * @param agentType 当前调用的 Agent 角色
   */
  abstract chatStream(
    messages: ChatMessage[],
    agentType: AgentType
  ): Promise<StreamResponse>;
}
