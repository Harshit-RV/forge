import type { Request, Response } from 'express';
import type { MessageDoc } from '../models/message/Message.model';
import type { StreamEmit } from '../services/agent-run';

// Open an NDJSON Message stream (same headers/abort wiring for create + messages endpoints)
export const beginNdjsonMessageStream = (
  req: Request, res: Response): { signal: AbortSignal; emit: StreamEmit; end: () => void;
} => {
  res.status(200);
  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');

  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  const controller = new AbortController();
  const onClose = () => {
    if (!res.writableEnded) controller.abort();
  };
  req.on('close', onClose);

  const emit: StreamEmit = (doc: MessageDoc) => {
    if (res.writableEnded) return;
    res.write(`${JSON.stringify(doc.toJSON())}\n`);
  };

  return {
    signal: controller.signal,
    emit,
    end: () => {
      req.off('close', onClose);
      if (!res.writableEnded) res.end();
    },
  };
}
