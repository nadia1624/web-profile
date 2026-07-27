import { getProfile } from '@/actions/profile';
import ProfileForm from '@/components/ProfileForm';

export const revalidate = 0; // Fetch fresh data on every visit

export default async function AdminProfilePage() {
  const profile = await getProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-heading text-white">Profile Management</h1>
        <p className="text-zinc-500 text-xs mt-1">
          Manage your personal biographies, profile photo, social links, and CV.
        </p>
      </div>

      <ProfileForm profile={profile as any} />
    </div>
  );
}
