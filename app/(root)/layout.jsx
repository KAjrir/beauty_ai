import { auth } from '@/auth';
import Header from '@/components/Header'
import { getUser, getPlans } from '@/lib/actions/action';

const Layout = async ({ children }) => {
  const session = await auth()
  const user = session ? await getUser(session?.user?.id) : null
  const plans = await getPlans()

  return (
    <main className='flex'>
        <div className='flex-3'>
          <Header 
            plans={plans}
            user={user}
          />
          {children}
        </div>
    </main>   
  );
}

export default Layout