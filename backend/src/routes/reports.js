const express = require('express');
const { Parser } = require('json2csv');
const pdf = require('html-pdf');
const { requireAuth, requireRole } = require('../middleware/auth');
const prisma = require('../prismaClient');

const router = express.Router();

router.get('/admissions/csv', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const records = await prisma.student.findMany({ include: { admissionForm: true, admissionStatus: true } });
    const fields = ['id', 'rollNumber', 'fullName', 'email', 'mobile', 'admissionForm.course', 'admissionForm.branch', 'admissionStatus.applicationStatus'];
    const parser = new Parser({ fields });
    const csv = parser.parse(records.map(r => ({
      id: r.id,
      rollNumber: r.rollNumber,
      fullName: r.fullName,
      email: r.email,
      mobile: r.mobile,
      'admissionForm.course': r.admissionForm?.course || '',
      'admissionForm.branch': r.admissionForm?.branch || '',
      'admissionStatus.applicationStatus': r.admissionStatus?.applicationStatus || ''
    })));
    res.header('Content-Type', 'text/csv');
    res.attachment('admissions-report.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

router.get('/admissions/pdf', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const records = await prisma.student.findMany({ include: { admissionForm: true, admissionStatus: true } });
    const html = `
      <html><body><h1>Admissions Report</h1><table border="1" cellpadding="8" cellspacing="0"><thead><tr><th>Roll Number</th><th>Name</th><th>Email</th><th>Course</th><th>Branch</th><th>Status</th></tr></thead><tbody>${records.map(r => `<tr><td>${r.rollNumber || ''}</td><td>${r.fullName}</td><td>${r.email}</td><td>${r.admissionForm?.course || 'N/A'}</td><td>${r.admissionForm?.branch || 'N/A'}</td><td>${r.admissionStatus?.applicationStatus || 'N/A'}</td></tr>`).join('')}</tbody></table></body></html>`;
    pdf.create(html, {}).toBuffer((err, buffer) => {
      if (err) return next(err);
      res.header('Content-Type', 'application/pdf');
      res.attachment('admissions-report.pdf');
      res.send(buffer);
    });
  } catch (error) {
    next(error);
  }
});

router.get("/students-csv", async(req,res)=>{

 const students =
 await prisma.student.findMany();

 const parser = new Parser();

 const csv = parser.parse(students);

 res.header(
   "Content-Type",
   "text/csv"
 );

 res.attachment("students.csv");

 return res.send(csv);
});

module.exports = router;
