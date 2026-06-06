# PakTechJobs

**A comprehensive job board and talent marketplace for Pakistan's tech ecosystem.**

Live: **[paktechjobs.com](https://pak-tech-jobs.vercel.app)**

## Problem & Purpose

PakTechJobs solves the fragmentation in Pakistan's tech recruitment landscape. Developers struggle to find legitimate job opportunities, and recruiters waste time on unqualified applicants. This platform creates a single, trust-first destination where:

- **Developers** browse curated listings, track applications, verify skills, and discover salary benchmarks across Pakistan
- **Recruiters** post positions, manage pipelines, communicate with candidates, and access verified talent
- **Admins** moderate listings, verify users, and maintain platform integrity

## Who It's For

- **Pakistani software engineers and developers** (junior to senior, remote and on-site)
- **Tech recruiters and HR teams** at Pakistani companies and global remote employers
- **Job seekers and career changers** in technology roles
- **Educational platforms** and employers looking for fresh graduates

## Tech Stack

### Frontend & Core
- **Next.js 16.1.6** — Full-stack React framework with App Router
- **React 19.2.3** — UI library (client components)
- **Preact 10.25.4** — Lightweight production alternative for performance-critical paths
- **TypeScript 5** — Type-safe application layer

### Styling & Animation
- **Tailwind CSS 4** — Utility-first CSS framework
- **GSAP 3.14.2** — High-performance animation library
- **@gsap/react 2.1.2** — GSAP React integration

### Data & State
- **Prisma 5.22.0** — Type-safe ORM for PostgreSQL
- **PostgreSQL** — Primary relational database
- **Redis** (via ioredis 5.10.1) — Session store and Socket.io adapter

### Real-Time Communication
- **Socket.io 4.8.3** — WebSocket library for real-time messaging and notifications
- **@socket.io/redis-adapter 8.3.0** — Multi-instance Socket.io scaling

### Authentication & Security
- **next-auth 5.0.0-beta.30** — JWT-based authentication
- **bcryptjs 3.0.3** — Password hashing

### Integrations
- **Google Generative AI** (@google/generative-ai 0.24.1, @google/genai 1.41.0) — AI-powered features
- **Cloudinary** — Image and CV file management
- **Resend 6.10.0** — Transactional email service

### Charting & Analytics
- **Recharts 3.8.1** — React-based charting library for salary dashboards

### Testing & Quality
- **Vitest 4.1.2** — Fast unit test framework
- **fast-check 4.6.0** — Property-based testing
- **@vitest/coverage-v8 4.1.2** — Code coverage
- **ESLint 9** — Code linting
- **tsx 4.21.0** — TypeScript execution runtime

### Utilities
- **nanoid 5.1.7** — Unique ID generation
- **dotenv 17.4.0** — Environment variable management

### Deployment
- **Vercel** — Primary hosting (Next.js optimized)
- **Fly.io** — Alternative container deployment option
- **Docker** — Containerization

## Key Features

### For Job Seekers
- **Browse & Filter Jobs** — Search by role, city, tech stack, experience level, job type (remote, on-site, contract, internship)
- **Application Tracking** — Track status through pipeline stages (Applied → Shortlisted → Interview → Offer)
- **Saved Jobs** — Bookmark listings for later
- **Job Alerts** — Get notified of new listings matching your criteria
- **Salary Insights** — View salary benchmarks by role, experience, and city
- **Skill Verification** — Verify skills via quiz, portfolio, or endorsements
- **Public Profile** — Build a searchable developer profile with portfolio link
- **Interview Scheduling** — Coordinate times with recruiters via suggested slots
- **Messaging** — Direct communication with recruiters
- **Referrals** — Track and reward referral conversions

### For Recruiters
- **Post & Manage Jobs** — Create listings with custom application fields, expiry, and featured options
- **Candidate Pipeline** — Track applications through custom stages with notes
- **Bulk Messaging** — Reach candidates at scale
- **Headhunt Outreach** — Direct outreach to developers with interest tracking
- **Recruiter Dashboard** — View analytics, response rates, SLA tracking
- **Team Seats** — Add team members (Pro/Enterprise tiers)
- **CV Access** — Download and review applications (Enterprise tier)
- **Verification Badge** — Build trust with verified recruiter status

### Platform
- **Role-Based Access** — Admin, Recruiter, Applicant roles with middleware-enforced authorization
- **Real-Time Notifications** — Socket.io-powered alerts for applications, messages, offers
- **SEO-Optimized Pages** — Category pages (Frontend Jobs, React Jobs, MERN Jobs, etc.) + blog resources
- **Salary Data Aggregation** — Demand snapshots and classification (High/Medium/Low demand)
- **Content Hub** — Auto-generated career guides (7 articles covering trends, interview prep, salary guides)
- **Responsive Design** — Mobile-first UI with Tailwind CSS

## Architecture Decisions

### Database Schema (Prisma)
The model design reflects a multi-role marketplace:

| Model | Purpose |
|-------|---------|
| `User` | Unified profile for Applicants, Recruiters, and Admins |
| `JobPost` | Listings with metadata, salary range, required fields, featured/premium status |
| `Application` | Tracks pipeline stage, rejection reason, CV, cover letter, SLA timings |
| `MessageThread` & `Message` | Enables direct recruiter↔applicant messaging |
| `Notification` | Real-time alerts (job alerts, interview reminders, status changes) |
| `InterviewSlot` | Proposed/confirmed interview times with meeting links |
| `Referral` | Tracks referral codes, clicks, conversions |
| `SkillVerification` | Verified skills by method (quiz/portfolio/endorsement) with expiry |
| `Review` | Peer reviews (recruiter ↔ applicant) post-application |
| `SalaryEntry` | Verified salary data for benchmarking and demand analysis |
| `DemandSnapshot` | Time-series skill demand classification |
| `SavedJob` & `JobAlert` | User job preferences |
| `HeadhuntOutreach` | Tracking headhunt outreach and responses |

### Real-Time Architecture
- **Socket.io + Redis Adapter** — Enables multi-instance deployments with pub/sub
- **JWT Authentication** — Socket handshake validates tokens from NextAuth
- **Room-Scoped Events** — User-specific notifications routed to `user:{userId}` rooms
- **Unread Queue** — Notifications persisted in Postgres, delivered on reconnect

### Authentication (NextAuth + JWT)
- **Session-Based** — JWT tokens stored in browser cookies
- **Multi-Provider Ready** — Configured for email/password and extensible for OAuth
- **Role-Based Middleware** — `middleware.ts` enforces route-level access control
- **No Cross-Origin Issues** — Built-in CORS handling via middleware

### Hosting Strategy
- **Vercel (Primary)** — Optimized for Next.js; handles edge functions, ISR, serverless APIs
- **Fly.io (Alternative)** — Docker-based deployments for advanced caching and custom routing
- **Environment Flexibility** — Docker Compose for local development with PostgreSQL + Redis

### Job Category Pages
- **Dynamic Generation** — Articles and category pages pre-generated via `generate-articles.js` and `generate-category-pages.js`
- **SEO-First** — Includes metadata, structured data, og tags
- **Link Aggregation** — Category pages aggregate jobs by skill/city and link to main job board

## Setup & Installation

### Prerequisites
- **Node.js** 18+ (LTS recommended)
- **npm** or **pnpm**
- **PostgreSQL** 14+ (local or cloud)
- **Redis** (for local dev and Socket.io adapter)
- **Docker & Docker Compose** (optional, for containerized setup)

### Local Development

#### 1. Clone & Install
```bash
git clone https://github.com/theabdullahnadeem/pak-tech-jobs.git
cd pak-tech-jobs
npm install
```

#### 2. Environment Configuration
Create a `.env.local` file in the root (see **Environment Variables** section):

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/paktechjobs
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=<generate-a-secure-random-secret>
NEXTAUTH_URL=http://localhost:3000
# ... (see full list below)
```

#### 3. Database Setup
```bash
npx prisma migrate dev --name init
npx prisma generate
```

#### 4. Run Development Server
```bash
npm run dev:server  # Starts custom HTTP server with Socket.io
# or
npm run dev         # Standard Next.js dev server (no Socket.io)
```

Open **http://localhost:3000** in your browser.

### Docker Setup
```bash
docker-compose up
```

The Compose file includes PostgreSQL and Redis services. The app runs at `http://localhost:3000`.

### Production Build
```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file with the following variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✓ | PostgreSQL connection string: `postgresql://user:password@host:5432/dbname` |
| `REDIS_URL` | ✓ | Redis connection: `redis://host:6379` or `rediss://...` for TLS |
| `NEXTAUTH_SECRET` | ✓ | JWT signing secret (generate: `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | ✓ | Public app URL (dev: `http://localhost:3000`, prod: `https://paktechjobs.com`) |
| `NODE_ENV` | ✓ | `development` or `production` |
| `PORT` | | Server port (default: `3000`) |
| `HOSTNAME` | | Server hostname (default: `localhost`) |
| **Email (Resend)** | | |
| `RESEND_API_KEY` | ✓ | API key from [resend.com](https://resend.com) |
| `SENDER_EMAIL` | ✓ | From address (e.g., `noreply@paktechjobs.com`) |
| **Google AI** | | |
| `GOOGLE_GENAI_API_KEY` | | Google Generative AI API key for article/content generation |
| **Cloudinary** | | |
| `CLOUDINARY_CLOUD_NAME` | ✓ | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | ✓ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✓ | Cloudinary API secret |
| **Analytics (Optional)** | | |
| `GOOGLE_ANALYTICS_ID` | | Google Analytics 4 measurement ID |
| `SENTRY_DSN` | | Sentry error tracking (optional) |

### Generate Secrets
```bash
# NextAuth secret
openssl rand -base64 32

# Or using Node:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Scripts

```bash
npm run dev           # Next.js dev server (no Socket.io)
npm run dev:server   # Custom server with Socket.io
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npm run test         # Run Vitest suite
npm run postinstall  # Generate Prisma client (runs automatically)
```

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

Set environment variables in Vercel dashboard or via CLI:
```bash
vercel env add DATABASE_URL
vercel env add REDIS_URL
# ... etc
```

### Fly.io
```bash
flyctl deploy
```

Uses `fly.toml` configuration. Ensure Redis and PostgreSQL are provisioned.

### Docker
```bash
docker build -t paktechjobs .
docker run -p 3000:3000 --env-file .env.production paktechjobs
```

## Key Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   ├── dashboard/                # Applicant dashboard
│   ├── recruiter/                # Recruiter portal
│   ├── admin/                    # Admin panel
│   ├── jobs/                     # Job listing pages
│   ├── [category]-jobs/          # Dynamic category pages (React, Backend, etc.)
│   ├── resources/                # Career guides and articles
│   ├── profile/                  # Public developer profiles
│   └── layout.tsx                # Root layout with providers
├── components/                   # Reusable React components
├── lib/                          # Utilities and integrations
│   ├── auth.ts / auth.config.ts  # NextAuth setup
│   ├── prisma.ts                 # Prisma client singleton
│   ├── redis.ts                  # Redis client
│   ├── email.ts                  # Resend integration
│   ├── cloudinary.ts             # Image upload
│   ├── socketio.ts               # Socket.io instance
│   ├── rateLimit.ts              # Rate limiting logic
│   └── [feature].ts              # Domain utilities
├── jobs/                         # Static job data (seed)
└── data/                         # Constants and configuration

prisma/
├── schema.prisma                 # Database schema
└── migrations/                   # Migration history

server.ts                         # Custom HTTP server with Socket.io
middleware.ts                     # NextAuth + role-based access
generate-articles.js             # Pre-generate blog posts
generate-category-pages.js       # Pre-generate category listings
docker-compose.yml               # Local dev environment
Dockerfile                       # Production container
```

## Notable Implementation Details

### Recruiter Verification & Tiering
- Email verification required for recruiter accounts
- Tiered model: FREE (1 seat), PRO, ENTERPRISE (custom seats + CV access)
- Response rate tracking and SLA warnings (7-day and 13-day alerts)

### Application Pipeline
- Custom rejection reasons (portfolio gap, salary mismatch, role filled, etc.)
- Withdrawal tracking to prevent double-counting
- Real-time stage updates via Socket.io

### Salary Benchmarking
- Community-submitted salary entries with verification status
- Time-series snapshots for demand analysis (High/Medium/Low classification)
- Aggregation by role, experience level, city, tech stack

### Real-Time Features
- **Notifications** — Application status, interview reminders, new messages (persisted in DB)
- **Messaging** — Direct communication with optional headhunt context
- **Presence** — Upcoming feature for recruiter availability indicators

### Performance Optimizations
- Preact fallback for bundle size in production
- Server-side caching (TTL-based with Redis)
- ISR for category and resource pages
- Database indexing on frequently-queried fields

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

[Specify if open source or proprietary]

## Contact & Support

**Issues & Feedback:** [GitHub Issues](https://github.com/theabdullahnadeem/pak-tech-jobs/issues)

**Live Site:** [paktechjobs.com](https://pak-tech-jobs.vercel.app)

---

**Built for Pakistan's tech community. Made to scale globally.**
