import { CyberCard } from "@/components/cyberpunk";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back button skeleton */}
      <div className="h-4 w-40 bg-[#2a2a35] rounded" />

      {/* Topic skeleton */}
      <CyberCard className="p-6">
        <div className="mb-4">
          <div className="h-4 w-32 bg-[#2a2a35] rounded" />
        </div>
        <div className="h-8 w-full bg-[#2a2a35] rounded mb-6" />
        
        {/* Author skeleton */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#2a2a35]">
          <div className="h-10 w-10 bg-[#2a2a35] rounded" />
          <div>
            <div className="h-4 w-32 bg-[#2a2a35] rounded mb-2" />
            <div className="h-3 w-24 bg-[#2a2a35] rounded" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="space-y-2 mb-6">
          <div className="h-4 w-full bg-[#2a2a35] rounded" />
          <div className="h-4 w-full bg-[#2a2a35] rounded" />
          <div className="h-4 w-3/4 bg-[#2a2a35] rounded" />
        </div>

        {/* Stats skeleton */}
        <div className="flex items-center gap-4 pt-4 border-t border-[#2a2a35]">
          <div className="h-4 w-20 bg-[#2a2a35] rounded" />
          <div className="h-4 w-24 bg-[#2a2a35] rounded" />
          <div className="h-4 w-20 bg-[#2a2a35] rounded" />
        </div>
      </CyberCard>

      {/* Comments section skeleton */}
      <section className="space-y-4">
        <div className="h-6 w-48 bg-[#2a2a35] rounded" />
        
        {[1, 2, 3].map((i) => (
          <CyberCard key={i} className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 bg-[#2a2a35] rounded" />
              <div>
                <div className="h-4 w-24 bg-[#2a2a35] rounded mb-1" />
                <div className="h-3 w-32 bg-[#2a2a35] rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-[#2a2a35] rounded" />
              <div className="h-4 w-2/3 bg-[#2a2a35] rounded" />
            </div>
          </CyberCard>
        ))}
      </section>
    </div>
  );
}
