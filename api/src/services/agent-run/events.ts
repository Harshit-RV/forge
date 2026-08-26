import type { AgentEvents, AgentRunSummary, ToolCall, ToolResult } from 'agent';
import MessageModel, { type MessageDoc } from '../../models/message/Message.model';
import MessageUtil from '../../utils/Message.util';
import type { RunPatch, StreamEmit } from './persist';

export function createAgentEventHandlers(args: {
  projectId: string;
  runId: string;
  emit: StreamEmit;
  patchRun: (patch: RunPatch) => Promise<MessageDoc>;
}): AgentEvents {
  const { projectId, runId, emit, patchRun } = args;

  return {
    onToolCall: async (call: ToolCall) => {
      const event = await new MessageModel({
        projectId,
        type: 'RUN_EVENT',
        runEvent: {
          runId,
          eventType: 'tool_call',
          toolCallId: call.id,
          toolName: call.name,
          toolArgs: MessageUtil.truncateToolArgs(call.args),
        },
      }).save();

      emit(event);
    },

    onToolResult: async (result: ToolResult) => {
      const event = await new MessageModel({
        projectId,
        type: 'RUN_EVENT',
        runEvent: {
          runId,
          eventType: 'tool_result',
          toolCallId: result.id,
          toolName: result.name,
          toolResult: MessageUtil.truncateToolResult(result.content),
          isError: result.isError,
          durationMs: result.durationMs,
          exitCode: result.exitCode,
        },
      }).save();

      emit(event);
    },

    onError: async (error: Error) => {
      const event = await new MessageModel({
        projectId,
        type: 'RUN_EVENT',
        runEvent: {
          runId,
          eventType: 'error',
          content: error.message,
          isError: true,
        },
      }).save();

      emit(event);
    },

    onDone: async (summary: AgentRunSummary) => {
      const mapped = MessageUtil.mapAgentStopReason(summary.stopReason);
      
      await patchRun({
        status: mapped.status,
        stopReason: mapped.stopReason,
        iterations: summary.iterations,
        usage: summary.usage,
        endedAt: new Date(),
      });

      if (summary.finalText.trim()) {
        const agentMessage = await new MessageModel({
          projectId,
          type: 'TEXT_MESSAGE',
          textMessage: {
            role: 'agent',
            content: summary.finalText,
            runId,
          },
        }).save();
        
        emit(agentMessage);
      }
    },
  };
}
