import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sanitizeString, sanitizeAmount } from '@/lib/security';
import { logSecurityEvent } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = body.name?.trim();
    const email = body.email?.trim()?.toLowerCase();
    const password = body.password;
    const university = body.university?.trim();
    const major = body.major?.trim();
    const semester = parseInt(body.semester) || 1;

    // Robust Validation
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Semua field wajib diisi' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: 'Password harus minimal 8 karakter' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Format email tidak valid' }, { status: 400 });
    }

    if (semester < 1 || semester > 14) {
      return NextResponse.json({ message: 'Semester tidak valid' }, { status: 400 });
    }

    await dbConnect();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: sanitizeString(name),
      email: email,
      password: hashedPassword,
      university: sanitizeString(university),
      major: sanitizeString(major),
      semester: semester,
    });

    await logSecurityEvent(user._id.toString(), 'USER_REGISTER', `Email: ${email}`, req);

    return NextResponse.json(
      { message: 'User registered successfully', userId: user._id },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
