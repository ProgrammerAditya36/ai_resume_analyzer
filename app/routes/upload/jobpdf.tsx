import { prepareInstructionsForJobDescription } from "../../../constants";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { convertPdfToImage } from "~/lib/pdfToImage";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";

export const meta = () => {
  return [
    { title: "ResumeWise | Upload" },
    { name: "description", content: "Upload your resume to get feedback" },
  ];
};

const UploadJobPDF = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [jobPDF, setJobPDF] = useState<File | null>(null);
  const [resumePDF, setResumePDF] = useState<File | null>(null);
  const [dropzoneKey, setDropzoneKey] = useState(0);
  const handleAnalyze = async ({
    jobPDF,
    resumePDF,
  }: {
    jobPDF: File;
    resumePDF: File;
  }) => {
    {
      setIsProcessing(true);
      setStatusText("Analyzing your resume...");
      const uploadedResume = await fs.upload([resumePDF]);
      if (!uploadedResume) return setStatusText("Failed to upload resume");
      setStatusText("Uploading job description...");
      const uploadedJobPDF = await fs.upload([jobPDF]);
      if (!uploadedJobPDF)
        return setStatusText("Failed to upload job description");
      setStatusText("Converting to image...");
      const { file: imageFile } = await convertPdfToImage(resumePDF);
      if (!imageFile) return setStatusText("Failed to convert to image");
      const { file: jobDescriptionFile } = await convertPdfToImage(jobPDF);
      if (!jobDescriptionFile)
        return setStatusText("Failed to convert job description to image");
      setStatusText("Uploading image...");
      const uploadedImage = await fs.upload([imageFile]);
      if (!uploadedImage) return setStatusText("Failed to upload image");
      setStatusText("Uploading job description image...");
      const uploadedJobDescriptionImage = await fs.upload([jobDescriptionFile]);
      if (!uploadedJobDescriptionImage)
        return setStatusText("Failed to upload job description image");
      setStatusText("Preparing data for analysis...");
      const uuid = generateUUID();
      const data = {
        id: uuid,
        resumePath: uploadedResume.path,
        imagePath: uploadedImage.path,
        jobDescriptionPath: uploadedJobPDF.path,
        jobDescriptionImagePath: uploadedJobDescriptionImage.path,
        companyName: "",
        jobTitle: "",
        jobDescription: "",
        feedback: "",
      };
      await kv.set(uuid, JSON.stringify(data));
      setStatusText("Analyzing...");
      const jobDescriptionFeedback = await ai.feedbackJobDescription(
        uploadedResume.path,
        uploadedJobPDF.path,
        prepareInstructionsForJobDescription()
      );
      if (!jobDescriptionFeedback)
        return setStatusText("Failed to get feedback");
      const jobDescriptionFeedbackText =
        typeof jobDescriptionFeedback.message.content === "string"
          ? jobDescriptionFeedback.message.content
          : jobDescriptionFeedback.message.content[0].text;
      const { jobDescription, jobTitle, companyName, feedback } = JSON.parse(
        jobDescriptionFeedbackText
      );
      data.jobDescription = jobDescription;
      data.jobTitle = jobTitle;
      data.companyName = companyName;
      data.feedback = feedback;
      await kv.set(uuid, JSON.stringify(data));
      setStatusText("Feedback received");
      navigate(`/resume/${uuid}`);
    }
  };
  const handleJobPDFSelect = (file: File | null) => {
    setJobPDF(file);
    if (!file) setDropzoneKey((k) => k + 1);
  };
  const handleResumePDFSelect = (file: File | null) => {
    setResumePDF(file);
    if (!file) setDropzoneKey((k) => k + 1);
  };
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    if (!jobPDF || !resumePDF) return;
    handleAnalyze({ jobPDF, resumePDF });
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
            <h2>Upload your resume and job description PDF</h2>
          )}
          {!isProcessing && (
            <form
              id="upload-job-pdf-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div flex flex-col gap-2 items-center">
                <label htmlFor="job-pdf" className="text-center">
                  Job Description
                </label>
                <FileUploader
                  key={dropzoneKey}
                  onFileSelect={handleJobPDFSelect}
                />
              </div>
              <div className="form-div flex flex-col gap-2 items-center">
                <label htmlFor="resume-pdf" className="text-center">
                  Resume
                </label>
                <FileUploader
                  key={dropzoneKey}
                  onFileSelect={handleResumePDFSelect}
                />
              </div>
              <button type="submit" className="primary-button">
                Analyze
              </button>
            </form>
          )}
          <Link to="/upload" className="secondary-button w-full">
            Back to main upload form
          </Link>
        </div>
      </section>
    </main>
  );
};

export default UploadJobPDF;
