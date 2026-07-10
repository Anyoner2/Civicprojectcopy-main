
export function InfrastructureBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=1600&q=80")',
        }}
      />
      <div className="absolute inset-0 bg-slate-950/75" />
    </div>
  );
}
