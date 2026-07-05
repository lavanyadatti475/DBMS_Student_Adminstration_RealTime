import { useState } from "react";
import api from "../../api/api";
import { UploadCloud } from "lucide-react";

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
      [e.target.name]: e.target.files[0],
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
   
      <section className="card-glass p-8 rounded-3xl border border-white/30 shadow-2xl animate-slideUp">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Document Vault</h2>

            <p className="mt-2 text-slate-600 dark:text-slate-300 ">
              Upload your documents securely for admin verification.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-3xl bg-blue-600 px-4 py-3 text-white">
            <UploadCloud size={18} />
            <span>Supported: PDF, JPG, PNG</span>
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
