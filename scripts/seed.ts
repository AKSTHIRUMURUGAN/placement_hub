// Load environment variables first
require('dotenv').config();

// Load environment variables first
require('dotenv').config();

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import connectDB from '../lib/db/mongodb';
import Student from '../lib/db/models/Student';
import Drive from '../lib/db/models/Drive';
import Application from '../lib/db/models/Application';
import Vault from '../lib/db/models/Vault';

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const auth = getAuth();

// Sample data
const sampleUsers = [
  // Admin
  {
    email: 'admin@placementhub.com',
    password: 'admin123',
    name: 'System Administrator',
    role: 'admin',
    regNo: 'ADMIN001',
    department: 'Administration',
    cgpa: 10.0,
    graduationYear: 2024,
    degree: 'B.Tech',
  },
  
  // Placement Faculty
  {
    email: 'placement1@college.edu',
    password: 'faculty123',
    name: 'Dr. Rajesh Kumar',
    role: 'placement-officer',
    regNo: 'FAC001',
    department: 'Placement Cell',
    cgpa: 10.0,
    graduationYear: 2024,
    degree: 'M.Tech',
  },
  {
    email: 'placement2@college.edu',
    password: 'faculty123',
    name: 'Prof. Priya Sharma',
    role: 'placement-officer',
    regNo: 'FAC002',
    department: 'Placement Cell',
    cgpa: 10.0,
    graduationYear: 2024,
    degree: 'M.Tech',
  },
  {
    email: 'placement3@college.edu',
    password: 'faculty123',
    name: 'Dr. Amit Patel',
    role: 'placement-officer',
    regNo: 'FAC003',
    department: 'Placement Cell',
    cgpa: 10.0,
    graduationYear: 2024,
    degree: 'M.Tech',
  },

  // Companies
  {
    email: 'hr@techcorp.com',
    password: 'company123',
    name: 'TechCorp Solutions',
    role: 'company',
    regNo: 'COMP001',
    department: 'Technology',
    cgpa: 10.0,
    graduationYear: 2024,
    degree: 'B.Tech',
  },
  {
    email: 'recruiter@innovatesoft.com',
    password: 'company123',
    name: 'InnovateSoft Pvt Ltd',
    role: 'company',
    regNo: 'COMP002',
    department: 'Software',
    cgpa: 10.0,
    graduationYear: 2024,
    degree: 'B.Tech',
  },
  {
    email: 'hiring@datatech.com',
    password: 'company123',
    name: 'DataTech Analytics',
    role: 'company',
    regNo: 'COMP003',
    department: 'Data Science',
    cgpa: 10.0,
    graduationYear: 2024,
    degree: 'B.Tech',
  },

  // Students
  {
    email: 'student1@college.edu',
    password: 'student123',
    name: 'Arjun Reddy',
    role: 'student',
    regNo: '20CS001',
    department: 'Computer Science',
    cgpa: 8.5,
    graduationYear: 2025,
    degree: 'B.Tech',
    activeBacklogs: 0,
    phone: '+91 9876543210',
    dateOfBirth: new Date('2003-05-15'),
    gender: 'Male',
  },
  {
    email: 'student2@college.edu',
    password: 'student123',
    name: 'Sneha Patel',
    role: 'student',
    regNo: '20CS002',
    department: 'Computer Science',
    cgpa: 9.2,
    graduationYear: 2025,
    degree: 'B.Tech',
    activeBacklogs: 0,
    phone: '+91 9876543211',
    dateOfBirth: new Date('2003-08-22'),
    gender: 'Female',
  },
  {
    email: 'student3@college.edu',
    password: 'student123',
    name: 'Rahul Sharma',
    role: 'student',
    regNo: '20EC001',
    department: 'Electronics',
    cgpa: 7.8,
    graduationYear: 2025,
    degree: 'B.Tech',
    activeBacklogs: 1,
    phone: '+91 9876543212',
    dateOfBirth: new Date('2003-02-10'),
    gender: 'Male',
  },
  {
    email: 'student4@college.edu',
    password: 'student123',
    name: 'Ananya Singh',
    role: 'student',
    regNo: '20IT001',
    department: 'Information Technology',
    cgpa: 8.9,
    graduationYear: 2025,
    degree: 'B.Tech',
    activeBacklogs: 0,
    phone: '+91 9876543213',
    dateOfBirth: new Date('2003-11-05'),
    gender: 'Female',
  },
  {
    email: 'student5@college.edu',
    password: 'student123',
    name: 'Vikram Joshi',
    role: 'student',
    regNo: '20ME001',
    department: 'Mechanical',
    cgpa: 7.5,
    graduationYear: 2025,
    degree: 'B.Tech',
    activeBacklogs: 2,
    phone: '+91 9876543214',
    dateOfBirth: new Date('2003-07-18'),
    gender: 'Male',
  },
];

