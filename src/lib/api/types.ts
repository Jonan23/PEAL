export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "woman" | "sponsor" | "admin" | "banned";
  bio?: string;
  location?: string;
  isPublic?: boolean;
  createdAt?: string;
}

export type ProgressCallback = (progress: number) => void;

export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl: string;
  videoDuration?: number;
  category?: string;
  authorId: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isTrending: boolean;
  createdAt: string;
  author?: User;
  tags?: string[];
}

export interface Mentor {
  id: string;
  userId: string;
  bio?: string;
  availability: "available" | "busy" | "unavailable";
  yearsExperience?: number;
  maxMentees: number;
  currentMenteesCount: number;
  acceptsRemote: boolean;
  user?: User;
  skills?: string[];
}

export interface FundingRequest {
  id: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  category?: string;
  goalAmount: number;
  currentAmount: number;
  supportersCount: number;
  authorId: string;
  status: string;
  deadline: string;
  createdAt: string;
  author?: User;
}

export interface SuccessStory {
  id: string;
  title: string;
  description: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  impactDescription?: string;
  authorId: string;
  celebrationsCount: number;
  isFeatured: boolean;
  createdAt: string;
  author?: User;
}

export interface Conversation {
  id: string;
  createdAt: string;
  participants?: ConversationParticipant[];
  lastMessage?: Message;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  lastMessageAt: string;
  unreadCount: number;
  user?: User;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: User;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  mentorMessagesNotifications: boolean;
  supporterUpdatesNotifications: boolean;
  weeklyDigest: boolean;
  language: string;
  theme: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  error: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  targetDate: string;
  status: "in_progress" | "completed" | "on_hold";
  progress: number;
  priority: "low" | "medium" | "high";
  createdAt: string;
  milestones: GoalMilestone[];
}

export interface GoalMilestone {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  eventDate: string;
  endDate?: string;
  location?: string;
  isVirtual: boolean;
  meetingUrl?: string;
  category: string;
  maxAttendees?: number;
  attendeeCount: number;
  hostId: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  createdAt: string;
  host?: User;
  attendees?: User[];
}

export interface MentorMatch {
  mentorId: string;
  score: number;
  matchedSkills: string[];
  matchedInterests: string[];
  locationMatch: boolean;
  availability: string;
  yearsExperience: number | null;
  profile: {
    id: string;
    bio: string | null;
    availability: string;
    yearsExperience: number | null;
    skills: string[];
    user: {
      id: string;
      name: string;
      avatarUrl: string | null;
      location: string | null;
      bio: string | null;
    };
  };
}
