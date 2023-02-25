type ChatHistory = {
  days: DayRecord[];
};

type DayRecord = {
  id: string;
  date: string;
  content: Bundle[];
};

type Bundle = MessageBundle | EventBundle;
type BundleBase<T, C> = { id: string; type: T; content: C[] };
type MessageBundle = BundleBase<"message", ChatMessage>;
type EventBundle = BundleBase<"event", ChatEvent>;

type Activity = ChatMessage | ChatEvent;

type ChatEvent = ContactAssigned | ContactEnded;

type ContactAssigned = ContactEventBase<"contact_assigned">;
type ContactEnded = ContactEventBase<"contact_ended">;
type ContactEventBase<T> = {
  id: string;
  type: "event";
  event: T;
  contact: {
    id: string;
  };
  assigned_agent: {
    id: string;
    name: string;
  };
  created_at: string;
};

type User = {
  id: string;
  name: string;
};
type MessageContent = string;
type ChatMessage = {
  id: string;
  type: "message";
  user: User;
  message: MessageContent;
  created_at: string;
};
