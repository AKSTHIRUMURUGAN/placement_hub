# PlacementHub

**Smart Campus Placement Ecosystem**

A centralized, intelligent campus placement platform that replaces fragmented WhatsApp groups, bulk emails, and scattered Excel sheets with a single, smart ecosystem.

---

## 🎯 Problem Statement

Every college placement department faces recurring problems:

- **Notification Overload**: Updates sent via WhatsApp/email only - students miss messages in floods
- **No Eligibility Filtering**: Everything sent to everyone - students waste time on irrelevant opportunities
- **Department Chaos**: No separation - ECE students see CSE-only drives
- **CGPA Blindness**: Students with 6.0 CGPA see 9.0-required listings
- **Excel Hell**: Multiple sheets per company - confusion, duplication, version conflicts
- **Mixed Drives**: Internships mixed with full-time - students miss windows
- **Repetitive Forms**: Same details filled in 10+ Google Forms
- **Status Blackout**: No visibility on application status
- **Document Chaos**: No centralized resume/certificate store
- **Scattered Instructions**: Key steps missed across messages
- **Inconsistent Data**: Companies get messy data formats
- **No Analytics**: Placement cells have zero visibility on trends

---

## 💡 Solution Overview

PlacementHub replaces all fragmented tools with one platform built on three core pillars:

### 1. **Smart Eligibility Engine**
Automatic filtering based on CGPA, department, skills, and backlog status

### 2. **Student Profile Vault**
A persistent digital career locker: resume, certificates, internships, projects

### 3. **One-Click Apply Engine**
Progressive profile system that eliminates repetitive form filling

---

## 👥 User Personas

### 🎓 Student (Arjun Kumar)
- **Role**: Final year CSE student, CGPA 8.4
- **Pain Points**: Misses drives, re-enters data repeatedly, unsure of eligibility
- **Goals**: Apply quickly, track status, manage documents centrally
- **Success**: Applied to 10+ drives with zero repeated form filling

### 👩‍💼 Placement Officer (Ms. Priya Suresh)
- **Role**: Placement Coordinator
- **Pain Points**: Manual Excel filtering, bulk messages, chasing documents
- **Goals**: Post drives quickly, auto-filter students, export shortlists
- **Success**: Zero manual filtering, all drives tracked, real-time placement rate

### 🏢 Company Recruiter (Mr. Kiran, Zoho HR)
- **Role**: Campus Recruitment Lead
- **Pain Points**: Inconsistent Excel data, can't filter easily, unclear timeline
- **Goals**: Get pre-filtered structured list, one-format download
- **Success**: Receives 50 eligible candidates in structured download

---

## ✨ Core Features

### 🎓 Student Module

#### Personalized Dashboard
- Smart feed showing only eligible companies (filtered by CGPA, dept, skills, backlogs)
- Metric cards: eligible drives, applied, shortlisted, internships open
- 'New Today' badge on drives posted in last 24 hours
- Deadline countdown timer (turns red within 48 hours)
- Status badges: Applied/Shortlisted/Rejected
- Tabs: Eligible for Me | All Drives | Internships | Applied | Archived

#### Company Drive Card
- Company name, logo, role, employment type (full-time/internship/PPO)
- CTC/stipend, location, work mode (remote/onsite/hybrid)
- Eligibility pill: green if eligible, red with reason if not
- Round breakdown: Aptitude → Technical → HR (with dates)
- One-click apply button (disabled if ineligible)
- Collapsible instructions panel
- Download JD button
- Bookmark for later

#### One-Click Apply Engine
- System checks vault against company's required fields
- Auto-fills all available fields from vault
- Only prompts for genuinely missing fields
- Missing field prompt: focused modal, one field at a time
- Progressive profile building - vault gets richer with each application
- Confirmation screen shows submitted data
- Withdrawal option within 2 hours

#### Student Vault (Career Locker)
- **Resume Store**: Multiple versions (CSE Resume, Core Resume), tagged by type
- **Certificate Vault**: PDFs/images, tagged by category (technical, soft skills, NPTEL)
- **Internship Log**: company, role, duration, stipend, certificate, description
- **Project Portfolio**: title, tech stack, GitHub link, demo link, description
- **Skills List**: proficiency levels (beginner/intermediate/advanced)
- **Dynamic Extra Fields**: GitHub, LinkedIn, portfolio, LeetCode, Codeforces
- **Vault Completeness Score**: 0-100% with suggestions

