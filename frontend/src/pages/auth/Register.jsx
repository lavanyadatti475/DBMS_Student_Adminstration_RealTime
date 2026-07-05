import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Mail, Phone, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '',rollNumber:'', password: '', confirmPassword: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {

  event.preventDefault();

  setError(null);
  setValidationErrors([]);
  setMessage(null);

  console.log("FORM DATA:");
  console.log(form);

  try {

    console.log("Calling register...");

    const response = await register(form);

    console.log("SUCCESS:");
    console.log(response);

    setMessage(response.message);

    setTimeout(() => {
      navigate('/login');
    }, 2000);

  } catch (err) {

    console.log("REGISTER ERROR:");
    console.log(err);

    console.log("RESPONSE:");
    console.log(err.response);

    if (err.response) {
      console.log("SERVER RESPONSE:");
      console.log(err.response.data);
    }

    setError(

      err.response?.data?.error ||

      JSON.stringify(err.response?.data) ||

      err.message ||

      "Registration failed"

    );

  }

};

  return (
    <div
className="
min-h-screen
bg-gradient-to-br
from-purple-50
via-pink-50
to-cyan-100
p-6
"
>
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl card-glass p-8 rounded-3xl shadow-xl">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Create your SAMS profile</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Securely submit your admission application and track the approval process.</p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <label className="block">
            <span className="text-slate-700 dark:text-slate-200">Full Name</span>
            <div className={`mt-2 flex items-center gap-3 rounded-3xl border ${validationErrors.some(e => e.path.includes('fullName')) ? 'border-rose-500' : 'border-slate-200'} bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900`}>
              <UserPlus size={18} className="text-slate-400" />
              <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required className="w-full bg-transparent outline-none text-slate-900 dark:text-slate-100" placeholder="Tejaswini Yerra" />
            </div>
          </label>

          <label className="block">
            <span className="text-slate-700 dark:text-slate-200">Email</span>
            <div className={`mt-2 flex items-center gap-3 rounded-3xl border ${validationErrors.some(e => e.path.includes('email')) ? 'border-rose-500' : 'border-slate-200'} bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900`}>
              <Mail size={18} className="text-slate-400" />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full bg-transparent outline-none text-slate-900 dark:text-slate-100" placeholder="teja@student.edu" />
            </div>
          </label>

          <label className="block">
            <span className="text-slate-700 dark:text-slate-200">Mobile Number</span>
            <div className={`mt-2 flex items-center gap-3 rounded-3xl border ${validationErrors.some(e => e.path.includes('mobile')) ? 'border-rose-500' : 'border-slate-200'} bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900`}>
              <Phone size={18} className="text-slate-400" />
              <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required className="w-full bg-transparent outline-none text-slate-900 dark:text-slate-100" placeholder="06301594486" />
            </div>
          </label>

          <label className="block">
  <span>Roll Number</span>

  <input
     value={form.rollNumber}
     onChange={(e)=>
        setForm({
          ...form,
          rollNumber:e.target.value
        })
     }
     placeholder="23VV1A1211"
  />

</label>



          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-slate-700 dark:text-slate-200">Password</span>
              <div className={`mt-2 flex items-center gap-3 rounded-3xl border ${validationErrors.some(e => e.path.includes('password')) ? 'border-rose-500' : 'border-slate-200'} bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900`}>
                <Lock size={18} className="text-slate-400" />
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="w-full bg-transparent outline-none text-slate-900 dark:text-slate-100" placeholder="Min 8 chars" />
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Must contain: uppercase, lowercase, number (min 8 chars)</p>
            </label>

            <label className="block">
              <span className="text-slate-700 dark:text-slate-200">Confirm Password</span>
              <div className={`mt-2 flex items-center gap-3 rounded-3xl border ${validationErrors.some(e => e.path.includes('confirmPassword')) ? 'border-rose-500' : 'border-slate-200'} bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900`}>
                <Lock size={18} className="text-slate-400" />
                <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required className="w-full bg-transparent outline-none text-slate-900 dark:text-slate-100" placeholder="Confirm password" />
              </div>
            </label>
          </div>

          <button type="submit" className="w-full rounded-3xl bg-brand-600 px-5 py-3 text-white transition hover:bg-brand-700 font-medium">Create account</button>

          {message && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-800">{message}</p>
                <p className="text-xs text-emerald-700 mt-1">Redirecting to login...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <AlertCircle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-rose-800">Registration Error</p>
                <p className="text-xs text-rose-700 mt-1">{error}</p>
              </div>
            </div>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">Already a member? <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</Link></p>
      </div>
    </div>
    </div>
  );
}
