
/*
This is a reference implementation of the backend as requested in the prompt.
To run this in a real environment, you would use Express, Mongoose, and JWT.
FIX: Switched to shard-00-01 (Primary) to allow writes.
*/

import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import { UserModel, ClassModel, AttendanceModel, SessionModel } from './models';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
const auth = (req: any, res: any, next: any) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send('Access Denied');
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};

// API Endpoints
app.post('/api/auth/register', async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = new UserModel({ ...req.body, password: hashedPassword });
  await user.save();
  res.send({ message: "User registered successfully" });
});

app.post('/api/auth/login', async (req, res) => {
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user || !await bcrypt.compare(req.body.password, user.password)) {
    return res.status(400).send('Invalid credentials');
  }
  const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'secret');
  res.send({
    user: { ...user.toObject(), id: user._id },
    token
  });
});

app.post('/api/teacher/mark-attendance', auth, async (req, res) => {
  // Logic to prevent duplicate marking
  const existing = await AttendanceModel.findOne({
    studentId: req.body.studentId,
    classId: req.body.classId,
    date: { $gte: new Date().setHours(0, 0, 0, 0) }
  });
  if (existing) return res.status(400).send('Attendance already marked');

  const record = new AttendanceModel(req.body);
  await record.save();
  res.send(record);
});

// --- NEW ENDPOINTS FOR DASHBOARDS ---

// Get User Profile
app.get('/api/auth/me', auth, async (req: any, res) => {
  const user = await UserModel.findById(req.user.id);
  if (!user) return res.status(404).send('User not found');
  res.send({ ...user.toObject(), id: user._id });
});

// Admin Dashboard Data
app.get('/api/dashboard/admin', auth, async (req: any, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).send('Access Denied');

  const totalStudents = await UserModel.countDocuments({ role: 'STUDENT' });
  const totalTeachers = await UserModel.countDocuments({ role: 'TEACHER' });
  const activeClasses = await ClassModel.countDocuments();

  // Recent users
  const recentUsersDocs = await UserModel.find().sort({ _id: -1 }).limit(5);
  const recentUsers = recentUsersDocs.map(u => ({ ...u.toObject(), id: u._id }));

  // Classes list
  const classes = await ClassModel.find().populate('teacherId', 'name');

  res.send({
    stats: {
      totalEnrollment: totalStudents,
      totalStaff: totalTeachers,
      activeClasses: activeClasses
    },
    recentUsers,
    classes: classes.map(c => ({
      id: c._id,
      name: c.name,
      teacher: (c.teacherId as any)?.name,
      students: c.studentIds.length
    }))
  });
});

// Teacher Dashboard Data
app.get('/api/dashboard/teacher', auth, async (req: any, res) => {
  if (req.user.role !== 'TEACHER') return res.status(403).send('Access Denied');

  const classes = await ClassModel.find({ teacherId: req.user.id });
  const totalStudents = classes.reduce((acc, curr) => acc + curr.studentIds.length, 0);

  // Mock attendance data for chart (can be aggregated real data in future)
  const attendanceData = [
    { name: 'Mon', attendance: 85 },
    { name: 'Tue', attendance: 78 },
    { name: 'Wed', attendance: 90 },
    { name: 'Thu', attendance: 82 },
    { name: 'Fri', attendance: 88 },
  ];

  res.send({
    stats: {
      activeClasses: classes.length,
      totalStudents
    },
    attendanceData,
    classes: classes.map(c => ({
      id: c._id,
      name: c.name,
      students: c.studentIds.length,
      time: c.schedule || '10:00 AM'
    }))
  });
});

// Student Dashboard Data
app.get('/api/dashboard/student', auth, async (req: any, res) => {
  if (req.user.role !== 'STUDENT') return res.status(403).send('Access Denied');

  const user = await UserModel.findById(req.user.id);
  const attendanceRecords = await AttendanceModel.find({ studentId: req.user.id }).populate('classId', 'name').sort({ date: -1 }).limit(10);

  // Calculate percentage (mock logic - in real app, separate query)
  const percentage = user?.attendancePercentage || 75;

  // Upcoming classes (all classes for now, filter by enrolment later)
  const classes = await ClassModel.find().populate('teacherId', 'name').limit(3);

  res.send({
    attendancePercentage: percentage,
    upcomingClasses: classes.map(c => ({
      id: c._id,
      name: c.name,
      teacher: (c.teacherId as any)?.name,
      time: c.schedule || '10:00 AM',
      room: 'Room 101' // mock
    })),
    history: attendanceRecords.map(r => ({
      sub: (r.classId as any)?.name || 'Unknown Class',
      date: new Date(r.date).toLocaleDateString(),
      method: r.method,
      status: r.status
    }))
  });
});

// SEED DATA ENDPOINT
app.post('/api/seed', async (req, res) => {
  await UserModel.deleteMany({});
  await ClassModel.deleteMany({});
  await AttendanceModel.deleteMany({});
  await SessionModel.deleteMany({});

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Admin
  await new UserModel({
    name: "Admin User",
    email: "admin@edu.com",
    password: hashedPassword,
    role: "ADMIN"
  }).save();

  // Teacher
  const teacher = await new UserModel({
    name: "Dr. Robert King",
    email: "teacher@edu.com",
    password: hashedPassword,
    role: "TEACHER"
  }).save();

  // Student
  const student = await new UserModel({
    name: "Alice Thompson",
    email: "student@edu.com",
    password: hashedPassword,
    role: "STUDENT",
    attendancePercentage: 85
  }).save();

  // Class
  const class1 = await new ClassModel({
    name: "CS-101 Introduction to CS",
    teacherId: teacher._id,
    studentIds: [student._id],
    schedule: "Mon, Wed 10:00 AM"
  }).save();

  // Attendance Record
  await new AttendanceModel({
    classId: class1._id,
    studentId: student._id,
    method: 'MANUAL',
    status: 'PRESENT'
  }).save();

  res.send({
    message: "Database seeded successfully", accounts: {
      admin: "admin@edu.com",
      teacher: "teacher@edu.com",
      student: "student@edu.com",
      password: "password123"
    }
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
