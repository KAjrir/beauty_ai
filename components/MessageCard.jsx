import ReactMarkdown from 'react-markdown';
import '@/styles/markdown.css'



const MessageCard = ( { message } ) => {
  return (
    <>
        {message.role === "assistant" && 
        
            <div className="markdown max-sm:w-[90%] w-[80%]">
                <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
        }

        {message.role === "user" && 
        
            <div className="w-[80%] ml-auto my-2 justify-items-end">
                <p className='bg-[#8641C3] sm:text-xl rounded-lg px-3 py-1.5'>
                    {message.content} 
                </p>
            </div>
        }

    </>
  )
}

export default MessageCard