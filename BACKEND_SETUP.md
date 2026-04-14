# PlacementHub Backend Setup Guide

Complete guide to set up and run the PlacementHub backend built with Next.js App Router.

---

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- MongoDB Atlas account (or local MongoDB)
- Cloudflare R2 account (for file storage)
- Cloudinary account (for image storage)
- Clerk account (for authentication)
- SendGrid account (for emails)

---

## Installation Steps

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd placementhub

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/placementhub

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_BUCKET_NAME=placementhub-files

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SendGrid
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=noreply@placementhub.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Service Setup

### MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP address (or allow all: 0.0.0.0/0)
5. Get connection string and add to `.env.local`

**Connection String Format:**
```
mongodb+srv://<username>:<password>@cluster.mongodb.net/placementhub?retryWrites=true&w=majority
```

### Clerk Authentication Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Enable Email/Password authentication
4. Add custom user metadata fields:
   - `role` (string): student | admin | placement-officer | company
5. Copy API keys to `.env.local`

**Configure Clerk Roles:**

In Clerk Dashboard → Users → Select a user → Public Metadata:
```json
{
  "role": "admin"
}
```

### Cloudflare R2 Setup

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to R2 Object Storage
3. Create a new bucket: `placementhub-files`
4. Generate API tokens:
   - Go to R2 → Manage R2 API Tokens
   - Create API token with read/write permissions
5. Copy credentials to `.env.local`

### Cloudinary Setup

1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for free account
3. Get credentials from Dashboard
4. Copy Cloud Name, API Key, API Secret to `.env.local`

### SendGrid Setup

1. Go to [SendGrid](https://sendgrid.com)
2. Create account and verify email
3. Create API Key:
   - Settings → API Keys → Create API Key
   - Give it "Full Access" or "Mail Send" permission
4. Copy API key to `.env.local`
5. Verify sender email:
   - Settings → Sender Authentication
   - Verify your FROM_EMAIL address

---

## Database Schema

The backend uses Mongoose with the following collections:

### Collections

1. **students** - Student profiles
2. **vault** - Student career locker (resumes, certificates, projects)
3. **drives** - Job/internship listings
4. **applications** - Application records
5. **companies** - Company profiles
6. **offers** - Placement offers
7. **notifications** - Notification log

### Indexes

Automatically created by Mongoose schemas:
- `students`: (department, cgpa), (email), (regNo)
- `drives`: (closeDate, status), (type, status)
- `applications`: (studentId, driveId) unique, (driveId, status)
- `vault`: (studentId)
- `notifications`: (userId, read, createdAt)

---

## Running the Application

### Development Mode

```bash
npm run dev
```

Server runs on: `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## API Testing

### Using Thunder Client (VS Code Extension)

1. Install Thunder Client extension
2. Import API collection (create from API_DOCUMENTATION.md)
3. Set environment variables
4. Test endpoints

### Using Postman

1. Create new collection
2. Set base URL: `http://localhost:3000/api`
3. Add Clerk session token to headers
4. Test endpoints

### Example: Test Student Creation

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <clerk_token>" \
  -d '{
    "clerkId": "user_xxxxx",
    "email": "student@example.com",
    "name": "John Doe",
    "regNo": "2021CS001",
    "department": "Computer Science Engineering",
    "cgpa": 8.5,
    "graduationYear": 2025,
    "degree": "B.Tech"
  }'
