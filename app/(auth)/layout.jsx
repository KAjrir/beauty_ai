import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { IoArrowBackSharp } from "react-icons/io5";
import { FcGoogle } from 'react-icons/fc'
import Link from 'next/link'

const Layout = async ({ children }) => {
  const session = await auth();
  if (session) redirect("/");

  return (
    <main className="relative flex flex-col gap-4 justify-center m-auto">
      <div className="max-sm:static absolute top-0 left-[-120px] flex gap-1 max-sm:justify-start justify-between items-center">
        <IoArrowBackSharp />
        <Link href='/'>Go back</Link>
      </div>
      <form
        action={async () => {
          'use server'
          await signIn('google')
        }}
        className={`flex gap-1.5 justify-center items-center bg-white text-black rounded-lg py-3
          font-bold cursor-pointer
          `}
      
      >
          < FcGoogle/> |
          <button type="submit">Sign in with Google</button>
      </form>
      {children}
    </main>
  );
};

export default Layout