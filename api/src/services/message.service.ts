import MessageModel, {
  type MessageDoc,
} from '../models/message/Message.model';
import ProjectService from './project.service';

class MessageService {
  static listTimelineForOwnedProject = async (
    projectId: string,
    userId: string
  ): Promise<MessageDoc[] | null> => {
    const project = await ProjectService.getOwnedProject(projectId, userId);
    if (!project) return null;

    const items = await MessageModel.find({ projectId }).sort({ createdAt: 1 });

    return items;
  };

  static insertUserTextMessage = async ( projectId: string, content: string ) : Promise<MessageDoc> => {
    return new MessageModel({
      projectId,
      type: 'TEXT_MESSAGE',
      textMessage: { role: 'user', content },
    }).save();
  }

  static createUserMessage = async (
    projectId: string,
    userId: string,
    content: string
  ) => {
    const project = await ProjectService.getOwnedProject(projectId, userId);
    if (!project) return null;

    return this.insertUserTextMessage(projectId, content);
  };
}

export default MessageService;
