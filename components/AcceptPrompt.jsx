'use client'

import { GoArrowRight } from "react-icons/go";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form"
import { useState } from "react";
import { nepFunctie} from "@/lib/actions/action"


const AcceptPrompt = ({handleSend}) => {
  const [ sendingMessage, setSendingMessage ] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
     if (!data.prompt?.trim() || sendingMessage) return;

    setSendingMessage(true);
    reset()
    
    try {
      console.log('⏳ Versturen bezig...');
      
      await handleSend(data.prompt)

      console.log('✅ Verstuurd:', data.prompt);

    } catch (err) {
      console.error('🚨 Fout bij verzenden:', err);
    } finally {
      setSendingMessage(false);
    }

  };
    
  const onKeyDown = (e) => {
    if(e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(onSubmit)()
    }
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="prompt-text-area fixed bottom-6 bg-purple-800">
        <Textarea 
          className="scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100 w-full overflow-y-auto resize-none"
          defaultValue=""
          onKeyDown={onKeyDown} 
          {...register("prompt")}
        />
        <button className="hover:opacity-60 transition active:scale-95">
          <GoArrowRight className="w-9 h-9 cursor-pointer rounded-full bg-black p-1.5"/>
        </button>
    </form>
  )
}

export default AcceptPrompt