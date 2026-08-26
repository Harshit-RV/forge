import { randomUUID } from 'node:crypto';
import { runAgent } from 'agent';
import MessageModel, { type RunStatus } from '../../models/message/Message.model';
import { createSandboxAdapter } from '../../adapters/sandbox';
import ProjectService from '../project.service';
import { AgentRunConflictError, AgentRunNotFoundError } from './errors';
import ensureSandboxRunning from './ensure-sandbox';
import { createAgentEventHandlers } from './events';
import { createQueuedRun, createRunPatcher, type StreamEmit } from './persist';
import MessageService from '../message.service';
export { AgentRunConflictError, AgentRunNotFoundError, type StreamEmit };

const ACTIVE_RUN_STATUSES: RunStatus[] = [ 'QUEUED', 'PROVISIONING', 'WORKING' ];


class AgentRunService {
  // checks ownership and if the agent is already working on the project
  static assertCanStart = async ( projectId: string, userId: string ): Promise<void> => {
    const project = await ProjectService.getOwnedProject(projectId, userId);
    if (!project) throw new AgentRunNotFoundError();

    const active = await MessageModel.findOne({
      projectId,
      type: 'RUN',
      'run.status': { $in: ACTIVE_RUN_STATUSES },
    }).lean();

    if (active) throw new AgentRunConflictError();
  };

  static streamMessageAndRun = async (args: {
    projectId: string;
    userId: string;
    content: string;
    signal: AbortSignal;
    emit: StreamEmit;
  }): Promise<void> => {
    const { projectId, userId, content, signal, emit } = args;

    await this.assertCanStart(projectId, userId);

    const userMessage = await MessageService.insertUserTextMessage(projectId, content);
    emit(userMessage);

    const runId = randomUUID();
    const runDoc = await createQueuedRun(
      projectId,
      runId,
      String(userMessage._id)
    );
    emit(runDoc);

    const patchRun = createRunPatcher(runDoc, emit);

    await patchRun({ status: 'PROVISIONING' });

    try {
      await ensureSandboxRunning(projectId, signal);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sandbox failed to start';
      await patchRun({
        status: 'FAILED',
        stopReason: 'ERROR',
        error: message,
        endedAt: new Date(),
      });
      return;
    }

    if (signal.aborted) {
      await patchRun({
        status: 'CANCELLED',
        stopReason: 'CANCELLED',
        endedAt: new Date(),
      });
      return;
    }

    await patchRun({ status: 'WORKING', startedAt: new Date() });

    const textMessages = await MessageService.listTextMessages(projectId);
    const messages = textMessages.map((message) => ({
      role: message.role === 'agent' ? ('assistant' as const) : ('user' as const),
      content: message.content,
    }));

    // Fallback: history should already include this turn; keep a non-empty prompt if it doesn't.
    if (messages.length === 0) {
      messages.push({ role: 'user', content });
    }

    const sandbox = createSandboxAdapter(projectId);

    try {
      await runAgent({
        sandbox,
        messages,
        signal,
        on: createAgentEventHandlers({ projectId, runId, emit, patchRun }),
      });
    } catch (error) {
      if (signal.aborted) {
        await patchRun({
          status: 'CANCELLED',
          stopReason: 'CANCELLED',
          endedAt: new Date(),
        });
        return;
      }

      const message = error instanceof Error ? error.message : 'Agent run failed';
      
      await patchRun({
        status: 'FAILED',
        stopReason: 'ERROR',
        error: message,
        endedAt: new Date(),
      });
    }
  };
}

export default AgentRunService;
