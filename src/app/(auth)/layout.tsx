export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center tech-grid relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0a0a0f] opacity-90" />
      <div className="scan-lines absolute inset-0 pointer-events-none" />
      <div className="relative z-10 w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
