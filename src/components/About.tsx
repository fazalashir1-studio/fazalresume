import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  const stats = [
    { number: "1.5+", label: "Years at Vendasta" },
    { number: "96%", label: "CSAT Score" },
    { number: "4", label: "Major Projects" },
    { number: "100%", label: "KPI Achievement" }
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* About Content */}
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-6">
              About Me
            </h2>
            <div className="space-y-6 text-lg text-foreground leading-relaxed">
              <p>
                I'm a dedicated Software Specialist at Vendasta Technologies with a Bachelor's 
                in Computer Science and Minor in Mathematics from the University of Saskatchewan. 
                Currently maintaining an exceptional 96% Customer Satisfaction score while working 
                with cutting-edge technologies.
              </p>
              <p>
                My technical expertise spans front-end development, BigQuery SQL, API integration 
                with Postman, and email automation with SendGrid. I collaborate closely with 
                development teams to identify platform improvements and create comprehensive 
                technical documentation.
              </p>
              <p>
                Beyond technical work, I'm passionate about mentoring team members, conducting 
                training sessions, and contributing to team knowledge sharing. I thrive on 
                solving complex technical challenges and building systems that enhance user experiences.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center p-6 shadow-card hover:shadow-hover transition-smooth bg-gradient-card border-0">
                <CardContent className="p-0">
                  <div className="text-4xl lg:text-5xl font-bold text-accent-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-primary text-center mb-12">
            What Drives Me
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: "🎯",
                title: "Technical Excellence",
                description: "Consistently delivering high-quality solutions while maintaining exceptional customer satisfaction scores."
              },
              {
                icon: "🚀",
                title: "Continuous Learning",
                description: "Always expanding my skillset with new technologies and contributing to platform improvements."
              },
              {
                icon: "🤝",
                title: "Team Collaboration",
                description: "Mentoring colleagues and creating documentation to enhance team knowledge and efficiency."
              }
            ].map((value, index) => (
              <Card key={index} className="text-center p-6 shadow-card hover:shadow-hover transition-smooth border-0 bg-white">
                <CardContent className="p-0">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h4 className="text-xl font-semibold text-primary mb-3">
                    {value.title}
                  </h4>
                  <p className="text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;