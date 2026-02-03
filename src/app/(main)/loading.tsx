import { CyberCard } from "@/components/cyberpunk";

export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 bg-[#2a2a35] rounded mb-2" />
          <div className="h-4 w-96 bg-[#2a2a35] rounded" />
        </div>
        <div className="h-10 w-32 bg-[#2a2a35] rounded" />
      </div>

      {/* Categories skeleton */}
      <section>
        <div className="h-6 w-48 bg-[#2a2a35] rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CyberCard key={i} className="p-4">
              <div className="h-6 w-32 bg-[#2a2a35] rounded mb-2" />
              <div className="h-4 w-full bg-[#2a2a35] rounded mb-2" />
              <div className="h-4 w-24 bg-[#2a2a35] rounded" />
            </CyberCard>
          ))}
        </div>
      </section>

      {/* Topics skeleton */}
      <section>
        <div className="h-6 w-48 bg-[#2a2a35] rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <CyberCard key={i} className="p-4">
              <div className="h-6 w-3/4 bg-[#2a2a35] rounded mb-2" />
              <div className="h-4 w-1/2 bg-[#2a2a35] rounded mb-2" />
              <div className="h-4 w-full bg-[#2a2a35] rounded" />
            </CyberCard>
          ))}
        </div>
      </section>
    </div>
  );
}
