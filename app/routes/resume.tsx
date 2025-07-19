import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Details from "~/components/Details";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";

export const meta = () => [
  { title: "Resumind | Review " },
  { name: "description", content: "Detailed overview of your resume" },
];

const Resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [jobDescriptionUrl, setJobDescriptionUrl] = useState("");
  const [jobDescriptionImagePath, setJobDescriptionImagePath] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated)
      navigate(`/auth?next=/resume/${id}`);
  }, [isLoading]);

  useEffect(() => {
    const loadResume = async () => {
      const resume = await kv.get(id as string);

      if (!resume) return;

      const data = JSON.parse(resume);

      const resumeBlob = await fs.read(data.resumePath);
      if (!resumeBlob) return;

      const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
      const resumeUrl = URL.createObjectURL(pdfBlob);
      setResumeUrl(resumeUrl);

      const imageBlob = await fs.read(data.imagePath);
      if (!imageBlob) return;
      const imageUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl);

      // Only set job description if present and valid
      if (data.jobDescriptionPath && data.jobDescriptionImagePath) {
        const jobDescriptionBlob = await fs.read(data.jobDescriptionPath);
        const jobDescriptionImageBlob = await fs.read(
          data.jobDescriptionImagePath
        );
        if (jobDescriptionBlob && jobDescriptionImageBlob) {
          const jobDescriptionUrl = URL.createObjectURL(jobDescriptionBlob);
          setJobDescriptionUrl(jobDescriptionUrl);
          const jobDescriptionImageUrl = URL.createObjectURL(
            jobDescriptionImageBlob
          );
          setJobDescriptionImagePath(jobDescriptionImageUrl);
        }
      } else {
        setJobDescriptionUrl("");
        setJobDescriptionImagePath("");
      }
      setFeedback(data.feedback);
      // console.log({ resumeUrl, imageUrl, feedback: data.feedback });
    };

    loadResume();
  }, [id]);

  // Determine if we have a job description image to show
  const hasJobDescription =
    jobDescriptionImagePath && jobDescriptionUrl ? true : false;

  // Responsive layout: if both resume and job description, show side by side on desktop, stacked on mobile.
  // If only resume, center it.
  return (
    <main className="!pt-0">
      <nav className="resume-nav">
        <Link to="/" className="back-button">
          <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">
            Back to Homepage
          </span>
        </Link>
      </nav>
      <div
        className={`flex w-full ${
          hasJobDescription
            ? "flex-row max-lg:flex-col-reverse"
            : "flex-row max-lg:flex-col-reverse"
        }`}
      >
        {/* Document preview section */}
        <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover max-h-[100vh] overflow-y-auto scrollbar-hide">
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div
              className={`flex ${
                hasJobDescription
                  ? "flex-row gap-6 max-lg:flex-col"
                  : "flex-col"
              } items-center justify-center w-full max-w-4xl`}
            >
              {/* Resume Preview */}
              {imageUrl && resumeUrl && (
                <div className="animate-in fade-in duration-1000 gradient-border flex-shrink-0">
                  <div className="relative group">
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={imageUrl}
                        className={`object-contain rounded-2xl shadow-lg transition-transform duration-200 group-hover:scale-105 ${
                          hasJobDescription
                            ? "max-h-[70vh] w-auto max-w-[400px]"
                            : "max-h-[80vh] w-auto max-w-[500px]"
                        }`}
                        title="resume"
                      />
                    </a>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-gray-200">
                      <span className="text-xs text-gray-600 font-medium">
                        Resume
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Job Description Preview (if available) */}
              {hasJobDescription && (
                <div className="animate-in fade-in duration-1000 gradient-border flex-shrink-0">
                  <div className="relative group">
                    <a
                      href={jobDescriptionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={jobDescriptionImagePath}
                        className="max-h-[70vh] w-auto max-w-[400px] object-contain rounded-2xl shadow-lg transition-transform duration-200 group-hover:scale-105"
                        title="job description"
                      />
                    </a>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-gray-200">
                      <span className="text-xs text-gray-600 font-medium">
                        Job Description
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
        {/* Feedback section */}
        <section className="feedback-section max-h-[100vh] overflow-y-auto scrollbar-hide">
          <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
          {feedback ? (
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
              <Summary feedback={feedback} />
              <ATS
                score={feedback.ATS.score || 0}
                suggestions={feedback.ATS.tips || []}
              />
              <Details feedback={feedback} />
            </div>
          ) : (
            <img src="/images/resume-scan-2.gif" className="w-full" />
          )}
        </section>
      </div>
    </main>
  );
};
export default Resume;
