import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Experience = () => {
  const experiences = [
    {
      title: "Software Specialist",
      company: "Vendasta Technologies Inc.",
      location: "Saskatoon, SK",
      period: "March 2023 – Present",
      description: "Deliver exceptional customer experiences while working with cutting-edge front-end technologies and technical tools. Collaborate with development teams to improve platform functionality.",
      technologies: ["BigQuery SQL", "Postman APIs", "SendGrid", "Zapier", "Automations", "Front-end Technologies"],
      highlights: [
        "Maintained Customer Satisfaction (CSAT) score of over 96% for over two years",
        "Exceeded monthly KPIs and scorecard outcomes consistently",
        "Collaborated with development teams to identify and manage platform bugs",
        "Created technical documentation and conducted team training sessions",
        "Proactively coached and mentored team members"
      ]
    },
    {
      title: "On-Site Supervisor",
      company: "University of Saskatchewan",
      location: "Saskatoon, SK",
      period: "June 2020 – June 2023",
      description: "Maintained safe environments and ensured events met best practice standards while developing comprehensive management reports.",
      technologies: ["Event Management", "Safety Protocols", "Report Generation"],
      highlights: [
        "Maintained safe environment and verified events meet best practice standards",
        "Developed informative reports for management team",
        "Supervised on-site operations for university events"
      ]
    },
    {
      title: "Mobilist / IT Support",
      company: "The Mobile Shop",
      location: "Saskatoon, SK", 
      period: "June 2020 – September 2021",
      description: "Provided comprehensive customer support using Oracle Database systems and troubleshooting mobile device issues across Canada-wide operations.",
      technologies: ["Oracle Database", "Point-of-Service Systems", "Cash Register Operations"],
      highlights: [
        "Assisted customers using Oracle Database to locate phones across multiple stores nationwide",
        "Troubleshot cellular errors both in-person and over the phone",
        "Operated cash register and point-of-service credit-card systems",
        "Processed cellular activations and customer payments"
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
                    <p className="text-sm text-muted-foreground">{exp.location}</p>
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