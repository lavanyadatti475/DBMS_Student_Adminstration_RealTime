const express = require('express');
const prisma = require('../prismaClient');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

function deriveBatchLabel(rollNumber) {
  const match = String(rollNumber || '').match(/^(\d{2})/);
  if (!match) {
    return null;
  }

  const startYear = 2000 + Number(match[1]);
  return `${startYear}-${startYear + 4}`;
}
router.get('/dashboard', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {

    console.log("===== DASHBOARD API HIT =====");

    const totalStudents = await prisma.student.count();
    console.log("totalStudents =", totalStudents);

    const applicationsReceived = await prisma.admissionForm.count();
    console.log("applicationsReceived =", applicationsReceived);

    const statuses = await prisma.admissionStatus.findMany();
    console.log("STATUSES:");
    console.log(statuses);

    const pendingVerification = await prisma.admissionStatus.count({
      where: { documentStatus: 'uploaded' }
    });

    const approved = await prisma.admissionStatus.count({
      where: { applicationStatus: 'approved' }
    });

    const rejected = await prisma.admissionStatus.count({
      where: { applicationStatus: 'rejected' }
    });

    console.log({
      totalStudents,
      applicationsReceived,
      pendingVerification,
      approved,
      rejected
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysRegistrations = await prisma.student.count({
      where: {
        createdAt: { gte: today }
      }
    });
    const branchDistribution = await prisma.$queryRaw`
  SELECT branch, CAST(COUNT(*) AS INTEGER) AS count
  FROM "AdmissionForm"
  GROUP BY branch
  ORDER BY count DESC
`;

const monthlyRegistrations = await prisma.$queryRaw`
  SELECT DATE_TRUNC('month', "createdAt") AS month,
         CAST(COUNT(*) AS INTEGER) AS count
  FROM "Student"
  GROUP BY month
  ORDER BY month
`;

const approvalRate =
  approved + rejected > 0
    ? Math.round((approved / (approved + rejected)) * 100)
    : 0;

const categoryDistribution = await prisma.$queryRaw`
  SELECT category, CAST(COUNT(*) AS INTEGER) AS count
  FROM "Student"
  GROUP BY category
  ORDER BY count DESC
`;

const academicCertificates = await prisma.uploadedDocument.findMany({
  where: {
    documentType: "academicCertificate"
  },
  include: {
    student: {
      include: {
        admissionForm: true
      }
    }
  },
  orderBy: {
    id: "desc"
  }
});

const sportsCertificates = await prisma.uploadedDocument.findMany({
  where: {
    documentType: "sportsCertificate"
  },
  include: {
    student: {
      include: {
        admissionForm: true
      }
    }
  },
  orderBy: {
    id: "desc"
  }
});

res.json({
  success: true,
  summary: {
    totalStudents,
    applicationsReceived,
    pendingVerification,
    approved,
    rejected,
    todaysRegistrations,
    approvalRate
  },
  charts: {
    branchDistribution,
    monthlyRegistrations,
    categoryDistribution
  },
  academicCertificates,
  sportsCertificates
});
    
  } catch (error) {
    next(error);
  }
});

router.get('/applications', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { search, branch, status, category, fromDate, toDate, page = 1, limit = 20 } = req.query;
    const where = {
      OR: search ? [{fullName:{contains:search,mode:"insensitive" }},{email:{contains:search,mode:"insensitive" }},{mobile:{contains:search,mode:"insensitive" }},{id:isNaN(search)? undefined: Number(search)} ] : undefined,
      admissionForm: branch ? { branch } : undefined,
      admissionStatus: status ? { applicationStatus: status } : undefined,
      category: category || undefined,
      createdAt: fromDate || toDate ? {
        gte: fromDate ? new Date(fromDate) : undefined,
        lte: toDate ? new Date(toDate) : undefined
      } : undefined
    };

    const applications = await prisma.student.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: { admissionForm: true, admissionStatus: true, batch: true, supervisor: true }
    });

    res.json({
      success: true,
      applications: applications.map((student) => ({
        ...student,
        batchLabel: student.batch?.name || deriveBatchLabel(student.rollNumber),
        branchLabel: student.admissionForm?.branch || 'N/A'
      }))
    });
  } catch (error) {
    next(error);
  }
});

router.post('/applications/bulk', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { action, ids } = req.body;
    if (!['approve', 'reject'].includes(action) || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, error: 'Invalid bulk action' });
    }

    const status = action === 'approve' ? 'approved' : 'rejected';
    const updates = await prisma.admissionStatus.updateMany({
      where: { studentId: { in: ids } },
      data: { applicationStatus: status }
    });
    res.json({ success: true, count: updates.count });
  } catch (error) {
    next(error);
  }
});

