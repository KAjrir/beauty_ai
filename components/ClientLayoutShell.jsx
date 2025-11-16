"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function ClientLayoutShell({ user, plans, chats, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const DESKTOP = window.innerWidth >= 640;

      setIsDesktop(DESKTOP);
      setIsOpen(DESKTOP);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <Header
        plans={plans}
        user={user}
        onHamburgerClick={() => setIsOpen(true)}
        isDesktop={isDesktop}
      />
      
        <main className="flex flex-1 overflow-hidden">
        { user && (
          <Sidebar
            chats={chats}
            isOpen={isOpen}
            isDesktop={isDesktop}
            onToggle={() => setIsOpen((prev) => !prev)}
            onClose={() => setIsOpen(false)}
          />
        )}

          <div className="flex-3 overflow-y-auto">{children}</div>
        </main>
    </>
  );
}
