import { getDedicatedSupportWidgetState } from "@/lib/enterpriseTier";
import type { EmployerTier } from "@/lib/enterpriseTier";

interface DedicatedSupportWidgetProps {
  tier: EmployerTier;
  accountManagerName: string | null;
}

/**
 * Renders a "Dedicated Support" card on the recruiter dashboard for Enterprise
 * employers. Shows the account manager's name when set, or a fallback message
 * when it hasn't been assigned yet. Returns null for non-Enterprise tiers.
 *
 * Validates: Requirements 5.1, 5.2, 5.3
 */
export default function DedicatedSupportWidget({
  tier,
  accountManagerName,
}: DedicatedSupportWidgetProps) {
  const { visible, message } = getDedicatedSupportWidgetState(tier, accountManagerName);

  if (!visible) return null;

  return (
    <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-emerald-400 text-lg" aria-hidden="true">🎯</span>
        <h2 className="text-sm font-semibold text-emerald-300 uppercase tracking-wide">
          Dedicated Support
        </h2>
      </div>
      {message ? (
        <p className="text-sm text-white">
          Your account manager:{" "}
          <span className="font-medium text-emerald-300">{message}</span>
        </p>
      ) : (
        <p className="text-sm text-gray-400">
          Your account manager will be assigned shortly.
        </p>
      )}
    </div>
  );
}
