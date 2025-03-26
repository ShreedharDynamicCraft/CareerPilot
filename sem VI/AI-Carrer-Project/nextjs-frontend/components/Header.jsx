import React from "react";
import { Button } from "./ui/button";
import {
  PenBox,
  LayoutDashboard,
  FileText,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Search,
  Users,
  BarChart,
  TrendingUp,
  UserCircle,
  Settings,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { checkUser } from "@/lib/checkUser";

export default async function Header() {
  await checkUser();

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 shadow-md">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
      
      
      
      
        <Link href="/" className="relative group">
          <div className="overflow-hidden relative">
            <Image
              src={"/logo.png"}
              alt="CareerPilot"
              width={200}
              height={60}
              className="h-12 py-1 w-auto object-contain transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
            />
            <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 group-hover:w-full"></div>
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <SignedIn>


{/*             
            <Link href="/dashboard">
              <Button variant="outline" className="hidden md:flex items-center gap-2 hover:bg-gray-100">
                <LayoutDashboard className="h-4 w-4" />
                Professional Outlook              </Button>
            </Link> */}





<Link href="/dashboard" className="relative group">
  <Button 
    variant="outline" 
    className="hidden md:flex items-center gap-2 px-4 py-2 
      bg-gradient-to-r from-blue-50 to-indigo-50 
      hover:from-blue-100 hover:to-indigo-100 
      border-2 border-transparent hover:border-blue-200 
      transition-all duration-300 shadow-sm hover:shadow-md
      group relative overflow-hidden"
  >
    <div className="flex items-center gap-2">
      <div className="relative">
        <LayoutDashboard className="h-4 w-4 text-blue-600 
          transition-transform duration-200 group-hover:-translate-y-5" />
        <TrendingUp className="h-4 w-4 text-indigo-600 absolute 
          top-0 left-0 translate-y-5 group-hover:translate-y-0 
          transition-transform duration-200" />
      </div>
      <span className="font-medium bg-gradient-to-r from-blue-600 
        to-indigo-600 bg-clip-text text-transparent">
        Professional Outlook
      </span>
      <ChevronRight className="h-4 w-4 text-blue-600 
        transform transition-transform duration-200 
        group-hover:translate-x-1" />
    </div>
    
    {/* Notification Dot */}
    <span className="absolute -top-1 -right-1 flex h-2 w-2">
      <span className="absolute inline-flex w-full h-full rounded-full 
        bg-blue-400 opacity-75 animate-ping"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 
        bg-blue-500"></span>
    </span>
    
    {/* Hover Effect Background */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 
      to-indigo-100/50 opacity-0 group-hover:opacity-100 
      transition-opacity duration-300"></div>
  </Button>
</Link>

{/* Career Profile Button */}
<Link href="/carrierform" className="relative group">
  <Button 
    variant="outline" 
    className="hidden md:flex items-center gap-2 px-4 py-2 
      bg-gradient-to-r from-purple-50 to-pink-50 
      hover:from-purple-100 hover:to-pink-100 
      border-2 border-transparent hover:border-purple-200 
      transition-all duration-300 shadow-sm hover:shadow-md
      group relative overflow-hidden"
  >
    <div className="flex items-center gap-2">
      <div className="relative">
        <UserCircle className="h-4 w-4 text-purple-600 
          transition-transform duration-200 group-hover:-translate-y-5" />
        <Settings className="h-4 w-4 text-pink-600 absolute 
          top-0 left-0 translate-y-5 group-hover:translate-y-0 
          transition-transform duration-200" />
      </div>
      <span className="font-medium bg-gradient-to-r from-purple-600 
        to-pink-600 bg-clip-text text-transparent">
        Career Profile
      </span>
      <ChevronRight className="h-4 w-4 text-purple-600 
        transform transition-transform duration-200 
        group-hover:translate-x-1" />
    </div>
    
    {/* Hover Effect Background */}
    <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 
      to-pink-100/50 opacity-0 group-hover:opacity-100 
      transition-opacity duration-300"></div>
  </Button>
</Link>


            {/* CareerPilot Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="relative overflow-hidden group flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-300 border-none shadow-md hover:shadow-lg">
                  <Briefcase className="h-4 w-4 transform transition-all duration-300 group-hover:rotate-12" />
                  <span className="hidden md:block relative z-10">CareerPilot</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
                  <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 w-0 h-1 bg-white transition-all duration-300 group-hover:w-full"></div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 shadow-xl rounded-lg border bg-white p-1 mt-1 overflow-hidden">
              
              <DropdownMenuItem asChild>
                  <Link href="/resume" className="flex items-center gap-2 hover:bg-blue-50 p-3 rounded-md group transition-all duration-200">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-md group-hover:bg-blue-200 transition-all duration-200">
                      <FileText className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">Build Resume</span>
                      <span className="text-xs text-gray-500">Create a professional resume</span>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/cover-letter" className="flex items-center gap-2 hover:bg-blue-50 p-3 rounded-md group transition-all duration-200">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-md group-hover:bg-indigo-200 transition-all duration-200">
                      <PenBox className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">Cover Letter</span>
                      <span className="text-xs text-gray-500">Craft compelling cover letters</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
             


                <DropdownMenuItem asChild>
                  <Link href="/resume-analysis" className="flex items-center gap-2 hover:bg-blue-50 p-3 rounded-md group transition-all duration-200">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-md group-hover:bg-purple-200 transition-all duration-200">
                      <FileText className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">Resume Analysis</span>
                      <span className="text-xs text-gray-500">Get feedback on your resume</span>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/interview" className="flex items-center gap-2 hover:bg-blue-50 p-3 rounded-md group transition-all duration-200">
                    <div className="p-2 bg-green-100 text-green-600 rounded-md group-hover:bg-green-200 transition-all duration-200">
                      <GraduationCap className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">Interview Prep</span>
                      <span className="text-xs text-gray-500">Practice interview questions</span>
                    </div>
                  </Link>
                </DropdownMenuItem>



                <DropdownMenuItem asChild>
                  <Link href="/job-search" className="flex items-center gap-2 hover:bg-blue-50 p-3 rounded-md group transition-all duration-200">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-md group-hover:bg-amber-200 transition-all duration-200">
                      <Search className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">Smart Job Search</span>
                      <span className="text-xs text-gray-500">Find the perfect job match</span>
                    </div>
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
                  <Link href="/career-advice" className="flex items-center gap-2 hover:bg-blue-50 p-3 rounded-md group transition-all duration-200">
                    <div className="p-2 bg-teal-100 text-teal-600 rounded-md group-hover:bg-teal-200 transition-all duration-200">
                      <BarChart className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">AI Career Guidance</span>
                      <span className="text-xs text-gray-500">Get personalized career advice</span>
                    </div>
                  </Link>
                </DropdownMenuItem>



              </DropdownMenuContent>
            </DropdownMenu>
        
        
        
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <Button className="relative overflow-hidden group bg-transparent border-2 border-blue-500 text-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300">
                <span className="relative z-10">Sign In</span>
                <div className="absolute top-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-600 w-0 h-full transition-all duration-300 group-hover:w-full"></div>
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="relative group">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 border-2 border-transparent group-hover:border-blue-400 rounded-full transition-all duration-300 shadow-sm group-hover:shadow-md",
                  },
                }}
                afterSignOutUrl="/"
              />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 opacity-0 group-hover:w-8 group-hover:opacity-100"></div>
            </div>
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}