const sampleDrives = [
  {
    companyName: 'TechCorp Solutions',
    role: 'Software Developer',
    type: 'full-time',
    employmentType: 'full-time',
    description: 'Join our dynamic team as a Software Developer and work on cutting-edge technologies including React, Node.js, and cloud platforms.',
    eligibility: {
      minCgpa: 7.5,
      departments: ['Computer Science', 'Information Technology'],
      maxBacklogs: 1,
      degrees: ['B.Tech'],
      graduationYears: [2025],
      requiredSkills: ['JavaScript', 'React', 'Node.js']
    },
    requiredFields: ['resume', 'coverLetter'],
    additionalQuestions: [],
    ctc: 800000, // 8 LPA
    location: 'Bangalore',
    workMode: 'hybrid',
    openDate: new Date('2026-04-01'),
    closeDate: new Date('2026-05-31'),
    rounds: [
      { name: 'Online Assessment' },
      { name: 'Technical Interview' },
      { name: 'HR Interview' }
    ],
    status: 'active',
  },
  {
    companyName: 'InnovateSoft Pvt Ltd',
    role: 'Full Stack Developer',
    type: 'full-time',
    employmentType: 'full-time',
    description: 'Looking for passionate Full Stack Developers to build scalable web applications using modern technologies.',
    eligibility: {
      minCgpa: 8.0,
      departments: ['Computer Science', 'Information Technology'],
      maxBacklogs: 0,
      degrees: ['B.Tech'],
      graduationYears: [2025],
      requiredSkills: ['React', 'Node.js', 'MongoDB']
    },
    requiredFields: ['resume', 'coverLetter'],
    additionalQuestions: [],
    ctc: 1200000, // 12 LPA
    location: 'Hyderabad',
    workMode: 'onsite',
    openDate: new Date('2026-04-05'),
    closeDate: new Date('2026-06-05'),
    rounds: [
      { name: 'Coding Challenge' },
      { name: 'System Design' },
      { name: 'Technical Interview' },
      { name: 'Final Interview' }
    ],
    status: 'active',
  },
  {
    companyName: 'DataTech Analytics',
    role: 'Data Analyst Intern',
    type: 'internship',
    employmentType: 'full-time',
    description: 'Internship opportunity for aspiring data analysts to work with real-world datasets and analytics tools.',
    eligibility: {
      minCgpa: 7.0,
      departments: ['Computer Science', 'Information Technology', 'Electronics'],
      maxBacklogs: 2,
      degrees: ['B.Tech'],
      graduationYears: [2025],
      requiredSkills: ['Python', 'SQL']
    },
    requiredFields: ['resume'],
    additionalQuestions: [],
    stipend: 25000, // 25k per month
    location: 'Remote',
    workMode: 'remote',
    openDate: new Date('2026-03-15'),
    closeDate: new Date('2026-05-15'),
    rounds: [
      { name: 'Aptitude Test' },
      { name: 'Technical Interview' }
    ],
    status: 'active',
  },
];

async function createFirebaseUser(userData: any) {
  try {
    // Check if Firebase Admin is available
    if (!auth) {
      console.warn('Firebase Admin not available, skipping user creation');
      return 'placeholder-uid-' + Date.now();
    }

    const userRecord = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.name,
    });
    return userRecord.uid;
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      // Get existing user
      const existingUser = await auth!.getUserByEmail(userData.email);
      return existingUser.uid;
    }
    throw error;
  }
}

