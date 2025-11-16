import MessageCard from "./MessageCard"
import ReactMarkdown from 'react-markdown';
import TypingDots from "./TypingDots";
import '@/styles/markdown.css'
import { useEffect, useRef } from "react";


const MessageContainer = ({messages, result, isLoading, messageRef}) => {
    const chatRef = useRef(null)
    console.log(messages)
    useEffect(() => {
        if(chatRef.current && messageRef.current && isLoading){
            messageRef.current.style.height = 10 + 'vh';
            chatRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }

        return () => {
            if (messageRef.current)  messageRef.current.style.height = 0;
        }

    }, [isLoading])
    

  return (
    <>
    {!messages.length  && 
        <div className="m-auto text-center">
            <div>
                <h1 className="md:text-5xl max-md:text-3xl text-white font-bold">Beauty AI</h1>
                <h2 className="md:text-3xl max-md:text-xl text-gray-200">Your Beauty Questions, Solved</h2>
            </div>
        </div>
    }

    {messages.length &&
        <div 
            ref={chatRef}
            className="rounded-2xl max-sm:w-full sm:w-[90%] px-2 pb-15 pt-5 flex flex-col"
        >
            {messages.map((message) => {
                return <MessageCard key={message.id} message={message}/>
            })}

            {isLoading ? <TypingDots /> : (
                result && 
                <div className="markdown w-[80%]">
                    <ReactMarkdown>{result}</ReactMarkdown>
                </div>
                )}
                <div ref={messageRef}></div>
        </div>
        
    }
        
    
    </>
  )
}

export default MessageContainer

