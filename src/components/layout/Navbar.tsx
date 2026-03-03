export function Navbar() {
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="text-lg font-bold text-slate-900">Sourcer OS</div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-600">User Settings</div>
        </div>
      </div>
    </nav>
  );
}
