import { api } from "./client";
import type {
  User,
  AuthResponse,
  Video,
  Mentor,
  FundingRequest,
  SuccessStory,
  Conversation,
  Message,
  Notification,
  UserSettings,
  PaginatedResponse,
  Goal,
  GoalMilestone,
  Event,
  MentorMatch,
} from "./types";

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    name: string;
    role: string;
  }) => api.post<AuthResponse>("/api/auth/register", data),

  login: (email: string, password: string) =>
    api.post<AuthResponse>("/api/auth/login", { email, password }),

  google: (idToken: string, role?: "woman" | "sponsor") =>
    api.post<AuthResponse>("/api/auth/google", {
      idToken,
      ...(role ? { role } : {}),
    }),

  logout: (refreshToken?: string) =>
    api.post("/api/auth/logout", refreshToken ? { refreshToken } : {}),

  getMe: () => api.get<{ user: User }>("/api/auth/me"),

  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string; refreshToken: string }>(
      "/api/auth/refresh",
      { refreshToken },
    ),
};

export const usersApi = {
  getById: (id: string) => api.get<{ user: User }>(`/api/users/${id}`),

  update: (id: string, data: Partial<User>) =>
    api.put<{ user: User }>(`/api/users/${id}`, data),

  delete: (id: string) => api.delete(`/api/users/${id}`),

  getFollowers: (id: string) =>
    api
      .get<{ data: User[] }>(`/api/users/${id}/followers`)
      .then((response) => ({ followers: response.data })),

  getFollowing: (id: string) =>
    api
      .get<{ data: User[] }>(`/api/users/${id}/following`)
      .then((response) => ({ following: response.data })),

  getSkills: (id: string) =>
    api.get<{ skills: string[] }>(`/api/users/${id}/skills`),

  updateSkills: (id: string, skills: string[]) =>
    api.put<{ skills: string[] }>(`/api/users/${id}/skills`, { skills }),

  getInterests: (id: string) =>
    api.get<{ interests: string[] }>(`/api/users/${id}/interests`),

  updateInterests: (id: string, interests: string[]) =>
    api.put<{ interests: string[] }>(`/api/users/${id}/interests`, {
      interests,
    }),

  follow: (id: string) => api.post(`/api/users/${id}/follow`),

  unfollow: (id: string) => api.delete(`/api/users/${id}/follow`),
};

