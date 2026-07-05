import { useEffect, useState } from "react";
import api from "../../api/api";
import StudentQRCode from "../../components/StudentQRCode";

export default function StudentProfile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/students/me");

        console.log("PROFILE RESPONSE:", res.data);

        setStudent(res.data.student);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <h2 className="text-xl font-semibold">
          Loading Profile...
        </h2>
      </div>
    );
  }

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

      {/* QR Code Section */}
      <div className="card-glass rounded-3xl border border-slate-200/70 bg-white p-8 shadow-lg dark:border-slate-700/70 dark:bg-slate-900">

        <h2 className="mb-4 text-center text-2xl font-bold">
          Student QR ID
        </h2>

        <div className="flex justify-center">
          {student && (
            <StudentQRCode student={student} />
          )}
        </div>

      </div>

      {/* Profile Card */}
      <div className="card-glass rounded-3xl border border-slate-200/70 bg-white p-8 shadow-lg dark:border-slate-700/70 dark:bg-slate-900">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Student Profile
            </h2>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Complete your personal details and guardian information.
            </p>
          </div>

          <div className="rounded-2xl bg-blue-600 px-6 py-3 text-white font-semibold">

            Profile Score:{" "}
            {student
              ? Math.min(
                  100,
                  Math.round(
                    (
                      [
                        "fullName",
                        "dob",
                        "gender",
                        "mobile",
                        "address"
                      ].filter((key) => student[key]).length /
                      5
                    ) * 100
                  )
                )
              : 0}
            %

          </div>

        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">

          {[
            {
              label: "Full Name",
              value: student?.fullName
            },
            {
label:"Roll Number",
value:student?.rollNumber
},
            {
              label: "Email",
              value: student?.email
            },
            {
              label: "Mobile",
              value: student?.mobile
            },
            {
              label: "Date Of Birth",
              value: student?.dob
            },
            {
              label: "Gender",
              value: student?.gender
            },
            {
              label: "Category",
              value: student?.category
            },
            {
              label: "Nationality",
              value: student?.nationality
            },
            {
              label: "Religion",
              value: student?.religion
            },
            {
              label: "Blood Group",
              value: student?.bloodGroup
            },
            {
              label: "Address",
              value: student?.address
            },
            {
              label: "Guardian Name",
              value: student?.guardianName
            },
            {
              label: "Guardian Occupation",
              value: student?.guardianOccupation
            },
            {
              label: "Guardian Income",
              value: student?.guardianIncome
            },
            {
              label: "Emergency Contact",
              value: student?.emergencyContact
            }
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800"
            >
              <h3 className="text-sm text-slate-500">
                {item.label}
              </h3>

              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                {item.value || "—"}
              </p>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
}