import { getContactMessages } from '@/actions/contact';
import ContactMessagesManager from '@/components/ContactMessagesManager';

export const revalidate = 0; // Fresh data on every visit

export default async function AdminMessagesPage() {
  const result = await getContactMessages();
  const messages = result.success && result.data ? result.data : [];

  return <ContactMessagesManager initialMessages={messages} />;
}
