import { useEffect, useMemo, useState } from 'react';
import api from '../../api/api';
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  Search,
  AlertTriangle,
  FileText,
  CheckCircle2,
  User,
  BookOpen,
  FileCheck,
  Loader2
} from 'lucide-react';

function getInitialFormState() {
  return {
    id: null,
    rollNumber: '',
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    dob: '',
    gender: 'Male',
    bloodGroup: '',
    nationality: 'Indian',
    religion: '',
    category: 'General',
    address: '',
    guardianName: '',
    guardianOccupation: '',
    guardianIncome: '',
    emergencyContact: '',
    secondarySchool: '',
    secondaryBoard: '',
    secondaryPercentage: '',
    secondaryYear: '',
    intermediateCollege: '',
    intermediateBoard: '',
    intermediatePercentage: '',
    intermediateYear: '',
    examName: 'JEE Main',
    examRank: '',
    examScore: '',
    examYear: new Date().getFullYear(),
    course: 'B.Tech',
    branch: 'Computer Science',
    admissionCategory: 'Merit',
    hostelRequired: false,
    scholarshipRequired: false,
    previousInstitution: '',
    applicationStatus: 'submitted'
  };
}

function deriveBatchLabel(rollNumber) {
  const match = String(rollNumber || '').match(/^(\d{2})/);
  if (!match) return 'N/A';
  const startYear = 2000 + Number(match[1]);
  return `${startYear}-${startYear + 4}`;
}

