
import { auth } from "@/auth";
import ChatUI from "@/components/ChatUI";
import { getUser } from "@/lib/actions/action";




const Home = async () => {
  const session = await auth()
  
  console.log("Session: ", session)

  return (
    <>
      <ChatUI />
    </>
  );
}

export default Home