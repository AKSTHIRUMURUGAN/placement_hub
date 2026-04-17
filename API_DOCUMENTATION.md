# PlacementHub API Documentation

Complete API reference for PlacementHub backend built with Next.js App Router.

---

## Base URL

```
http://localhost:3000/api
```

---

## Authentication

All API routes (except public ones) require authentication via Clerk. Include the session token in requests.

### Headers

```
Authorization: Bearer <clerk_session_token>
```

---

## API Endpoints

### Students

#### Get Current Student Profile
```http
GET /api/students/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student": { ... },
    "vault": { ... }
  }
}
```

---

#### Get All Students (Admin Only)
```http
GET /api/students?page=1&limit=20&department=CSE&search=john
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `department` (optional): Filter by department
- `graduationYear` (optional): Filter by graduation year
- `search` (optional): Search by name, email, or regNo

**Response:**
```json
{
  "success": true,
  "data": {
    "students": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

---

#### Create Student (Admin Only)
```http
POST /api/students
```

**Body:**
```json
{
  "clerkId": "user_xxxxx",
  "email": "student@example.com",
  "name": "John Doe",
  "regNo": "2021CS001",
  "department": "Computer Science Engineering",
  "cgpa": 8.5,
  "graduationYear": 2025,
  "degree": "B.Tech",
  "phone": "+919876543210"
}
```

---

#### Bulk Upload Students (Admin Only)
```http
POST /api/students/bulk-upload
```

**Body:**
```json
{
  "students": [
    {
      "email": "student1@example.com",
      "name": "Student One",
      "regNo": "2021CS001",
      "department": "Computer Science Engineering",
      "cgpa": 8.5,
      "graduationYear": 2025,
      "degree": "B.Tech"
    },
    ...
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk upload completed: 45 success, 5 failed",
  "data": {
    "success": 45,
    "failed": 5,
    "errors": [...]
  }
}
```

---

#### Update Student Profile
```http
PUT /api/students/:id
```

**Body:**
```json
{
  "phone": "+919876543210",
  "dateOfBirth": "2003-05-15",
  "gender": "Male"
}
```

---

#### Delete Student (Admin Only)
```http
DELETE /api/students/:id
```

---

### Vault

#### Get Student Vault
```http
GET /api/vault
```

**Response:**
```json
{
  "success": true,
  "data": {
    "studentId": "...",
    "resumes": [...],
    "certificates": [...],
    "internships": [...],
    "projects": [...],
    "skills": [...],
    "extraFields": {...},
    "completenessScore": 85
  }
}
```

---

#### Upload Resume
```http
POST /api/vault/resume
```

**Body (multipart/form-data):**
- `file`: PDF file (max 5MB)
- `type`: Resume type (e.g., "CSE Resume", "General")

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": { ... }
}
```

---

#### Delete Resume
```http
DELETE /api/vault/resume?id=<resume_id>
```

---

#### Upload Certificate
```http
POST /api/vault/certificate
```

**Body (multipart/form-data):**
- `file`: PDF or image file (max 5MB)
- `category`: Certificate category (e.g., "technical", "NPTEL")
- `title`: Certificate title

---

#### Delete Certificate
```http
DELETE /api/vault/certificate?id=<certificate_id>
```

---

#### Add Project
```http
POST /api/vault/project
```

**Body:**
```json
{
  "title": "E-commerce Platform",
  "description": "Full-stack e-commerce application",
  "techStack": ["React", "Node.js", "MongoDB"],
  "githubUrl": "https://github.com/user/project",
  "demoUrl": "https://demo.example.com",
  "startDate": "2024-01-01",
  "endDate": "2024-03-01"
}
```

---

#### Delete Project
```http
DELETE /api/vault/project?id=<project_id>
```

---

#### Add Internship
```http
POST /api/vault/internship
```

**Body:**
```json
{
  "company": "Tech Corp",
  "role": "Software Developer Intern",
  "duration": "3 months",
  "startDate": "2024-06-01",
  "endDate": "2024-08-31",
  "stipend": 15000,
  "description": "Worked on backend APIs"
}
```

---

#### Delete Internship
```http
DELETE /api/vault/internship?id=<internship_id>
```

---

#### Update Skills
```http
PUT /api/vault/skills
```

**Body:**
```json
{
  "skills": [
    { "name": "JavaScript", "proficiency": "advanced" },
    { "name": "Python", "proficiency": "intermediate" },
    { "name": "React", "proficiency": "advanced" }
  ]
}
```

---

#### Update Extra Fields
```http
PUT /api/vault/extra-fields
```

**Body:**
```json
{
  "extraFields": {
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username",
    "portfolio": "https://portfolio.com",
    "leetcode": "https://leetcode.com/username",
    "marks10th": 95.5,
    "marks12th": 92.0
  }
}
```

---

### Drives

#### Get All Drives
```http
GET /api/drives?page=1&limit=20&type=full-time&tab=eligible
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `type` (optional): Drive type (full-time | internship | ppo)
- `status` (optional): Drive status (active | closed)
- `tab` (optional): Filter tab (eligible | all | applied)

**Response:**
```json
{
  "success": true,
  "data": {
    "drives": [
      {
        "_id": "...",
        "companyName": "Google",
        "role": "Software Engineer",
        "type": "full-time",
        "ctc": 2500000,
        "location": "Bangalore",
        "eligibility": {
          "isEligible": true,
          "reasons": [],
          "matchScore": 95
        },
        "application": null,
        "isNew": true,
        "deadlineUrgent": false
      }
    ],
    "pagination": {...}
  }
}
```

---

#### Get Drive by ID
```http
GET /api/drives/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "companyName": "Google",
    "role": "Software Engineer",
    "description": "...",
    "eligibility": {
      "minCgpa": 7.5,
      "departments": ["CSE", "IT"],
      "requiredSkills": ["JavaScript", "React"],
      "maxBacklogs": 0
    },
    "requiredFields": ["resume", "github", "linkedin"],
    "rounds": [...],
    "eligibility": {
      "isEligible": true,
      "reasons": [],
      "matchScore": 95
    }
  }
}
```

---

#### Create Drive (Admin Only)
```http
POST /api/drives
```

**Body:**
```json
{
  "companyName": "Google",
  "companyLogo": "https://...",
  "role": "Software Engineer",
  "type": "full-time",
  "ctc": 2500000,
  "location": "Bangalore",
  "workMode": "hybrid",
  "description": "Looking for talented engineers...",
  "eligibility": {
    "minCgpa": 7.5,
    "departments": ["Computer Science Engineering", "Information Technology"],
    "requiredSkills": ["JavaScript", "React", "Node.js"],
    "maxBacklogs": 0,
    "degrees": ["B.Tech", "B.E."],
    "graduationYears": [2025]
  },
  "requiredFields": ["resume", "github", "linkedin"],
  "additionalQuestions": [
    {
      "question": "Why do you want to join Google?",
      "type": "text",
      "required": true
    }
  ],
  "rounds": [
    {
      "name": "Online Assessment",
      "date": "2024-05-01",
      "instructions": "Complete the coding test"
    }
  ],
  "openDate": "2024-04-15",
  "closeDate": "2024-04-30",
  "status": "active"
}
```

---

#### Update Drive (Admin Only)
```http
PUT /api/drives/:id
```

---

#### Delete Drive (Admin Only)
```http
DELETE /api/drives/:id
```

---

#### Get Drive Applications (Admin Only)
```http
GET /api/drives/:id/applications?status=shortlisted&department=CSE
```

**Query Parameters:**
- `status` (optional): Filter by application status
- `department` (optional): Filter by department
- `search` (optional): Search by name, email, or regNo

**Response:**
```json
{
  "success": true,
  "data": {
    "drive": {...},
    "applications": [
      {
        "_id": "...",
        "status": "applied",
        "appliedAt": "2024-04-20T10:30:00Z",
        "student": {
          "name": "John Doe",
          "email": "john@example.com",
          "regNo": "2021CS001",
          "department": "CSE",
          "cgpa": 8.5
        },
        "vault": {
          "resumeUrl": "...",
          "skills": ["JavaScript", "React"],
          "github": "..."
        }
      }
    ],
    "stats": {
      "total": 150,
      "applied": 100,
      "shortlisted": 30,
      "selected": 10,
      "rejected": 10
    }
  }
}
```

---

### Applications

#### Get User Applications
```http
GET /api/applications?status=applied
```

**Query Parameters:**
- `status` (optional): Filter by status

---

#### Submit Application (One-Click Apply)
```http
POST /api/applications
```

**Body:**
```json
{
  "driveId": "...",
  "missingFields": {
    "github": "https://github.com/username"
  },
  "additionalAnswers": {
    "Why do you want to join Google?": "Because..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "_id": "...",
    "studentId": "...",
    "driveId": "...",
    "status": "applied",
    "submittedData": {...}
  }
}
```

**Error Response (Missing Fields):**
```json
{
  "success": false,
  "message": "Missing required fields",
  "errors": {
    "missingFields": ["github", "portfolio"]
  }
}
```

---

#### Get Application Details
```http
GET /api/applications/:id
```

---

#### Withdraw Application
```http
PUT /api/applications/:id/withdraw
```

**Note:** Can only withdraw within 2 hours of submission

---

#### Update Application Status (Admin Only)
```http
PUT /api/applications/:id/status
```

**Body:**
```json
{
  "status": "shortlisted",
  "note": "Selected for technical round",
  "currentRound": "Technical Interview"
}
```

---

#### Bulk Update Applications (Admin Only)
```http
POST /api/applications/bulk-update
```

**Body:**
```json
{
  "applicationIds": ["id1", "id2", "id3"],
  "status": "shortlisted",
  "note": "Selected for next round"
}
```

---

### Notifications

#### Get User Notifications
```http
GET /api/notifications?page=1&limit=20&unreadOnly=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "unreadCount": 5,
    "pagination": {...}
  }
}
```

---

#### Mark Notification as Read
```http
PUT /api/notifications/:id/read
```

---

#### Mark All Notifications as Read
```http
PUT /api/notifications/read-all
```

---

### Placements (Offers)

#### Get All Placements (Admin Only)
```http
GET /api/placements?page=1&limit=20&year=2025&department=CSE&status=accepted
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `year` (optional): Filter by graduation year
- `department` (optional): Filter by department
- `status` (optional): Filter by status (accepted | pending)
- `search` (optional): Search by name, email, regNo, or company

**Response:**
```json
{
  "success": true,
  "data": {
    "offers": [
      {
        "_id": "...",
        "studentId": {
          "name": "John Doe",
          "email": "john@example.com",
          "regNo": "2021CS001",
          "department": "CSE",
          "cgpa": 8.5
        },
        "companyName": "Google",
        "role": "Software Engineer",
        "ctc": 2500000,
        "offerDate": "2024-05-01",
        "accepted": true,
        "acceptedAt": "2024-05-02"
      }
    ],
    "pagination": {...}
  }
}
```

---

#### Create Placement (Admin Only)
```http
POST /api/placements
```

**Body:**
```json
{
  "studentId": "...",
  "driveId": "...",
  "applicationId": "...",
  "companyName": "Google",
  "role": "Software Engineer",
  "ctc": 2500000,
  "joiningDate": "2024-07-01",
  "offerLetterUrl": "https://...",
  "offerDate": "2024-05-01"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Placement offer created successfully",
  "data": {
    "offer": {...}
  }
}
```

---

#### Get Placement Details
```http
GET /api/placements/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "offer": {
      "_id": "...",
      "studentId": {...},
      "driveId": {...},
      "companyName": "Google",
      "role": "Software Engineer",
      "ctc": 2500000,
      "offerDate": "2024-05-01",
      "accepted": true
    }
  }
}
```

---

#### Update Placement (Admin Only)
```http
PUT /api/placements/:id
```

**Body:**
```json
{
  "ctc": 2600000,
  "joiningDate": "2024-08-01"
}
```

---

#### Delete Placement (Admin Only)
```http
DELETE /api/placements/:id
```

---

#### Accept Offer (Student)
```http
POST /api/placements/:id/accept
```

**Response:**
```json
{
  "success": true,
  "message": "Offer accepted successfully",
  "data": {
    "offer": {...}
  }
}
```

---

#### Reject Offer (Student)
```http
POST /api/placements/:id/reject
```

**Body:**
```json
{
  "reason": "Pursuing higher studies"
}
```

---

#### Get Placement Statistics (Admin Only)
```http
GET /api/placements/stats?year=2025
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalStudents": 500,
      "placedStudents": 320,
      "unplacedStudents": 180,
      "placementRate": 64.0,
      "pendingOffers": 15,
      "avgCtc": 1200000,
      "maxCtc": 5000000,
      "minCtc": 400000
    },
    "departmentStats": [
      {
        "department": "CSE",
        "placed": 150,
        "total": 200,
        "placementRate": "75.00",
        "avgCtc": 1500000,
        "maxCtc": 5000000
      }
    ],
    "topCompanies": [
      {
        "company": "Google",
        "placements": 25,
        "avgCtc": 2500000
      }
    ]
  }
}
```

---

### Analytics (Admin Only)

#### Get Dashboard Stats
```http
GET /api/analytics/dashboard?year=2025
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalStudents": 500,
      "totalDrives": 45,
      "activeDrives": 12,
      "totalApplications": 2500,
      "placedStudents": 320,
      "unplacedCount": 180,
      "placementRate": 64.0
    },
    "departmentStats": [
      {
        "department": "CSE",
        "total": 200,
        "placed": 150,
        "placementRate": "75.00"
      }
    ],
    "topSkills": [
      { "skill": "JavaScript", "count": 35 },
      { "skill": "Python", "count": 30 }
    ],
    "recentDrives": [...]
  }
}
```

---

#### Get Unplaced Students
```http
GET /api/analytics/unplaced?year=2025&department=CSE&minCgpa=7.0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unplacedStudents": [...],
    "total": 45
  }
}
```

---

#### Export Applications Data
```http
GET /api/analytics/export?driveId=xxx&status=shortlisted
```

**Response:**
```json
{
  "success": true,
  "data": {
    "drive": {
      "companyName": "Google",
      "role": "Software Engineer"
    },
    "data": [
      {
        "Student Name": "John Doe",
        "Registration Number": "2021CS001",
        "Email": "john@example.com",
        "Department": "CSE",
        "CGPA": 8.5,
        "Skills": "JavaScript, React, Node.js",
        "Resume URL": "...",
        "GitHub": "...",
        "LinkedIn": "..."
      }
    ],
    "count": 30
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... }
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## Eligibility Engine

The eligibility engine automatically filters drives based on:

1. **CGPA**: `student.cgpa >= drive.eligibility.minCgpa`
2. **Department**: Student's department in `drive.eligibility.departments[]`
3. **Skills**: Student has required skills from `drive.eligibility.requiredSkills[]`
4. **Backlogs**: `student.activeBacklogs <= drive.eligibility.maxBacklogs`
5. **Degree**: Student's degree in `drive.eligibility.degrees[]`
6. **Graduation Year**: Student's year in `drive.eligibility.graduationYears[]`

### Match Score Calculation

- Base score: 100
- CGPA mismatch: -30
- Department mismatch: -25
- Backlogs exceed limit: -20
- Degree mismatch: -15
- Year mismatch: -10
- Missing skills: -20 (all) or -10 (partial)

---

## One-Click Apply Flow

1. Student clicks "Apply" on a drive
2. System checks vault against `drive.requiredFields[]`
3. Auto-fills available fields from vault
4. Prompts for missing fields only
5. Student fills missing fields → saved to vault
6. Application submitted with complete data
7. Future applications reuse saved data

### Progressive Profile Building

Each application enriches the student's vault:
- First application: May need to fill 5-6 fields
- Second application: May need 1-2 new fields
- Third+ applications: Truly one-click (if no new fields required)

---

## Notification System

Notifications are sent via:
- **In-app**: Always enabled
- **Email**: Configurable per event type
- **WhatsApp**: High-priority events only

### Notification Events

- New eligible drive posted
- Application status changed
- Deadline reminder (48 hours before)
- Shortlisted for next round
- Selected/Rejected

---

## File Upload Limits

- **Resumes**: PDF only, max 5MB
- **Certificates**: PDF or images, max 5MB
- **Company Logos**: Images, max 2MB

---

## Rate Limiting

(To be implemented)

- 100 requests per minute per user
- 1000 requests per hour per user

---

## Webhooks

(Future feature)

Webhook events for external integrations:
- `application.submitted`
- `application.status_changed`
- `drive.created`
- `student.placed`

---

## Testing

Use tools like Postman or Thunder Client to test API endpoints.

### Example: Test One-Click Apply

1. Create a student and vault
2. Create a drive with required fields
3. POST to `/api/applications` with driveId
4. Check response for missing fields
5. Resubmit with missing fields
6. Verify application created

---

## Support

For API issues or questions, contact the development team.
