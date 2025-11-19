import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Loading from "@/app/loading";
import { auth } from '@/auth';
import { getUser, getPlans } from '@/lib/actions/action';
import { Suspense } from "react";
import { redirect } from "next/navigation";

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
        { user && (
          <Suspense>
            <Sidebar />
          </Suspense>
        )}

          <div className="flex-3 overflow-y-auto">
            {children}
          </div>
        </main>
    </>
  );
}
