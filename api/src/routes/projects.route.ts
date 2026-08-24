import express from 'express';
import { ProjectProps } from '../models/Project.model';
import { isValidObjectId } from 'mongoose';
import { authed, requireUser } from '../middleware/require-user';
import ProjectService from '../services/project.service';

const router = express.Router();
router.use(requireUser);

// Create a new project
router.post('/create', authed(async (req, res) => {
  try {
    const { title, subtitle } = req.body;

    const newProject: ProjectProps = {
      userId: req.userId,
      title: title ?? null,
      subtitle: subtitle ?? null
    };

    const projectDoc = await ProjectService.createNewProject(newProject);

    return res.status(201).json(projectDoc);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
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


// Get project by ID
router.get('/:id', authed(async (req, res) => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string' || !isValidObjectId(id)) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = await ProjectService.getProjectById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.userId !== req.userId) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.json(project);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}));

export default router;
