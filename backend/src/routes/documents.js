const express = require('express');
const multer = require('multer');
const path = require('path');
const { requireAuth, requireRole } = require('../middleware/auth');
const prisma = require('../prismaClient');

const router = express.Router();

const documentCategoryMap = {
administration: new Set([
  'photograph',
  'aadhaar',
  'sscMemo',
  'intermediateMemo',
  'transferCertificate',
  'bonafideCertificate',
  'passportSizePhotograph',
  'studentIdCard',
  'addressProof',
  'parentGuardianIdProof',
  'incomeCertificate',
  'casteCertificate',
  'residenceCertificate',
  'migrationCertificate',
  'admissionLetter',
  'feeReceipt',
  'semesterRegistrationDocuments'
]),
scholarship: new Set([
  'incomeCertificate',
  'casteCertificate',
  'bonafideCertificate',
  'aadhaar',
  'bankPassbook',
  'studentBankAccountDetails',
  'scholarshipApplicationForm',
  'feeReceipt',
  'academicMarksMemo',
  'previousScholarshipApprovalLetter',
  'passportSizePhoto',
  'parentIncomeProof'
]),
achievement: new Set(['academicCertificate', 'sportsCertificate', 'technicalCertificate']),
participation: new Set(['participationCertificate'])
};

function inferCategory(documentType, requestedCategory) {
  if (requestedCategory && documentCategoryMap[requestedCategory]) {
    return requestedCategory;
  }

  for (const [category, values] of Object.entries(documentCategoryMap)) {
    if (values.has(documentType)) {
      return category;
    }
  }

  return 'administration';
}

function buildDocumentUrl(fileName) {
  return `/uploads/${fileName}`;
}

function resolveFileResponse(document) {
  return {
    ...document,
    fileUrl: document.fileUrl || document.filePath,
    uploadDate: document.uploadDate || document.createdAt || null
  };
}

/* ---------------- MULTER CONFIG ---------------- */

const storage = multer.diskStorage({
destination: (req, file, cb) => {
cb(
null,
process.env.UPLOAD_DIR ||
path.join(__dirname, '../../uploads')
);
},

filename: (req, file, cb) => {
cb(
null,
`${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`
);
}
});

const upload = multer({
storage,

limits: {
fileSize: 8 * 1024 * 1024
},

fileFilter: (req, file, cb) => {
const allowed = [
'image/jpeg',
'image/png',
'application/pdf',
'image/jpg',
'application/msword',
'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

cb(null, allowed.includes(file.mimetype));

}
});

/* ---------------- UPLOAD DOCUMENTS ---------------- */

router.post(
'/upload',
requireAuth,
upload.fields([
{ name: 'photograph' },
{ name: 'aadhaar' },
{ name: 'sscMemo' },
{ name: 'intermediateMemo' },
{ name: 'transferCertificate' },
{ name: 'incomeCertificate' },
{ name: 'casteCertificate' },
{ name: 'DOBCertificate' },
{ name: 'rankCard' },
{ name: 'signature' },
{ name: 'sportsCertificate' },
{ name: 'academicCertificate' },
{ name: 'participationCertificate' },
{ name: 'bonafideCertificate' },
{ name: 'studentIdCard' },
{ name: 'addressProof' },
{ name: 'parentGuardianIdProof' },
{ name: 'residenceCertificate' },
{ name: 'migrationCertificate' },
{ name: 'admissionLetter' },
{ name: 'feeReceipt' },
{ name: 'bankPassbook' },
{ name: 'studentBankAccountDetails' },
{ name: 'scholarshipApplicationForm' },
{ name: 'academicMarksMemo' },
{ name: 'previousScholarshipApprovalLetter' },
{ name: 'passportSizePhoto' },
{ name: 'parentIncomeProof' },
{ name: 'technicalCertificate' }
]),
async (req, res, next) => {
try {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No files uploaded'
    });
  }

  const uploads = Object.entries(req.files).flatMap(
    ([documentType, items]) =>
      items.map((item) => ({
        documentType,
        documentCategory: inferCategory(documentType, req.body?.documentCategory),
        documentTitle: req.body?.documentTitle || documentType,
        fileName: item.filename,
        filePath: buildDocumentUrl(item.filename),
        fileUrl: buildDocumentUrl(item.filename),
        fileType: item.mimetype,
        fileSize: item.size,
        uploadedBy: req.user?.email || String(req.user?.id || ''),
        isMandatory: Boolean(req.body?.isMandatory)
      }))
  );

  const records = await Promise.all(
    uploads.map((record) =>
      prisma.uploadedDocument.create({
        data: {
          ...record,
          studentId: req.user.id
        }
      })
    )
  );

  await prisma.admissionStatus.upsert({
    where: {
      studentId: req.user.id
    },

    update: {
      documentStatus: 'uploaded'
    },

    create: {
      studentId: req.user.id,
      applicationStatus: 'submitted',
      documentStatus: 'uploaded'
    }
  });

  await prisma.notification.create({
    data: {
      studentId: req.user.id,
      title: 'Document Uploaded',
      message:
        'Your documents were uploaded successfully.'
    }
  });

  await prisma.activityLog.create({
    data: {
      action: 'Document Uploaded',
      performedBy: req.user.id,
      studentId: req.user.id
    }
  });

  res.json({
    success: true,
    documents: records.map(resolveFileResponse)
  });

} catch (error) {
  next(error);
}

}
);

/* ---------------- MY DOCUMENTS ---------------- */