#### Application Tracker
- Full history: Applied → Under Review → Shortlisted → Selected/Rejected
- Timeline view per company with round status and dates
- Notifications on status changes (in-app + email)
- 'Waiting' indicator if no update in 7+ days

#### Notifications & Alerts
- In-app notification center with unread badge
- Email: new eligible drive, status change, deadline reminder (48h before)
- WhatsApp via Twilio/Meta API for high-priority events
- Configurable preferences per channel per event type
- Digest mode: daily summary email

#### Internship Section (Dedicated)
- Separate tab from full-time drives
- Filters: Paid/Unpaid, Remote/Onsite/Hybrid, Duration, Stipend range
- Future: Off-campus listings (LinkedIn/Internshala API)
- Certificate upload to vault after completion

---

### 🏫 Placement Admin Module

#### Drive Management
- Create drive form: company, logo, role, JD upload, employment type
- Eligibility rule builder: min CGPA slider, department multi-select, skills, max backlogs
- Required extra fields selector: GitHub, portfolio, etc.
- Optional additional questions: short text, dropdown, file upload
- Round configuration: name, date, venue/link, instructions
- Schedule: open date, close date, result date
- Draft mode and duplicate drive feature

#### Student Applicant Dashboard
- Per-drive view: all applicants with vault data in structured table
- Columns: name, roll no., dept, CGPA, skills, resume link, applied at, status
- Bulk actions: shortlist selected, reject selected, move to next round
- Filters: by dept, CGPA range, round status
- Search by name or roll number
- Export to Excel/CSV: structured, clean, no manual formatting
- Email/WhatsApp shortlisted students with one click

#### Analytics & Reporting
- Dashboard: registered students, drives posted, applications, placed students
- Department-wise placement rate chart
- Company visit calendar
- Top skills in demand
- Unplaced students list (filter by dept, CGPA)
- Offer letter tracker: mark as placed with CTC, company, role
- Year-over-year comparison

#### Student Management
- Bulk registration via Excel upload
- CGPA update: bulk upload after each semester
- Student profile review
- Profile approval: flag incomplete profiles
- Blacklist/hold: mark ineligible with reason

---

### 🏢 Company Portal (Phase 2)

#### Company Registration & Login
- HR creates account, verified by placement admin
- Company profile: logo, about, campus history

#### Drive Creation Request
- HR submits drive details
- Placement admin reviews and approves
- HR receives notification with live drive link

#### Candidate Pool Access
- Pre-filtered eligible candidate list only
- Structured Excel download with all required fields
- Direct resume download per candidate
- Round result submission via portal

---

## 🧠 Smart Eligibility Engine

The eligibility engine runs on every student-facing feed query.

### Eligibility Parameters

| Parameter | Logic |
|-----------|-------|
| Minimum CGPA | `drive.minCgpa <= student.cgpa` |
| Department | `drive.departments[]` includes `student.department` |
| Skills Required | `student.skills[]` contains at least N of `drive.requiredSkills[]` |
| Maximum Backlogs | `student.activeBacklogs <= drive.maxBacklogs` (default: 0) |
| Batch/Year | `drive.batch` matches `student.graduationYear` |
| Degree Type | `drive.degree` matches `student.degree` |

### Display Logic
- **Eligible drives**: Shown normally with green pill, Apply button active
- **Ineligible (close)**: Shown dimmed with specific reason (e.g., 'CGPA 8.5 required, you have 8.1')
- **Ineligible (far)**: Hidden by default, visible under 'All Drives' tab
- **Admin override**: Mark specific students eligible manually

### Future: AI Suggestions
- "Add Python to unlock 5 more drives"
- "Students similar to you got placed here"
- "Based on past years, Infosys usually visits in October"

---

## 🔄 Progressive Profile & One-Click Apply

### How It Works

1. Student clicks Apply on a drive
2. System fetches `drive.requiredFields[]` (e.g., [resume, cgpa, github, portfolio])
3. System checks `student.vault` for each required field
4. Fields in vault → auto-included (no student action)
5. Missing fields → focused prompt, one field at a time
6. Student fills missing field → saved permanently to vault
7. Application submitted with complete data
8. Next application → already available, truly one click

### Vault Field Types