```

---

## Initial Data Setup

### 1. Create Admin User

1. Sign up via Clerk
2. In Clerk Dashboard, set user's public metadata:
```json
{
  "role": "admin"
}
```

### 2. Bulk Upload Students

Use the bulk upload endpoint:

```bash
POST /api/students/bulk-upload
```

With Excel data converted to JSON:
```json
{
  "students": [
    {
      "email": "student1@college.edu",
      "name": "Student One",
      "regNo": "2021CS001",
      "department": "Computer Science Engineering",
      "cgpa": 8.5,
      "graduationYear": 2025,
      "degree": "B.Tech",
      "phone": "+919876543210"
    }
  ]
}
```

### 3. Create Sample Drive

```bash
POST /api/drives
```

```json
{
  "companyName": "Google",
  "role": "Software Engineer",
  "type": "full-time",
  "ctc": 2500000,
  "location": "Bangalore",
  "workMode": "hybrid",
  "description": "Looking for talented engineers",
  "eligibility": {
    "minCgpa": 7.5,
    "departments": ["Computer Science Engineering"],
    "requiredSkills": ["JavaScript", "React"],
    "maxBacklogs": 0,
    "degrees": ["B.Tech"],
    "graduationYears": [2025]
  },
  "requiredFields": ["resume", "github"],
  "openDate": "2024-04-15",
  "closeDate": "2024-04-30",
  "status": "active"
}
```

---

## File Structure

```
placementhub/
├── app/
│   └── api/
│       ├── students/
│       │   ├── route.ts
│       │   ├── me/route.ts
│       │   ├── bulk-upload/route.ts
│       │   └── [id]/route.ts
│       ├── vault/
│       │   ├── route.ts
│       │   ├── resume/route.ts
│       │   ├── certificate/route.ts
│       │   ├── project/route.ts
│       │   ├── internship/route.ts
│       │   ├── skills/route.ts
│       │   └── extra-fields/route.ts
│       ├── drives/
│       │   ├── route.ts
│       │   ├── [id]/
│       │   │   ├── route.ts
│       │   │   └── applications/route.ts
│       ├── applications/
│       │   ├── route.ts
│       │   ├── bulk-update/route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── status/route.ts
│       ├── notifications/
│       │   ├── route.ts
│       │   ├── read-all/route.ts
│       │   └── [id]/read/route.ts
│       └── analytics/
│           ├── dashboard/route.ts
│           ├── unplaced/route.ts
│           └── export/route.ts
├── lib/
│   ├── db/
│   │   ├── mongodb.ts
│   │   └── models/
│   │       ├── Student.ts
│   │       ├── Vault.ts
│   │       ├── Drive.ts
│   │       ├── Application.ts
│   │       ├── Company.ts
│   │       ├── Offer.ts
│   │       └── Notification.ts
│   ├── eligibility/
│   │   └── engine.ts
│   ├── storage/
│   │   ├── cloudflare.ts
│   │   └── cloudinary.ts
│   ├── notifications/
│   │   └── email.ts
│   └── utils/
│       ├── auth.ts
│       ├── response.ts
│       └── constants.ts
├── types/
│   └── index.ts
├── .env.local
├── .env.example
└── package.json
```

---

## Common Issues & Solutions

### Issue: MongoDB Connection Failed

**Solution:**
- Check MONGODB_URI is correct
- Verify IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

### Issue: Clerk Authentication Not Working

**Solution:**
- Verify API keys are correct
- Check if user has proper role in public metadata
- Ensure Clerk middleware is configured

### Issue: File Upload Fails

**Solution:**
- Verify Cloudflare R2 credentials
- Check bucket name is correct
- Ensure file size is under 5MB

### Issue: Emails Not Sending

**Solution:**
- Verify SendGrid API key
- Check sender email is verified
- Review SendGrid activity logs

---

## Performance Optimization

### Database Indexes

All critical indexes are defined in Mongoose schemas and created automatically.

### Caching Strategy

(To be implemented)
- Cache drive listings for 5 minutes
- Cache student eligibility checks
- Use Redis for session storage

### File Storage

- Resumes/certificates: Cloudflare R2 (cost-effective)
- Images/logos: Cloudinary (optimized delivery)
- Generate signed URLs with 7-day expiry

---

## Security Best Practices

1. **Environment Variables**: Never commit `.env.local`
2. **API Authentication**: All routes protected by Clerk
3. **Role-Based Access**: Admin routes check user role
4. **File Validation**: Check file types and sizes
5. **Input Sanitization**: Validate all user inputs
6. **Rate Limiting**: (To be implemented)

---

## Monitoring & Logging

### Development

```bash
# View logs
npm run dev

# Logs appear in terminal
```

### Production

Use services like:
- **Vercel Analytics** (if deployed on Vercel)
- **Sentry** for error tracking
- **LogRocket** for session replay
- **MongoDB Atlas Monitoring** for database metrics

---

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Environment Variables in Vercel

Add all variables from `.env.local` in:
- Vercel Dashboard → Project → Settings → Environment Variables

---

## Backup & Recovery

### Database Backup

MongoDB Atlas provides automatic backups:
- Go to Clusters → Backup
- Configure backup schedule
- Test restore process

### Manual Backup

```bash
# Export collections
mongodump --uri="mongodb+srv://..." --out=./backup

# Restore
mongorestore --uri="mongodb+srv://..." ./backup
```

---

## API Rate Limits

(To be implemented)

Recommended limits:
- 100 requests/minute per user
- 1000 requests/hour per user
- 10,000 requests/day per user

---

## Testing

### Unit Tests

(To be implemented)

```bash
npm run test
```

### Integration Tests

Test critical flows:
1. Student registration → vault creation
2. Drive creation → eligibility filtering
3. Application submission → notification sent
4. Status update → email sent

---

## Maintenance

### Regular Tasks

1. **Weekly**: Review error logs
2. **Monthly**: Check database performance
3. **Quarterly**: Update dependencies
4. **Yearly**: Review and optimize indexes

### Database Cleanup

```javascript
// Remove old notifications (older than 90 days)
db.notifications.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
})

// Archive completed drives
db.drives.updateMany(
  { status: 'closed', closeDate: { $lt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } },
  { $set: { status: 'completed' } }
)
```

---

## Support & Documentation

- **API Documentation**: See `API_DOCUMENTATION.md`
- **README**: See `README.md`
- **Issues**: Create GitHub issue
- **Email**: support@placementhub.com

---

## Next Steps

1. ✅ Backend setup complete
2. 🔄 Build frontend components
3. 🔄 Implement real-time notifications
4. 🔄 Add WhatsApp integration
5. 🔄 Build analytics dashboard
6. 🔄 Add resume parser
7. 🔄 Implement AI recommendations

---

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

**Backend is now ready! Start building the frontend or test the API endpoints.**
