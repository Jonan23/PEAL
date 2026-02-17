# PEAL Backend Architecture Plan

A comprehensive guide for building the backend for the PEAL (Pride, Empowerment And Love) women's empowerment platform.

---

## 1. Technology Stack Recommendation

### Core Framework

- **Runtime**: Node.js 20+ or Bun
- **Framework**: Hono (lightweight, fast) or Express.js (mature ecosystem)
- **API Style**: RESTful API with OpenAPI/Swagger documentation

### Database

- **Primary Database**: PostgreSQL with Prisma ORM
- **Database Hosting**: Supabase, Neon, or Railway
- **Alternative**: SQLite for development

### Authentication & Security

- **Auth Provider**: Supabase Auth, Clerk, or NextAuth.js
- **Password Hashing**: bcrypt or argon2
- **JWT**: jose library for token handling
- **Rate Limiting**: @upstash/ratelimit (Redis)

### File Storage

- **Storage**: Supabase Storage, AWS S3, or Cloudinary
- **Video Processing**: Mux, Cloudinary Video, or AWS MediaConvert

### Additional Services

- **Email**: Resend or SendGrid
- **Notifications**: Firebase Cloud Messaging (FCM)
- **Analytics**: PostHog or Mixpanel
- **Error Tracking**: Sentry

---

## 2. Database Schema

### Core Entities

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL CHECK (role IN ('woman', 'sponsor', 'admin')),
    bio TEXT,
    location VARCHAR(255),
    is_public BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User Skills
CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, skill)
);

-- User Interests
CREATE TABLE user_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    interest VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, interest)
);

-- Videos Table
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    video_url TEXT NOT NULL,
    video_duration INTEGER,
    category VARCHAR(100),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    is_trending BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Video Tags
CREATE TABLE video_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(video_id, tag)
);

-- Video Likes
CREATE TABLE video_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(video_id, user_id)
);

-- Video Comments
CREATE TABLE video_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES video_comments(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Funding Requests
CREATE TABLE funding_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    cover_image_url TEXT,
    category VARCHAR(100),
    goal_amount DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) DEFAULT 0,
    supporters_count INTEGER DEFAULT 0,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'funded', 'expired', 'cancelled')),
    deadline DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Funding Donations
CREATE TABLE funding_donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funding_request_id UUID REFERENCES funding_requests(id) ON DELETE CASCADE,
    donor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    message TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Success Stories
CREATE TABLE success_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    before_image_url TEXT,
    after_image_url TEXT,
    impact_description TEXT,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    celebrations_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Success Story Celebrations
CREATE TABLE success_story_celebrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    success_story_id UUID REFERENCES success_stories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(success_story_id, user_id)
);

-- Mentor Profiles
CREATE TABLE mentor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    bio TEXT,
    availability VARCHAR(50) DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'unavailable')),
    years_experience INTEGER,
    max_mentees INTEGER DEFAULT 5,
    current_mentees_count INTEGER DEFAULT 0,
    accepts_remote BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Mentor Skills
CREATE TABLE mentor_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES mentor_profiles(id) ON DELETE CASCADE,
    skill VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(mentor_id, skill)
);

-- Mentor Connections
CREATE TABLE mentor_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES mentor_profiles(id) ON DELETE CASCADE,
    mentee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(mentor_id, mentee_id)
);

