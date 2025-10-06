import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-sm shadow-card"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary">Portfolio</h2>
          
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("about")}
              className="text-foreground hover:text-accent-primary transition-smooth"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("experience")}
              className="text-foreground hover:text-accent-primary transition-smooth"
            >
              Experience
            </button>
            <button
              onClick={() => scrollToSection("skills")}
              className="text-foreground hover:text-accent-primary transition-smooth"
            >
              Skills
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-foreground hover:text-accent-primary transition-smooth"
            >
              Contact
            </button>
            <Button 
              variant="professional" 
              size="sm"
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/Fazal_Resume2025.pdf';
                link.download = 'Fazal_Resume2025.pdf';
                link.click();
              }}
            >
              Download Resume
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;