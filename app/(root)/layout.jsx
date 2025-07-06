import { auth } from '@/auth';
import Header from '@/components/Header'
import { getUser, getPlans } from '@/lib/actions/action';

const Layout = async ({ children }) => {
  const session = await auth()
  const user = session ? await getUser(session?.user?.id) : null
  const plans = await getPlans()

  return (
    <>
        <Header plans={plans} user={user}/>
        {children}
    </>   
  );
}

export default Layout