-- Messages
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Conversation Participants
CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP DEFAULT NOW(),
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Settings
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    mentor_messages_notifications BOOLEAN DEFAULT true,
    supporter_updates_notifications BOOLEAN DEFAULT true,
    weekly_digest BOOLEAN DEFAULT false,
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'system',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User Follows
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Indexes for Performance
CREATE INDEX idx_videos_author ON videos(author_id);
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_videos_trending ON videos(is_trending, created_at);
CREATE INDEX idx_funding_requests_author ON funding_requests(author_id);
CREATE INDEX idx_funding_requests_status ON funding_requests(status);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
```

---

## 3. API Endpoints Design

### Authentication

```
POST   /api/auth/register     - Register new user
POST   /api/auth/login       - Login user
POST   /api/auth/logout      - Logout user
POST   /api/auth/refresh    - Refresh access token
POST   /api/auth/forgot-password - Request password reset
POST   /api/auth/reset-password  - Reset password
GET    /api/auth/me          - Get current user
```

### Users

```
GET    /api/users                    - List users (with filters)
GET    /api/users/:id               - Get user profile
PUT    /api/users/:id               - Update user profile
DELETE /api/users/:id              - Delete user account
GET    /api/users/:id/videos        - Get user's videos
GET    /api/users/:id/requests     - Get user's funding requests
GET    /api/users/:id/skills        - Get user's skills
PUT    /api/users/:id/skills        - Update user's skills
GET    /api/users/:id/interests     - Get user's interests
PUT    /api/users/:id/interests     - Update user's interests
GET    /api/users/:id/followers    - Get user's followers
GET    /api/users/:id/following    - Get users being followed
POST   /api/users/:id/follow       - Follow a user
DELETE /api/users/:id/follow       - Unfollow a user
```

### Videos

```
GET    /api/videos                 - List videos (paginated, filtered)
GET    /api/videos/:id             - Get video details
POST   /api/videos                 - Upload video
PUT    /api/videos/:id             - Update video
DELETE /api/videos/:id             - Delete video
POST   /api/videos/:id/like        - Like video
DELETE /api/videos/:id/like        - Unlike video
GET    /api/videos/:id/comments     - Get video comments
POST   /api/videos/:id/comments    - Add comment
DELETE /api/videos/:id/comments/:commentId - Delete comment
GET    /api/videos/trending        - Get trending videos
GET    /api/videos/feed            - Get personalized feed
```

### Funding Requests

```
GET    /api/requests               - List funding requests
GET    /api/requests/:id          - Get request details
POST   /api/requests              - Create funding request
PUT    /api/requests/:id          - Update funding request
DELETE /api/requests/:id          - Delete funding request
POST   /api/requests/:id/donate   - Donate to request
GET    /api/requests/:id/donations - Get request donations
```

### Success Stories

```
GET    /api/stories                - List success stories
GET    /api/stories/:id            - Get story details
POST   /api/stories               - Create success story
PUT    /api/stories/:id            - Update story
DELETE /api/stories/:id           - Delete story
POST   /api/stories/:id/celebrate - Celebrate a story
DELETE /api/stories/:id/celebrate - Remove celebration
GET    /api/stories/featured      - Get featured story
```

### Mentors

```
GET    /api/mentors                - List mentors (with filters)
GET    /api/mentors/:id           - Get mentor profile
POST   /api/mentors               - Create mentor profile
PUT    /api/mentors/:id           - Update mentor profile
POST   /api/mentors/:id/connect   - Request mentor connection
PUT    /api/mentors/:id/connection - Accept/reject connection
DELETE /api/mentors/:id/connection - Remove connection
GET    /api/mentors/:id/mentees  - Get mentor's mentees
```

### Messages

```
GET    /api/conversations          - List conversations
GET    /api/conversations/:id     - Get conversation messages
POST   /api/conversations         - Start conversation
POST   /api/conversations/:id/messages - Send message
PUT    /api/conversations/:id/read - Mark as read
```

### Notifications

```
GET    /api/notifications         - List notifications
PUT    /api/notifications/:id/read - Mark notification as read
PUT    /api/notifications/read-all - Mark all as read
DELETE /api/notifications/:id     - Delete notification
```

### Settings

```
GET    /api/settings              - Get user settings
PUT    /api/settings             - Update user settings
PUT    /api/settings/language    - Change language
PUT    /api/settings/theme       - Change theme
PUT    /api/settings/notifications - Update notification preferences
```

---

## 4. Key Features Implementation

### 4.1 Authentication Flow

1. **Registration**
   - Validate email format
   - Hash password with bcrypt (12 rounds)
   - Create user record
   - Generate verification email
   - Return JWT tokens

2. **Login**
   - Find user by email
   - Verify password
   - Generate access token (15min) + refresh token (7 days)
   - Set HTTP-only cookies

3. **Password Reset**
   - Generate reset token (expires in 1 hour)
   - Send reset email
   - Verify token and update password

### 4.2 Video Upload Flow

1. **Upload Request**
   - Client requests upload URL
   - Server generates presigned URL (S3/Supabase)
   - Client uploads directly to storage
   - Server creates video record with processing status

2. **Processing** (if using video service)
   - Video service webhook notifies completion
   - Generate thumbnail
   - Extract duration
   - Update video record

### 4.3 Funding Flow

1. **Create Request**
   - Validate goal amount (min $100)
   - Set deadline (max 90 days)
   - Create with 'active' status

2. **Donation**
   - Validate amount
   - Process payment (Stripe integration)
   - Update current amount
   - Increment supporters count
   - Notify request author

3. **Completion**
   - Check if deadline passed or goal met
   - Update status to 'funded' if goal met
   - Send completion notifications

### 4.4 Mentor Matching

1. **Profile Creation**
   - User registers as sponsor
   - Creates mentor profile with skills

2. **Connection Request**
   - User browses mentors
   - Sends connection request
   - Mentor accepts/rejects
   - Both can message

### 4.5 Real-time Features

- **Messages**: WebSocket for instant messaging
- **Notifications**: Server-Sent Events (SSE) or WebSocket
- **Video Views**: Increment on watch

---

## 5. Security Requirements

### Authentication & Authorization

- JWT tokens with short expiry (15 min)
- Refresh token rotation
- HTTP-only secure cookies
- CSRF protection
- Rate limiting (100 req/min per IP)

### Data Protection

- Input validation with Zod
- SQL injection prevention ( parameterized queries via Prisma)
- XSS prevention (sanitize inputs)
- File upload validation (type, size limits)

### Privacy

- Public profile toggle
- Anonymous donations option
- Data export capability (GDPR)
- Account deletion with data purge

---

## 6. Suggested Project Structure

```
peal-backend/
├── src/
│   ├── config/
│   │   ├── database.ts      # Prisma client
│   │   ├── auth.ts         # Auth configuration
│   │   └── env.ts          # Environment variables
│   ├── middleware/
│   │   ├── auth.ts         # JWT verification
│   │   ├── error.ts        # Error handling
│   │   ├── rate-limit.ts   # Rate limiting
│   │   └── validate.ts     # Input validation
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── videos.ts
│   │   ├── requests.ts
│   │   ├── stories.ts
│   │   ├── mentors.ts
│   │   ├── messages.ts
│   │   ├── notifications.ts
│   │   └── settings.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── email.service.ts
│   │   ├── storage.service.ts
│   │   ├── payment.service.ts
│   │   └── notification.service.ts
│   ├── utils/
│   │   ├── token.ts
│   │   ├── password.ts
│   │   └── validators.ts
│   ├── types/
│   │   └── index.ts
│   ├── constants/
│   │   └── index.ts
│   └── index.ts            # App entry point
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── auth.test.ts
│   ├── videos.test.ts
│   └── integration.test.ts
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 7. Development Phases

