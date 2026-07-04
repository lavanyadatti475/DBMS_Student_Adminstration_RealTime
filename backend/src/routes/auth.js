const express = require('express');
const { z } = require('zod');
const prisma = require('../prismaClient');
const validate = require('../middleware/validate');
const { hashPassword, comparePassword } = require('../utils/hash');
const { authTokens, createToken, verifyToken } = require('../utils/token');
const { sendEmail, buildVerificationEmail, buildPasswordResetEmail } = require('../services/emailService');

const router = express.Router();

const canSendEmails = Boolean(
  process.env.EMAIL_HOST &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS &&
  !process.env.EMAIL_USER.includes('your-mail-username') &&
  !process.env.EMAIL_PASS.includes('your-mail-password')
);

const registerSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  mobile: z.string().min(10).max(16),
  rollNumber: z.string().min(3).optional(),
  password: z.string().min(8).regex(/(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])/, 'Password must include upper, lower, and number'),
  confirmPassword: z.string().min(8)
}).refine(data => data.password === data.confirmPassword, { message: 'Passwords must match', path: ['confirmPassword'] });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const forgotSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({ token: z.string(), password: z.string().min(8), confirmPassword: z.string().min(8) }).refine(data => data.password === data.confirmPassword, { message: 'Passwords must match', path: ['confirmPassword'] });

async function generateUniqueRollNumber() {
  const yearPrefix = new Date().getFullYear().toString().slice(-2);
  let rollNumber = '';
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    rollNumber = `RN${yearPrefix}${suffix}`;
    const existing = await prisma.student.findUnique({ where: { rollNumber } });
    isUnique = !existing;
    attempts += 1;
  }

  if (!isUnique) {
    throw new Error('Unable to generate unique roll number');
  }

  return rollNumber;
}

router.post('/register', validate(registerSchema), async (req, res, next) => {
  const { fullName, email, mobile, password, rollNumber: providedRollNumber } = req.body;
  try {
    const existing = await prisma.student.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ success: false, error: 'Email already registered' });

    const hashed = await hashPassword(password);
    const verificationToken = canSendEmails ? createToken({ email }, process.env.JWT_SECRET, '1d') : null;
    const rollNumber = providedRollNumber?.trim() || await generateUniqueRollNumber();
    const rollNumberConflict = await prisma.student.findUnique({ where: { rollNumber } });
    if (rollNumberConflict) {
      return res.status(409).json({ success: false, error: 'Roll number already registered' });
    }
    const student = await prisma.student.create({
      data: {
        rollNumber,
        fullName,
        email,
        mobile,
        passwordHash: hashed,
        role: 'student',
        emailVerified: !canSendEmails,
        verificationToken
      }
    });

    if (canSendEmails) {
      try {
        const emailPayload = buildVerificationEmail(fullName, student.verificationToken);
        await sendEmail({ to: email, ...emailPayload });
      } catch (emailError) {
        console.warn('Email send failed during registration:', emailError.message || emailError);
        return res.status(201).json({
          success: true,
          message: 'Registration successful. Verification email could not be sent; please contact support or try again later.'
        });
      }
    }

    const message = canSendEmails
      ? 'Registration successful. Verify your email.'
      : 'Registration successful. Email is not configured, so your account is already verified for development.';

    res.status(201).json({ success: true, message });
  } catch (error) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'Roll number or email already exists' });
    }
    next(error);
  }
});

router.post('/verify-email', validate(z.object({ token: z.string() })), async (req, res, next) => {
  const { token } = req.body;
  try {
    const payload = verifyToken(token, process.env.JWT_SECRET);
    const student = await prisma.student.updateMany({ where: { email: payload.email, emailVerified: false }, data: { emailVerified: true, verificationToken: null } });
    if (student.count === 0) return res.status(400).json({ success: false, error: 'Invalid or expired verification link' });
    res.json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  const { email, password } = req.body;
  try {
    let user = await prisma.student.findUnique({ where: { email } });
    let userType = 'student';

    if (!user) {
      user = await prisma.admin.findUnique({ where: { email } });
      userType = 'admin';
    }

    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    if (userType === 'student' && !user.emailVerified) return res.status(403).json({ success: false, error: 'Please verify your email before login' });

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const tokens = authTokens(user);
    res.cookie('token', tokens.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 2 * 60 * 60 * 1000 });
    res.json({ success: true, user: { id: user.id, rollNumber: user.rollNumber, fullName: user.fullName, email: user.email, mobile: user.mobile, role: user.role }, ...tokens });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) return res.status(401).json({ success: false, error: 'Refresh token required' });

    const payload = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const student = await prisma.student.findUnique({ where: { id: payload.id } });
    if (!student) return res.status(401).json({ success: false, error: 'Invalid refresh token' });

    const tokens = authTokens(student);
    res.json({ success: true, ...tokens });
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', validate(forgotSchema), async (req, res, next) => {
  try {
    const { email } = req.body;
    const student = await prisma.student.findUnique({ where: { email } });
    if (!student) return res.status(200).json({ success: true, message: 'If your email exists, reset instructions were sent.' });

    const token = createToken({ id: student.id, email }, process.env.REFRESH_TOKEN_SECRET, '1h');
    await prisma.student.update({ where: { email }, data: { passwordResetToken: token, passwordResetExpires: new Date(Date.now() + 3600000) } });

    const emailPayload = buildPasswordResetEmail(student.fullName, token);
    await sendEmail({ to: email, ...emailPayload });
    res.json({ success: true, message: 'Password reset instructions sent.' });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', validate(resetSchema), async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const payload = verifyToken(token, process.env.REFRESH_TOKEN_SECRET);
    const student = await prisma.student.findUnique({ where: { id: payload.id } });
    if (!student || student.passwordResetToken !== token || student.passwordResetExpires < new Date()) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }

    const hashed = await hashPassword(password);
    await prisma.student.update({ where: { id: student.id }, data: { passwordHash: hashed, passwordResetToken: null, passwordResetExpires: null } });
    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
