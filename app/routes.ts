import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/auth", "routes/auth.tsx"),
  route("/upload", "routes/upload/index.tsx"),
  route("/upload/job-pdf", "routes/upload/jobpdf.tsx"),
  route("/resume/:id", "routes/resume.tsx"),
] satisfies RouteConfig;
