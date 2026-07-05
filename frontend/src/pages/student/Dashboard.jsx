
import { useEffect, useState } from 'react';
import api from '../../api/api';
import { CheckCircle2, FileText, Shield, Bell } from 'lucide-react';
import DigiLockerSection from '../../components/DigiLockerSection';
import AdmissionLetterButton from '../../components/AdmissionLetterButton';

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);
  console.log("STATS DATA:", stats);

  useEffect(() => {
    api
      .get('/students/dashboard')
      .then((res) => setStats(res.data.data))
      .catch(console.error);
  }, []);

  return (    
  <div
    className="min-h-screen p-6 space-y-6 animate-fadeIn"
    style={{
      backgroundImage: `
        linear-gradient(
          rgba(15, 23, 42, 0.55),
          rgba(15, 23, 42, 0.55)
        ),
        url('https://jntugv.edu.in/static/media/JNTU_PIC.ae61eebb7dc963f0dd30.png')
      `,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      backgroundRepeat: "no-repeat"
    }}
  >

    {/* Welcome Banner */}
    <div className="card-glass rounded-3xl p-8 text-center animate-slideUp">

      <h1 className="text-4xl font-bold text-sky-700">
        Welcome to SAMS Portal
      </h1>

      <p className="mt-3 text-slate-600 text-lg">
        Student Admission Management System
      </p>

      <p className="text-slate-500 mt-2">
        Track your application, upload documents and monitor admission progress.
      </p>

    </div>
    {/* Feature Cards */}

<div className="grid md:grid-cols-3 gap-6">

  <div className="card-glass p-6 rounded-3xl text-center animate-slideUp">

    <h3 className="text-xl font-bold text-sky-700">
      Upload Documents
    </h3>

    <p className="mt-2 text-slate-500">
      Submit required admission documents.
    </p>

  </div>

  <div className="card-glass p-6 rounded-3xl text-center animate-slideUp">

    <h3 className="text-xl font-bold text-green-700">
      Check Status
    </h3>

    <p className="mt-2 text-slate-500">
      Monitor application verification.
    </p>

  </div>

  <div className="card-glass p-6 rounded-3xl text-center animate-slideUp">

    <h3 className="text-xl font-bold text-purple-700">
      Notifications
    </h3>

    <p className="mt-2 text-slate-500">
      View latest admission updates.
    </p>

  </div>

</div>
    
      {/* Student Profile Card */}
      <div className="card-glass p-6 rounded-3xl border-slate-200/70  dark:border-slate-700/70">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div style={{ width: "150px", height: "150px" }}>
  <img
    src={
      stats?.profilePhoto
        ? `http://localhost:5000${stats.profilePhoto}`
        : "https://via.placeholder.com/150"
    }
    alt="Student Profile"
    style={{
      width: "150px",
      height: "150px",
      objectFit: "cover",
      border: "6px solid #38bdf8",
      borderRadius: "50%",
      boxShadow: "0px 0px 25px rgba(14,165,233,0.5)"
    }}
    onLoad={() => console.log("IMAGE LOADED")}
    onError={(e) => {
      console.log("IMAGE ERROR");
      console.log(stats?.profilePhoto);
      console.log(e);
    }}
  />
</div>

          <div className="flex-1">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {stats?.fullName || 'Student'}
            </h2>

              {stats?.rollNumber && (
    <span
      className="
      px-4
      py-1
      rounded-full
      bg-sky-100
      text-sky-700
      text-sm
      font-semibold
      border
      border-sky-300
      dark:bg-sky-900/30
      dark:text-sky-300
      dark:border-sky-700
      "
    >
      {stats.rollNumber}
    </span>
)}
            <p className="text-slate-500 mt-1">
              {stats?.email}
            </p>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-slate-500">Course</p>
                <p className="font-semibold">
                  {stats?.course || 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Branch</p>
                <p className="font-semibold">
                  {stats?.branch || 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Application Status
                </p>
                <p className="font-semibold text-green-600">
    {stats?.applicationStatus || "Draft"}
  </p>


{stats?.applicationStatus?.toLowerCase() === "approved" && (
  <div className="mt-2">
    <AdmissionLetterButton student={stats} />
  </div>
)}
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Documents Uploaded
                </p>
                <p className="font-semibold">
                  {stats?.documentsUploaded || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
  {[
    {
      title: 'Application Status',
      value: stats?.applicationStatus || 'Draft',
      icon: FileText,
      tint: 'from-brand-500 to-sky-400'
    },
    {
      title: 'Documents Uploaded',
      value: stats?.documentsUploaded || 0,
      icon: CheckCircle2,
      tint: 'from-emerald-500 to-emerald-400'
    },
    {
      title: 'Verification Progress',
      value: stats?.verificationProgress || 'Pending',
      icon: Shield,
      tint: 'from-violet-500 to-fuchsia-500'
    },
    {
      title: 'Notifications',
      value: stats?.notifications?.length || 0,
      icon: Bell,
      tint: 'from-slate-600 to-slate-400'
    }
  ].map((card) => (
    <div
      key={card.title}
      className="card-glass p-6 rounded-3xl shadow-xl border-slate-200/70 dark:border-slate-700/70"
    >
      <div
        className={`inline-flex items-center justify-center rounded-2xl bg-gradient-to-br ${card.tint} p-3 text-white`}
      >
        <card.icon size={20} />
      </div>

      <h3 className="mt-6 text-sm uppercase tracking-[0.2em] text-slate-500">
        {card.title}
      </h3>

      <p className="mt-3 text-4xl font-bold text-sky-700">
        {card.value}
      </p>
    </div>
  ))}
</section>

      {/* Progress + Profile Completion */}
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">

        <div className="card-glass p-6 rounded-3xl border-slate-200/70 dark:border-slate-700/70">
          <h2 className="text-xl font-semibold">
            Application Progress
          </h2>

          <div className="mt-6 space-y-4">
            {[
              'Draft',
              'Submitted',
              'Under Review',
              'Document Verification',
              'Approved / Rejected'
            ].map((step, idx) => {
              const active =
                stats?.applicationStatus
                  ?.toLowerCase()
                  .includes(step.toLowerCase()) ||
                (idx === 0 &&
                  stats?.applicationStatus === 'Draft');

              return (
                <div key={step} className="flex items-center gap-4">
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-2xl ${
                      active
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>

                  <div>
                    <p className="font-semibold">
                      {step}
                    </p>

                    <p className="text-sm text-slate-500">
                      {active
                        ? 'Current stage'
                        : 'Upcoming stage'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-glass p-6 rounded-3xl border-slate-200/70 dark:border-slate-700/70">
          <h2 className="text-xl font-semibold">
            Profile Completion
          </h2>

          <div className="mt-6 rounded-3xl bg-slate-200 p-1 dark:bg-slate-800">
            <div
              className="h-4 rounded-3xl bg-brand-600"
              style={{
                width: `${stats?.profileCompletion || 0}%`
              }}
            />
          </div>

          <p className="mt-3 text-sm text-slate-500">
            {stats?.profileCompletion || 0}% complete
          </p>
        </div>
      </section>

      {/* DigiLocker */}
      <DigiLockerSection
        uploadedDocuments={
          stats?.uploadedDocuments || []
        }
      />
    </div>
  );
}
