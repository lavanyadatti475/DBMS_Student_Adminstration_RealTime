const express = require('express');
const { z } = require('zod');
const { requireAuth } = require('../middleware/auth');
const prisma = require('../prismaClient');
const validate = require('../middleware/validate');

const router = express.Router();

const profileSchema = z.object({
fullName: z.string().min(3).optional(),
rollNumber: z.string().optional(),
dob: z.string().optional(),
gender: z.string().optional(),
bloodGroup: z.string().optional(),
nationality: z.string().optional(),
religion: z.string().optional(),
category: z.string().optional(),
mobile: z.string().min(10).max(16).optional(),
address: z.string().optional(),
guardianName: z.string().optional(),
guardianOccupation: z.string().optional(),
guardianIncome: z.string().optional(),
emergencyContact: z.string().optional()
});

/* GET STUDENT PROFILE */
router.get('/me', requireAuth, async (req, res, next) => {
try {
const student = await prisma.student.findUnique({
where: {
id: req.user.id
},
include: {
academicDetails: true,
admissionForm: true,
uploadedDocuments: true,
notifications: true,
admissionStatus: true
}
});


if (!student) {
  return res.status(404).json({
    success: false,
    error: 'Student not found'
  });
}

res.json({
  success: true,
  student
});


} catch (error) {
next(error);
}
});

/* UPDATE PROFILE */
router.put(
'/me',
requireAuth,
validate(profileSchema),
async (req, res, next) => {
try {

  const student =
    await prisma.student.update({
      where: {
        id: req.user.id
      },
      data: req.body
    });

  await prisma.activityLog.create({
    data: {
      action: 'Profile Updated',
      performedBy: req.user.id,
      studentId: req.user.id
    }
  });

  res.json({
    success: true,
    student
  });

} catch (error) {
  next(error);
}

}
);

/* DASHBOARD DATA */
router.get('/dashboard', requireAuth, async (req, res, next) => {
try {

const student = await prisma.student.findUnique({
  where: {
    id: req.user.id
  },
  include: {
    admissionForm: true,
    uploadedDocuments: true,
    notifications: true,
    admissionStatus: true
  }
});

if (!student) {
  return res.status(404).json({
    success: false,
    error: 'Student not found'
  });
}

const profilePhoto =
  student.uploadedDocuments.find(
    (doc) => doc.documentType === 'photograph'
  );

const completion = Math.min(
  100,
  Math.round(
    (
      [
        'fullName',
        'emailVerified',
        'dob',
        'gender',
        'mobile',
        'address'
      ].filter((key) => student[key]).length / 6
    ) * 100
  )
);

res.json({
  success: true,
  data: {

    fullName: student.fullName,
    rollNumber: student.rollNumber,
    email: student.email,

    course:
      student.admissionForm?.course || 'N/A',

    branch:
      student.admissionForm?.branch || 'N/A',

    profilePhoto:
      profilePhoto?.filePath || null,

    applicationStatus:
      student.admissionStatus?.applicationStatus ||
      'draft',

    documentsUploaded:
      student.uploadedDocuments.length,

    uploadedDocuments:
      student.uploadedDocuments,

    verificationProgress:
      student.admissionStatus?.documentStatus ||
      'pending',

    notifications:
      (student.notifications || []).slice(0, 5),

    profileCompletion:
      completion
  }
});


} catch (error) {
next(error);
}
});

module.exports = router;
