import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Skills = () => {
  const skillCategories = [
    {
      title: "Programming Languages",
      icon: "💻",
      skills: [
        { name: "Python", level: 90 },
        { name: "Java", level: 85 },
        { name: "JavaScript", level: 88 },
        { name: "SQL", level: 92 },
        { name: "C#", level: 75 }
      ]
    },
    {
      title: "Web Technologies",
      icon: "🌐",
      skills: [
        { name: "HTML", level: 95 },
        { name: "CSS", level: 90 },
        { name: "Node.js", level: 80 },
        { name: "Curl", level: 85 },
        { name: "Bash", level: 78 }
      ]
    },
    {
      title: "Database & Cloud",
      icon: "☁️",
      skills: [
        { name: "Google BigQuery", level: 95 },
        { name: "MySQL", level: 88 },
        { name: "Docker", level: 75 },
        { name: "Linux", level: 82 },
        { name: "Assembly", level: 70 }
      ]
    },
    {
      title: "Tools & Technologies",
      icon: "🛠️",
      skills: [
        { name: "Git/GitHub", level: 90 },
        { name: "Jira", level: 85 },
        { name: "Confluence", level: 80 },
        { name: "Adobe Lightroom", level: 75 },
        { name: "Jupyter Notebook", level: 85 }
      ]
    }
  ];

  return (
    <section id="skills" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-4">
            Skills & Expertise
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Technologies and tools I work with to bring ideas to life
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {skillCategories.map((category, index) => (
            <Card key={index} className="shadow-card hover:shadow-hover transition-smooth border-0 bg-gradient-card">
              <CardHeader className="text-center pb-4">
                <div className="text-4xl mb-3">{category.icon}</div>
                <CardTitle className="text-xl text-primary">
                  {category.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {category.skills.map((skill, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">
                        {skill.name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {skill.level}%
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-accent h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Certifications */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-primary mb-8">Certifications</h3>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {[
              "Google Analytics: Data Everywhere",
              "Standard First Aid – CPR",
              "Secourisme général – certification"
            ].map((cert, index) => (
              <Badge key={index} variant="outline" className="text-sm px-4 py-2 bg-white border-accent-primary/20 text-accent-primary">
                🏆 {cert}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;