export const videosApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.category) searchParams.set("category", params.category);
    if (params?.search) searchParams.set("search", params.search);
    const query = searchParams.toString();
    return api.get<PaginatedResponse<Video>>(
      `/api/videos${query ? `?${query}` : ""}`,
    );
  },

  getById: (id: string) => api.get<{ video: Video }>(`/api/videos/${id}`),

  getTrending: () =>
    api.get<{ data: Video[] }>("/api/videos/trending").then((res) => ({
      videos: res.data,
    })),

  create: (data: {
    title: string;
    description?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    category?: string;
    tags?: string[];
  }) => api.post<{ video: Video }>("/api/videos", data),

  update: (id: string, data: Partial<Video>) =>
    api.put<{ video: Video }>(`/api/videos/${id}`, data),

  delete: (id: string) => api.delete(`/api/videos/${id}`),

  like: (id: string) => api.post(`/api/videos/${id}/like`),

  unlike: (id: string) => api.delete(`/api/videos/${id}/like`),

  addComment: (id: string, content: string) =>
    api.post(`/api/videos/${id}/comments`, { content }),

  getComments: (id: string) =>
    api.get<{
      data: unknown[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/api/videos/${id}/comments`),
};

export const mentorsApi = {
  getAll: (params?: {
    skill?: string;
    availability?: string;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.skill) searchParams.set("skill", params.skill);
    if (params?.availability)
      searchParams.set("availability", params.availability);
    const query = searchParams.toString();
    return api
      .get<{
        data: Mentor[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(`/api/mentors${query ? `?${query}` : ""}`)
      .then((response) => ({
        mentors: response.data,
        pagination: response.pagination,
      }));
  },

  getById: (id: string) => api.get<{ mentor: Mentor }>(`/api/mentors/${id}`),

  createProfile: (data: {
    bio?: string;
    skills?: string[];
    yearsExperience?: number;
  }) => api.post<{ mentor: Mentor }>("/api/mentors", data),

  updateProfile: (id: string, data: Partial<Mentor>) =>
    api.put<{ mentor: Mentor }>(`/api/mentors/${id}`, data),

  connect: (mentorId: string) => api.post(`/api/mentors/${mentorId}/connect`),

  respondToConnection: (
    mentorId: string,
    connectionId: string,
    action: "accept" | "reject",
  ) =>
    api.put(`/api/mentors/${mentorId}/connection`, {
      connectionId,
      action,
    }),

  getConnections: () =>
    api.get<{ connections: unknown[] }>("/api/mentors/connections"),

  getMentees: () => api.get<{ mentees: User[] }>("/api/mentors/mentees"),
};

export const requestsApi = {
  getAll: (params?: {
    status?: string;
    category?: string;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.search) searchParams.set("search", params.search);
    const query = searchParams.toString();
    return api
      .get<{
        data: FundingRequest[];
      }>(`/api/requests${query ? `?${query}` : ""}`)
      .then((response) => ({ requests: response.data }));
  },

  getById: (id: string) =>
    api.get<{ request: FundingRequest }>(`/api/requests/${id}`),

  create: (data: {
    title: string;
    description: string;
    goalAmount: number;
    deadline: string;
    category?: string;
    coverImageUrl?: string;
  }) => api.post<{ request: FundingRequest }>("/api/requests", data),

  update: (id: string, data: Partial<FundingRequest>) =>
    api.put<{ request: FundingRequest }>(`/api/requests/${id}`, data),

  delete: (id: string) => api.delete(`/api/requests/${id}`),

  getDonations: (id: string) =>
    api
      .get<{ donations: unknown[] }>(`/api/payments/donations/${id}`)
      .then((response) => ({ donations: response.donations })),
};

export const donationsApi = {
  createIntent: (
    requestId: string,
    amount: number,
    message?: string,
    isAnonymous?: boolean,
  ) =>
    api.post<{
      clientSecret: string;
      donationId: string;
      paymentIntentId?: string;
    }>("/api/payments/create-donation-intent", {
      requestId,
      amount,
      message,
      isAnonymous,
    }),

  confirm: (donationId: string, paymentIntentId?: string) =>
    api.post<{
      success: boolean;
      message: string;
      donation: { id: string; amount: number; requestId: string };
    }>("/api/payments/confirm-donation", {
      donationId,
      paymentIntentId,
    }),
};

export const storiesApi = {
  getAll: (params?: { featured?: boolean }) => {
    if (params?.featured) {
      return api
        .get<{
          story: SuccessStory;
        }>("/api/stories/featured")
        .then((response) => ({
          stories: [response.story],
          pagination: { page: 1, limit: 1, total: 1, totalPages: 1 },
        }));
    }
    return api
      .get<{
        data: SuccessStory[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>("/api/stories")
      .then((response) => ({
        stories: response.data,
        pagination: response.pagination,
      }));
  },

  getById: (id: string) =>
    api.get<{ story: SuccessStory }>(`/api/stories/${id}`),

  create: (data: {
    title: string;
    description: string;
    beforeImageUrl?: string;
    afterImageUrl?: string;
    impactDescription?: string;
  }) => api.post<{ story: SuccessStory }>("/api/stories", data),

  update: (id: string, data: Partial<SuccessStory>) =>
    api.put<{ story: SuccessStory }>(`/api/stories/${id}`, data),

  delete: (id: string) => api.delete(`/api/stories/${id}`),

  celebrate: (id: string) => api.post(`/api/stories/${id}/celebrate`),
};

export const messagesApi = {
  getConversations: () =>
    api
      .get<{
        data: Array<{
          id: string;
          participants: Array<{ id: string; name: string; avatarUrl?: string }>;
          lastMessage?: Message;
          unreadCount?: number;
          lastMessageAt?: string;
          createdAt?: string;
        }>;
      }>("/api/messages")
      .then((response) => ({
        conversations: response.data.map(
          (conversation): Conversation => ({
            id: conversation.id,
            createdAt:
              conversation.createdAt ||
              conversation.lastMessageAt ||
              new Date().toISOString(),
            unreadCount: conversation.unreadCount || 0,
            lastMessage: conversation.lastMessage,
            participants: (conversation.participants || []).map(
              (participant) => ({
                id: `${conversation.id}:${participant.id}`,
                conversationId: conversation.id,
                userId: participant.id,
                lastMessageAt:
                  conversation.lastMessageAt ||
                  conversation.createdAt ||
                  new Date().toISOString(),
                unreadCount: conversation.unreadCount || 0,
                user: participant,
              }),
            ),
          }),
        ),
      })),

  getConversation: (id: string) =>
    api
      .get<{
        conversation: {
          id: string;
          createdAt?: string;
          participants: Array<{ id: string; name: string; avatarUrl?: string }>;
          messages: Message[];
        };
      }>(`/api/messages/${id}`)
      .then((response) => ({
        conversation: <Conversation>{
          id: response.conversation.id,
          createdAt:
            response.conversation.createdAt || new Date().toISOString(),
          unreadCount: 0,
          participants: response.conversation.participants.map(
            (participant) => ({
              id: `${response.conversation.id}:${participant.id}`,
              conversationId: response.conversation.id,
              userId: participant.id,
              lastMessageAt: new Date().toISOString(),
              unreadCount: 0,
              user: participant,
            }),
          ),
        },
        messages: response.conversation.messages,
      })),

  createConversation: (_participantIds: string[]) => {
    throw new Error(
      "Backend does not support empty conversation creation. Send the first message instead.",
    );
  },

  sendMessage: (conversationId: string, content: string) =>
    api.post<{ message: Message }>(`/api/messages/${conversationId}/messages`, {
      content,
    }),

  markAsRead: (conversationId: string) =>
    api.put(`/api/messages/${conversationId}/read`),
};

export const notificationsApi = {
  getAll: (params?: { unreadOnly?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.unreadOnly) searchParams.set("unreadOnly", "true");
    const query = searchParams.toString();
    return api.get<{ notifications: Notification[] }>(
      `/api/notifications${query ? `?${query}` : ""}`,
    );
  },

  markAsRead: (id: string) => api.patch(`/api/notifications/${id}/read`),

  markAllAsRead: () => api.patch("/api/notifications/read-all"),

  delete: (id: string) => api.delete(`/api/notifications/${id}`),
};

export const settingsApi = {
  get: () => api.get<{ settings: UserSettings }>("/api/settings"),

  update: (data: Partial<UserSettings>) =>
    api.put<{ settings: UserSettings }>("/api/settings", data),

  updateLanguage: (language: string) =>
    api.patch<{ settings: UserSettings }>("/api/settings/language", {
      language,
    }),

  updateTheme: (theme: string) =>
    api.patch<{ settings: UserSettings }>("/api/settings/theme", { theme }),

  updateNotifications: (data: Partial<UserSettings>) =>
    api.patch<{ settings: UserSettings }>("/api/settings/notifications", data),
};

export const uploadsApi = {
  getPresignedUrl: (
    filename: string,
    contentType: string,
    _type: "video" | "image",
  ) =>
    api.post<{
      uploadUrl: string;
      fileUrl: string;
      key: string;
      maxSize: number;
    }>("/api/uploads/presigned-url", {
      fileName: filename,
      contentType,
    }),

  completeUpload: (key: string, fileName: string, contentType: string) =>
    api.post("/api/uploads/complete", { key, fileName, contentType }),

  deleteFile: (key: string) => api.delete(`/api/uploads/${key}`),
};

export const searchApi = {
  global: (query: string) =>
    api.get<{
      users: User[];
      videos: Video[];
      requests: FundingRequest[];
      stories: SuccessStory[];
    }>(`/api/search?q=${encodeURIComponent(query)}`),
};

export const goalsApi = {
  getAll: (status?: string) => {
    const query = status ? `?status=${status}` : "";
    return api.get<{ goals: Goal[] }>(`/api/goals${query}`);
  },

  getById: (id: string) => api.get<{ goal: Goal }>(`/api/goals/${id}`),

  create: (data: {
    title: string;
    description?: string;
    category: string;
    targetDate: string;
    priority?: string;
    milestones?: { title: string; description?: string; dueDate?: string }[];
  }) => api.post<{ goal: Goal }>("/api/goals", data),

  update: (id: string, data: Partial<Goal>) =>
    api.put<{ goal: Goal }>(`/api/goals/${id}`, data),

  delete: (id: string) => api.delete(`/api/goals/${id}`),

  addMilestone: (
    goalId: string,
    data: { title: string; description?: string; dueDate?: string },
  ) =>
    api.post<{ milestone: GoalMilestone }>(
      `/api/goals/${goalId}/milestones`,
      data,
    ),

  updateMilestone: (
    goalId: string,
    milestoneId: string,
    data: Partial<GoalMilestone>,
  ) =>
    api.put<{ milestone: GoalMilestone }>(
      `/api/goals/${goalId}/milestones/${milestoneId}`,
      data,
    ),

  deleteMilestone: (goalId: string, milestoneId: string) =>
    api.delete(`/api/goals/${goalId}/milestones/${milestoneId}`),

  getStats: () =>
    api.get<{
      stats: {
        total: number;
        inProgress: number;
        completed: number;
        overdue: number;
        averageProgress: number;
        byCategory: Record<string, number>;
      };
    }>("/api/goals/stats/summary"),
};

export const eventsApi = {
  getAll: (params?: { status?: string; category?: string; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.page) searchParams.set("page", params.page.toString());
    const query = searchParams.toString();
    return api.get<{
      events: Event[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/api/events${query ? `?${query}` : ""}`);
  },

  getById: (id: string) => api.get<{ event: Event }>(`/api/events/${id}`),

  create: (data: {
    title: string;
    description?: string;
    coverImage?: string;
    eventDate: string;
    endDate?: string;
    location?: string;
    isVirtual?: boolean;
    meetingUrl?: string;
    category: string;
    maxAttendees?: number;
  }) => api.post<{ event: Event }>("/api/events", data),

  update: (id: string, data: Partial<Event>) =>
    api.put<{ event: Event }>(`/api/events/${id}`, data),

  delete: (id: string) => api.delete(`/api/events/${id}`),

  register: (id: string) => api.post(`/api/events/${id}/register`),

  unregister: (id: string) => api.delete(`/api/events/${id}/register`),
};

