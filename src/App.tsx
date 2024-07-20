import "./App.css";
import { InboxData, Conversation, User, Message } from "./types";

const GET_URL =
  "https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=5448e3d103064334b6f707489996";

const POST_URL =
  "https://candidate.hubteam.com/candidateTest/v3/problem/result?userKey=5448e3d103064334b6f707489996";

/////////////////////////////////////////////
// TO WHOEVER IS REVIEWING THIS CODE...
// I spun this app up as a Vite + React app before starting the coding challenge...
// only to realize that it was way overkill lol. 
// Hope you enjoy my non-React-y React app :) 
/////////////////////////////////////////////

function App() {
  // used to make API requests and handle errors
  const apiRequest = async <T,>(
    url: string,
    options?: RequestInit
  ): Promise<T> => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        // Handle HTTP errors
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      // Handle network errors and other unexpected issues
      console.error(`Failed to request data from ${url}:`, error);
      throw new Error(`Failed to request data. Please try again later.`);
    }
  };

  const getInboxData = async (): Promise<InboxData> => {
    return apiRequest<InboxData>(GET_URL);
  };

  const postConversationData = async (conversations: Conversation[]) => {
    await apiRequest<void>(POST_URL, {
      method: "POST",
      body: JSON.stringify({ conversations }),
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    });
  };

  // sorts conversations in reverse chronological order based on most recent message
  const sortConversations = (conversations: Conversation[]): Conversation[] => {
    return conversations.sort(
      (a, b) => b.mostRecentMessage.timestamp - a.mostRecentMessage.timestamp
    );
  };

  const createNewConversation = (
    user: User,
    message: Message
  ): Conversation => {
    const { content, timestamp, fromUserId } = message;
    const { avatar, firstName, lastName, id: userId } = user;

    return {
      totalMessages: 1,
      avatar,
      firstName,
      lastName,
      userId,
      mostRecentMessage: {
        content,
        timestamp,
        userId: fromUserId,
      },
    };
  };

  const updateExistingConversation = (
    conversation: Conversation,
    message: Message
  ) => {
    const { content, timestamp, fromUserId } = message;

    conversation.totalMessages++;
    if (conversation.mostRecentMessage.timestamp < timestamp) {
      conversation.mostRecentMessage = {
        content,
        timestamp,
        userId: fromUserId,
      };
    }
  };

  // builds a map of users for quicker lookup
  const buildUserMap = (users: User[]): Map<number, User> => {
    const userMap = new Map<number, User>();
    for (const user of users) {
      userMap.set(user.id, user);
    }
    return userMap;
  };

  const buildConversationList = (data: InboxData): Conversation[] => {
    const { messages, users: userList, userId: myUserId } = data;
    const users = buildUserMap(userList);
    const conversations = new Map<number, Conversation>();

    for (const message of messages) {
      const { fromUserId, toUserId } = message;
      const conversationPartnerId =
        fromUserId === myUserId ? toUserId : fromUserId;
      const conversation = conversations.get(conversationPartnerId);

      if (conversation) {
        updateExistingConversation(conversation, message);
      } else {
        const user = users.get(conversationPartnerId);
        if (user) {
          const newConversation = createNewConversation(user, message);
          conversations.set(conversationPartnerId, newConversation);
        }
      }
    }

    return sortConversations(Array.from(conversations.values()));
  };

  const solveCodingChallenge = async () => {
    try {
      const inboxData = await getInboxData();
      const conversations = buildConversationList(inboxData);
      await postConversationData(conversations);
    } catch (error) {
      console.error("Error in data processing:", error);
    }
  };

  solveCodingChallenge();

  return null;
}

export default App;
