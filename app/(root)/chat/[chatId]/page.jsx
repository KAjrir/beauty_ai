import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getChatMessages } from "@/lib/actions/chat"
import ChatUI from "@/components/ChatUI"

const ChatPage = async ({ params }) => {
    const session = await auth()
    if(!session) redirect("/")
    const { chatId } = await params 
    
    const chats = await getChatMessages(chatId)
    
    return (
        <ChatUI chatMessages={chats}/>
    )
}

export default ChatPage