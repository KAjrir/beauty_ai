import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getChat } from "@/lib/actions/chat"
import ChatUI from "@/components/ChatUI"

const ChatPage = async ({ params }) => {
    const session = await auth()
    if(!session) redirect("/")

    const { chatId } = await params
    
    const response = await getChat(chatId, session.user.id)
    
    // console.log("MESSAGES:", response)
    
    return (
        <ChatUI
            chatMessages={response.messages}
            error={response.error || null}
        />
    )
}

export default ChatPage