| Field | Type | Reuse |
|-------|------|-------|
| Resume (latest) | File (PDF) | Every application |
| CGPA | Number (auto) | Every application |
| Department | Text (auto) | Every application |
| Skills | Array | Skill-match drives |
| GitHub URL | Text | Tech companies |
| LinkedIn URL | Text | All companies |
| Portfolio URL | Text | Design/product roles |
| LeetCode profile | Text | Coding-heavy drives |
| 10th marks | Number | Some companies |
| 12th marks | Number | Some companies |
| Internship details | Structured array | Experience-required drives |
| Project links | Array of objects | Tech drives |

### Additional Questions (Drive-Specific)
Not saved to vault, application-specific only:
- "Why do you want to join Zoho?" - text, 500 chars max
- "Preferred work location?" - dropdown
- "Available from date?" - date picker

---

## 🗄️ Data Architecture

### MongoDB Collections

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `students` | Core student identity | name, email, dept, cgpa, regNo, graduationYear |
| `vault` | Career locker per student | resumeUrls[], certificates[], projects[], skills[], extraFields{} |
| `drives` | Job/internship listings | companyName, type, eligibility{}, requiredFields[], deadline |
| `applications` | Application records | studentId, driveId, status, submittedData{}, appliedAt |
| `companies` | Company profiles | name, logo, hrEmail, pastDrives[], verifiedBy |
| `rounds` | Drive rounds | driveId, roundName, date, venue, resultDate |
| `notifications` | Notification log | userId, type, message, read, createdAt |
| `offers` | Placement records | studentId, driveId, ctc, role, offerDate, accepted |

### Index Strategy
- `students`: index on `(department, cgpa)` - for eligibility queries
- `drives`: index on `(deadline, type)` - for active drive feed
- `applications`: compound index on `(studentId, driveId)` - unique constraint
- `vault`: index on `studentId` - fast lookup per student

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui |
| **Backend** | Next.js API Routes (App Router) - Server-Side Execution |
| **Database** | MongoDB (Atlas) with Mongoose ODM |
| **Authentication** | Clerk (student + admin + company roles) or NextAuth.js |
| **File Storage** | Cloudflare R2 (files) + Cloudinary (images/logos) |
| **Email** | Nodemailer + SendGrid / Resend |
| **WhatsApp** | Meta Cloud API or Twilio WhatsApp API |
| **Hosting** | Vercel (serverless, auto-deploy from GitHub) |
| **Analytics** | Mixpanel or Posthog (event tracking) |
| **Background Jobs** | Vercel Cron Jobs (deadline reminders, digest emails) |
| **Search** | MongoDB Atlas Search (full-text on company/role names) |

### Why This Stack?

- **Next.js App Router**: Server-side execution for API routes, no separate backend needed
- **MongoDB**: Flexible schema for vault data, excellent for document storage
- **Cloudflare R2**: Cost-effective file storage (resumes, certificates, JDs)
- **Cloudinary**: Image optimization for logos, profile pictures
- **Vercel**: Zero-config deployment, edge functions, automatic scaling
- **No Redis**: Using Vercel Cron Jobs instead for scheduled tasks

---

## 📁 Project Structure

