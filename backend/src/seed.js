require('dotenv').config();
const bcrypt = require('bcrypt');
const prisma = require('./prismaClient');

async function seed() {
  const password = await bcrypt.hash('SuperAdmin@2026', 12);

  await prisma.admin.upsert({
    where: { email: 'superadmin@sams.edu' },
    update: { fullName: 'SAMS Administrator', passwordHash: password, role: 'admin' },
    create: {
      fullName: 'SAMS Administrator',
      email: 'superadmin@sams.edu',
      passwordHash: password,
      role: 'admin'
    }
  });

  const student = await prisma.student.upsert({
    where: { email: 'student1@sams.edu' },
    update: {
      rollNumber: 'RN260001',
      passwordHash: await bcrypt.hash('Student@1234', 12),
      role: 'student',
      emailVerified: true
    },
    create: {
      rollNumber: 'RN260001',
      fullName: 'Tejaswiniprakash',
      email: 'student1@sams.edu',
      mobile: '6301594486',
      passwordHash: await bcrypt.hash('Student@1234', 12),
      role: 'student',
      emailVerified: true,
      profileCompleted: true,
      category: 'General'
    }
  });

  await prisma.admissionForm.upsert({
    where: { studentId: student.id },
    update: {
      course: 'B.Tech',
      branch: 'Computer Science',
      admissionCategory: 'General',
      hostelRequired: true,
      scholarshipRequired: false,
      declarationAccepted: true,
      draft: false,
      submittedAt: new Date(),
      status: 'submitted'
    },
    create: {
      studentId: student.id,
      course: 'B.Tech',
      branch: 'Computer Science',
      admissionCategory: 'General',
      hostelRequired: true,
      scholarshipRequired: false,
      declarationAccepted: true,
      draft: false,
      submittedAt: new Date(),
      status: 'submitted'
    }
  });

  await prisma.admissionStatus.upsert({
    where: { studentId: student.id },
    update: { applicationStatus: 'under-review', documentStatus: 'pending' },
    create: { studentId: student.id, applicationStatus: 'under-review', documentStatus: 'pending' }
  });

  console.log('Seed completed. Admin credentials: superadmin@sams.edu / SuperAdmin@2026');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
