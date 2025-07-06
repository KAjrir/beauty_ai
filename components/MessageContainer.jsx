import MessageCard from "./MessageCard"
import ReactMarkdown from 'react-markdown';
import TypingDots from "./TypingDots";
import '@/styles/markdown.css'


const MessageContainer = ({messages, result, isLoading}) => {
    

  return (
    <>
    {messages.length < 2  && 
        <div className="text-center m-auto grid gap-4">
            <h1 className="text-5xl text-white font-bold">Beauty AI</h1>
            <h2 className="text-2xl text-gray-200">Your Beauty Questions, Solved</h2>
        </div>
    }

    {messages.length >= 2 &&
        <div className="pb-15 rounded-sm max-sm:w-[95%] sm:w-[85%] max-xl:h-90 mb-5 px-3 py-2 overflow-auto flex flex-col" >
            {console.log(JSON.stringify(messages,null,2))}
            {messages.map((message, i) => {
                // if(messages[i] === messages.length - 1) return null
                return <MessageCard key={message.id} message={message}/>
            })}
            {isLoading ? <TypingDots /> : (
                result && <div className="markdown w-[80%]">
                    <ReactMarkdown>{result}</ReactMarkdown>
                </div>
                )}
        </div>
        
    }
        
    
    </>
  )
}

export default MessageContainer

