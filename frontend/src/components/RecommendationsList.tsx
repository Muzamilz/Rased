export default function RecommendationsList({ recommendations }: { recommendations: string[] }) {
  if (recommendations.length === 0) return null;

  return (
    <ul className="space-y-2">
      {recommendations.map((r, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
            {i + 1}
          </span>
          <span className="text-sm text-gray-700">{r}</span>
        </li>
      ))}
    </ul>
  );
}
