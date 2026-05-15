import { AgentType } from '@agenthub/shared';
import type { ChatMessage } from '@agenthub/shared';
import { BaseAgentAdapter, StreamResponse } from './base.adapter.ts';

export class MockAdapter extends BaseAgentAdapter {
  name = 'Mock AI';

  async chatStream(messages: ChatMessage[], agentType: AgentType): Promise<StreamResponse> {
    const lastMessage = messages[messages.length - 1]?.content || '';
    const responseText = `[Mock ${agentType}] 你好！我收到了你的消息："${lastMessage}"。由于目前处于测试模式，我正在模拟流式返回响应。AgentHub 正在稳步建设中！`;

    return {
      onChunk: (callback) => {
        // 模拟打字机效果
        let i = 0;
        const interval = setInterval(() => {
          if (i < responseText.length) {
            callback(responseText[i]);
            i++;
          } else {
            clearInterval(interval);
          }
        }, 30);
      },
      onComplete: (callback) => {
        setTimeout(() => callback(responseText), responseText.length * 35);
      },
      onError: (callback) => {
        // 测试模式不模拟错误
      }
    };
  }
}
