"use client"

import Image from "next/image"
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePathname } from "next/navigation";
import { navigationLinks } from "@/constants/index";
import { handleSignOut } from "@/lib/actions/action";
import { useState } from "react";
import PlanContainer from "./PlanContainer";

export default function Header ({ user, plans }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  

  return (
    <header className="flex fixed w-full bg-purple-900 justify-between items-center px-5 py-4">
        <Link href="/">
          <Image
            src='/logo-4.jpeg'
            alt="logo"
            width={50}
            height={50}
            className="rounded-full"
          />
        </Link>

        <div className="max-sm:text-xl flex gap-4 text-2xl items-center">
          {!user && navigationLinks.map(link => (
            <Link key={link.label} href={link.href} className={`${link.className} ${pathname === link.href && "underline"}`}>{link.label}</Link>
          ))}
          {user && <button onClick={handleSignOut} className="hover:underline">
            Sign out
          </button>}
          <button onClick={() => setOpen(true)}>
            <Avatar className="max-sm:h-10 max-sm:w-10 cursor-pointer h-15 w-15">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </button>

          <PlanContainer plans={plans} open={open} onClose={() => setOpen(false)} user={user} />
        </div>
    </header>
  )
}

