'use client'

import { useToast } from "@/components/ui/toast-provider"
import { useRef, useState, useEffect, startTransition} from "react";
import { useParams, useRouter } from "next/navigation";
import AcceptPrompt from "./AcceptPrompt";
import MessageContainer from "./MessageContainer";


const ChatUI = ({chatMessages, error}) => {
  const toast = useToast()
  const router = useRouter()

  useEffect(() => {
    if(error) {
      toast.error(error)
      router.replace("/")
    }

  }, [error])

  // const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState('');
  const [messages, setMessages] = useState( chatMessages || [] )
  const [pendingChatId, setPendingChatId] = useState(null)
  const [changeRouter, setChangeRouter] = useState(false)

  const { chatId } = useParams()
    
  const messageRef = useRef(null)

  useEffect(() => {
    if (!pendingChatId) return;

    startTransition(() => {
      router.replace(`/chat/${pendingChatId}`, {scroll: false});
    })
  }, [changeRouter])

  
  const handleSend = async (data) => {
    const tempId = uuid()

    const updatedMessages = [...messages, { id: tempId, role: 'user', content: data, isTempUser: true }];
    setMessages(updatedMessages)
    setResult('');

    
    let res
    
    try {
      setIsLoading(true)
      res = await fetch('/api/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: updatedMessages,
          chatId: chatId
        }),
      });
    } catch (err) {
        toast.error(err.error)
    }
    
    if (!res.ok) {
      const err = await res.json();
      const msg = err.error || "Something went wrong"

      toast.error(msg)

      return;
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) return;

    let buffer = "";
    let assistantMessageId = null;

    // continuous read
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // split op newline om JSON events te isoleren
      const lines = buffer.split("\n");

      // laatste lijn kan incompleet zijn → bewaren!
      buffer = lines.pop();

      for (let line of lines) {
        if (!line.trim()) continue;

        if (line.startsWith(`{"type"`)) {
          let event;
          try {
            event = JSON.parse(line);
          } catch (err) {
            console.error("Invalid JSON line:", line);
            continue;
          }

          if (event.type === "init") {
            if (event.chatId !== chatId) {
              setPendingChatId(event.chatId)
            }

            if (messageRef.current) {
              messageRef.current.style.height = 15+"vw"
              window.scrollBy(0, 200)
            }
            setIsLoading(false)

            continue;
          }

          if (event.type === "user_message_id") {
            updateUserMessageTempToReal(setMessages, event.id);
            continue;
          }

          if (event.type === "assistant_message_id") {
            // we bewaren alleen de ID hier (tekst later in "end")
            assistantMessageId = event.id;
            continue;
          }

          if (event.type === "token"){
            setResult(prev => prev + event.value)
            continue
          }

          if (event.type === "end") {
            const text = event.text;

            setMessages(prev => [
              ...prev,
              {
                id: assistantMessageId,
                role: "assistant",
                content: text,
              }
            ]);

            setResult("");

            if (messageRef.current) {
              messageRef.current.style.height = 0
            }
            setChangeRouter(true)
            return;
          }

          continue;
        }
      }
    }

    setChangeRouter(false)
  }

  return (
    
    <main className="h-full flex flex-col justify-between items-center">
      
      <MessageContainer
        messages={messages}
        result={result}
        isLoading={isLoading}
        messageRef={messageRef}
      />
      
      <AcceptPrompt
        handleSend={handleSend}
      />
    </main>
  )
}

export default ChatUI

function updateUserMessageTempToReal(setMessages, realId) {
  setMessages(prev =>
    prev.map(msg =>
      msg.isTempUser ? { ...msg, id: realId, isTempUser: false } : msg
    )
  );
}

function uuid() {
  // return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
  //   (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  // );
  const id = "id-" + Math.random().toString(36) + Date.now();
  return id
}