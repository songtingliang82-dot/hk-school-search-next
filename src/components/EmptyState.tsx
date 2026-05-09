type EmptyStateProps = {
  message?: string;
};

export function EmptyState({
  message = "暂无符合条件的专业，请尝试放宽筛选条件",
}: EmptyStateProps) {
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-gray-500">
      <svg
        aria-hidden="true"
        viewBox="0 0 120 120"
        className="mb-4 h-20 w-20 text-slate-300"
        fill="none"
      >
        <circle cx="55" cy="55" r="34" stroke="currentColor" strokeWidth="8" />
        <path
          d="M79 79L99 99"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="8"
        />
        <path
          d="M39 52h32M39 64h20"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="6"
        />
      </svg>
      <p>{message}</p>
    </div>
  );
}
