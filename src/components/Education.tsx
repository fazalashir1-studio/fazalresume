import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Education = () => {
  const education = {
    degree: "Bachelor of Computer Science",
    minor: "Minor in Mathematics", 
    institution: "University of Saskatchewan",
    location: "Saskatoon, SK",
    relevantCourses: [
      "Data Structures and Algorithms",
      "Theory and Application of Databases", 
      "Automata and Formal Languages",
      "Computer Organization and Architecture",
      "Computer Vision and Image Processing",
      "Cloud Computing",
      "Full-Stack Programming"
    ]
  };

  const associations = [
    {
      organization: "UofS UX Collective",
      period: "February 2022 – June 2023",
      description: "Active member of the User Experience Collective, participating in UX design workshops and collaborative projects."
    },
    {
      organization: "Elevation Aviation", 
      period: "July 2022 – June 2023",
      description: "Participated in aviation-related activities and technical learning opportunities."
    }
  ];

  return (
    <section id="education" className="py-20 bg-gradient-card">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-4">
            Education & Associations
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Academic foundation and professional development
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Education Card */}
          <Card className="shadow-card hover:shadow-hover transition-smooth border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="text-center">
                <CardTitle className="text-3xl text-primary mb-2">
                  {education.degree}
                </CardTitle>
                <h3 className="text-xl font-semibold text-accent-primary mb-2">
                  {education.minor}
                </h3>
                <p className="text-lg text-foreground font-medium">
                  {education.institution}
                </p>
                <p className="text-muted-foreground">{education.location}</p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-primary mb-4 text-center">Relevant Coursework:</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {education.relevantCourses.map((course, idx) => (
                    <Badge key={idx} variant="outline" className="bg-accent-primary/10 text-accent-primary border-accent-primary/20 p-2 text-center justify-center">
                      {course}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Associations */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary text-center">Professional Associations</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {associations.map((association, index) => (
                <Card key={index} className="shadow-card hover:shadow-hover transition-smooth border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl text-primary">
                      {association.organization}
                    </CardTitle>
                    <Badge variant="secondary" className="mx-auto w-fit">
                      {association.period}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground text-center leading-relaxed">
                      {association.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* References */}
          <Card className="shadow-card border-0 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground italic">
                *References to be provided upon request
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Education;