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
  const [activeCategory, setActiveCategory] = useState('administration');
  const [documents, setDocuments] = useState([]);
  const [uploadFiles, setUploadFiles] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setBusy(true);
        const res = await api.get('/documents/my-list');
        setDocuments(res.data.documents || []);
      } catch (err) {
        setError(err?.error || 'Unable to load documents.');
      } finally {
        setBusy(false);
      }
    };

    fetchDocuments();
  }, [refreshFlag]);

  const documentsByCategory = useMemo(() => {
    const grouped = {
      administration: [],
      scholarship: [],
      achievement: [],
      participation: []
    };

    documents.forEach((doc) => {
      grouped[getCategoryForDoc(doc)].push(doc);
    });

    return grouped;
  }, [documents]);

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    setUploadFiles((prev) => ({
      ...prev,
      [name]: files?.[0] || null
    }));
  };

  const handleUpload = async (category) => {
    try {
      setBusy(true);
      setError('');
      setMessage('');

      const config = CATEGORY_CONFIG[category];
      const formData = new FormData();
      let fileCount = 0;

      config.fields.forEach((field) => {
        const file = uploadFiles[field.name];
        if (file) {
          formData.append(field.name, file);
          fileCount += 1;
        }
      });

      formData.append('documentCategory', category);

      if (fileCount === 0) {
        setError('Select at least one file before uploading.');
        return;
      }

      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage(`${config.title} uploaded successfully.`);
      setUploadFiles({});
      setRefreshFlag((value) => value + 1);
    } catch (err) {
      setError(err?.error || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleReplace = async (documentId, file) => {
    if (!file) return;

    try {
      setBusy(true);
      setError('');
      setMessage('');

      const formData = new FormData();
      formData.append('file', file);
      await api.put(`/documents/${documentId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('Document replaced successfully.');
      setRefreshFlag((value) => value + 1);
    } catch (err) {
      setError(err?.error || 'Replace failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (documentId) => {
    const confirmed = window.confirm('Delete this document? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setBusy(true);
      await api.delete(`/documents/${documentId}`);
      setMessage('Document deleted successfully.');
      setRefreshFlag((value) => value + 1);
    } catch (err) {
      setError(err?.error || 'Delete failed.');
    } finally {
      setBusy(false);
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

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {CATEGORY_ORDER.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-3xl border p-5 text-left transition ${activeCategory === category ? 'border-sky-300 bg-sky-400/15 text-white shadow-lg' : 'border-white/10 bg-white/5 text-slate-200 hover:border-sky-300/40 hover:bg-white/10'}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Category</div>
                  <h2 className="mt-2 text-lg font-semibold">{CATEGORY_CONFIG[category].title}</h2>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm">{documentsByCategory[category]?.length || 0}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {message && <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/15 p-4 text-emerald-100">{message}</div>}
      {error && <div className="rounded-2xl border border-rose-400/30 bg-rose-500/15 p-4 text-rose-100">{error}</div>}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">{CATEGORY_CONFIG[activeCategory].title}</h2>
                <p className="mt-1 text-slate-300">{CATEGORY_CONFIG[activeCategory].description}</p>
              </div>
              <button
                type="button"
                onClick={() => setRefreshFlag((value) => value + 1)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-slate-100 hover:bg-white/10"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {CATEGORY_CONFIG[activeCategory].fields.map((field) => (
                <label key={field.name} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-slate-100">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{field.label}</span>
                    <FileText size={16} className="text-sky-300" />
                  </div>
                  <input
                    type="file"
                    name={field.name}
                    accept="application/pdf,image/jpeg,image/png,.doc,.docx"
                    onChange={handleFileChange}
                    className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-500 file:px-4 file:py-2 file:text-white hover:file:bg-sky-400"
                  />
                </label>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleUpload(activeCategory)}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UploadCloud size={18} />
                Upload to {CATEGORY_CONFIG[activeCategory].title}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h3 className="text-xl font-semibold text-white">{CATEGORY_CONFIG[activeCategory].title} Records</h3>
            <p className="mt-1 text-slate-300">Click a file to preview or open it in a new tab.</p>

            {busy && <div className="mt-4 rounded-2xl bg-white/5 p-4 text-slate-300">Loading...</div>}

            {!busy && activeDocs.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-300">No documents uploaded for this category.</div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {activeDocs.map((doc) => {
                  const url = getFileUrl(doc.fileUrl || doc.filePath);
                  return (
                    <article key={doc.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-slate-100 shadow-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{doc.documentCategory || activeCategory}</div>
                          <h4 className="mt-2 text-lg font-semibold">{doc.documentTitle || doc.documentType}</h4>
                          <p className="mt-1 text-sm text-slate-300">{doc.fileName}</p>
                        </div>
                        <FileText className="text-sky-300" size={20} />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                        <span className="rounded-full bg-white/5 px-3 py-1">Uploaded: {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'N/A'}</span>
                        <span className="rounded-full bg-white/5 px-3 py-1">Size: {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : 'N/A'}</span>
                        <span className="rounded-full bg-white/5 px-3 py-1">By: {doc.uploadedBy || 'N/A'}</span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {url && (
                          <>
                            <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                              <Eye size={16} /> Preview
                            </a>
                            <a href={url} download className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
                              <Download size={16} /> Download
                            </a>
                          </>
                        )}
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
                          <input
                            type="file"
                            className="hidden"
                            accept="application/pdf,image/jpeg,image/png,.doc,.docx"
                            onChange={(event) => handleReplace(doc.id, event.target.files?.[0])}
                          />
                          <RefreshCw size={16} /> Replace
                        </label>
                        <button
                          type="button"
                          onClick={() => handleDelete(doc.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-500/20"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h3 className="text-xl font-semibold text-white">Document Viewer</h3>
            <p className="mt-2 text-slate-300">Open PDF files directly, preview images, and keep the exact stored file URL in sync with the database.</p>
            <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-300">
              Missing file paths are handled gracefully through the preview and download buttons. If a file is unavailable, the browser will show the missing resource behavior instead of breaking the page.
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h3 className="text-xl font-semibold text-white">Available Categories</h3>
            <div className="mt-4 space-y-3">
              {CATEGORY_ORDER.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${activeCategory === category ? 'bg-sky-500/20 text-white' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
                >
                  <span>{CATEGORY_CONFIG[category].title}</span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs">{documentsByCategory[category]?.length || 0}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