```
placementhub/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (student)/
│   │   ├── dashboard/
│   │   ├── drives/
│   │   ├── internships/
│   │   ├── applications/
│   │   ├── vault/
│   │   └── profile/
│   ├── (admin)/
│   │   ├── dashboard/
│   │   ├── drives/
│   │   │   ├── create/
│   │   │   └── [id]/
│   │   ├── students/
│   │   ├── analytics/
│   │   └── settings/
│   ├── (company)/
│   │   ├── dashboard/
│   │   ├── drives/
│   │   └── candidates/
│   ├── api/
│   │   ├── auth/
│   │   ├── students/
│   │   ├── drives/
│   │   ├── applications/
│   │   ├── vault/
│   │   ├── notifications/
│   │   ├── analytics/
│   │   └── webhooks/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (shadcn components)
│   ├── student/
│   ├── admin/
│   ├── company/
│   └── shared/
├── lib/
│   ├── db/
│   │   ├── mongodb.ts
│   │   └── models/
│   │       ├── Student.ts
│   │       ├── Vault.ts
│   │       ├── Drive.ts
│   │       ├── Application.ts
│   │       ├── Company.ts
│   │       └── Notification.ts
│   ├── eligibility/
│   │   └── engine.ts
│   ├── storage/
│   │   ├── cloudflare.ts
│   │   └── cloudinary.ts
│   ├── notifications/
│   │   ├── email.ts
│   │   └── whatsapp.ts
│   └── utils/
├── types/
├── public/
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 MVP Build Roadmap - 14 Days

| Days | Deliverable | Key Tasks |
|------|-------------|-----------|
| **Days 1-2** | Project setup & auth | Next.js + Tailwind scaffold, Clerk auth, student + admin roles, MongoDB connection |
| **Days 3-4** | Student profile + vault | Profile form (CGPA, dept, year), vault: resume upload (Cloudinary), skills input |
| **Days 5-6** | Admin: post drive | Drive creation form with eligibility rule builder, CGPA/dept/skills config, deadline |
| **Days 7-8** | Student feed | Eligibility query engine, personalized drive feed, drive card UI, tabs |
| **Days 9-10** | One-click apply | Vault-vs-requirements check, missing field prompt, application submission, status badge |
| **Days 11-12** | Admin applicant dashboard | Per-drive applicant table, bulk shortlist, CSV export |
| **Days 13-14** | Notifications + polish | Email (deadline, status change), internship tab, mobile responsiveness, bug fixes |

### Phase 2 (Days 15-45)
- Company portal (HR login, drive request, candidate download)
- Analytics dashboard for placement cell
- WhatsApp notifications via Meta Cloud API
- Resume parsing (extract CGPA and skills automatically)
- Calendar view for upcoming drives
- Offer letter tracker and placement finalization flow

### Phase 3 (Days 46-90) - Scale
- Multi-college support (SaaS: one instance per college, custom domain)
- AI job recommendation engine
- Off-campus drive aggregation (LinkedIn/Naukri API scraping)
- Interview preparation resources per company
- Alumni placement network

---

## 🔐 Security & Access Control

### Role-Based Access

| Role | Permissions |
|------|-------------|
| **Student** | View own profile/vault/applications; view eligible drives; apply; view own status only |
| **Placement Admin** | Post/edit/delete drives; view allb applicants; update status; access analytics; manage students |
| **Company HR** | View eligible applicants for own drives only; download data; submit round results |
| **Super Admin** | All permissions; manage placement admins; college-level config |

### Data Privacy
- Students cannot see other students' data
- Companies see only students who applied
- CGPA and personal data encrypted at rest (MongoDB Atlas encryption)
- Vault files stored in private buckets - signed URLs only
- Audit log: every admin action timestamped and logged

---

## 📊 Success Metrics

### Student KPIs
- Average time to apply per drive: **< 30 seconds** after first application
- Vault completeness rate: **> 80%** of registered students
- Drive open rate: **> 70%** of eligible drives viewed
- Application conversion: **> 40%** eligible drive seen → applied

### Placement Cell KPIs
- Time to post a drive: **< 5 minutes** (vs 30+ minutes manually)
- Manual filtering effort: **zero** - fully automated
- Export accuracy: **100%** structured, clean exports
- Coordinator satisfaction: **> 4.5/5** on quarterly survey

### Company KPIs
- Candidate list quality: **< 5%** ineligible candidates
- Time from posting to shortlist download: **< 48 hours**
- Data format satisfaction: **> 90%** use without reformatting

---

## 🎯 Competitive Advantage

| Platform | What it does | PlacementHub Advantage |
|----------|--------------|------------------------|
| Superset | Multi-college placement platform | Deeper personalization, vault, one-click apply |
| Internshala | Internship listings, not campus-specific | Tied to your college drives, eligibility-aware |
| Google Forms + Excel | Current manual process | Replaces entirely with automated flow |
| LinkedIn Campus | Job postings, not placement workflows | Built for placement officer workflows |
| CampX / Talentica | Enterprise ATS for companies | Built for students and placement cells |

---

## 🔥 Advanced & Differentiating Features

### AI-Powered Recommendations
- 'Best match for you' score (0-100%) based on skills, dept, CGPA
- 'Students like you got placed here' - collaborative filtering
- Smart nudge: 'Add React to unlock 8 more drives'
- Deadline predictor: 'Based on past years, Infosys usually visits in October'

### Resume Builder (Future)
- Auto-generate resume from vault data
- ATS-optimized format per company
- Version management: role-specific variants

### Interview Preparation Module
- Per-company prep pack: past questions, round breakdown, alumni tips
- Mock aptitude test with timer
- 'Interview in 3 days' alert triggers prep pack

### Alumni Connect
- Graduated students stay as alumni
- Message alumni at specific companies for advice
- Alumni can refer current students

### Analytics for Students
- Personal placement journey chart
- Skill gap analysis
- Proactive gap alerts

### Notification Intelligence
- Do-not-disturb hours: no push between 11pm-7am
- Priority override: 'Urgent - drive closes in 6 hours' bypasses DND
- Smart deduplication: suppress reminders if already applied

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- Cloudflare R2 account (for file storage)
- Cloudinary account (for image storage)
- Clerk account (for authentication)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/placementhub.git
cd placementhub

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Environment Variables

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# File Storage (Cloudflare R2)
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_BUCKET_NAME=your_bucket_name

# Image Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@placementhub.com

# WhatsApp (Meta Cloud API) - Optional
META_WHATSAPP_TOKEN=your_meta_token
META_PHONE_NUMBER_ID=your_phone_number_id

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📝 API Routes Structure

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students` - Get all students (admin only)
- `GET /api/students/:id` - Get student profile
- `PUT /api/students/:id` - Update student profile
- `POST /api/students/bulk-upload` - Bulk upload students (admin)

