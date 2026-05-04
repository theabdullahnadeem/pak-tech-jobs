"use client";

import { getPremiumToggleState } from "@/lib/enterpriseTier";
import type { EmployerTier } from "@/lib/enterpriseTier";

interface PremiumListingToggleProps {
  tier: EmployerTier;
  value: boolean;
  onChange: (v: boolean) => void;
}

/**
 * A toggle control for marking a job post as a premium listing.
 *
 * - FREE tier: rendered as disabled with tooltip "Contact Sales to Unlock"
 * - PRO / ENTERPRISE tier: rendered as enabled, wired to value/onChange
 *
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4
 */
export default function PremiumListingToggle({
  tier,
  value,
  onChange,
}: PremiumListingToggleProps) {
  const { disabled, tooltip } = getPremiumToggleState(tier);

  const toggle = (
    <label
      className={`inline-flex items-center gap-2.5 text-sm select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        checked={value}
        disabled={disabled}
        onChange={(e) => {
          if (!disabled) onChange(e.target.checked);
        }}
        className="accent-emerald-600 h-4 w-4"
        aria-label="Premium Listing"
      />
      <span className="text-gray-700 font-medium">Premium Listing</span>
      {disabled && (
        <span className="text-xs text-gray-400 font-normal">(PRO / ENTERPRISE only)</span>
      )}
    </label>
  );

  if (tooltip) {
    return (
      <span title={tooltip} className="inline-block">
        {toggle}
      </span>
    );
  }

  return toggle;
}
