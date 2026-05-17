import api from "./axios";
import type {
  Message,
  SendMessageDTO,
  EditMessageDTO,
  DeleteMessageDTO,
} from "../types/global.types";

export const sendMessage = async (data: SendMessageDTO): Promise<Message> => {
  const res = await api.post<Message>("/api/chat/message/send", data);
  return res.data;
};

export const uploadMessageFile = async (
  file: File,
  roomId?: string,
  receiver?: string,
): Promise<Message> => {
  const formData = new FormData();
  formData.append("file", file);
  if (roomId) formData.append("roomId", roomId);
  if (receiver) formData.append("receiver", receiver);

  const res = await api.post<Message>("/api/chat/message/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const downloadMessageFile = async (
  messageId: string,
  fileName: string,
) => {
  const res = await api.get(`/api/chat/message/download/${messageId}`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;

  document.body.appendChild(a);
  a.click();

  a.remove();
  window.URL.revokeObjectURL(url);
};

export const getPrivateMessages = async (
  userId: string,
): Promise<Message[]> => {
  const res = await api.get(`/api/chat/message/private/${userId}`);
  return res.data.data;
};

export const getRoomMessages = async (roomId: string): Promise<Message[]> => {
  const res = await api.get(`/api/chat/message/room/${roomId}`);
  return res.data.data;
};

export const getLatestMessages = async () => {
  const res = await api.get("/api/chat/message/latest");
  return res.data;
};

export const editMessage = async (data: EditMessageDTO): Promise<Message> => {
  const res = await api.patch<Message>("/api/chat/message/edit", data);
  return res.data;
};

export const deleteMessage = async (
  data: DeleteMessageDTO,
): Promise<{ message: string }> => {
  const res = await api.delete<{ message: string }>(
    "/api/chat/message/delete",
    {
      data,
    },
  );
  return res.data;
};
