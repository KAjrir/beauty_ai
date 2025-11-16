'use client'

import { useToast } from "@/components/ui/toast-provider"
import { useRef, useState, useEffect,  } from "react";
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

  const { chatId } = useParams()
    
  const messageRef = useRef(null)

  
  const handleSend = async (data) => {
    const tempId = uuid()
    console.log(tempId)

    const updatedMessages = [...messages, { id: tempId, role: 'user', content: data, isTempUser: true }];
    setMessages(updatedMessages)
    setResult('');

    setIsLoading(prev => !prev)

    let res
    
    try {
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
    } finally{
      setIsLoading(prev => prev = false)
    }
    
    if (!res.ok) {
      const errorJson = await res.json();
      const msg = errorJson.error || "Something went wrong"

      // setError(msg);
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
              router.replace(`/chat/${event.chatId}`);
            }
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
              messageRef.current.style.height = "0px";
            }

            return;
          }

          continue;
        }
      }
    }
  }

  return (
    
    <main className="h-full flex flex-col justify-between items-center">
      
      <MessageContainer
        messages={messages}
        result={result}
        isLoading={isLoading}
        messageRef={messageRef}
      />

      {/* {error ? 
        (error.limitReached 
        ? <p className="fixed bottom-22 text-xl">Subscribe to a plan to ask more questions.</p>
        : <p className="fixed bottom-22 text-xl">{error.error}</p>
        )
      : (null)
      } */}
      
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