async function createVaultForStudent(studentId: string) {
  const vault = await Vault.create({
    studentId,
    resumes: [],
    certificates: [],
    internships: [],
    projects: [
      {
        title: 'E-commerce Website',
        description: 'Built a full-stack e-commerce platform using MERN stack',
        techStack: ['React', 'Node.js', 'MongoDB', 'Express'],
        githubUrl: 'https://github.com/example/ecommerce',
        demoUrl: 'https://ecommerce-demo.com',
      }
    ],
    skills: [
      { name: 'JavaScript', proficiency: 'advanced' },
      { name: 'React', proficiency: 'intermediate' },
      { name: 'Node.js', proficiency: 'intermediate' },
      { name: 'Python', proficiency: 'beginner' },
      { name: 'SQL', proficiency: 'intermediate' },
    ],
    extraFields: {
      github: 'https://github.com/example',
      linkedin: 'https://linkedin.com/in/example',
      marks10th: 85.5,
      marks12th: 88.2,
    },
    completenessScore: 75,
  });
  return vault;
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Student.deleteMany({});
    await Drive.deleteMany({});
    await Application.deleteMany({});
    await Vault.deleteMany({});

    // Create users in Firebase and database
    console.log('👥 Creating users...');
    const createdStudents: any[] = [];
    
    for (const userData of sampleUsers) {
      try {
        // Create Firebase user
        const firebaseUid = await createFirebaseUser(userData);
        
        // Create database user
        const student = await Student.create({
          firebaseUid,
          email: userData.email,
          name: userData.name,
          regNo: userData.regNo,
          department: userData.department,
          cgpa: userData.cgpa,
          graduationYear: userData.graduationYear,
          degree: userData.degree,
          role: userData.role,
          activeBacklogs: userData.activeBacklogs || 0,
          phone: userData.phone,
          dateOfBirth: userData.dateOfBirth,
          gender: userData.gender,
          isActive: true,
          isBlacklisted: false,
        });

        console.log(`✅ Created user: ${userData.name} (${userData.role})`);
        
        // Create vault for students
        if (userData.role === 'student') {
          await createVaultForStudent(student._id.toString());
          createdStudents.push(student);
          console.log(`📁 Created vault for: ${userData.name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating user ${userData.name}:`, error);
      }
    }

    // Create drives
    console.log('🚗 Creating placement drives...');
    const createdDrives: any[] = [];
    
    // Get admin user for createdBy field
    const adminUser = await Student.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ Admin user not found, cannot create drives');
      return;
    }
    
    for (const driveData of sampleDrives) {
      try {
        const drive = await Drive.create({
          ...driveData,
          createdBy: adminUser._id,
        });
        createdDrives.push(drive);
        console.log(`✅ Created drive: ${driveData.role} at ${driveData.companyName}`);
      } catch (error) {
        console.error(`❌ Error creating drive ${driveData.role}:`, error);
      }
    }

    // Create sample applications
    console.log('📝 Creating sample applications...');
    const applicationStatuses = ['applied', 'shortlisted', 'rejected', 'selected'];
    
    for (let i = 0; i < createdStudents.length && i < createdDrives.length; i++) {
      const student = createdStudents[i];
      const drive = createdDrives[i % createdDrives.length];
      
      try {
        const application = await Application.create({
          studentId: student._id,
          driveId: drive._id,
          status: applicationStatuses[i % applicationStatuses.length],
          appliedAt: new Date(),
          resumeUrl: 'https://example.com/resume.pdf',
          coverLetter: `I am excited to apply for the ${drive.role} position at ${drive.companyName}. With my strong technical background and passion for technology, I believe I would be a great fit for this role.`,
        });
        
        console.log(`✅ Created application: ${student.name} -> ${drive.companyName}`);
      } catch (error) {
        console.error(`❌ Error creating application:`, error);
      }
    }

    // Create additional cross-applications
    if (createdStudents.length > 1 && createdDrives.length > 1) {
      try {
        // Student 1 applies to multiple drives
        await Application.create({
          studentId: createdStudents[0]._id,
          driveId: createdDrives[1]._id,
          status: 'applied',
          appliedAt: new Date(),
          resumeUrl: 'https://example.com/resume.pdf',
          coverLetter: 'I am interested in this opportunity and believe my skills align well with your requirements.',
        });

        // Student 2 applies to multiple drives
        await Application.create({
          studentId: createdStudents[1]._id,
          driveId: createdDrives[0]._id,
          status: 'shortlisted',
          appliedAt: new Date(),
          resumeUrl: 'https://example.com/resume.pdf',
          coverLetter: 'I am passionate about software development and would love to contribute to your team.',
        });

        console.log('✅ Created additional cross-applications');
      } catch (error) {
        console.error('❌ Error creating cross-applications:', error);
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users created: ${sampleUsers.length}`);
    console.log(`🚗 Drives created: ${createdDrives.length}`);
    console.log(`📁 Vaults created: ${createdStudents.length}`);
    console.log(`📝 Applications created: ${createdStudents.length + 2}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@placementhub.com / admin123');
    console.log('Faculty: placement1@college.edu / faculty123');
    console.log('Company: hr@techcorp.com / company123');
    console.log('Student: student1@college.edu / student123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeder
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding process failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;