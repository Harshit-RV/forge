import Project, { ProjectDoc, ProjectProps } from "../models/Project.model";


class ProjectService {
  static createNewProject = async (args: ProjectProps): Promise<ProjectDoc> => {
    const project = new Project({ ...args });
    return project.save();
  }
  
  static getProjectsByUserId = async (userId: string): Promise<ProjectDoc[]> => {
    return Project.find({ userId });
  }
  
  static getProjectByProjectId = async (projectId: string): Promise<ProjectDoc | null> => {
    return Project.findOne({ projectId });
  }
  
  static getProjectById = async (id: string): Promise<ProjectDoc | null> => {
    return Project.findById(id);
  }
  
  static deleteProject = async (id: string) => {
    return Project.findByIdAndDelete(id);
  }
  
  static getAllProjects = async (): Promise<ProjectDoc[]> => {
    return Project.find({});
  }
  
  static updateProject = async (id: string, updateFields: Partial<ProjectProps>) => {
    return Project.findByIdAndUpdate(id, updateFields, { new: true });
  }
}

export default ProjectService;