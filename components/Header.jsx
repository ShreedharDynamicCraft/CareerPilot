"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import {
  PenBox,
  LayoutDashboard,
  FileText,
  GraduationCap,
  ChevronDown,
  Stars,
  Briefcase,
  Rocket,
  Brain,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-lg z-50"
    >
      <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={"/logo.png"}
              alt="CareerCraft"
              width={200}
              height={60}
              className="h-12 py-1 w-auto object-contain"
            />
          </motion.div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-4">
          <SignedIn>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="hidden md:flex items-center gap-2 transition-all hover:bg-primary hover:text-white"
              >
                <LayoutDashboard className="h-5 w-5" />
                Industry Insights
              </Button>
            </Link>

            {/* Career Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center gap-2 transition-all hover:bg-primary hover:text-white">
                  <Stars className="h-5 w-5" />
                  <span className="hidden md:block">Career Tools</span>
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-lg">
                <DropdownMenuItem asChild>
                  <Link href="/resume" className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    AI Resume Builder
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/ai-cover-letter" className="flex items-center gap-3">
                    <PenBox className="h-5 w-5 text-green-500" />
                    Cover Letter Generator
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/interview" className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-purple-500" />
                    Interview Prep
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/career-roadmap" className="flex items-center gap-3">
                    <Rocket className="h-5 w-5 text-orange-500" />
                    Career Roadmap
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/job-search" className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-yellow-500" />
                    Job Search
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/skill-up" className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-red-500" />
                    Skill Development
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Networking Section */}
            <Link href="/networking">
              <Button
                variant="ghost"
                className="hidden md:flex items-center gap-2 transition-all hover:bg-primary hover:text-white"
              >
                <Users className="h-5 w-5" />
                Networking
              </Button>
            </Link>
          </SignedIn>

          {/* Authentication Buttons */}
          <SignedOut>
            <SignInButton>
              <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
                <Button variant="outline">Sign In</Button>
              </motion.div>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonPopoverCard: "shadow-xl",
                  userPreviewMainIdentifier: "font-semibold",
                },
              }}
              afterSignOutUrl="/"
            />
          </SignedIn>
        </div>
      </nav>
    </motion.header>
  );
}
