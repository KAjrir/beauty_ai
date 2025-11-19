import { auth } from "@/auth";
import SidebarClient from "@/components/SidebarClient";
import { getUserChats } from "@/lib/actions/chat";

const Sidebar = async () => {
    const session = await auth()
    if(!session) redirect("/")
    const chats = session ? await getUserChats(session.user.id) : []

    return (
        <SidebarClient chats={chats}/>
    )
}

export default Sidebar