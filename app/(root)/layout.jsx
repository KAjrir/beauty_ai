import { auth } from '@/auth';
import { getUser, getPlans } from '@/lib/actions/action';
import ClientLayoutShell from '../../components/ClientLayoutShell'; // 👈 we maken deze dadelijk

export default async function Layout({ children }) {
  const session = await auth();
  const user = session ? await getUser(session?.user?.id) : null;
  const plans = await getPlans();

  return (
    <ClientLayoutShell user={user} plans={plans}>
      {children}
    </ClientLayoutShell>
  );
}