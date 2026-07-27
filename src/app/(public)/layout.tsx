import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getProfile } from '@/actions/profile';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Global subtle radial ambient lights */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-[800px] left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Dynamic Header */}
      <Navbar cvUrl={profile?.cvUrl} />

      {/* Main Pages */}
      <main className="flex-grow relative z-10 flex flex-col">
        {children}
      </main>

      {/* Dynamic Footer */}
      <Footer
        email={profile?.email}
        linkedinUrl={profile?.linkedinUrl}
        githubUrl={profile?.githubUrl}
        instagramUrl={profile?.instagramUrl}
      />
    </div>
  );
}
