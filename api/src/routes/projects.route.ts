import express from 'express';
import { authed, AuthedRequest, requireUser } from '../middleware/require-user';

import MessageService from '../services/message.service';
import ProjectService from '../services/project.service';
import AgentRunService, { AgentRunConflictError, AgentRunNotFoundError } from '../services/agent-run';
import { beginNdjsonMessageStream } from '../utils/ndjson-stream';
import Helper from '../utils/helper.util';

const router = express.Router();
router.use(requireUser);

function projectId(req: AuthedRequest) {
  const { projectId } = req.params;
  return typeof projectId === 'string' ? projectId : undefined;
}

// Create project + run the agent (which provisions sandbox as well); stream Message docs as NDJSON.
router.post('/create', authed(async (req, res) => {
  try {
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const project = await ProjectService.createProjectRecord({
      userId: req.userId,
      title: Helper.optionalString(req.body?.title),
      subtitle: Helper.optionalString(req.body?.subtitle),
    });

    const stream = beginNdjsonMessageStream(req, res);

    try {
      await AgentRunService.streamMessageAndRun({
        projectId: project.projectId,
        userId: req.userId,
        content: prompt,
        signal: stream.signal,
        emit: stream.emit,
      });
    } catch (err) {
      console.log(err);
    } finally {
      stream.end();
    }
  } catch (err) {
    console.log(err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }
}));


router.post('/:projectId/heartbeat', authed(async (req, res) => {
  const id = projectId(req);
  if (!id) return res.status(400).json({ error: 'Invalid project ID' });

  await ProjectService.heartbeat(id);
  return res.json({ ok: true });
}));


// Live sandbox state, derived from the cluster
router.get('/:projectId/status', authed(async (req, res) => {
  const id = projectId(req);
  if (!id) return res.status(400).json({ error: 'Invalid project ID' });

  try {
    const status = await ProjectService.getStatus(id);
    return res.json(status);
  } catch (err) {
    console.log(err);
    return res.status(502).json({ error: 'Could not reach the cluster' });
  }
}));


router.post('/:projectId/sandbox', authed(async (req, res) => {
  const id = projectId(req);
  if (!id) return res.status(400).json({ error: 'Invalid project ID' });

  const owned = await ProjectService.getOwnedProject(id, req.userId);
  if (!owned) return res.status(404).json({ error: 'Project not found' });

  try {
    const status = await ProjectService.startSandbox(id);
    return res.json(status);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Could not start sandbox' });
  }
}));


// Provision a sandbox for this project
router.post('/:projectId/start', authed(async (req, res) => {
  const id = projectId(req);
  if (!id) return res.status(400).json({ error: 'Invalid project ID' });

  try {
    const status = await ProjectService.startSandbox(id);
    return res.json(status);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Could not start sandbox' });
  }
}));


router.post('/:projectId/stop', authed(async (req, res) => {
  const id = projectId(req);
  if (!id) return res.status(400).json({ error: 'Invalid project ID' });

  try {
    const status = await ProjectService.stopSandbox(id);
    return res.json(status);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Could not stop sandbox' });
  }
}));


// Conversation timeline (messages + runs + run events) - oldest first.
router.get('/:projectId/messages', authed(async (req, res) => {
  const id = projectId(req);
  if (!id) return res.status(400).json({ error: 'Invalid project ID' });

  try {
    const timeline = await MessageService.listTimelineForOwnedProject(
      id,
      req.userId
    );
    if (!timeline) {
      return res.status(404).json({ error: 'Project not found' });
    }
    return res.json(timeline);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}));


// Persist user message + run the agent; stream Message docs as NDJSON.
router.post('/:projectId/messages', authed(async (req, res) => {
  const id = projectId(req);
  if (!id) return res.status(400).json({ error: 'Invalid project ID' });

  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
  if (!content) {
    return res.status(400).json({ error: 'content is required' });
  }

  try {
    await AgentRunService.assertCanStart(id, req.userId);
  } catch (err) {
    if (err instanceof AgentRunNotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    if (err instanceof AgentRunConflictError) {
      return res.status(409).json({ error: err.message });
    }
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }

  const stream = beginNdjsonMessageStream(req, res);

  try {
    await AgentRunService.streamMessageAndRun({
      projectId: id,
      userId: req.userId,
      content,
      signal: stream.signal,
      emit: stream.emit,
    });
  } catch (err) {
    console.log(err);
  } finally {
    stream.end();
  }
}));


// Get projects by user ID
router.get('/list/user', authed(async (req, res) => {
  try {
    const projects = await ProjectService.getProjectsByUserId(req.userId);

    return res.json(projects);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}));


// Get project by projectId
router.get('/:projectId', authed(async (req, res) => {
  const id = projectId(req);
  if (!id) return res.status(400).json({ error: 'Invalid project ID' });

  try {
    const project = await ProjectService.getOwnedProject(id, req.userId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json(project.toObject());
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}));


// Delete the project and destroy its sandbox
router.delete('/:projectId', authed(async (req, res) => {
  const id = projectId(req);
  if (!id) return res.status(400).json({ error: 'Invalid project ID' });

  try {
    await ProjectService.deleteProject(id);
    return res.json({ ok: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Could not delete project' });
  }
}));

export default router;
