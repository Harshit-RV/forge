import MessageModel, {
  type MessageDoc,
  type RunPayload,
} from '../../models/message/Message.model';

export type StreamEmit = (doc: MessageDoc) => void;

export type RunPatch = Partial<Omit<RunPayload, 'runId' | 'triggerMessageId'>>;

export const createQueuedRun = async (
  projectId: string,
  runId: string,
  triggerMessageId: string
): Promise<MessageDoc> => {
  return new MessageModel({
    projectId,
    type: 'RUN',
    run: {
      runId,
      status: 'QUEUED',
      triggerMessageId,
      // other fields get default values
    },
  }).save();
}

export const createRunPatcher = (initial: MessageDoc, emit: StreamEmit) => {
  let runDoc = initial;

  return async (patch: RunPatch): Promise<MessageDoc> => {
    if (!runDoc.run) return runDoc;

    Object.assign(runDoc.run, patch);
    runDoc.markModified('run');
    runDoc = await runDoc.save();

    emit(runDoc);

    return runDoc;
  };
};
