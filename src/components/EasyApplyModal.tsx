"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";

export interface JobForApply {
  id: string;
  title: string;
  requiredFields: string[];
}

interface Props {
  job: JobForApply;
  onClose: () => void;
  onSuccess: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Full Name",
  email: "Email Address",
  phone: "Phone Number",
  yearsOfExperience: "Years of Experience",
  coverLetter: "Cover Letter",
  cv: "CV / Resume",
};

function inp(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2 text-sm text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${hasError ? "border-red-500/60" : "border-white/10"}`;
}

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default function EasyApplyModal({ job, onClose, onSuccess }: Props) {
  const { data: session } = useSession();

  const [name, setName] = useState(session?.user?.name ?? "");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadStep, setUploadStep] = useState<"idle" | "uploading" | "submitting">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  const required = job.requiredFields;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setCvError("");
    if (!file) { setCvFile(null); return; }
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      setCvError("Only PDF, DOC, or DOCX files are accepted.");
      setCvFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCvError("File must be under 5MB.");
      setCvFile(null);
      return;
    }
    setCvFile(file);
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (required.includes("name") && !name.trim()) errs.name = "Full name is required";
    if (required.includes("email") && !email.trim()) errs.email = "Email is required";
    if (required.includes("phone") && !phone.trim()) errs.phone = "Phone number is required";
    if (required.includes("yearsOfExperience") && !yearsOfExperience) errs.yearsOfExperience = "Years of experience is required";
    if (required.includes("coverLetter") && !coverLetter.trim()) errs.coverLetter = "Cover letter is required";
    if (required.includes("cv") && !cvFile) errs.cv = "CV upload is required";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    let cvPublicId: string | undefined;
    let cvFileName: string | undefined;

    try {
      if (cvFile) {
        setUploadStep("uploading");
        const sigRes = await fetch("/api/upload/cv-signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobPostId: job.id }),
        });
        if (!sigRes.ok) throw new Error("Failed to get upload signature");
        const sig = await sigRes.json();

        const formData = new FormData();
        formData.append("file", cvFile);
        formData.append("api_key", sig.api_key);
        formData.append("timestamp", String(sig.timestamp));
        formData.append("signature", sig.signature);
        formData.append("folder", sig.folder);
        formData.append("public_id", sig.public_id);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${sig.cloud_name}/raw/upload`,
          { method: "POST", body: formData }
        );
        if (!uploadRes.ok) throw new Error("CV upload to Cloudinary failed. Please try again.");
        const uploadData = await uploadRes.json();
        cvPublicId = uploadData.public_id as string;
        cvFileName = cvFile.name;
      }

      setUploadStep("submitting");
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobPostId: job.id,
          applicantName: name.trim(),
          applicantEmail: email.trim(),
          applicantPhone: phone.trim() || undefined,
          yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
          coverLetter: coverLetter.trim() || undefined,
          cvPublicId,
          cvFileName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        else setErrors({ general: data.error ?? "Submission failed" });
        setUploadStep("idle");
        return;
      }

      onSuccess();
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : "Something went wrong" });
      setUploadStep("idle");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">Apply for this role</h2>
            <p className="text-xs text-gray-400 mt-0.5">{job.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-gray-500 hover:text-white transition-colors text-2xl leading-none disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {errors.general && (
            <div className="rounded-lg bg-red-950/40 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {errors.general}
            </div>
          )}

          {required.includes("name") && (
            <Field label={FIELD_LABELS.name} error={errors.name} required>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className={inp(!!errors.name)}
                placeholder="Your full name"
              />
            </Field>
          )}

          {required.includes("email") && (
            <Field label={FIELD_LABELS.email} error={errors.email} required>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inp(!!errors.email)}
                placeholder="you@example.com"
              />
            </Field>
          )}

          {required.includes("phone") && (
            <Field label={FIELD_LABELS.phone} error={errors.phone} required>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className={inp(!!errors.phone)}
                placeholder="+92 300 0000000"
              />
            </Field>
          )}

          {required.includes("yearsOfExperience") && (
            <Field label={FIELD_LABELS.yearsOfExperience} error={errors.yearsOfExperience} required>
              <input
                type="number"
                min={0}
                max={50}
                value={yearsOfExperience}
                onChange={e => setYearsOfExperience(e.target.value)}
                className={inp(!!errors.yearsOfExperience)}
                placeholder="e.g. 3"
              />
            </Field>
          )}

          {required.includes("coverLetter") && (
            <Field label={FIELD_LABELS.coverLetter} error={errors.coverLetter} required>
              <textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                rows={4}
                className={inp(!!errors.coverLetter) + " resize-none"}
                placeholder="Tell the recruiter why you're a great fit…"
              />
            </Field>
          )}

          {required.includes("cv") && (
            <Field label={FIELD_LABELS.cv} error={errors.cv || cvError} required>
              <div
                onClick={() => fileRef.current?.click()}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                  cvFile
                    ? "border-emerald-500/60 bg-emerald-950/20"
                    : "border-white/10 bg-gray-800 hover:border-white/20"
                }`}
              >
                <span className="text-lg">{cvFile ? "📄" : "📎"}</span>
                <span className="text-sm text-gray-300 truncate flex-1">
                  {cvFile ? cvFile.name : "Click to upload PDF, DOC, or DOCX (max 5MB)"}
                </span>
                {cvFile && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setCvFile(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="text-gray-500 hover:text-red-400 text-xs shrink-0"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </Field>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {submitting && (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            )}
            {uploadStep === "uploading"
              ? "Uploading CV…"
              : uploadStep === "submitting"
              ? "Submitting…"
              : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}
