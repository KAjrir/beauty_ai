'use client'

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";


const page = () => {
  const searchParams = useSearchParams();
  const router = useRouter()
  const sessionId = searchParams.get('session_id');

  return (
    <div>
      <h1>Payment successful!</h1>
      <p>Session ID: {sessionId}</p>
      <Link href={'/'}>Back to dashboard</Link>
    </div>
  );
}

export default page