router.get('/applications/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
      include: {
        academicDetails: true,
        admissionForm: true,
        uploadedDocuments: true,
        admissionStatus: true,
        batch: true,
        supervisor: true
      }
    });
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student application not found' });
    }
    res.json({
      success: true,
      student: {
        ...student,
        batchLabel: student.batch?.name || deriveBatchLabel(student.rollNumber),
        branchLabel: student.admissionForm?.branch || 'N/A'
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/applications', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const {
      fullName, email,rollNumber, mobile, password = 'Student@1234',
      dob, gender, bloodGroup, nationality, religion, category, address,
      guardianName, guardianOccupation, guardianIncome, emergencyContact,
      
      // Academic
      secondarySchool, secondaryBoard, secondaryPercentage, secondaryYear,
      intermediateCollege, intermediateBoard, intermediatePercentage, intermediateYear,
      examName, examRank, examScore, examYear,

      // Admission Form
      course, branch, admissionCategory, hostelRequired = false, scholarshipRequired = false,
      previousInstitution, applicationStatus = 'submitted'
    } = req.body;

    if (!fullName || !email || !mobile || !course || !branch || !admissionCategory) {
      return res.status(400).json({ success: false, error: 'Missing required fields (fullName, email, mobile, course, branch, admissionCategory)' });
    }

    const existing = await prisma.student.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const rollNumber = req.body.rollNumber || `RN${new Date().getFullYear().toString().slice(-2)}${Math.floor(1000 + Math.random() * 9000)}`;
    const rollNumberConflict = await prisma.student.findUnique({ where: { rollNumber } });
    if (rollNumberConflict) {
      return res.status(409).json({ success: false, error: 'Roll number already registered' });
    }

    const { hashPassword } = require('../utils/hash');
    const hashed = await hashPassword(password);

    const student = await prisma.$transaction(async (tx) => {
      const newStudent = await tx.student.create({
        data: {
          rollNumber,
          fullName,
          email,
          rollNumber,
          mobile,
          passwordHash: hashed,
          role: 'student',
          emailVerified: true,
          profileCompleted: true,
          dob,
          gender,
          bloodGroup,
          nationality,
          religion,
          category,
          address,
          guardianName,
          guardianOccupation,
          guardianIncome,
          emergencyContact
        }
      });

      await tx.academicDetail.create({
        data: {
          studentId: newStudent.id,
          secondarySchool,
          secondaryBoard,
          secondaryPercentage: secondaryPercentage ? parseFloat(secondaryPercentage) : null,
          secondaryYear: secondaryYear ? parseInt(secondaryYear) : null,
          intermediateCollege,
          intermediateBoard,
          intermediatePercentage: intermediatePercentage ? parseFloat(intermediatePercentage) : null,
          intermediateYear: intermediateYear ? parseInt(intermediateYear) : null,
          examName,
          examRank,
          examScore,
          examYear: examYear ? parseInt(examYear) : null
        }
      });

      await tx.admissionForm.create({
        data: {
          studentId: newStudent.id,
          course,
          branch,
          admissionCategory,
          hostelRequired: Boolean(hostelRequired),
          scholarshipRequired: Boolean(scholarshipRequired),
          previousInstitution,
          declarationAccepted: true,
          draft: false,
          submittedAt: new Date(),
          status: 'submitted'
        }
      });

      await tx.admissionStatus.create({
        data: {
          studentId: newStudent.id,
          applicationStatus,
          documentStatus: 'pending'
        }
      });

      return newStudent;
    });

    res.status(201).json({
      success: true,
      student: {
        ...student,
        batchLabel: deriveBatchLabel(student.rollNumber),
        branchLabel: branch
      }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/applications/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = Number(id);

    const {
      fullName, email,rollNumber,mobile, password,
      dob, gender, bloodGroup, nationality, religion, category, address,
      guardianName, guardianOccupation, guardianIncome, emergencyContact,
      
      // Academic
      secondarySchool, secondaryBoard, secondaryPercentage, secondaryYear,
      intermediateCollege, intermediateBoard, intermediatePercentage, intermediateYear,
      examName, examRank, examScore, examYear,

      // Admission Form
      course, branch, admissionCategory, hostelRequired, scholarshipRequired,
      previousInstitution, applicationStatus
    } = req.body;

    const studentExists = await prisma.student.findUnique({ where: { id: studentId } });
    if (!studentExists) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    if (email && email !== studentExists.email) {
      const emailConflict = await prisma.student.findUnique({ where: { email } });
      if (emailConflict) {
        return res.status(409).json({ success: false, error: 'Email already in use' });
      }
    }

    let updatedPasswordHash = undefined;
    if (password) {
      const { hashPassword } = require('../utils/hash');
      updatedPasswordHash = await hashPassword(password);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedStudent = await tx.student.update({
        where: { id: studentId },
        data: {
          rollNumber: req.body.rollNumber || studentExists.rollNumber,
          fullName,
          email,
          rollNumber,
          mobile,
          passwordHash: updatedPasswordHash,
          dob,
          gender,
          bloodGroup,
          nationality,
          religion,
          category,
          address,
          guardianName,
          guardianOccupation,
          guardianIncome,
          emergencyContact
        }
      });

      await tx.academicDetail.upsert({
        where: { studentId },
        update: {
          secondarySchool,
          secondaryBoard,
          secondaryPercentage: secondaryPercentage !== undefined ? (secondaryPercentage ? parseFloat(secondaryPercentage) : null) : undefined,
          secondaryYear: secondaryYear !== undefined ? (secondaryYear ? parseInt(secondaryYear) : null) : undefined,
          intermediateCollege,
          intermediateBoard,
          intermediatePercentage: intermediatePercentage !== undefined ? (intermediatePercentage ? parseFloat(intermediatePercentage) : null) : undefined,
          intermediateYear: intermediateYear !== undefined ? (intermediateYear ? parseInt(intermediateYear) : null) : undefined,
          examName,
          examRank,
          examScore,
          examYear: examYear !== undefined ? (examYear ? parseInt(examYear) : null) : undefined
        },
        create: {
          studentId,
          secondarySchool,
          secondaryBoard,
          secondaryPercentage: secondaryPercentage ? parseFloat(secondaryPercentage) : null,
          secondaryYear: secondaryYear ? parseInt(secondaryYear) : null,
          intermediateCollege,
          intermediateBoard,
          intermediatePercentage: intermediatePercentage ? parseFloat(intermediatePercentage) : null,
          intermediateYear: intermediateYear ? parseInt(intermediateYear) : null,
          examName,
          examRank,
          examScore,
          examYear: examYear ? parseInt(examYear) : null
        }
      });

      if (course || branch || admissionCategory) {
        await tx.admissionForm.upsert({
          where: { studentId },
          update: {
            course,
            branch,
            admissionCategory,
            hostelRequired: hostelRequired !== undefined ? Boolean(hostelRequired) : undefined,
            scholarshipRequired: scholarshipRequired !== undefined ? Boolean(scholarshipRequired) : undefined,
            previousInstitution
          },
          create: {
            studentId,
            course: course || '',
            branch: branch || '',
            admissionCategory: admissionCategory || '',
            hostelRequired: Boolean(hostelRequired),
            scholarshipRequired: Boolean(scholarshipRequired),
            previousInstitution,
            declarationAccepted: true,
            draft: false,
            submittedAt: new Date(),
            status: 'submitted'
          }
        });
      }

      if (applicationStatus) {
        await tx.admissionStatus.upsert({
          where: { studentId },
          update: { applicationStatus },
          create: { studentId, applicationStatus, documentStatus: 'pending' }
        });
      }

      return updatedStudent;
    });

    res.json({
      success: true,
      student: {
        ...updated,
        batchLabel: deriveBatchLabel(updated.rollNumber),
        branchLabel: branch || updated.admissionForm?.branch || 'N/A'
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get(
 "/search",
 requireAuth,
 requireRole("admin"),
 async(req,res)=>{

 const {q}=req.query;

 const students=
 await prisma.student.findMany({

  where:{
   OR:[
    {
     fullName:{
      contains:q,
      mode:"insensitive"
     }
    },
    {
     email:{
      contains:q,
      mode:"insensitive"
     }
    },
    {
     mobile:{
      contains:q
     }
    },
    {
 rollNumber:{
  contains:q,
  mode:"insensitive"
 }
}
   ]
  }

 });

 res.json({
  success:true,
  students
 });
});

router.delete('/applications/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = Number(id);

    const studentExists = await prisma.student.findUnique({ where: { id: studentId } });
    if (!studentExists) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.academicDetail.deleteMany({ where: { studentId } });
      await tx.admissionForm.deleteMany({ where: { studentId } });
      await tx.uploadedDocument.deleteMany({ where: { studentId } });
      await tx.admissionStatus.deleteMany({ where: { studentId } });
      await tx.notification.deleteMany({ where: { studentId } });
      await tx.student.delete({ where: { id: studentId } });
    });

    res.json({ success: true, message: 'Student application deleted successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/activity', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const recentLogs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
    res.json({ success: true, recentLogs });
  } catch (error) {
    next(error);
  }
});

router.get(

'/student/:rollNumber',

requireAuth,

requireRole('admin'),

async(req,res)=>{

const student =
await prisma.student.findUnique({

where:{

rollNumber:
req.params.rollNumber

},

include:{

academicDetails:true,

admissionForm:true,

uploadedDocuments:true,

admissionStatus:true

}

})

if(!student){

return res.status(404).json({

success:false,

error:'Student not found'

})

}

res.json({

success:true,

student

})

});

module.exports = router;


