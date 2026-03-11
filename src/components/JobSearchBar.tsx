"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface JobSearchBarProps {
  className?: string;
  initialKeyword?: string;
  initialLocation?: string;
}

export default function JobSearchBar({
  className = "",
  initialKeyword = "",
  initialLocation = "All Cities",
}: JobSearchBarProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState(initialLocation);

  const locations = ["All Cities", "Lahore", "Karachi", "Islamabad", "Remote"];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct search URL or route intelligently based on generic implementation
    let route = "/jobs";
    
    if (location.toLowerCase() === "remote") {
      route = "/remote-jobs";
    } else if (location !== "All Cities") {
      route = `/jobs-in-${location.toLowerCase()}`;
    }

    const searchParams = new URLSearchParams();
    if (keyword) searchParams.set("q", keyword);
    
    const queryString = searchParams.toString();
    router.push(`${route}${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`flex flex-col md:flex-row items-center gap-2 p-2 bg-card dark:bg-card-dark rounded-2xl md:rounded-full border border-border dark:border-border-dark shadow-lg ${className}`}
    >
      <div className="flex-1 flex items-center w-full px-4 py-2 md:py-0 border-b md:border-b-0 border-border dark:border-border-dark md:border-r">
        <span className="text-xl mr-3 opacity-50">🔍</span>
        <input
          type="text"
          placeholder="Job title, skill, or keyword..."
          className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted focus:ring-0"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <div className="flex-1 flex items-center w-full px-4 py-2 md:py-0 relative">
        <span className="text-xl mr-3 opacity-50">📍</span>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-foreground cursor-pointer focus:ring-0 appearance-none pr-8"
        >
          {locations.map((loc) => (
            <option key={loc} value={loc} className="bg-card dark:bg-card-dark">
              {loc}
            </option>
          ))}
        </select>
        <div className="absolute right-4 pointer-events-none opacity-50">
          ▼
        </div>
      </div>

      <button
        type="submit"
        className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl md:rounded-full transition-all duration-300 flex items-center justify-center gap-2"
      >
        Search Jobs
      </button>
    </form>
  );
}
