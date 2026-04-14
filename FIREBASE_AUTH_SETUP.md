# Firebase Authentication Setup Guide

Complete guide to set up Firebase Authentication for PlacementHub.

---

## Overview

PlacementHub uses Firebase Authentication for secure user management:
- **Client-side**: Firebase SDK for user login/signup
- **Server-side**: Firebase Admin SDK for token verification in API routes

---

## Firebase Project Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `placementhub`
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click "Get started"
3. Enable sign-in methods:
   - **Email/Password**: Enable
   - **Google** (optional): Enable for social login
4. Click "Save"

### 3. Get Client Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click web icon (</>) to add web app
4. Register app name: `PlacementHub Web`
5. Copy the configuration object

Example:
```javascript
{
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "placementhub-xxxxx.firebaseapp.com",
  projectId: "placementhub-xxxxx",
  storageBucket: "placementhub-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
}
```

### 4. Generate Service Account Key (Server-side)

1. Go to **Project Settings → Service accounts**
2. Click "Generate new private key"
3. Download JSON file
4. Keep it secure - never commit to Git!

---

## Environment Configuration

### Option 1: Using Service Account JSON (Recommended)

Add to `.env.local`:

```env
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=placementhub-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=placementhub-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=placementhub-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Firebase Admin (Server) - Entire JSON as string
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"placementhub-xxxxx","private_key_id":"xxxxx","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@placementhub-xxxxx.iam.gserviceaccount.com","client_id":"xxxxx","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40placementhub-xxxxx.iam.gserviceaccount.com"}'
```

### Option 2: Using Individual Fields

Add to `.env.local`:

```env
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=placementhub-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=placementhub-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=placementhub-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Firebase Admin (Server) - Individual fields
FIREBASE_PROJECT_ID=placementhub-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@placementhub-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
```

---

## Code Implementation

### Client-Side Authentication

Create `lib/firebase/client.ts`:

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { auth };
export default app;
```

### Sign Up Example

```typescript
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

async function signUp(email: string, password: string, userData: any) {
  try {
    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get ID token
    const idToken = await user.getIdToken();

    // Create student profile in your database
    const response = await fetch('/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        firebaseUid: user.uid,
        email: user.email,
        ...userData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create profile');
    }

    return user;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}
```

### Sign In Example

```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get ID token for API calls
    const idToken = await user.getIdToken();
    
    // Store token in localStorage or state management
    localStorage.setItem('authToken', idToken);

    return user;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}
```

### Sign Out Example

```typescript
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

async function logout() {
  try {
    await signOut(auth);
    localStorage.removeItem('authToken');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}
```

### Making Authenticated API Calls

```typescript
import { auth } from '@/lib/firebase/client';

async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get fresh token
  const idToken = await user.getIdToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });

  return response;
}

// Usage
const response = await makeAuthenticatedRequest('/api/vault');
const data = await response.json();
```

---

## Server-Side Token Verification

The backend automatically verifies tokens using `lib/utils/auth.ts`:

```typescript
import { auth } from '@/lib/firebase/admin';

export async function verifyAuthToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1];
  const decodedToken = await auth.verifyIdToken(token);
  return decodedToken;
}
```

---

## User Roles Management

### Setting User Role in Database

When creating a student:

```typescript
await Student.create({
  firebaseUid: user.uid,
  email: user.email,
  name: 'John Doe',
  role: 'student', // or 'admin', 'placement-officer', 'company'
  // ... other fields
});
```

### Checking Roles in API Routes

```typescript
// Require admin access
const admin = await requireAdmin(request);

// Require any authenticated user
const user = await requireAuth(request);

// Require company access
const company = await requireCompany(request);
```

### Creating Admin Users

1. Create user via Firebase Authentication
2. Manually update role in MongoDB:

```javascript
db.students.updateOne(
  { firebaseUid: 'user_firebase_uid' },
  { $set: { role: 'admin' } }
)
```

Or via API (if you have admin access):

```typescript
PUT /api/students/:id
{
  "role": "admin"
}
```

---

## Security Rules

### Firebase Authentication Settings

1. **Email Verification** (Optional):
   - Go to Authentication → Settings
   - Enable "Email enumeration protection"

2. **Password Policy**:
   - Minimum 6 characters (Firebase default)
   - Consider enforcing stronger passwords in your UI

3. **Authorized Domains**:
   - Go to Authentication → Settings → Authorized domains
   - Add your production domain

---

## Token Refresh

Firebase tokens expire after 1 hour. Handle refresh:

```typescript
import { auth } from '@/lib/firebase/client';

