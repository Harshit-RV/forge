import MessageModel, {
  type MessageDoc,
} from '../models/message/Message.model';
import type { TextMessagePayload } from '../models/message/textMessage.schema';
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

  static listTextMessages = async (projectId: string): Promise<TextMessagePayload[]> => {
    const docs = await MessageModel.find({
      projectId,
      type: 'TEXT_MESSAGE',
    }).sort({ createdAt: 1 }).lean();

    return docs.flatMap((doc) => (doc.textMessage ? [doc.textMessage] : []));
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
