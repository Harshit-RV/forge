import {
  RUN_EVENT_TOOL_ARGS_MAX_CHARS,
  RUN_EVENT_TOOL_RESULT_MAX_CHARS,
  RunStatus,
  RunStopReason,
} from '../models/message/Message.model';

class MessageUtil {

  static mapAgentStopReason(agentStopReason: string): {
    status: RunStatus;
    stopReason: RunStopReason;
  } {
    switch (agentStopReason) {
      case 'SUCCESS':
        return { status: 'SUCCESS', stopReason: 'COMPLETED' };
      case 'CANCELLED':
        return { status: 'CANCELLED', stopReason: 'CANCELLED' };
      case 'TIMEOUT':
        return { status: 'FAILED', stopReason: 'TIMEOUT' };
      case 'MAX_ITERATIONS':
        return { status: 'FAILED', stopReason: 'MAX_ITERATIONS' };
      case 'MAX_TOKENS':
        return { status: 'FAILED', stopReason: 'MAX_TOKENS' };
      case 'REFUSAL':
        return { status: 'FAILED', stopReason: 'REFUSAL' };
      default:
        return { status: 'FAILED', stopReason: 'ERROR' };
    }
  }
  
  // Truncate a string for storing in Mongo
  private static truncateForPersistence(
    value: string,
    maxChars: number
  ): string {
    if (value.length <= maxChars) return value;
    const keep = Math.max(0, maxChars - '…[truncated]'.length);
    return `${value.slice(0, keep)}…[truncated]`;
  }

  // JSON-serialize tool args, then truncate
  static truncateToolArgs(
    args: unknown,
    maxChars = RUN_EVENT_TOOL_ARGS_MAX_CHARS
  ): unknown {
    if (args === undefined) return undefined;
    try {
      const raw = JSON.stringify(args);
      if (raw.length <= maxChars) return args;
      return this.truncateForPersistence(raw, maxChars);
    } catch {
      return this.truncateForPersistence(String(args), maxChars);
    }
  }

  static truncateToolResult(
    result: string,
    maxChars = RUN_EVENT_TOOL_RESULT_MAX_CHARS
  ): string {
    return this.truncateForPersistence(result, maxChars);
  }
}

export default MessageUtil;