function getStatusBadge(status) {
  const value = (status || 'draft').toLowerCase();
  const styles = {
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/35 dark:text-emerald-400 dark:border-emerald-900',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/35 dark:text-rose-400 dark:border-rose-900',
    'under-review': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/35 dark:text-amber-400 dark:border-amber-900',
    submitted: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/35 dark:text-blue-400 dark:border-blue-900',
    draft: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${styles[value] || styles.draft}`}>
      {status || 'Draft'}
    </span>
  );
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', branch: '', batch: ''});
  
  // Modals state
  const [viewingApp, setViewingApp] = useState(null);
  const [editingApp, setEditingApp] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingAppId, setDeletingAppId] = useState(null);
  const [form, setForm] = useState(getInitialFormState());
  const [activeTab, setActiveTab] = useState('personal');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  function getInitialFormState() {
    return {
      rollNumber:'',fullName: '', email: '', mobile: '', password: '',
      dob: '', gender: 'Male', bloodGroup: '', nationality: 'Indian', religion: '', category: 'General', address: '',
      guardianName: '', guardianOccupation: '', guardianIncome: '', emergencyContact: '',
      
      secondarySchool: '', secondaryBoard: '', secondaryPercentage: '', secondaryYear: '',
      intermediateCollege: '', intermediateBoard: '', intermediatePercentage: '', intermediateYear: '',
      examName: 'JEE Main', examRank: '', examScore: '', examYear: new Date().getFullYear(),
      
      course: 'B.Tech', branch: 'Computer Science', admissionCategory: 'Merit',
      hostelRequired: false, scholarshipRequired: false, previousInstitution: '',
      applicationStatus: 'submitted'
    };
  }
  const fetchApplications = () => {
    setLoading(true);
    setFormError('');
    try {
      const res = await api.get('/admin/applications', { params });
      setApplications(res.data.applications || []);
    } catch (err) {
      setFormError(err?.error || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredBranchOptions = useMemo(() => {
    return [
      'Computer Science',
      'Information Technology',
      'ECE',
      'Mechanical',
      'EEE',
      'Metallurgy',
      'Civil'
    ];
  }, []);

  const handleOpenCreate = () => {
    setForm(getInitialFormState());
    setEditingApp(null);
    setIsCreateOpen(true);
    setFormError('');
    setFormSuccess('');
    setActiveTab('personal');
  };

  const handleOpenEdit = async (appId) => {
    setFormError('');
    setFormSuccess('');
    setActiveTab('personal');
    try {
      const res = await api.get(`/admin/applications/${appId}`);
      const student = res.data.student;
      setForm({
        rollNumber:
        student.rollNumber || '',
        id: student.id,
        rollNumber: student.rollNumber || '',
        fullName: student.fullName || '',
        email: student.email || '',
        mobile: student.mobile || '',
        password: '',
        dob: student.dob || '',
        gender: student.gender || 'Male',
        bloodGroup: student.bloodGroup || '',
        nationality: student.nationality || 'Indian',
        religion: student.religion || '',
        category: student.category || 'General',
        address: student.address || '',
        guardianName: student.guardianName || '',
        guardianOccupation: student.guardianOccupation || '',
        guardianIncome: student.guardianIncome || '',
        emergencyContact: student.emergencyContact || '',
        secondarySchool: student.academicDetails?.secondarySchool || '',
        secondaryBoard: student.academicDetails?.secondaryBoard || '',
        secondaryPercentage: student.academicDetails?.secondaryPercentage || '',
        secondaryYear: student.academicDetails?.secondaryYear || '',
        intermediateCollege: student.academicDetails?.intermediateCollege || '',
        intermediateBoard: student.academicDetails?.intermediateBoard || '',
        intermediatePercentage: student.academicDetails?.intermediatePercentage || '',
        intermediateYear: student.academicDetails?.intermediateYear || '',
        examName: student.academicDetails?.examName || 'JEE Main',
        examRank: student.academicDetails?.examRank || '',
        examScore: student.academicDetails?.examScore || '',
        examYear: student.academicDetails?.examYear || new Date().getFullYear(),
        course: student.admissionForm?.course || 'B.Tech',
        branch: student.admissionForm?.branch || 'Computer Science',
        admissionCategory: student.admissionForm?.admissionCategory || 'Merit',
        hostelRequired: student.admissionForm?.hostelRequired || false,
        scholarshipRequired: student.admissionForm?.scholarshipRequired || false,
        previousInstitution: student.admissionForm?.previousInstitution || '',
        applicationStatus: student.admissionStatus?.applicationStatus || 'submitted'
      });
      setEditingApp(student);
    } catch (err) {
      setFormError(err?.error || 'Could not retrieve student details.');
    }
  };

  const handleOpenView = async (appId) => {
    try {
      const res = await api.get(`/admin/applications/${appId}`);
      setViewingApp(res.data.student);
    } catch (err) {
      setFormError(err?.error || 'Could not retrieve student details.');
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.put(`/admin/applications/${appId}`, { applicationStatus: newStatus });
      await fetchApplications();
      if (viewingApp?.id === appId) {
        await handleOpenView(appId);
      }
    } catch (err) {
      setFormError(err?.error || 'Failed to update application status.');
    }
  };

  const handleDelete = async (appId) => {
    try {
      await api.delete(`/admin/applications/${appId}`);
      setDeletingAppId(null);
      await fetchApplications();
    } catch (err) {
      setFormError(err?.error || 'Failed to delete student.');
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError('');
    setFormSuccess('');

    if (!form.fullName || !form.email || !form.mobile || !form.course || !form.branch || !form.admissionCategory) {
      setFormError('Please fill out all required fields.');
      setSubmitting(false);
      return;
    }

    try {
      if (isCreateOpen) {
        await api.post('/admin/applications', form);
        setFormSuccess('Student application created successfully.');
      } else if (editingApp) {
        await api.put(`/admin/applications/${editingApp.id}`, form);
        setFormSuccess('Student application updated successfully.');
      }

      setTimeout(() => {
        setIsCreateOpen(false);
        setEditingApp(null);
        fetchApplications();
      }, 1000);
    } catch (err) {
      setFormError(err?.error || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-100 p-6">
      <div className="space-y-6">
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-100 p-6 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Application Management</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Search, filter, and process SAMS admission requests.</p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 rounded-3xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 active:scale-95"
            >
              <Plus size={18} /> New Application
            </button>
          </div>

          <div className="mt-6 grid gap-4 rounded-3xl border border-cyan-100 bg-gradient-to-r from-blue-50 via-cyan-50 to-indigo-50 p-6 shadow-md dark:border-slate-700 dark:bg-slate-800 lg:grid-cols-4">
            <div className="flex items-center gap-2.5 rounded-3xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm focus-within:border-brand-500 dark:border-slate-700 dark:bg-slate-900 lg:col-span-1">
              <Search size={16} className="text-slate-400" />
              <input
                value={pendingFilters.search}
                onChange={(e) => setPendingFilters({ ...pendingFilters, search: e.target.value })}
                placeholder="Search Name, Email, Roll Number..."
                className="w-full bg-transparent text-sm outline-none text-slate-900 dark:text-slate-100"
              />
            </div>
            <select
              value={pendingFilters.branch}
              onChange={(e) => setPendingFilters({ ...pendingFilters, branch: e.target.value })}
              className="rounded-3xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none shadow-sm transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="">All Branches</option>
              {filteredBranchOptions.map((branch) => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
            <select
              value={pendingFilters.status}
              onChange={(e) => setPendingFilters({ ...pendingFilters, status: e.target.value })}
              className="rounded-3xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none shadow-sm transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under-review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={pendingFilters.category}
              onChange={(e) => setPendingFilters({ ...pendingFilters, category: e.target.value })}
              className="rounded-3xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none shadow-sm transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="">All Categories</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>

          <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              onClick={() => {
                const empty = { search: '', branch: '', status: '', category: '' };
                setPendingFilters(empty);
                setFilters(empty);
                fetchApplications(empty);
              }}
              className="rounded-3xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Clear Filters
            </button>
            <button
              onClick={() => {
                setFilters(pendingFilters);
                fetchApplications(pendingFilters);
              }}
              className="rounded-3xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              Apply
            </button>
          </div>
          <select
            value={filters.branch}
            onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
            className="rounded-3xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none shadow-sm transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="">All Branches</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="ECE">Electronics</option>
            <option value="Mec">Mechanical</option>
            <option value="EEE">EEE</option>
            <option value="MET">Meturagy</option>
            <option value="Civil">Civil</option>
          </select>
          {/* Batch */}
  <select
    value={filters.batch || ""}
    onChange={(e) =>
      setFilters({ ...filters, batch: e.target.value })
    }
    className="px-4 py-2 rounded-2xl border border-slate-300 bg-white"
  >
    <option value="">All Batches</option>
    <option value="2022">2022</option>
    <option value="2023">2023</option>
    <option value="2024">2024</option>
    <option value="2025">2025</option>
    <option value="2026">2026</option>
  </select>
        </div>
        <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button 
            onClick={() => setFilters({ search: '', branch: '', batch: '' })} 
            className="rounded-3xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Clear Filters
          </button>
          <button 
            onClick={fetchApplications} 
            className="rounded-3xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            Apply
          </button>
        </div>

        {formError && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{formError}</div>}
        {formSuccess && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{formSuccess}</div>}

uppercase
tracking-wide">
                <tr>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Course & Branch</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Submitted</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white/50 dark:divide-slate-700 dark:bg-slate-950/50">
                {applications.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <td className="px-6 py-4">

<button

onClick={()=>

handleOpenView(student.id)

}

className="

text-blue-600
font-semibold

hover:underline

"

>

{student.rollNumber || '--'}

</button>

</td>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{student.fullName}</div>
                      <div className="text-xs text-slate-500">{student.email}</div>
                      <div className="text-xs text-slate-400">{student.mobile}</div>
                    </td>
                    <td className="px-6 py-4">
                      {student.admissionForm ? (
                        <>
                          <div className="font-medium text-slate-800 dark:text-slate-200">{student.admissionForm.course}</div>
                          <div className="text-xs text-slate-500">{student.admissionForm.branch}</div>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not started</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(student.admissionStatus?.applicationStatus)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {student.category || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {student.admissionForm?.submittedAt 
                        ? new Date(student.admissionForm.submittedAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenView(student.id)}
                          title="View Details"
                          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(student.id)}
                          title="Edit"
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeletingAppId(student.id)}
                          title="Delete"
                          className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* VIEW DETAILS MODAL */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="card-glass w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Application Details</h3>
                <p className="text-xs text-slate-500">System ID: #{viewingApp.id}</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2">
                <AlertTriangle className="h-8 w-8 text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">No applications found</span>
                <span className="text-xs text-slate-400">Try adjusting your filters or search terms.</span>
              </div>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {/* Profile Card */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-600">
                  <User size={16} /> Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-150 p-4 dark:border-slate-800 text-xs">
                  <div>

<p className="text-slate-400">

Roll Number

</p>

<p
className="
font-semibold
text-slate-800">

{viewingApp.rollNumber || '--'}

</p>

</div>
                  <div>
                    <p className="text-slate-400">Full Name</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.fullName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Email Address</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Mobile</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.mobile}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Date of Birth</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.dob || '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Gender</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.gender || '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Blood Group</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.bloodGroup || '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Category</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.category || '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Nationality</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.nationality || '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-400">Residential Address</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.address || '—'}</p>
                  </div>
                </div>
                <button onClick={() => setViewingApp(null)} className="rounded-full p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X size={20} />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/40">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Process Status:</span>
                <button onClick={() => handleStatusChange(viewingApp.id, 'under-review')} className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600 active:scale-95">Under Review</button>
                <button onClick={() => handleStatusChange(viewingApp.id, 'approved')} className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 active:scale-95">Approve</button>
                <button onClick={() => handleStatusChange(viewingApp.id, 'rejected')} className="rounded-full bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 active:scale-95">Reject</button>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-slate-500">Current:</span>
                  {getStatusBadge(viewingApp.admissionStatus?.applicationStatus)}
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-600"><User size={16} /> Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-150 p-4 text-xs dark:border-slate-800">
                    <div><p className="text-slate-400">Full Name</p><p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.fullName}</p></div>
                    <div><p className="text-slate-400">Email Address</p><p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.email}</p></div>
                    <div><p className="text-slate-400">Mobile</p><p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.mobile}</p></div>
                    <div><p className="text-slate-400">Date of Birth</p><p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.dob || '—'}</p></div>
                    <div><p className="text-slate-400">Gender</p><p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.gender || '—'}</p></div>
                    <div><p className="text-slate-400">Blood Group</p><p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.bloodGroup || '—'}</p></div>
                    <div><p className="text-slate-400">Category</p><p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.category || '—'}</p></div>
                    <div><p className="text-slate-400">Nationality</p><p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.nationality || '—'}</p></div>
                    <div className="col-span-2"><p className="text-slate-400">Residential Address</p><p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.address || '—'}</p></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-600"><BookOpen size={16} /> Academic Records</h4>
                  <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-150 p-4 text-xs dark:border-slate-800">
                    <div className="col-span-2 border-b border-slate-100 pb-2 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-slate-100">10th Class (Secondary)</p>
                      <p className="mt-1 text-slate-400">School: <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.academicDetails?.secondarySchool || '—'}</span></p>
                      <p className="text-slate-400">Board: <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.academicDetails?.secondaryBoard || '—'}</span> | Score: <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.academicDetails?.secondaryPercentage || '—'}%</span> | Year: <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.academicDetails?.secondaryYear || '—'}</span></p>
                    </div>
                    <div className="col-span-2 border-b border-slate-100 pb-2 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-slate-100">12th Class (Intermediate)</p>
                      <p className="mt-1 text-slate-400">College: <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.academicDetails?.intermediateCollege || '—'}</span></p>
                      <p className="text-slate-400">Board: <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.academicDetails?.intermediateBoard || '—'}</span> | Score: <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.academicDetails?.intermediatePercentage || '—'}%</span> | Year: <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.academicDetails?.intermediateYear || '—'}</span></p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-bold text-slate-900 dark:text-slate-100">Entrance Examination</p>
                      <p className="mt-1 text-slate-400">Exam: <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.academicDetails?.examName || '—'}</span></p>
                      <p className="text-slate-400">Rank: <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.academicDetails?.examRank || '—'}</span> | Score: <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.academicDetails?.examScore || '—'}</span> | Year: <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.academicDetails?.examYear || '—'}</span></p>
                    </div>
                  </div>

                  <h4 className="flex items-center gap-2 pt-2 text-sm font-bold uppercase tracking-wider text-brand-600"><FileCheck size={16} /> Admission Details</h4>
                  <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-150 p-4 text-xs dark:border-slate-800">
                    <div><p className="text-slate-400">Roll Number</p><p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.rollNumber || '—'}</p></div>
                    <div><p className="text-slate-400">Batch</p><p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.batchLabel || viewingApp.batch?.name || deriveBatchLabel(viewingApp.rollNumber)}</p></div>
                    <div><p className="text-slate-400">Course Preference</p><p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.admissionForm?.course || '—'}</p></div>
                    <div><p className="text-slate-400">Branch Preference</p><p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.branchLabel || viewingApp.admissionForm?.branch || '—'}</p></div>
                    <div><p className="text-slate-400">Admission Category</p><p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.admissionForm?.admissionCategory || '—'}</p></div>
                    <div><p className="text-slate-400">Previous Institution</p><p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.admissionForm?.previousInstitution || '—'}</p></div>
                    <div><p className="text-slate-400">Hostel Required</p><p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.admissionForm?.hostelRequired ? 'Yes' : 'No'}</p></div>
                    <div><p className="text-slate-400">Scholarship Required</p><p className="font-semibold text-slate-800 dark:text-slate-200">{viewingApp.admissionForm?.scholarshipRequired ? 'Yes' : 'No'}</p></div>
                  </div>

                  <h4 className="flex items-center gap-2 pt-2 text-sm font-bold uppercase tracking-wider text-brand-600"><FileText size={16} /> Uploaded Documents</h4>
                  <div className="space-y-2 rounded-2xl border border-slate-150 p-4 text-xs dark:border-slate-800">
                    {viewingApp.uploadedDocuments?.length ? (
                      viewingApp.uploadedDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-2 dark:bg-slate-900/60">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{doc.documentType}</span>
                          <a href={`http://localhost:5000${doc.filePath}`} target="_blank" rel="noreferrer" className="font-semibold text-brand-600 hover:text-brand-700">View File</a>
                        </div>
                      ))
                    ) : (
                      <p className="italic text-slate-500">No files uploaded yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                <button onClick={() => setViewingApp(null)} className="rounded-3xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700">Close</button>
              </div>
            </div>
          </div>
        )}

        {(isCreateOpen || editingApp) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <div className="card-glass max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl p-6 shadow-2xl animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{isCreateOpen ? 'Create New Student Application' : 'Edit Student Application'}</h3>
                  <p className="text-xs text-slate-500">{isCreateOpen ? 'Fill out all details to enroll a new applicant.' : `Modifying student ID: #${editingApp?.id}`}</p>
                </div>
                <button onClick={() => { setIsCreateOpen(false); setEditingApp(null); }} className="rounded-full p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X size={20} />
                </button>
              </div>

              <div className="mt-4 flex border-b border-slate-200 dark:border-slate-800">
                {[
                  { id: 'personal', label: '1. Personal Info' },
                  { id: 'academic', label: '2. Academic Details' },
                  { id: 'admission', label: '3. Admission Setup' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${activeTab === tab.id ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={handleSave} className="mt-6 space-y-6">
              {/* Tab 1: Personal Info */}
              {activeTab === 'personal' && (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  <label>

<span
className="
text-xs
font-bold
uppercase
tracking-wider
text-slate-500"
>

Roll Number

</span>

<input

value={form.rollNumber}

onChange={(e)=>

setForm({

...form,

rollNumber:e.target.value

})

}

className="
mt-2
w-full
rounded-2xl
border
border-slate-200
px-4
py-3"

placeholder="2022CSE001"

/>

</label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name *</span>
                    <input 
                      value={form.fullName} 
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })} 
                      required 
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" 
                      placeholder="e.g. Tejaswini Yerra"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address *</span>
                    <input 
                      type="email"
                      value={form.email} 
                      onChange={(e) => setForm({ ...form, email: e.target.value })} 
                      required 
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" 
                      placeholder="e.g. name@domain.com"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Mobile Number *</span>
                    <input 
                      value={form.mobile} 
                      onChange={(e) => setForm({ ...form, mobile: e.target.value })} 
                      required 
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" 
                      placeholder="e.g. 06301594486"
                    />
                  </label>
                  {isCreateOpen && (
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Roll Number *</span>
                      <input value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} required className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="RN260001" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name *</span>
                      <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="e.g. Tejaswini Yerra" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address *</span>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="e.g. name@domain.com" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Mobile Number *</span>
                      <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="e.g. 06301594486" />
                    </label>
                    {isCreateOpen && (
                      <label className="block">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</span>
                        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="••••••••" />
                      </label>
                    )}
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Date of Birth</span>
                      <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gender</span>
                      <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Blood Group</span>
                      <input value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="e.g. O+, A-" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</span>
                      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        <option value="General">General</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Nationality</span>
                      <input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                    </label>
                    <label className="block lg:col-span-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Residential Address</span>
                      <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Guardian Name</span>
                      <input value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Emergency Contact</span>
                      <input value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                    </label>
                  </div>
                )}

                {activeTab === 'academic' && (
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <label className="block lg:col-span-3"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Secondary School</span><input value={form.secondarySchool} onChange={(e) => setForm({ ...form, secondarySchool: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>
                    <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Secondary Board</span><input value={form.secondaryBoard} onChange={(e) => setForm({ ...form, secondaryBoard: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>
                    <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Secondary %</span><input value={form.secondaryPercentage} onChange={(e) => setForm({ ...form, secondaryPercentage: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>
                    <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Secondary Year</span><input value={form.secondaryYear} onChange={(e) => setForm({ ...form, secondaryYear: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>
                    <label className="block lg:col-span-3"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Intermediate College</span><input value={form.intermediateCollege} onChange={(e) => setForm({ ...form, intermediateCollege: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>
                    <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Intermediate Board</span><input value={form.intermediateBoard} onChange={(e) => setForm({ ...form, intermediateBoard: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>
                    <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Intermediate %</span><input value={form.intermediatePercentage} onChange={(e) => setForm({ ...form, intermediatePercentage: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>
                    <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Intermediate Year</span><input value={form.intermediateYear} onChange={(e) => setForm({ ...form, intermediateYear: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>
                    <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Exam Name</span><input value={form.examName} onChange={(e) => setForm({ ...form, examName: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>
                    <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Exam Rank</span><input value={form.examRank} onChange={(e) => setForm({ ...form, examRank: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>
                    <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Exam Score</span><input value={form.examScore} onChange={(e) => setForm({ ...form, examScore: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>
                  </div>
                )}

                {activeTab === 'admission' && (
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Course *</span><input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} required className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>
                    <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Branch *</span><select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} required className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900">{filteredBranchOptions.map((branch) => <option key={branch} value={branch}>{branch}</option>)}</select></label>
                    <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Admission Category *</span><input value={form.admissionCategory} onChange={(e) => setForm({ ...form, admissionCategory: e.target.value })} required className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>
                    <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Previous Institution</span><input value={form.previousInstitution} onChange={(e) => setForm({ ...form, previousInstitution: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>
                    <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Application Status</span><select value={form.applicationStatus} onChange={(e) => setForm({ ...form, applicationStatus: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="under-review">Under Review</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></label>
                    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"><input type="checkbox" checked={form.hostelRequired} onChange={(e) => setForm({ ...form, hostelRequired: e.target.checked })} /> Hostel Required</label>
                    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"><input type="checkbox" checked={form.scholarshipRequired} onChange={(e) => setForm({ ...form, scholarshipRequired: e.target.checked })} /> Scholarship Required</label>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div className="text-xs text-slate-500">Roll number is the primary student identifier.</div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => { setIsCreateOpen(false); setEditingApp(null); }} className="rounded-3xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</button>
                    <button type="submit" disabled={submitting} className="rounded-3xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">{submitting ? 'Saving...' : 'Save Application'}</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {deletingAppId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <div className="card-glass w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in duration-200">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-rose-50 p-3 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"><AlertTriangle size={24} /></div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Delete Application?</h3>
                  <p className="text-xs text-slate-500">Are you sure you want to delete this student application? This action is permanent and will delete all related academic, admission, and document records.</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button onClick={() => setDeletingAppId(null)} className="rounded-3xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">No, Keep</button>
                <button onClick={() => handleDelete(deletingAppId)} className="rounded-3xl bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 active:scale-95">Yes, Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
