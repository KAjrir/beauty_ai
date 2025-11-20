import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { auth } from '@/auth';
import { getUser, getPlans } from '@/lib/actions/action';

export default async function ClientLayoutShell({ children }) {
  const session = await auth();
  const user = session ? await getUser(session.user.id) : null;
  const plans = await getPlans();

  return (
    <>
      <Header
        plans={plans}
        user={user}
      />
      
      <main className="flex flex-1 overflow-hidden">
      {user && (
        <Sidebar />
      )}

        <div className="flex-3 overflow-y-auto">
          {children}
        </div>
      </main>
    </>
  );
}
