import { createAnthropic } from "@ai-sdk/anthropic";
import { AgentBounds, AgentChatMessage, AgentEvents, AgentRunSummary, AgentSandbox, StopReason } from "./types";
import config, { AGENT_DEFAULT_BOUNDS, MODEL } from "./config";
import { generateText, stepCountIs } from "ai";
import { SYSTEM_PROMPT } from "./prompt";
import { createTools } from "./tools/tools";


export type RunAgentOptions = {
  sandbox: AgentSandbox;
  // Multi-turn chat history. Preferred over `prompt`
  messages?: AgentChatMessage[];
  // use only when `messages` is empty
  prompt?: string;
  // apiKey?: string;
  // model?: string;
  bounds?: Partial<AgentBounds>
  on?: AgentEvents;
  signal?: AbortSignal;
}

function resolveMessages(options: RunAgentOptions): AgentChatMessage[] {
  if (options.messages != null && options.messages.length > 0) {
    return options.messages;
  }
  if (options.prompt != null && options.prompt !== '') {
    return [{ role: 'user', content: options.prompt }];
  }
  throw new Error('runAgent requires messages or prompt');
}

export async function runAgent(options: RunAgentOptions): Promise<AgentRunSummary> {
  
  const startedAt = Date.now();
  const messages = resolveMessages(options);
  
  let timedOut = false;
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  options.signal?.addEventListener('abort', onAbort);

  if (options.signal?.aborted) {
    const runSummary: AgentRunSummary = {
      stopReason: 'CANCELLED',
      iterations: 0,
      usage: { inputTokens: 0, outputTokens: 0, cacheCreationInputTokens: 0, cacheReadInputTokens: 0 },
      durationMs: Date.now() - startedAt,
      finalText: '',
    }

    return runSummary
  }
   
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, AGENT_DEFAULT_BOUNDS.maxWallClockMs);


  try {
    const anthropic = createAnthropic({ apiKey: config.claudeApiKey });
    
    const result = await generateText({
      model: anthropic(MODEL),
      instructions: SYSTEM_PROMPT,
      messages,
      tools: createTools(options.sandbox),
      stopWhen: stepCountIs(AGENT_DEFAULT_BOUNDS.maxIterations),
      
      abortSignal: controller.signal,
  
      onToolExecutionStart: async ({ toolCall }) => {
        await options.on?.onToolCall?.({
          id: toolCall.toolCallId,
          name: toolCall.toolName,
          args: 'input' in toolCall ? toolCall.input : undefined,
        })
      },
  
      onToolExecutionEnd: async ({ toolCall, toolOutput, toolExecutionMs }) => {
        const isError = toolOutput.type === 'tool-error';
  
        const content = isError 
          ? String(toolOutput.error) 
          : typeof toolOutput.output === 'string'
            ? toolOutput.output
            : JSON.stringify(toolOutput.output);
  
        await options.on?.onToolResult?.({
          id: toolCall.toolCallId,
          name: toolCall.toolName,
          content,
          isError,
          durationMs: toolExecutionMs,
        });
      },
  
      onStepEnd: async (step) => {
        if (step.text.trim()) {
          await options.on?.onAssistantMessage?.(step.text);
        } 
      }
    });
  
    const runSummary: AgentRunSummary = {
      stopReason: 'SUCCESS',
      iterations: result.steps.length,
      usage: {
        inputTokens: result.usage.inputTokens ?? 0,
        outputTokens: result.usage.outputTokens ?? 0,
        cacheCreationInputTokens:
          result.usage.inputTokenDetails?.cacheWriteTokens ?? 0,
        cacheReadInputTokens:
          result.usage.inputTokenDetails?.cacheReadTokens ?? 0,
      },
      durationMs: Date.now() - startedAt,
      finalText: result.text,
    }
  
    await options.on?.onDone?.(runSummary);
  
    return runSummary
  } catch (error) {
    const isStopReasonKnown = timedOut || options.signal?.aborted || controller.signal.aborted;

    if (isStopReasonKnown) {
      const runSummary: AgentRunSummary = {
        stopReason: timedOut ? 'TIMEOUT' : 'CANCELLED',
        iterations: 0,
        usage: { inputTokens: 0, outputTokens: 0, cacheCreationInputTokens: 0, cacheReadInputTokens: 0 },
        durationMs: Date.now() - startedAt,
        finalText: '',
      }

      await options.on?.onDone?.(runSummary);
      return runSummary;
    }

    const normalizedError = error instanceof Error
      ? error
      : new Error(String(error));

    await options.on?.onError?.(normalizedError);
    throw normalizedError;
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', onAbort);
  }
}