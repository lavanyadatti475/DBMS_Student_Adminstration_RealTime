import {
  FileText,
  Download,
  CheckCircle,
  Clock
} from "lucide-react";

function getFileUrl(filePath) {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  return `http://localhost:5000${filePath}`;
}

export default function DigiLockerSection({
  uploadedDocuments = []
}) {
  return (
    <div className="card-glass p-6 rounded-3xl border-slate-200/70 dark:border-slate-700/70">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          DigiLocker
        </h2>

        <span className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm">
          {uploadedDocuments.length} Documents
        </span>
      </div>

      {uploadedDocuments.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          No documents uploaded yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {uploadedDocuments.map((doc) => (
            <div
              key={doc.id}
              className="border rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <FileText size={24} />

               {doc.verificationStatus === "approved" ? (
                  <CheckCircle className="text-green-500" />):(
                   <Clock className="text-yellow-500" />)} 
              
              </div>

              <h3 className="mt-4 font-semibold text-lg">
                {(doc.documentTitle || doc.documentType || '').replace(
                  /([A-Z])/g,
                  " $1"
                )}
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                {doc.fileName}
              </p>

              <p className="text-xs text-slate-400 mt-1 uppercase tracking-[0.2em]">
                {doc.documentCategory || 'administration'}
              </p>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Uploaded: {doc.uploadDate ? new Date(doc.uploadDate).toLocaleString() : 'N/A'}
              </p>

              <p className="mt-2 text-sm">
                Status:
                <span
  className={`ml-2 font-medium ${
    doc.verificationStatus === "approved"
      ? "text-green-600"
      : doc.verificationStatus === "rejected"
      ? "text-red-600"
      : "text-yellow-600"
  }`}
>
  {doc.verificationStatus}
</span>
              </p>

              <a
                href={getFileUrl(doc.fileUrl || doc.filePath)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white"
              >
                <Download size={16} />
                Open
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}