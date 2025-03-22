import React from "react";
import { Button } from "./ui/button";
import {
  PenBox,
  LayoutDashboard,
  FileText,
  GraduationCap,
  ChevronDown,
  Briefcase,
  Search,
  Users,
  BarChart,
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
import { checkUser } from "@/lib/checkUser";

export default async function Header() {
  await  checkUser();

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 shadow-md">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <Image
            src={"/logo.png"}
            alt="CareerPilot"
            width={200}
            height={60}
            className="h-12 py-1 w-auto object-contain transition-transform hover:scale-105"
          />
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <SignedIn>
            <Link href="/dashboard">
              <Button variant="outline" className="hidden md:flex items-center gap-2 hover:bg-gray-100">
                <LayoutDashboard className="h-4 w-4" />
                Industry Insights
              </Button>
            </Link>

            {/* CareerPilot Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center gap-2 hover:bg-gray-100 transition-all">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden md:block">CareerPilot</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 shadow-lg rounded-lg border bg-white">
              
              <DropdownMenuItem asChild>
                  <Link href="/resume" className="flex items-center gap-2 hover:bg-gray-200 p-2 rounded-md">
                    <FileText className="h-4 w-4" />
                    Build Resume
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/ai-cover-letter" className="flex items-center gap-2 hover:bg-gray-200 p-2 rounded-md">
                    <PenBox className="h-4 w-4" />
                    Cover Letter
                  </Link>
                </DropdownMenuItem>
             


                <DropdownMenuItem asChild>
                  <Link href="/resume-analysis" className="flex items-center gap-2 hover:bg-gray-200 p-2 rounded-md">
                    <FileText className="h-4 w-4" />
                    Resume Analysis
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/interview" className="flex items-center gap-2 hover:bg-gray-200 p-2 rounded-md">
                    <GraduationCap className="h-4 w-4" />
                    Interview Prep
                  </Link>
                </DropdownMenuItem>



                <DropdownMenuItem asChild>
                  <Link href="/job-search" className="flex items-center gap-2 hover:bg-gray-200 p-2 rounded-md">
                    <Search className="h-4 w-4" />
                    Smart Job Search
                  </Link>
                </DropdownMenuItem>
                {/* <DropdownMenuItem asChild>
                  <Link href="/skill-up" className="flex items-center gap-2 hover:bg-gray-200 p-2 rounded-md">
                    <GraduationCap className="h-4 w-4" />
                    Skill Up for Promotion
                  </Link>
                </DropdownMenuItem> */}
                {/* <DropdownMenuItem asChild>
                  <Link href="/networking" className="flex items-center gap-2 hover:bg-gray-200 p-2 rounded-md">
                    <Users className="h-4 w-4" />
                    Networking Assistant
                  </Link>
                </DropdownMenuItem> */}
                {/* <DropdownMenuItem asChild>
                  <Link href="/freelance-jobs" className="flex items-center gap-2 hover:bg-gray-200 p-2 rounded-md">
                    <Briefcase className="h-4 w-4" />
                    Freelance & Remote Jobs
                  </Link>
                </DropdownMenuItem> */}
                {/* <DropdownMenuItem asChild>
                  <Link href="/internship-finder" className="flex items-center gap-2 hover:bg-gray-200 p-2 rounded-md">
                    <GraduationCap className="h-4 w-4" />
                    Internship Finder
                  </Link>
                </DropdownMenuItem> */}
                {/* Growth Tools Items Merged Here */}
     

                <DropdownMenuItem asChild>
                  <Link href="/career-advice" className="flex items-center gap-2 hover:bg-gray-200 p-2 rounded-md">
                    <BarChart className="h-4 w-4" />
                    AI Career Guidance Chatbot
                  </Link>
                </DropdownMenuItem>



              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <Button variant="outline" className="hover:bg-gray-100">Sign In</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 border rounded-full hover:shadow-lg transition-all",
                },
              }}
              afterSignOutUrl="/"
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}