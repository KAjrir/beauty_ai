import MessageCard from "./MessageCard"
import ReactMarkdown from 'react-markdown';
import TypingDots from "./TypingDots";
import '@/styles/markdown.css'
import { useEffect, useRef } from "react";


const MessageContainer = ({messages, result, isLoading, messageRef}) => {
    const chatRef = useRef(null)

    useEffect(() => {
        if(chatRef.current && messageRef.current && isLoading){
            messageRef.current.style.height = 75 + 'vh';
            messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }

    }, [isLoading])
    

  return (
    <>
    {messages.length < 2  && 
        <div>
            <h1 className="text-5xl text-white font-bold">Beauty AI</h1>
            <h2 className="text-2xl text-gray-200">Your Beauty Questions, Solved</h2>
        </div>
    }

    {messages.length >= 2 &&
        <div 
            ref={chatRef}
            className="mt-30 mb-30 rounded-2xl max-sm:w-[80%] sm:w-[80%] px-4 py-2 overflow-y-auto flex flex-col" >
            {messages.map((message, i) => {
                // if(messages[i] === messages.length - 1) return null
                return <MessageCard key={message.id} message={message}/>
            })}
            {isLoading ? <TypingDots /> : (
                result && <div className="markdown w-[80%]">
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

