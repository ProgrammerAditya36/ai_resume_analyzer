import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";
import { convertPdfToImage } from "~/lib/pdfToImage";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../../constants";

export const meta = () => {
  return [
    { title: "ResumeWise | Upload" },
    { name: "description", content: "Upload your resume to get feedback" },
  ];
};

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dropzoneKey, setDropzoneKey] = useState(0);
  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    {
      setIsProcessing(true);
      setStatusText("Analyzing your resume...");
      const uploadedFile = await fs.upload([file]);
      if (!uploadedFile) return setStatusText("Failed to upload resume");
      setStatusText("Converting to image...");
      const { file: imageFile } = await convertPdfToImage(file);
      if (!imageFile) return setStatusText("Failed to convert to image");
      setStatusText("Uploading image...");
      const uploadedImage = await fs.upload([imageFile]);
      if (!uploadedImage) return setStatusText("Failed to upload image");
      setStatusText("Preparing data for analysis...");
      const uuid = generateUUID();
      const data = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: "",
      };
      await kv.set(uuid, JSON.stringify(data));
      setStatusText("Analyzing...");
      const feedback = await ai.feedback(
        uploadedFile.path,
        prepareInstructions({ jobTitle, jobDescription })
      );
      if (!feedback) return setStatusText("Failed to get feedback");
      const feedbackText =
        typeof feedback.message.content === "string"
          ? feedback.message.content
          : feedback.message.content[0].text;
      data.feedback = JSON.parse(feedbackText);
      await kv.set(uuid, JSON.stringify(data));
      setStatusText("Feedback received");
      console.log(data);
    }
  };
  const handleFileSelect = (file: File | null) => {
    setFile(file);
    if (!file) setDropzoneKey((k) => k + 1);
  };
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);
    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;
    if (!file) return;
    handleAnalyze({ companyName, jobTitle, jobDescription, file });
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
              <div className="mt-2 mb-2"></div>
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
          <Link to="/upload/job-pdf" className="secondary-button">
            Or upload job description as PDF
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Upload;
