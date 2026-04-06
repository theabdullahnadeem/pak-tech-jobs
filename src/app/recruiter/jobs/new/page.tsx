"use client";

import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

type ExperienceLevel = "JUNIOR" | "MID" | "SENIOR" | "LEAD";
type JobType = "FULL_TIME" | "REMOTE" | "CONTRACT" | "INTERNSHIP" | "PART_TIME";

interface FormErrors {
  title?: string;
  description?: string;
  skills?: string;
  location?: string;
  city?: string;
  salaryMin?: string;
  salaryMax?: string;
  experienceLevel?: string;
  jobType?: string;
  category?: string;
  general?: string;
}

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: "JUNIOR", label: "Junior" },
  { value: "MID", label: "Mid-level" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead" },
];

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "REMOTE", label: "Remote" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "PART_TIME", label: "Part-time" },
];

export default function NewJobPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">("");
  const [jobType, setJobType] = useState<JobType | "">("");

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");

  const [requiredFields, setRequiredFields] = useState<string[]>(["name", "email"]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // ── Tag input helpers ────────────────────────────────────────────────────────

  function addTag(
    value: string,
    list: string[],
    setList: (v: string[]) => void,
    setInput: (v: string) => void
  ) {
    const trimmed = value.trim().replace(/,$/, "").trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
    }
    setInput("");
  }

  function handleTagKeyDown(
    e: KeyboardEvent<HTMLInputElement>,
    input: string,
    list: string[],
    setList: (v: string[]) => void,
    setInput: (v: string) => void
  ) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input, list, setList, setInput);
    } else if (e.key === "Backspace" && input === "" && list.length > 0) {
      setList(list.slice(0, -1));
    }
  }

  function removeTag(tag: string, list: string[], setList: (v: string[]) => void) {
    setList(list.filter((t) => t !== tag));
  }

  // ── Validation ───────────────────────────────────────────────────────────────

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!title.trim()) errs.title = "Title is required";
    if (!description.trim()) errs.description = "Description is required";
    if (!location.trim()) errs.location = "Location is required";
    if (!city.trim()) errs.city = "City is required";
    if (skills.length === 0) errs.skills = "At least one skill is required";
    if (categories.length === 0) errs.category = "At least one category is required";
    if (!experienceLevel) errs.experienceLevel = "Experience level is required";
    if (!jobType) errs.jobType = "Job type is required";

    const min = Number(salaryMin);
    const max = Number(salaryMax);
    if (!salaryMin) {
      errs.salaryMin = "Minimum salary is required";
    } else if (isNaN(min) || min < 0) {
      errs.salaryMin = "Enter a valid salary";
    }
    if (!salaryMax) {
      errs.salaryMax = "Maximum salary is required";
    } else if (isNaN(max) || max < 0) {
      errs.salaryMax = "Enter a valid salary";
    } else if (salaryMin && !errs.salaryMin && min > max) {
      errs.salaryMax = "Max salary must be ≥ min salary";
    }

    return errs;
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Flush any pending tag inputs
    const finalSkills = skillInput.trim()
      ? [...skills, skillInput.trim()]
      : skills;
    const finalCategories = categoryInput.trim()
      ? [...categories, categoryInput.trim()]
      : categories;

    if (skillInput.trim()) setSkills(finalSkills);
    if (categoryInput.trim()) setCategories(finalCategories);

    const errs = validate();
    // Re-check with flushed values
    if (finalSkills.length === 0) errs.skills = "At least one skill is required";
    if (finalCategories.length === 0) errs.category = "At least one category is required";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          skills: finalSkills,
          location: location.trim(),
          city: city.trim(),
          salaryMin: Number(salaryMin),
          salaryMax: Number(salaryMax),
          experienceLevel,
          jobType,
          category: finalCategories,
          requiredFields,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrors({ general: data.error || "Failed to create job post" });
        return;
      }

      router.push("/recruiter/dashboard");
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Post a New Job</h1>
        <p className="text-sm text-gray-500 mb-8">
          Fill in all required fields to publish your listing.
        </p>

        {errors.general && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Title */}
          <Field label="Job Title" error={errors.title} required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior React Developer"
              className={inputCls(!!errors.title)}
            />
          </Field>

          {/* Description */}
          <Field label="Description" error={errors.description} required>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Describe the role, responsibilities, and requirements..."
              className={inputCls(!!errors.description)}
            />
          </Field>

          {/* Skills tag input */}
          <Field label="Required Skills" error={errors.skills} required hint="Press Enter or comma to add">
            <TagInput
              tags={skills}
              input={skillInput}
              onInputChange={setSkillInput}
              onKeyDown={(e) => handleTagKeyDown(e, skillInput, skills, setSkills, setSkillInput)}
              onBlur={() => addTag(skillInput, skills, setSkills, setSkillInput)}
              onRemove={(t) => removeTag(t, skills, setSkills)}
              hasError={!!errors.skills}
              placeholder="e.g. React, TypeScript"
            />
          </Field>

          {/* Category tag input */}
          <Field label="Category" error={errors.category} required hint="Press Enter or comma to add">
            <TagInput
              tags={categories}
              input={categoryInput}
              onInputChange={setCategoryInput}
              onKeyDown={(e) => handleTagKeyDown(e, categoryInput, categories, setCategories, setCategoryInput)}
              onBlur={() => addTag(categoryInput, categories, setCategories, setCategoryInput)}
              onRemove={(t) => removeTag(t, categories, setCategories)}
              hasError={!!errors.category}
              placeholder="e.g. Frontend, Full-stack"
            />
          </Field>

          {/* Location + City */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Location" error={errors.location} required>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Pakistan"
                className={inputCls(!!errors.location)}
              />
            </Field>
            <Field label="City" error={errors.city} required>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Lahore"
                className={inputCls(!!errors.city)}
              />
            </Field>
          </div>

          {/* Salary range */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Min Salary (PKR)" error={errors.salaryMin} required>
              <input
                type="number"
                min={0}
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="e.g. 80000"
                className={inputCls(!!errors.salaryMin)}
              />
            </Field>
            <Field label="Max Salary (PKR)" error={errors.salaryMax} required>
              <input
                type="number"
                min={0}
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="e.g. 150000"
                className={inputCls(!!errors.salaryMax)}
              />
            </Field>
          </div>

          {/* Experience level + Job type */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Experience Level" error={errors.experienceLevel} required>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                className={inputCls(!!errors.experienceLevel)}
              >
                <option value="">Select level</option>
                {EXPERIENCE_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Job Type" error={errors.jobType} required>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType)}
                className={inputCls(!!errors.jobType)}
              >
                <option value="">Select type</option>
                {JOB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Required application fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Application Fields
              <span className="ml-1 text-xs text-gray-400 font-normal">(what applicants must fill in)</span>
            </label>
            <div className="rounded-lg border border-gray-300 bg-white p-3 space-y-2">
              {[
                { key: "name", label: "Full Name", locked: true },
                { key: "email", label: "Email Address", locked: true },
                { key: "phone", label: "Phone Number", locked: false },
                { key: "yearsOfExperience", label: "Years of Experience", locked: false },
                { key: "coverLetter", label: "Cover Letter", locked: false },
                { key: "cv", label: "CV / Resume Upload", locked: false },
              ].map(field => (
                <label key={field.key} className={`flex items-center gap-2.5 text-sm ${field.locked ? "opacity-60" : "cursor-pointer"}`}>
                  <input
                    type="checkbox"
                    checked={requiredFields.includes(field.key)}
                    disabled={field.locked}
                    onChange={e => {
                      if (field.locked) return;
                      setRequiredFields(prev =>
                        e.target.checked ? [...prev, field.key] : prev.filter(f => f !== field.key)
                      );
                    }}
                    className="accent-emerald-600 h-4 w-4"
                  />
                  <span className="text-gray-700">{field.label}</span>
                  {field.locked && <span className="text-xs text-gray-400">(always required)</span>}
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Publishing…" : "Publish Job Post"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
  return [
    "w-full rounded-lg border px-3 py-2 text-sm text-gray-900 bg-white",
    "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
    hasError ? "border-red-400" : "border-gray-300",
  ].join(" ");
}

function Field({
  label,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="ml-1 text-xs text-gray-400 font-normal">({hint})</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface TagInputProps {
  tags: string[];
  input: string;
  onInputChange: (v: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onRemove: (tag: string) => void;
  hasError: boolean;
  placeholder?: string;
}

function TagInput({
  tags,
  input,
  onInputChange,
  onKeyDown,
  onBlur,
  onRemove,
  hasError,
  placeholder,
}: TagInputProps) {
  return (
    <div
      className={[
        "flex flex-wrap gap-1.5 rounded-lg border px-3 py-2 bg-white min-h-[42px]",
        "focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent",
        hasError ? "border-red-400" : "border-gray-300",
      ].join(" ")}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium"
        >
          {tag}
          <button
            type="button"
            onClick={() => onRemove(tag)}
            className="hover:text-emerald-600 leading-none"
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] text-sm text-gray-900 bg-transparent outline-none placeholder-gray-400"
      />
    </div>
  );
}
