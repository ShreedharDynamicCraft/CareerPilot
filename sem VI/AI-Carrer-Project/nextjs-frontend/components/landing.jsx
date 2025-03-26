import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  FileText,
  Lightbulb,
  MessageSquare,
  Search,
  Target,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">CareerPilot</h1>
            <p className="text-xl md:text-2xl mb-8">AI-Powered Career Guidance Platform</p>
            <p className="text-lg md:text-xl mb-10 opacity-90">
              Navigate your career journey with personalized AI guidance, tools, and insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                <Link href="/dashboard">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Comprehensive Career Tools</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <Link href={feature.link} className="text-blue-600 font-medium inline-flex items-center">
                  Explore <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How CareerPilot Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Accelerate Your Career?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have transformed their careers with CareerPilot's AI-powered guidance.
          </p>
          <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
            <Link href="/dashboard">Get Started Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">CareerPilot</h3>
              <p className="mb-4">AI-powered career guidance for the modern professional.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Features</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white">
                    Career Advice
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Resume Builder
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Interview Prep
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Job Search
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Career Guides
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} CareerPilot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: "Personalized Career Advice",
    description:
      "AI analyzes your skills, experience, and goals to suggest suitable career paths with step-by-step guidance.",
    icon: Lightbulb,
    link: "/dashboard/career-advice",
  },
  {
    title: "AI Resume Builder",
    description:
      "Generate professional resumes efficiently with customizable templates and keyword optimization for ATS.",
    icon: FileText,
    link: "/dashboard/resume-builder",
  },
  {
    title: "Cover Letter Generator",
    description:
      "Create personalized cover letters based on job descriptions with AI-driven suggestions for maximum impact.",
    icon: MessageSquare,
    link: "/dashboard/cover-letter",
  },
  {
    title: "Resume Analysis",
    description:
      "AI reviews your resume for structure, wording, and industry relevance with instant feedback for improvement.",
    icon: BarChart3,
    link: "/dashboard/resume-analysis",
  },
  {
    title: "Interview Preparation",
    description: "Practice with AI-generated mock interview questions and get real-time feedback on your responses.",
    icon: Target,
    link: "/dashboard/interview-prep",
  },
  {
    title: "Smart Job Search",
    description: "Discover job opportunities based on your profile and market trends with personalized notifications.",
    icon: Search,
    link: "/dashboard/job-search",
  },
  {
    title: "Skill Development",
    description:
      "Get recommendations for courses and training programs based on industry trends and your career goals.",
    icon: BookOpen,
    link: "/dashboard/skill-development",
  },
  {
    title: "Career Roadmap",
    description:
      "Visualize your career journey with a personalized step-by-step plan to achieve your professional goals.",
    icon: Zap,
    link: "/dashboard/career-roadmap",
  },
  {
    title: "Internship Finder",
    description: "Students and freshers can discover relevant internships to kickstart their professional journey.",
    icon: Briefcase,
    link: "/dashboard/internships",
  },
]

const steps = [
  {
    title: "Create Your Profile",
    description: "Input your skills, experience, education, and career goals to get personalized guidance.",
  },
  {
    title: "Explore AI Tools",
    description: "Access our suite of AI-powered tools designed to enhance every aspect of your career journey.",
  },
  {
    title: "Accelerate Your Career",
    description: "Implement personalized recommendations and watch your professional growth take off.",
  },
]

