import { getCurrentAdmin } from '@/actions/auth';
import SettingsForm from '@/components/SettingsForm';

export const revalidate = 0; // Fetch fresh data on every visit

export default async function AdminSettingsPage() {
  const currentAdmin = await getCurrentAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-heading text-white">System Settings</h1>
        <p className="text-zinc-500 text-xs mt-1">
          Manage your administrator email, profile display name, and update your security password.
        </p>
      </div>

      <SettingsForm currentAdmin={currentAdmin as any} />
    </div>
  );
}
