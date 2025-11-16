"use client";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { navigationLinks } from "@/constants/index";
import { handleSignOut } from "@/lib/actions/action";
import { Menu } from "lucide-react";
import { useState } from "react";
import PlanContainer from "./PlanContainer";

export default function Header({ user, plans, onHamburgerClick, isDesktop }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 h-24 max-sm:h-16 bg-purple-900 flex justify-between items-center px-4 md:px-6 shadow-md z-50">
      {/* Linkerkant */}
      <div className="flex items-center gap-3">
        {/* Hamburger alleen op mobiel */}
        {!isDesktop && (
          <button
            onClick={onHamburgerClick}
            className="bg-purple-800 p-2 rounded-md hover:bg-purple-700 transition"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-4.jpeg"
            alt="logo"
            width={42}
            height={42}
            className="rounded-full object-cover"
          />
          <span className="ml-2 text-white text-lg font-semibold max-sm:hidden">
            Beauty AI
          </span>
        </Link>
      </div>

      {/* Rechterkant */}
      <div className="flex items-center gap-3 text-lg max-sm:text-base">
        {/* Navigatie */}
        {!user &&
          navigationLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`${
                pathname === link.href ? "underline text-white" : "text-gray-200"
              } hover:text-white transition`}
            >
              {link.label}
            </Link>
          ))}

        {/* Sign out */}
        {user && (
          <button
            onClick={handleSignOut}
            className="hover:underline text-gray-200 hover:text-white transition"
          >
            Sign out
          </button>
        )}

        {/* Avatar */}
        {user && (
        <button onClick={() => setOpen(true)} className="flex items-center">
          <Avatar className="cursor-pointer h-9 w-9">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </button>
        )}

        {/* Plancontainer */}
        <PlanContainer
          plans={plans}
          open={open}
          onClose={() => setOpen(false)}
          user={user}
        />
      </div>
    </header>
  );
}