### Vault
- `GET /api/vault` - Get student vault
- `POST /api/vault/resume` - Upload resume
- `POST /api/vault/certificate` - Upload certificate
- `POST /api/vault/project` - Add project
- `POST /api/vault/internship` - Add internship
- `PUT /api/vault/skills` - Update skills

### Drives
- `GET /api/drives` - Get all drives (filtered by eligibility for students)
- `GET /api/drives/:id` - Get drive details
- `POST /api/drives` - Create drive (admin only)
- `PUT /api/drives/:id` - Update drive (admin only)
- `DELETE /api/drives/:id` - Delete drive (admin only)

### Applications
- `GET /api/applications` - Get user applications
- `POST /api/applications` - Submit application
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id/withdraw` - Withdraw application
- `GET /api/drives/:driveId/applications` - Get all applications for drive (admin)
- `PUT /api/applications/:id/status` - Update application status (admin)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Analytics
- `GET /api/analytics/dashboard` - Get placement dashboard stats (admin)
- `GET /api/analytics/department` - Get department-wise stats (admin)
- `GET /api/analytics/trends` - Get placement trends (admin)

---

## 🎨 UI Components (shadcn/ui)

Key components to install:

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add table
npx shadcn-ui@latest add form
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
```

---

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly UI elements
- Optimized for both desktop and mobile workflows

---

## 🧪 Testing Strategy

- Unit tests: Jest + React Testing Library
- Integration tests: API route testing
- E2E tests: Playwright (critical user flows)
- Manual testing: Student application flow, admin drive creation

---

## 📈 Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Environment Setup
1. Add all environment variables in Vercel dashboard
2. Configure MongoDB Atlas IP whitelist (allow all for Vercel)
3. Set up custom domain (optional)
4. Configure Vercel Cron Jobs for scheduled tasks

---

## 🤝 Contributing

This is a college project. Contributions welcome for:
- Bug fixes
- Feature enhancements
- Documentation improvements
- UI/UX refinements

---

## 📄 License

MIT License - feel free to use for your college or startup

---

## 💰 Business Model (Future)

### SaaS Pricing
- **Small College** (500-1000 students): ₹30,000/year
- **Medium College** (1000-3000 students): ₹75,000/year
- **Large College** (3000+ students): ₹2,00,000/year

### Target
- 100 colleges in Year 1 = ₹3 Cr ARR
- 5,000+ engineering colleges in India = massive market

---

## 📞 Contact

For queries, suggestions, or collaboration:
- Email: [your-email]
- GitHub: [your-github]
- LinkedIn: [your-linkedin]

---

## 🎯 One-Page Pitch

**The Problem**: Every college runs placements through WhatsApp, emails, and Excel sheets. Students miss opportunities. Placement cells spend 60% time on manual filtering. Companies receive inconsistent data.

**The Solution**: PlacementHub - one platform for students, placement officers, and companies. Students see only eligible opportunities. Apply in one click. Placement cell posts once - system handles filtering, notifications, and exports. Companies get clean, structured, pre-screened lists.

**The Market**: 5,000+ engineering colleges in India. Each with 500-5,000 students. SaaS model: ₹30,000-₹2,00,000 per college per year.

**Why Now**: Post-COVID digital adoption. Coordinators want tools, not workarounds. WhatsApp Business API freely available. One developer, 14 days, MVP ready.

---

**PlacementHub — Build it. Ship it. Own your college's future.**