### Phase 1: Foundation (Week 1-2)

- [ ] Set up Node.js project with TypeScript
- [ ] Configure PostgreSQL with Prisma
- [ ] Implement authentication (register, login, logout)
- [ ] Set up environment variables
- [ ] Create basic user CRUD

### Phase 2: Core Features (Week 3-4)

- [ ] Video upload and listing
- [ ] Funding requests (CRUD + donations)
- [ ] Success stories
- [ ] Basic search and filtering

### Phase 3: Social Features (Week 5-6)

- [ ] Mentor profiles and connections
- [ ] Messaging system
- [ ] Notifications
- [ ] User profiles and following

### Phase 4: Polish (Week 7-8)

- [ ] Real-time features (WebSocket)
- [ ] File storage integration
- [ ] Email notifications
- [ ] API documentation

### Phase 5: Production Ready (Week 9)

- [ ] Error handling and logging
- [ ] Rate limiting
- [ ] API rate limiting
- [ ] CI/CD pipeline
- [ ] Deployment configuration

---

## 8. Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/peal"

# Auth
JWT_SECRET="your-super-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
ACCESS_TOKEN_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"

# Storage
STORAGE_BUCKET="peal-assets"
STORAGE_REGION="us-east-1"
STORAGE_ACCESS_KEY=""
STORAGE_SECRET_KEY=""

# Email (Resend/SendGrid)
EMAIL_API_KEY=""
EMAIL_FROM="noreply@peal.app"

# External Services
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
MUX_API_KEY=""
MUX_API_SECRET=""
FIREBASE_PROJECT_ID=""
FIREBASE_PRIVATE_KEY=""
FIREBASE_CLIENT_EMAIL=""

# App
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

---

## 9. Testing Strategy

### Unit Tests

- Authentication logic
- Password hashing
- Token generation
- Input validation

### Integration Tests

- API endpoints
- Database operations
- Authentication flow

### E2E Tests

- User registration flow
- Video upload flow
- Donation flow

### Test Coverage Target

- Minimum 70% code coverage
- All critical paths tested

---

## 10. API Documentation

Use OpenAPI/Swagger for API documentation.

**Documentation Endpoints:**

- `/docs` - Swagger UI
- `/openapi.json` - OpenAPI spec

**Example Endpoint Documentation:**

```yaml
/users:
  get:
    summary: List users
    description: Returns a paginated list of users
    parameters:
      - name: page
        in: query
        schema:
          type: integer
          default: 1
      - name: limit
        in: query
        schema:
          type: integer
          default: 20
    responses:
      200:
        description: Successful response
        content:
          application/json:
            schema:
              type: object
              properties:
                data:
                  type: array
                  items:
                    $ref: "#/components/schemas/User"
                pagination:
                  $ref: "#/components/schemas/Pagination"
```

---

## 11. Deployment

### Production Checklist

- [ ] Database backup strategy
- [ ] SSL certificates
- [ ] CDN configuration for assets
- [ ] Monitoring and alerts
- [ ] Log aggregation
- [ ] Health check endpoint at `/health`

### Suggested Hosting

- **Backend**: Railway, Render, or AWS ECS
- **Database**: Neon (serverless PostgreSQL)
- **Storage**: Supabase Storage or AWS S3
- **CDN**: CloudFront or similar

### Health Check Endpoint

```typescript
app.get("/health", async (c) => {
  const dbOk = await checkDatabase();
  const storageOk = await checkStorage();

  return c.json({
    status: dbOk && storageOk ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    services: {
      database: dbOk ? "up" : "down",
      storage: storageOk ? "up" : "down",
    },
  });
});
```

---

## 12. Future Considerations

### Scalability

- Implement caching with Redis
- Database read replicas for heavy queries
- CDN for video streaming

### AI Features (Phase 2)

- Video recommendations
- Mentor matching algorithm
- Content moderation

### Mobile App

- React Native or Flutter
- Push notifications
- Offline support

### Monetization

- Premium subscriptions
- Transaction fees on donations
- Sponsored content

---

_Document Version: 1.0_
_Last Updated: February 2026_
