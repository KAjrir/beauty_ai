"use client";

import { X, ChevronLeft, ChevronRight, MessageSquare, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ chats, isOpen, isDesktop, setIsOpen, onToggle, onClose }) {
  const pathName = usePathname()
  
  return (
    <aside
      className={`bg-purple-950 border-r border-purple-800 text-white transition-all duration-300 flex flex-col
        ${isDesktop
          ? isOpen
            ? "sticky top-24 w-64 h-[calc(100vh-6rem)]"
            : "sticky top-24 w-16 h-[calc(100vh-6rem)]"
          : isOpen
            ? "fixed top-0 bottom-0 left-0 right-25 z-60"
            : "hidden"}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-purple-800">
        {isOpen && <h2 className="text-lg font-semibold">Your Chats</h2>}

        {isDesktop ? (
          <button onClick={onToggle} className="p-1 rounded hover:bg-purple-800 cursor-pointer">
            {isOpen ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
          </button>
        ) : (
          <button onClick={onClose}>
            <X size={24} />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-3 overflow-auto">
        <Link href={'/'}>
          <SidebarItem icon={<MessageSquare size={22} />} label="New Chat" isOpen={isOpen} />
        </Link>

        <SidebarItem icon={<Search size={22} />} label="Search" isOpen={isOpen} />
        <hr />
        <nav className="flex-1 space-y-3">
          {chats && 
            chats.map(chat => {
              const currentChat = pathName === `/chat/${chat.id}`
              return (
              <Chat 
                key={chat.id}
                id={chat.id} 
                label={chat.title}
                isOpen={isOpen}
                isDesktop={isDesktop}
                setIsOpen={setIsOpen}
                currentChat={currentChat}
              />
              )
            }
          )}
        </nav>
      </nav>
    </aside>
  );
}

function SidebarItem({ icon=null, label, isOpen }) {
  return (
    <button
      className={`flex items-center gap-3 w-full hover:bg-purple-800 active:bg-purple-900 cursor-pointer rounded p-2 transition-all ${
        isOpen ? "justify-start" : "justify-center"
      }`}
    >
      {icon}
      {isOpen && <span>{label}</span>}
    </button>
  );
}

function Chat({id, label, isOpen, isDesktop, setIsOpen, currentChat}) {
  return (
    <Link key={id} href={`/chat/${id}`}
      onNavigate={(e) => {
        if(currentChat){
          e.preventDefault()
          return
        }
        if(!isDesktop && isOpen) {
          setIsOpen(false)
        }
      }}
    >
      <button
        className={`flex items-center gap-3 w-full hover:bg-purple-800 active:bg-purple-900 cursor-pointer rounded p-2 transition-all ${
          isOpen ? "justify-start" : "justify-center"
        }`}
      >
        {isOpen && <span className="text-nowrap overflow-x-hidden text-ellipsis">{label}</span>}
      </button>
    </Link>
  );
}
