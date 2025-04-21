import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, MapPin, Calendar, DollarSign, Sparkles } from 'lucide-react';

export default function JobCard({ job }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [sparklePosition, setSparklePosition] = useState({ x: 0, y: 0 });
  const [showSparkle, setShowSparkle] = useState(false);

  // Magic entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Magic sparkle animation on mouse move
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSparklePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    if (!showSparkle) setShowSparkle(true);
  };

  return (
    <div className="relative perspective-1000 my-8 mx-4">
      {/* Floating shadow effect */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-md transition-all duration-700 opacity-30 
        ${isVisible ? "scale-105" : "scale-0 opacity-0"} 
        ${isHovered ? "animate-pulse" : ""}`} 
        style={{ transform: 'translateY(10px)' }}
      ></div>
      
      <Card 
        className={`relative z-10 transition-all duration-700 ease-out
          border-0 overflow-hidden
          ${isVisible ? "opacity-100 rotate-0 translate-y-0" : "opacity-0 -rotate-3 translate-y-16"}
          ${isHovered ? "shadow-2xl" : "shadow-lg"}
          bg-gradient-to-br from-white via-blue-50 to-purple-50`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowSparkle(false);
        }}
        onMouseMove={handleMouseMove}
        style={{
          transform: isHovered ? "translateY(-8px) rotateX(2deg)" : "translateY(0) rotateX(0)",
          transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}
      >
        {/* Rainbow top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
        
        {/* Sparkle effect that follows cursor */}
        {showSparkle && (
          <div 
            className="absolute pointer-events-none z-20 text-yellow-400 animate-ping"
            style={{ 
              top: `${sparklePosition.y - 10}px`, 
              left: `${sparklePosition.x - 10}px`,
              transition: "top 0.1s, left 0.1s"
            }}
          >
            <Sparkles size={20} />
          </div>
        )}
        
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 opacity-30 
          transition-opacity duration-500 ${isHovered ? "opacity-80" : "opacity-0"}`}
          style={{ animation: isHovered ? "gradient-shift 3s ease infinite" : "none" }}
        ></div>
        
        <CardHeader className="pb-2 relative z-10">
          <div className="flex justify-between items-start">
            <CardTitle 
              className={`text-lg font-bold transition-all duration-300 ${
                isHovered ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600" : ""
              }`}
            >
              {job.title}
            </CardTitle>
            <Badge 
              className={`transition-all duration-500 ${
                isHovered 
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse" 
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {job.platform}
            </Badge>
          </div>
          <CardDescription className="flex justify-between items-center mt-1">
            <span className="font-medium text-gray-700">{job.company}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3 pt-1 relative z-10">
          <div className={`transition-all duration-500 ${
            isHovered ? "transform translate-x-2" : ""
          }`}>
            <p className={`text-sm flex items-center gap-2 text-gray-600 transition-colors duration-300 ${
              isHovered ? "text-blue-600" : ""
            }`}>
              <MapPin className={`h-4 w-4 ${isHovered ? "text-pink-500" : "text-gray-400"}`} />
              {job.location}
            </p>
            
            <p className={`text-sm flex items-center gap-2 text-gray-600 transition-colors duration-300 ${
              isHovered ? "text-purple-600" : ""
            }`}>
              <Calendar className={`h-4 w-4 ${isHovered ? "text-purple-500" : "text-gray-400"}`} />
              Posted {job.postedDate}
            </p>
            
            {job.salary && (
              <p className={`text-sm flex items-center gap-2 text-gray-600 transition-colors duration-300 ${
                isHovered ? "text-indigo-600" : ""
              }`}>
                <DollarSign className={`h-4 w-4 ${isHovered ? "text-indigo-500" : "text-gray-400"}`} />
                {job.salary}
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-2 relative z-10">
          <Button 
            asChild 
            className={`w-full transition-all duration-500 overflow-hidden relative
              ${isHovered 
                ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white border-transparent" 
                : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"
              }`}
          >
            <a 
              href={job.applyLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center"
            >
              <ExternalLink className={`mr-2 h-4 w-4 ${isHovered ? "animate-bounce" : ""}`} />
              <span className={`relative ${isHovered ? "animate-pulse" : ""}`}>Apply Now</span>
              
              {/* Magic particle effect on hover */}
              {isHovered && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="absolute h-1 w-1 rounded-full bg-white animate-ping"></span>
                  <span className="absolute h-1 w-1 rounded-full bg-white animate-ping" style={{animationDelay: "0.2s"}}></span>
                  <span className="absolute h-1 w-1 rounded-full bg-white animate-ping" style={{animationDelay: "0.4s"}}></span>
                </span>
              )}
            </a>
          </Button>
        </CardFooter>
        
        {/* Corner shine effect */}
        <div 
          className={`absolute -right-12 -top-12 w-24 h-24 bg-white opacity-20 transform rotate-45 transition-all duration-700
            ${isHovered ? "translate-x-0 translate-y-0" : "translate-x-12 translate-y-12"}`}
        ></div>
      </Card>
      
      {/* Add style for gradient animation */}
      <style jsx global>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}