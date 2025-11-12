import MessageCard from "./MessageCard"
import ReactMarkdown from 'react-markdown';
import TypingDots from "./TypingDots";
import '@/styles/markdown.css'
import { useEffect, useRef } from "react";


const MessageContainer = ({messages, result, isLoading, messageRef}) => {
    const chatRef = useRef(null)

    useEffect(() => {
        if(chatRef.current && messageRef.current && isLoading){
            messageRef.current.style.height = 10 + 'vh';
            messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }

    }, [isLoading])
    

  return (
    <>
    {messages.length < 2  && 
        <div className="m-auto">
            <div>
                <h1 className="text-5xl text-white font-bold">Beauty AI</h1>
                <h2 className="text-2xl text-gray-200">Your Beauty Questions, Solved</h2>
            </div>
        </div>
    }

    {messages.length >= 2 &&
        <div 
            ref={chatRef}
            className="rounded-2xl max-sm:w-[80%] sm:w-[80%] px-6 pb-15 pt-5 flex flex-col" >
            {messages.map((message, i) => {
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

