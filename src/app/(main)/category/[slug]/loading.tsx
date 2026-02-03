import { CyberCard } from "@/components/cyberpunk";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back button skeleton */}
      <div className="h-4 w-40 bg-[#2a2a35] rounded" />

      {/* Header skeleton */}
      <CyberCard className="p-6">
        <div className="h-8 w-64 bg-[#2a2a35] rounded mb-2" />
        <div className="h-4 w-full bg-[#2a2a35] rounded mb-2" />
        <div className="h-4 w-32 bg-[#2a2a35] rounded" />
      </CyberCard>

      {/* Topics skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <CyberCard key={i} className="p-4">
            <div className="h-6 w-3/4 bg-[#2a2a35] rounded mb-2" />
            <div className="h-4 w-1/2 bg-[#2a2a35] rounded mb-2" />
            <div className="h-4 w-full bg-[#2a2a35] rounded" />
          </CyberCard>
        ))}
      </div>
    </div>
  );
}
