
/*
This is a reference implementation of the backend as requested in the prompt.
To run this in a real environment, you would use Express, Mongoose, and JWT.
*/

import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Schemas
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'TEACHER', 'STUDENT'], required: true },
  classId: String,
  faceEncoding: Array // Store 128-d face encodings
});

const AttendanceSchema = new mongoose.Schema({
  classId: mongoose.Schema.Types.ObjectId,
  studentId: mongoose.Schema.Types.ObjectId,
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE'], default: 'PRESENT' },
  method: { type: String, enum: ['FACE', 'QR', 'MANUAL'], required: true }
});

const UserModel = mongoose.model('User', UserSchema);
const AttendanceModel = mongoose.model('Attendance', AttendanceSchema);

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
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');
  res.send({ user, token });
});

app.post('/api/teacher/mark-attendance', auth, async (req, res) => {
  // Logic to prevent duplicate marking
  const existing = await AttendanceModel.findOne({
    studentId: req.body.studentId,
    date: { $gte: new Date().setHours(0,0,0,0) }
  });
  if (existing) return res.status(400).send('Attendance already marked');
  
  const record = new AttendanceModel(req.body);
  await record.save();
  res.send(record);
});

// Start Server (Conceptual)
// app.listen(5000, () => console.log("Server running"));
