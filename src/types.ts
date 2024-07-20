interface Message {
  content: string;
  fromUserId: number;
  toUserId: number;
  timestamp: number;
}

interface User {
  avatar: string;
  firstName: string;
  lastName: string;
  id: number;
}

interface InboxData {
  userId: number;
  users: User[];
  messages: Message[];
}

interface MostRecentMessage {
  content: string;
  timestamp: number;
  userId: number;
}

interface Conversation {
  avatar: string;
  firstName: string;
  lastName: string;
  userId: number;
  totalMessages: number;
  mostRecentMessage: MostRecentMessage;
}

export type { Conversation, InboxData, Message, User };
