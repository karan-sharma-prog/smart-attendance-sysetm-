import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'TEACHER', 'STUDENT'], required: true },
    classId: { type: String }, // For students, which class they belong to (optional/multiple in future)
    faceEncoding: { type: Array, default: [] }, // Store 128-d face encodings
    attendancePercentage: { type: Number, default: 0 } // Cached/Calculated field
});

export const UserModel = mongoose.model('User', UserSchema);

// Class Schema
const ClassSchema = new mongoose.Schema({
    name: { type: String, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    schedule: { type: String } // e.g., "Mon, Wed 10:00 AM"
});

export const ClassModel = mongoose.model('Class', ClassSchema);

// Attendance Schema
const AttendanceSchema = new mongoose.Schema({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE'], default: 'PRESENT' },
    method: { type: String, enum: ['FACE', 'QR', 'MANUAL'], required: true }
});

export const AttendanceModel = mongoose.model('Attendance', AttendanceSchema);

// Session Schema (for active classes/QR codes)
const SessionSchema = new mongoose.Schema({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    startTime: { type: Date, default: Date.now },
    expiryTime: { type: Date, required: true },
    qrToken: { type: String, required: true },
    isActive: { type: Boolean, default: true }
});

export const SessionModel = mongoose.model('Session', SessionSchema);
