import { useState, type FormEvent } from "react";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";

export const meta = () => {
  return [
    { title: "ResumeWise | Upload" },
    { name: "description", content: "Upload your resume to get feedback" },
  ];
};

const Upload = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dropzoneKey, setDropzoneKey] = useState(0);
  const handleFileSelect = (file: File | null) => {
    setFile(file);
    if (!file) setDropzoneKey((k) => k + 1);
  };
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);
    const companyName = formData.get("company-name");
    const jobTitle = formData.get("job-title");
    const jobDescription = formData.get("job-description");
    console.log(companyName, jobTitle, jobDescription, file);
  };
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your dream job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img
                src="/images/resume-scan.gif"
                alt="resume-scan"
                className="w-full"
              />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
          )}
          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div">
                <input
                  type="text"
                  id="company-name"
                  name="company-name"
                  placeholder="Company Name"
                  required
                />
              </div>
              <div className="form-div">
                <input
                  type="text"
                  id="job-title"
                  name="job-title"
                  placeholder="Job Title"
                  required
                />
              </div>
              <div className="form-div">
                <textarea
                  rows={5}
                  id="job-description"
                  name="job-description"
                  placeholder="Job Description"
                  required
                />
              </div>
              <div className="form-div">
                <FileUploader
                  key={dropzoneKey}
                  onFileSelect={handleFileSelect}
                />
              </div>
              <button type="submit" className="primary-button">
                Analyze
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Upload;
