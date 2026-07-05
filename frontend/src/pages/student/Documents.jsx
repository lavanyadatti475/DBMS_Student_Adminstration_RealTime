import { useEffect, useMemo, useState } from 'react';
import api from '../../api/api';
import { UploadCloud, Eye, Download, Trash2, RefreshCw, FileText, FolderOpen } from 'lucide-react';

const CATEGORY_CONFIG = {
  administration: {
    title: 'Administration Documents',
    description: 'College admission and record documents.',
    fields: [
      { name: 'photograph', label: 'Passport Size Photograph' },
      { name: 'aadhaar', label: 'Aadhaar Card' },
      { name: 'sscMemo', label: 'SSC / 10th Marks Memo' },
      { name: 'intermediateMemo', label: 'Intermediate / 12th Marks Memo' },
      { name: 'transferCertificate', label: 'Transfer Certificate' },
      { name: 'bonafideCertificate', label: 'Bonafide Certificate' },
      { name: 'studentIdCard', label: 'Student ID Card' },
      { name: 'addressProof', label: 'Address Proof' },
      { name: 'parentGuardianIdProof', label: 'Parent / Guardian ID Proof' },
      { name: 'incomeCertificate', label: 'Income Certificate' },
      { name: 'casteCertificate', label: 'Caste Certificate' },
      { name: 'residenceCertificate', label: 'Residence Certificate' },
      { name: 'migrationCertificate', label: 'Migration Certificate' },
      { name: 'admissionLetter', label: 'Admission Letter' },
      { name: 'feeReceipt', label: 'Fee Receipt' },
      { name: 'semesterRegistrationDocuments', label: 'Semester Registration Documents' }
    ]
  },
  scholarship: {
    title: 'Scholarship Documents',
    description: 'Documents commonly required for scholarship applications.',
    fields: [
      { name: 'incomeCertificate', label: 'Income Certificate' },
      { name: 'casteCertificate', label: 'Caste Certificate' },
      { name: 'bonafideCertificate', label: 'Bonafide Certificate' },
      { name: 'aadhaar', label: 'Aadhaar Card' },
      { name: 'bankPassbook', label: 'Bank Passbook' },
      { name: 'studentBankAccountDetails', label: 'Student Bank Account Details' },
      { name: 'scholarshipApplicationForm', label: 'Scholarship Application Form' },
      { name: 'feeReceipt', label: 'Fee Receipt' },
      { name: 'academicMarksMemo', label: 'Academic Marks Memo' },
      { name: 'previousScholarshipApprovalLetter', label: 'Previous Scholarship Approval Letter' },
      { name: 'passportSizePhoto', label: 'Passport Size Photo' },
      { name: 'parentIncomeProof', label: 'Parent Income Proof' }
    ]
  },
  achievement: {
    title: 'Achievement Certificates',
    description: 'Academic, technical, cultural, and sports achievement certificates.',
    fields: [
      { name: 'academicCertificate', label: 'Academic Certificate' },
      { name: 'sportsCertificate', label: 'Sports Certificate' },
      { name: 'technicalCertificate', label: 'Technical Certificate' }
    ]
  },
  participation: {
    title: 'Participation Certificates',
    description: 'Participation certificates and event records.',
    fields: [
      { name: 'participationCertificate', label: 'Participation Certificate' }
    ]
  }
};

const CATEGORY_ORDER = ['administration', 'scholarship', 'achievement', 'participation'];

function getFileUrl(filePath) {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  return `http://localhost:5000${filePath}`;
}

function getCategoryForDoc(doc) {
  if (doc.documentCategory && CATEGORY_CONFIG[doc.documentCategory]) {
    return doc.documentCategory;
  }

  const field = doc.documentType || '';
  if (CATEGORY_CONFIG.administration.fields.some((item) => item.name === field)) return 'administration';
  if (CATEGORY_CONFIG.scholarship.fields.some((item) => item.name === field)) return 'scholarship';
  if (CATEGORY_CONFIG.achievement.fields.some((item) => item.name === field)) return 'achievement';
  if (CATEGORY_CONFIG.participation.fields.some((item) => item.name === field)) return 'participation';
  return 'administration';
}

