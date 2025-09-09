import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Experience = () => {
  const experiences = [
    {
      title: "Senior Software Engineer",
      company: "Tech Solutions Inc.",
      period: "2022 - Present",
      description: "Led development of scalable web applications serving 100K+ users. Architected microservices infrastructure and mentored junior developers.",
      technologies: ["React", "Node.js", "TypeScript", "AWS", "Docker"],
      highlights: [
        "Reduced application load time by 40%",
        "Implemented CI/CD pipeline saving 20+ hours/week",
        "Led team of 5 developers on critical projects"
      ]
    },
    {
      title: "Full Stack Developer",
      company: "Digital Innovations Ltd.",
      period: "2020 - 2022",
      description: "Developed and maintained multiple client applications using modern web technologies. Collaborated with design teams to create exceptional user experiences.",
      technologies: ["React", "Python", "PostgreSQL", "Redis", "GraphQL"],
      highlights: [
        "Built 15+ responsive web applications",
        "Improved database query performance by 60%",
        "Established coding standards and best practices"
      ]
    },
    {
      title: "Frontend Developer",
      company: "StartUp Ventures",
      period: "2019 - 2020",
      description: "Created responsive user interfaces and collaborated with UX designers to implement pixel-perfect designs. Focused on performance optimization and accessibility.",
      technologies: ["JavaScript", "React", "CSS3", "Webpack", "Jest"],
      highlights: [
        "Achieved 98% accessibility compliance",
        "Reduced bundle size by 35%",
        "Implemented comprehensive test coverage"
      ]
    }
  ];

  return (
    <section id="experience" className="py-20 bg-gradient-card">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-4">
            Professional Experience
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A journey through my career highlights and achievements
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {experiences.map((exp, index) => (
            <Card key={index} className="shadow-card hover:shadow-hover transition-smooth border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl text-primary mb-2">
                      {exp.title}
                    </CardTitle>
                    <h3 className="text-lg font-semibold text-accent-primary">
                      {exp.company}
                    </h3>
                  </div>
                  <Badge variant="secondary" className="text-sm px-4 py-2 w-fit">
                    {exp.period}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-foreground leading-relaxed">
                  {exp.description}
                </p>
                
                <div>
                  <h4 className="font-semibold text-primary mb-3">Key Achievements:</h4>
                  <ul className="space-y-2">
                    {exp.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-accent-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-foreground">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-primary mb-3">Technologies:</h4>
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech, idx) => (
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

export default Experience;