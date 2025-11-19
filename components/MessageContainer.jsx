"use client"

import MessageCard from "./MessageCard"
import ReactMarkdown from 'react-markdown';
import TypingDots from "./TypingDots";
import '@/styles/markdown.css'
import { useEffect, useRef, useState } from "react";


const MessageContainer = ({messages, result, isLoading, messageRef}) => {
    const chatRef = useRef(null)
    const [ready, setReady] = useState(false)
    // console.log(messages)

    useEffect(() => {
        if(messageRef.current) {
            messageRef.current?.scrollIntoView({ behavior: "instant" });
        }

        setReady(true)

    }, [messageRef.current, isLoading])
    

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
            className={`rounded-2xl max-sm:w-full sm:w-[90%] px-2 pb-25 pt-5 flex flex-col gap-3
                ${ready ? "opacity-100": "opacity-0"}
            `}
        
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