export default function Documents() {
  const [files, setFiles] = useState({});
  const [status, setStatus] = useState("");
  const [activeTab, setActiveTab] = useState("administration");

  const documentGroups = {
  administration: [
    "Bonafide Certificate",
    "College ID Card",
    "Fee Receipt",
    "Transfer Certificate",
    "Migration Certificate",
    "No Due Certificate"
  ],

  scholarship: [
    "Scholarship Application Form",
    "Income Certificate",
    "Caste Certificate",
    "Bank Passbook",
    "Aadhaar Card",
    "Scholarship Sanction Letter"
  ],

  achievements: [
    "Sports Achievement Certificate",
    "Academic Topper Certificate",
    "Hackathon Winner Certificate",
    "Workshop Excellence Certificate",
    "Technical Event Winner Certificate",
    "National / State Level Achievement Certificate"
  ],

  participation: [
    "Hackathon Participation Certificate",
    "Workshop Participation Certificate",
    "Seminar Participation Certificate",
    "Conference Participation Certificate",
    "Technical Fest Participation Certificate",
    "Volunteer Participation Certificate"
  ]
};

  const handleChange = (e) => {
    setFiles((prev) => ({
      ...prev,
      [name]: files?.[0] || null
    }));
  };
  
  const handleUpload = async () => {
  try {
    const formData = new FormData();

    Object.entries(files).forEach(([key, file]) => {
      if (file) {
         formData.append("documents", file);

    formData.append(
      "category",
      activeTab
    );

    formData.append(
      "documentName",
      key
    );

  }

});

    const response = await api.post(
      "/documents/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.success) {
      setStatus("Documents uploaded successfully!");
    } else {
      setStatus("Upload failed.");
    }
  } catch (err) {
    console.error(err);
    setStatus("Upload failed.");
  }
};


  const activeDocs = documentsByCategory[activeCategory] || [];

  return (
    <div className="min-h-screen space-y-6 p-6 animate-fadeIn bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-4 py-2 text-sky-200">
              <FolderOpen size={16} />
              Uploaded Documents
            </div>
            <h1 className="mt-4 text-3xl font-bold text-white">Document Center</h1>
            <p className="mt-2 max-w-2xl text-slate-300">Manage administration, scholarship, achievement, and participation documents in separate sections.</p>
          </div>

          <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 px-4 py-3 text-sky-100">
            Supported: PDF, JPG, PNG, DOC, DOCX
          </div>
        </div>

<div className="mt-8 flex flex-wrap justify-center gap-4">

  <button
    onClick={() => setActiveTab("administration")}
    className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
      activeTab === "administration"
        ? "bg-blue-600 text-white shadow-lg"
        : "bg-white text-slate-700 hover:bg-blue-100"
    }`}
  >
    🏛 College Administration
  </button>

  <button
    onClick={() => setActiveTab("scholarship")}
    className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
      activeTab === "scholarship"
        ? "bg-emerald-600 text-white shadow-lg"
        : "bg-white text-slate-700 hover:bg-emerald-100"
    }`}
  >
    🎓 Scholarship
  </button>

  <button
    onClick={() => setActiveTab("achievements")}
    className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
      activeTab === "achievements"
        ? "bg-purple-600 text-white shadow-lg"
        : "bg-white text-slate-700 hover:bg-purple-100"
    }`}
  >
    🏆 Achievements
  </button>

  <button
    onClick={() => setActiveTab("participation")}
    className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
      activeTab === "participation"
        ? "bg-orange-600 text-white shadow-lg"
        : "bg-white text-slate-700 hover:bg-orange-100"
    }`}
  >
    🤝 Co-Participation
  </button>

</div>

<div className="mt-8 grid gap-4 md:grid-cols-2">
          {documentGroups[activeTab].map((name) => (
  <label
    key={name}
    className="
      block
      rounded-3xl
      border
      border-slate-200
      bg-white/90
      p-5
      shadow-md
      hover:shadow-xl
      hover:-translate-y-1
      transition-all
      duration-300
    "
  >
    <span className="font-semibold text-slate-800">
      {name}
    </span>

    <input
      type="file"
      name={name}
      accept="application/pdf,image/jpeg,image/png"
      onChange={handleChange}
      className="
        mt-4
        w-full
        rounded-lg
        border
        border-slate-300
        bg-slate-50
        px-3
        py-2
        text-slate-700
    dark:bg-slate-900
    dark:border-slate-600
    dark:text-white
        file:mr-4
        file:rounded-lg
        file:border-0
        file:bg-blue-600
        file:px-4
        file:py-2
        file:text-white
        hover:file:bg-blue-700
      "
    />
  </label>
))}

</div> {/* <-- Close the grid here */}

<div className="mt-8 text-center">
  <button
    onClick={handleUpload}
    className="rounded-3xl bg-blue-600 px-8 py-3 text-white font-semibold hover:bg-blue-700 transition"
>
  {activeTab === "administration" && "Upload College Documents"}
  {activeTab === "scholarship" && "Upload Scholarship Documents"}
  {activeTab === "achievements" && "Upload Achievement Documents"}
  {activeTab === "participation" && "Upload Participation Documents"}
</button>
</div>
        {status && (
          <div className="mt-4 rounded-xl border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700 p-4 text-green-700 dark:text-green-300">
            {status}
          </div>
          
        )}
      </section>
    </div>
  );
}