export const matchingApi = {
  getRecommendations: (userId: string) =>
    api.get<{ matches: MentorMatch[] }>(
      `/api/mentors/match/recommendations?userId=${userId}`,
    ),

  findMatches: (
    userId: string,
    criteria?: {
      skills?: string[];
      interests?: string[];
      location?: string;
      minExperience?: number;
      availability?: string;
      acceptsRemote?: boolean;
    },
    limit?: number,
  ) =>
    api.post<{ matches: MentorMatch[] }>("/api/mentors/match", {
      userId,
      criteria,
      limit,
    }),
};

export interface ModerationReport {
  id: string;
  reporterId: string;
  contentType: string;
  contentId: string;
  reason: string;
  description?: string;
  status: string;
  reviewedBy?: string;
  reviewedAt?: string;
  action?: string;
  createdAt: string;
}

export const moderationApi = {
  report: (data: {
    contentType: string;
    contentId: string;
    reason: string;
    description?: string;
  }) => api.post<{ report: ModerationReport }>("/api/moderation/report", data),

  getMyReports: () =>
    api.get<{ reports: ModerationReport[] }>("/api/moderation/my-reports"),

  getPending: () =>
    api.get<{ reports: ModerationReport[] }>("/api/moderation/pending"),

  review: (
    id: string,
    action: "dismiss" | "warn" | "remove_content" | "ban_user",
  ) =>
    api.post<{ report: ModerationReport }>(`/api/moderation/${id}/review`, {
      action,
    }),

  getStats: () =>
    api.get<{
      stats: {
        pending: number;
        reviewed: number;
        dismissed: number;
        actioned: number;
      };
    }>("/api/moderation/stats"),
};

