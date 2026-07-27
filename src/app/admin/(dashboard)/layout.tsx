import AdminSidebar from '@/components/AdminSidebar';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground">
      {/* Responsive Admin Sidebar */}
      <AdminSidebar />

      {/* Admin Content Area */}
      <main className="flex-grow flex flex-col p-6 md:p-10 max-h-screen overflow-y-auto relative z-10">
        {/* Ambient background accent glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none z-0" />
        
        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
