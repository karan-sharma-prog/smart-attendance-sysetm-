
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  classId?: string;
  attendancePercentage?: number;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  studentIds: string[];
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  method: 'FACE' | 'QR' | 'MANUAL';
  timestamp: string;
}

export interface Session {
  id: string;
  classId: string;
  startTime: string;
  expiryTime: string;
  qrToken: string;
  isActive: boolean;
}