// Get fresh token before API call
async function getFreshToken() {
  const user = auth.currentUser;
  if (!user) return null;
  
  // Force refresh if needed
  return await user.getIdToken(true);
}
```

---

## Error Handling

### Common Firebase Auth Errors

```typescript
import { FirebaseError } from 'firebase/app';

try {
  await signInWithEmailAndPassword(auth, email, password);
} catch (error) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/user-not-found':
        console.error('No user found with this email');
        break;
      case 'auth/wrong-password':
        console.error('Incorrect password');
        break;
      case 'auth/email-already-in-use':
        console.error('Email already registered');
        break;
      case 'auth/weak-password':
        console.error('Password is too weak');
        break;
      case 'auth/invalid-email':
        console.error('Invalid email format');
        break;
      default:
        console.error('Authentication error:', error.message);
    }
  }
}
```

---

## Testing Authentication

### 1. Test Sign Up

```bash
# Create test user in Firebase Console
# Authentication → Users → Add user
# Email: test@example.com
# Password: Test123!
```

### 2. Test API with Token

```bash
# Get token from browser console after login
const token = await firebase.auth().currentUser.getIdToken();
console.log(token);

# Use token in API request
curl -X GET http://localhost:3000/api/students/me \
  -H "Authorization: Bearer <your_token_here>"
```

### 3. Test Role-Based Access

```bash
# Try accessing admin endpoint as student (should fail)
curl -X GET http://localhost:3000/api/analytics/dashboard \
  -H "Authorization: Bearer <student_token>"

# Response: 403 Forbidden
```

---

## Production Deployment

### Vercel Environment Variables

Add all Firebase variables in Vercel Dashboard:
- Project → Settings → Environment Variables
- Add each variable from `.env.local`
- Deploy

### Security Checklist

- ✅ Service account key stored securely (not in Git)
- ✅ Authorized domains configured
- ✅ CORS configured for your domain
- ✅ Token verification on all protected routes
- ✅ Role-based access control implemented
- ✅ HTTPS enabled in production

---

## Monitoring & Debugging

### Firebase Console

1. **Authentication → Users**: View all registered users
2. **Authentication → Usage**: Monitor sign-ins
3. **Authentication → Settings**: Configure policies

### Debug Token Issues

```typescript
// In API route
console.log('Auth header:', request.headers.get('authorization'));

// In client
const user = auth.currentUser;
console.log('Current user:', user);
const token = await user?.getIdToken();
console.log('Token:', token);
```

---

## Migration from Clerk

If migrating from Clerk:

1. Update all `clerkId` references to `firebaseUid`
2. Update authentication calls to use Firebase
3. Remove Clerk dependencies
4. Update middleware
5. Test all authentication flows

---

## Common Issues & Solutions

### Issue: "Firebase app not initialized"

**Solution**: Ensure Firebase is initialized before use:
```typescript
import { auth } from '@/lib/firebase/client';
// Use auth only after component mounts
```

### Issue: "Token verification failed"

**Solution**: 
- Check service account credentials
- Ensure token is fresh (not expired)
- Verify Authorization header format

### Issue: "CORS error"

**Solution**:
- Add your domain to Firebase authorized domains
- Check API route CORS configuration

---

## Next Steps

1. ✅ Firebase setup complete
2. 🔄 Implement sign-up/sign-in UI
3. 🔄 Add password reset flow
4. 🔄 Implement email verification
5. 🔄 Add social login (Google, GitHub)
6. 🔄 Set up role management UI

---

## Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Next.js with Firebase](https://firebase.google.com/docs/auth/web/start)

---

**Firebase Authentication is now configured! Start building your auth UI.**
