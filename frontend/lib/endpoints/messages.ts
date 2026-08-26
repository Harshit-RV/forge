import { request, requestNdjson, type Token } from "@/lib/api";
import type { Message } from "@/lib/types";

export const messagesApi = {
  list: (token: Token, projectId: string) =>
    request<Message[]>(`/projects/${projectId}/messages`, token),

  send: (
    token: Token,
    projectId: string,
    content: string,
    onMessage: (message: Message) => void
  ) =>
    requestNdjson<Message>(
      `/projects/${projectId}/messages`,
      token,
      { content },
      onMessage
    ),
};
