
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import { UserModel, ClassModel, AttendanceModel, SessionModel } from './models';

dotenv.config();

const seed = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected.');

        console.log('Clearing database...');
        await UserModel.deleteMany({});
        await ClassModel.deleteMany({});
        await AttendanceModel.deleteMany({});
        await SessionModel.deleteMany({});
        console.log('Cleared.');

        const hashedPassword = await bcrypt.hash('password123', 10);

        console.log('Creating Admin...');
        const admin = new UserModel({
            name: "Admin User",
            email: "admin@edu.com",
            password: hashedPassword,
            role: "ADMIN"
        });
        await admin.save();

        console.log('Creating Teacher...');
        const teacher = new UserModel({
            name: "Dr. Robert King",
            email: "teacher@edu.com",
            password: hashedPassword,
            role: "TEACHER"
        });
        await teacher.save();

        console.log('Creating Student...');
        const student = new UserModel({
            name: "Alice Thompson",
            email: "student@edu.com",
            password: hashedPassword,
            role: "STUDENT",
            attendancePercentage: 85
        });
        await student.save();

        console.log('Creating Class...');
        const class1 = new ClassModel({
            name: "CS-101 Introduction to CS",
            teacherId: teacher._id,
            studentIds: [student._id],
            schedule: "Mon, Wed 10:00 AM"
        });
        await class1.save();

        console.log('Creating Attendance Record...');
        const att = new AttendanceModel({
            classId: class1._id,
            studentId: student._id,
            method: 'MANUAL',
            status: 'PRESENT'
        });
        await att.save();

        console.log('Seeding successful!');
        process.exit(0);
    } catch (err: any) {
        console.error('SEEDING FAILED:', err);
        fs.writeFileSync('seed_error.txt', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        process.exit(1);
    }
};

seed();
