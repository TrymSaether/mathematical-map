import type { LearningState } from "../store";

/** Small status badge for a concept's learning state. */
export function StateGlyph({
  state,
  size = 16,
  color = "var(--primary)",
}: {
  state: LearningState;
  size?: number;
  color?: string;
}) {
  if (state === "learned") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="9" fill="#16a34a" />
        <path d="M7 12.5l3 3 6-7" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (state === "in-progress") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2" />
        <path d="M12 3 a9 9 0 0 1 0 18 z" fill={color} />
      </svg>
    );
  }
  if (state === "locked") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 018 0v3" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="#cbd5e1" strokeWidth="2" />
    </svg>
  );
}

export const LEARNING_STATE_LABEL: Record<LearningState, string> = {
  learned: "Learned",
  "in-progress": "In Progress",
  "not-started": "Not Started",
  locked: "Locked",
};
