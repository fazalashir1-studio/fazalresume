import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  const stats = [
    { number: "5+", label: "Years Experience" },
    { number: "50+", label: "Projects Completed" },
    { number: "15+", label: "Technologies Mastered" },
    { number: "100%", label: "Client Satisfaction" }
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
                I'm a passionate software engineer with over 5 years of experience building 
                scalable web applications and leading development teams. My journey began with 
                a Computer Science degree and has evolved through continuous learning and 
                hands-on experience with cutting-edge technologies.
              </p>
              <p>
                I specialize in full-stack development, with particular expertise in React, 
                Node.js, and cloud technologies. I believe in writing clean, maintainable code 
                and creating user experiences that truly make a difference.
              </p>
              <p>
                When I'm not coding, you'll find me contributing to open-source projects, 
                mentoring junior developers, or exploring the latest in web technology. 
                I'm always excited about the next challenge and opportunity to grow.
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
                title: "Problem Solving",
                description: "I thrive on tackling complex challenges and finding elegant solutions that make a real impact."
              },
              {
                icon: "🚀",
                title: "Innovation",
                description: "Always staying ahead of the curve with emerging technologies and best practices in development."
              },
              {
                icon: "🤝",
                title: "Collaboration",
                description: "Building strong relationships with teams and clients to deliver exceptional results together."
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