
export function InfrastructureBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80")',
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-slate-950/20" />
    </div>
  );
}
