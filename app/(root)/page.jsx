
import { auth } from "@/auth";
import ChatUI from "@/components/ChatUI";
import { getUser } from "@/lib/actions/action";




const Home = async () => {
  const session = await auth()
  const user = await getUser(session?.user.id)
  
  console.log("user: ", user)
  console.log("Session: ", session)

  return (
    <>
      <ChatUI />
    </>
  );
}

export default Home