router.get(
'/my-list',
requireAuth,
async (req, res, next) => {
try {
  const documents =
    await prisma.uploadedDocument.findMany({
      where: {
        studentId: req.user.id
      },
      orderBy: {
        uploadDate: 'desc'
      }
    });

  res.json({
    success: true,
    documents: documents.map(resolveFileResponse)
  });

} catch (error) {
  next(error);
}

}
);

/* ---------------- DOCUMENT DETAILS ---------------- */

router.get(
'/:id',
requireAuth,
async (req, res, next) => {
try {
  const document =
    await prisma.uploadedDocument.findUnique({
      where: {
        id: Number(req.params.id)
      }
    });

  if (!document) {
    return res.status(404).json({
      success: false,
      error: 'Document not found'
    });
  }

  res.json({
    success: true,
    document: resolveFileResponse(document)
  });

} catch (error) {
  next(error);
}


}
);

/* ---------------- UPDATE DOCUMENT ---------------- */

router.put(
'/:id',
requireAuth,
upload.single('file'),
async (req, res, next) => {
try {
  const document = await prisma.uploadedDocument.findUnique({ where: { id: Number(req.params.id) } });

  if (!document) {
    return res.status(404).json({ success: false, error: 'Document not found' });
  }

  if (document.studentId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  const updateData = {
    documentType: req.body.documentType || document.documentType,
    documentCategory: req.body.documentCategory || document.documentCategory,
    documentTitle: req.body.documentTitle || document.documentTitle,
    verificationStatus: req.body.verificationStatus || document.verificationStatus,
    verificationNotes: req.body.verificationNotes ?? document.verificationNotes,
    isMandatory: req.body.isMandatory !== undefined ? req.body.isMandatory === 'true' || req.body.isMandatory === true : document.isMandatory
  };

  if (req.file) {
    updateData.fileName = req.file.filename;
    updateData.filePath = buildDocumentUrl(req.file.filename);
    updateData.fileUrl = buildDocumentUrl(req.file.filename);
    updateData.fileType = req.file.mimetype;
    updateData.fileSize = req.file.size;
  }

  const updated = await prisma.uploadedDocument.update({
    where: { id: document.id },
    data: updateData
  });

  res.json({ success: true, document: resolveFileResponse(updated) });
} catch (error) {
  next(error);
}
}
);

/* ---------------- DELETE DOCUMENT ---------------- */

router.delete(
'/:id',
requireAuth,
async (req, res, next) => {
try {
  const document = await prisma.uploadedDocument.findUnique({ where: { id: Number(req.params.id) } });

  if (!document) {
    return res.status(404).json({ success: false, error: 'Document not found' });
  }

  if (document.studentId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  await prisma.uploadedDocument.delete({ where: { id: document.id } });

  res.json({ success: true, message: 'Document deleted successfully' });
} catch (error) {
  next(error);
}
}
);

/* ---------------- DOCUMENTS BY CATEGORY ---------------- */

router.get(
'/categories/:category',
requireAuth,
async (req, res, next) => {
try {
  const { category } = req.params;
  const validCategories = ['administration', 'scholarship', 'achievement', 'participation'];

  if (!validCategories.includes(category)) {
    return res.status(400).json({ success: false, error: 'Invalid document category' });
  }

  const documents = await prisma.uploadedDocument.findMany({
    where: {
      studentId: req.user.id,
      OR: [
        { documentCategory: category },
        { documentType: { in: Array.from(documentCategoryMap[category] || []) } }
      ]
    },
    orderBy: {
      uploadDate: 'desc'
    }
  });

  res.json({ success: true, category, documents });
} catch (error) {
  next(error);
}
}
);

/* ---------------- STUDENT LOOKUP BY ROLL NUMBER ---------------- */

router.get(
'/student/lookup',
requireAuth,
async (req, res, next) => {
try {
  const rollNumber = String(req.query.rollNumber || '').trim();
  if (!rollNumber) {
    return res.status(400).json({ success: false, error: 'Roll number is required' });
  }

  const student = await prisma.student.findUnique({
    where: { rollNumber },
    include: {
      batch: true,
      supervisor: true,
      academicDetails: true,
      admissionForm: true,
      uploadedDocuments: true,
      admissionStatus: true,
      scholarships: { include: { scholarship: true } },
      achievements: true
    }
  });

  if (!student) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }

  res.json({ success: true, student });
} catch (error) {
  next(error);
}
}
);

/* ---------------- VERIFY DOCUMENT ---------------- */

router.post(
'/:id/verify',
requireAuth,
requireRole('admin'),
async (req, res, next) => {
try {
  const { status, notes } = req.body;

  if (
    !['approved', 'rejected', 'pending']
      .includes(status)
  ) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status'
    });
  }

  const document =
    await prisma.uploadedDocument.update({
      where: {
        id: Number(req.params.id)
      },
      data: {
        verificationStatus: status,
        verificationNotes: notes || null
      }
    });

  await prisma.notification.create({
    data: {
      studentId: document.studentId,
      title:
        status === 'approved'
          ? 'Document Approved'
          : 'Document Rejected',

      message:
        status === 'approved'
          ? 'Your document has been approved.'
          : 'Your document has been rejected. Please review the remarks.'
    }
  });

  await prisma.activityLog.create({
    data: {
      action: `Document ${status}`,
      performedBy: req.user.id,
      studentId: document.studentId,
      details: notes || null
    }
  });

  res.json({
    success: true,
    document
  });

} catch (error) {
  next(error);
}

}
);


module.exports = router;