export const adminApi = {
  getDashboard: () =>
    api.get<{
      stats: {
        totalUsers: number;
        activeUsers: number;
        totalVideos: number;
        totalFundingRequests: number;
        totalDonations: number;
        totalDonationAmount: number;
        totalMentors: number;
        pendingReports: number;
      };
    }>("/api/admin/dashboard"),

  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.role) searchParams.set("role", params.role);
    const query = searchParams.toString();
    return api.get<{
      users: Array<
        User & {
          _count: {
            videos: number;
            fundingRequests: number;
            fundingDonations: number;
          };
        }
      >;
      total: number;
      page: number;
      limit: number;
    }>(`/api/admin/users${query ? `?${query}` : ""}`);
  },

  updateUser: (id: string, data: { role?: string; emailVerified?: boolean }) =>
    api.patch<{ user: User }>(`/api/admin/users/${id}`, data),

  deleteUser: (id: string) => api.delete(`/api/admin/users/${id}`),

  getVideos: (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return api.get<{
      videos: Video[];
      total: number;
      page: number;
      limit: number;
    }>(`/api/admin/videos${query ? `?${query}` : ""}`);
  },

  deleteVideo: (id: string) => api.delete(`/api/admin/videos/${id}`),

  getFundingRequests: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);
    const query = searchParams.toString();
    return api.get<{
      requests: FundingRequest[];
      total: number;
      page: number;
      limit: number;
    }>(`/api/admin/funding-requests${query ? `?${query}` : ""}`);
  },

  updateFundingRequest: (id: string, status: string) =>
    api.patch<{ request: FundingRequest }>(
      `/api/admin/funding-requests/${id}`,
      { status },
    ),

  getReports: (params?: { page?: number; limit?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);
    const query = searchParams.toString();
    return api.get<{
      reports: ModerationReport[];
      total: number;
      page: number;
      limit: number;
    }>(`/api/admin/reports${query ? `?${query}` : ""}`);
  },

  getAnalytics: () =>
    api.get<{
      analytics: {
        period: string;
        newUsers: number;
        newVideos: number;
        newDonations: number;
        donationTotal: number;
      };
    }>("/api/admin/analytics"),
};
