import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Contact = () => {
  const contactInfo = [
    {
      icon: "📧",
      title: "Email",
      value: "john.smith@email.com",
      link: "mailto:john.smith@email.com"
    },
    {
      icon: "📱",
      title: "Phone",
      value: "+1 (555) 123-4567",
      link: "tel:+15551234567"
    },
    {
      icon: "🌐",
      title: "LinkedIn",
      value: "linkedin.com/in/johnsmith",
      link: "https://linkedin.com/in/johnsmith"
    },
    {
      icon: "💻",
      title: "GitHub",
      value: "github.com/johnsmith",
      link: "https://github.com/johnsmith"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Let's Work Together
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Ready to bring your next project to life? I'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-smooth">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl mb-3">{info.icon}</div>
                    <h3 className="font-semibold text-white mb-2">{info.title}</h3>
                    <a 
                      href={info.link}
                      className="text-accent-secondary hover:text-white transition-smooth text-sm"
                    >
                      {info.value}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Quick Response</CardTitle>
              </CardHeader>
              <CardContent className="text-white/90">
                <p className="mb-4">
                  I typically respond to messages within 24 hours. For urgent matters, 
                  feel free to call me directly.
                </p>
                <div className="flex items-center gap-2 text-accent-secondary">
                  <span>🕒</span>
                  <span>Available: Mon - Fri, 9 AM - 6 PM EST</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-glow">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Send a Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <Input placeholder="Your name" className="border-accent-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input type="email" placeholder="your.email@example.com" className="border-accent-primary/20" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Subject</label>
                <Input placeholder="Project inquiry" className="border-accent-primary/20" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Message</label>
                <Textarea 
                  placeholder="Tell me about your project..."
                  className="min-h-32 border-accent-primary/20"
                />
              </div>
              
              <Button variant="professional" size="lg" className="w-full">
                Send Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;