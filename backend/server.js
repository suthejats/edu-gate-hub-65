const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Joi = require('joi');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK (commented out for demo - replace with actual credentials)
let db, bucket;
try {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });

  db = admin.firestore();
  bucket = admin.storage().bucket();
} catch (error) {
  console.log('Firebase initialization failed, using in-memory storage for demo:', error.message);
  // Fallback to in-memory storage for demo
  db = null;
  bucket = null;
}

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for demo purposes (replace with actual database)
let institutions = [];
let exams = [];
let profiles = [];

// File storage directory
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

// Authentication middleware (simplified for demo)
const authenticateTeacher = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    // For demo purposes, accept any token and simulate a teacher user
    req.user = { id: 'demo-teacher-id', email: 'teacher@example.com' };
    req.profile = { role: 'teacher', institution_code: 'DEMO123' };
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Validation schemas
const examCreateSchema = Joi.object({
  examTitle: Joi.string().required().min(1).max(255),
  subjectClass: Joi.string().required().min(1).max(255),
  examDateTime: Joi.date().required().min('now'),
  duration: Joi.string().required().min(1).max(100)
});

const institutionRegisterSchema = Joi.object({
  name: Joi.string().required().min(2).max(255),
  email: Joi.string().email().required(),
  contact: Joi.string().required().min(10).max(15),
  address: Joi.string().required().min(10).max(500)
});

// Routes

// POST /institution/register - Register institution and generate unique code
app.post('/institution/register', async (req, res) => {
  try {
    const { error: validationError } = institutionRegisterSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const { name, email, contact, address } = req.body;

    if (db) {
      // Check for existing institution with same email in Firestore
      const institutionsRef = db.collection('institutions');
      const existingInstitution = await institutionsRef.where('email', '==', email).get();
      if (!existingInstitution.empty) {
        return res.status(409).json({ error: 'Institution with this email already exists' });
      }
    } else {
      // Check for existing institution with same email (in-memory)
      const existingInstitution = institutions.find(inst => inst.email === email);
      if (existingInstitution) {
        return res.status(409).json({ error: 'Institution with this email already exists' });
      }
    }

    // Generate unique institution code
    const institutionCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    // Create institution object
    const institution = {
      id: Date.now().toString(),
      name: name,
      email: email,
      contact: contact,
      address: address,
      institution_code: institutionCode,
      status: 'pending',
      created_at: db ? admin.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
    };

    if (db) {
      // Store in Firestore
      const institutionsRef = db.collection('institutions');
      await institutionsRef.doc(institution.id).set(institution);
    } else {
      // Store in memory
      institutions.push(institution);
    }

    // Send email with institution code (simplified for demo)
    console.log(`Institution Code for ${email}: ${institutionCode}`);

    res.json({
      success: true,
      institution: {
        id: institution.id,
        name: institution.name,
        email: institution.email,
        institution_code: institutionCode,
        status: institution.status
      },
      message: 'Institution registered successfully. Check console for institution code.'
    });
  } catch (error) {
    console.error('Institution registration error:', error);
    res.status(500).json({ error: 'Failed to register institution' });
  }
});

// POST /teacher/exam/upload - Upload question paper file
app.post('/teacher/exam/upload', authenticateTeacher, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileName = `${Date.now()}_${req.file.originalname}`;

    if (bucket) {
      const file = bucket.file(fileName);

      // Upload file to Firebase Storage
      await file.save(req.file.buffer, {
        metadata: {
          contentType: req.file.mimetype,
        },
        public: true,
      });

      // Get public URL
      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      res.json({
        success: true,
        fileUrl: fileUrl,
        fileName: fileName,
        message: 'File uploaded successfully'
      });
    } else {
      // Save file to local storage (demo)
      const filePath = path.join(UPLOAD_DIR, fileName);
      fs.writeFileSync(filePath, req.file.buffer);

      // Create file URL (local path for demo)
      const fileUrl = `/uploads/${fileName}`;

      res.json({
        success: true,
        fileUrl: fileUrl,
        fileName: fileName,
        message: 'File uploaded successfully'
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// POST /teacher/exam/create - Define exam details
app.post('/teacher/exam/create', authenticateTeacher, async (req, res) => {
  try {
    const { error: validationError } = examCreateSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    const { examTitle, subjectClass, examDateTime, duration, fileUrl } = req.body;

    // Create exam object
    const exam = {
      id: Date.now().toString(),
      exam_title: examTitle,
      subject_class: subjectClass,
      exam_date_time: new Date(examDateTime).toISOString(),
      duration: duration,
      file_url: fileUrl || null,
      institution_code: req.profile.institution_code,
      created_by: req.user.id,
      status: 'pending',
      created_at: db ? admin.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
    };

    if (db) {
      // Store in Firestore
      const examsRef = db.collection('exams');
      await examsRef.doc(exam.id).set(exam);
    } else {
      // Store in memory
      exams.push(exam);
    }

    res.json({
      success: true,
      exam: exam,
      message: 'Exam created successfully and submitted for approval'
    });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

// GET /teacher/exams - Fetch list of scheduled exams
app.get('/teacher/exams', authenticateTeacher, async (req, res) => {
  try {
    let userExams = [];

    if (db) {
      // Fetch exams from Firestore
      const examsRef = db.collection('exams');
      const snapshot = await examsRef.where('created_by', '==', req.user.id).orderBy('created_at', 'desc').get();

      snapshot.forEach(doc => {
        userExams.push({ id: doc.id, ...doc.data() });
      });
    } else {
      // Fetch exams from in-memory storage
      userExams = exams.filter(exam => exam.created_by === req.user.id);
      // Sort by created_at descending
      userExams.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    res.json({
      success: true,
      exams: userExams,
      count: userExams.length
    });
  } catch (error) {
    console.error('Fetch exams error:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
