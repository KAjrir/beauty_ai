import { auth } from '@/auth';
import { getUser, getPlans } from '@/lib/actions/action';
import { getUserChats } from '@/lib/actions/chat'
import ClientLayoutShell from '../../components/ClientLayoutShell';

export default async function Layout({ children }) {
  const session = await auth();
  const user = session ? await getUser(session?.user?.id) : null;
  const plans = await getPlans();
  const chats = user ? await getUserChats(user.id) : []

  return (
    <ClientLayoutShell user={user} plans={plans} chats={chats}>
      {children}
    </ClientLayoutShell>
  );
}