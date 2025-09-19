import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Projects = () => {
  const projects = [
    {
      title: "QuerySync",
      subtitle: "Part of Vendasta Mentorship Program",
      period: "November 2024 - In Progress",
      description: "Designing a comprehensive system to automate BigQuery execution and facilitate CSV file generation with a user-friendly frontend interface.",
      technologies: ["Frontend Development", "Backend Systems", "BigQuery", "REST APIs", "Agile/Scrum"],
      highlights: [
        "Designing user-friendly frontend interface for collecting input parameters and query selection",
        "Developing backend system to automate BigQuery execution and facilitate CSV file generation",
        "Implementing frontend-to-backend communication pipelines using REST APIs",
        "Adopting Agile methodologies (Scrum) to manage milestones and iteratively deliver functional components"
      ],
      status: "In Progress"
    },
    {
      title: "Chat Manager System", 
      period: "January 2022 - April 2022",
      description: "Implemented a multi-user chat system in a team of 3, featuring real-time communication with advanced threading and web-socket technology.",
      technologies: ["Java", "Threading", "Web-Sockets", "Git", "Scrum"],
      highlights: [
        "Implemented chat manager system allowing multiple users to communicate simultaneously",
        "Developed user interface using Java with Threading and Web-Socketing for message transmission",
        "Conducted weekly Scrum meetings following Agile development approach",
        "Personal role: Group chat feature development and Git repository management"
      ],
      status: "Completed",
      link: "https://git.cs.usask.ca/aaf590/rmi_java"
    },
    {
      title: "Web-System for CBO",
      period: "September 2021 – December 2021", 
      description: "Developed a comprehensive 3-tier web system enabling community members to sign up for volunteering opportunities across different organizations.",
      technologies: ["JavaScript", "Node.js", "HTML", "CSS", "Express.js", "MySQL", "Bootstrap"],
      highlights: [
        "Developed 3-tier web system for volunteering opportunity signup",
        "Implemented Server-Client architecture using JavaScript, Node.js, HTML, and CSS",
        "Built RESTful API using Express.js to support web application functionality",
        "Created MySQL database with Bootstrap designs for optimal user experience"
      ],
      status: "Completed",
      link: "https://git.cs.usask.ca/aaf590/web-community-based-organization/-/tree/master?ref_type=heads"
    },
    {
      title: "Zelda for Game Mechanics",
      period: "September 2021 – December 2021",
      description: "Built a survival game from scratch in a team of 6, testing users' survival abilities across increasing difficulty levels with each cleared round.",
      technologies: ["Unity", "C#", "Game Development", "UI/UX Design"],
      highlights: [
        "Built complete game testing user survival ability with increasing difficulties",
        "Created design storyboards during team meetings to decide gaming patterns",
        "Developed and tested entire game in Unity with additional C# features",
        "Personal role: Game's User Interface, settings, and Save/Load System development"
      ],
      status: "Completed", 
      link: "https://git.cs.usask.ca/trg130/cmpt-306-game"
    }
  ];

  return (
    <section id="projects" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-4">
            Featured Projects
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A showcase of my technical projects and development experience
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {projects.map((project, index) => (
            <Card key={index} className="shadow-card hover:shadow-hover transition-smooth border-0 bg-gradient-card">
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-primary mb-2">
                      {project.title}
                    </CardTitle>
                    {project.subtitle && (
                      <h3 className="text-lg font-semibold text-accent-primary mb-2">
                        {project.subtitle}
                      </h3>
                    )}
                    <p className="text-muted-foreground">{project.period}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-start lg:items-end">
                    <Badge 
                      variant={project.status === "In Progress" ? "default" : "secondary"} 
                      className="text-sm px-4 py-2"
                    >
                      {project.status}
                    </Badge>
                    {project.link && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => window.open(project.link, '_blank')}
                      >
                        {project.link.includes('http') ? 'View Repository' : project.link}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-foreground leading-relaxed">
                  {project.description}
                </p>
                
                <div>
                  <h4 className="font-semibold text-primary mb-3">Key Features & Achievements:</h4>
                  <ul className="space-y-2">
                    {project.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-accent-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-foreground">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-primary mb-3">Technologies Used:</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, idx) => (
                      <Badge key={idx} variant="outline" className="bg-accent-primary/10 text-accent-primary border-accent-primary/20">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;