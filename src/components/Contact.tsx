import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "All fields required",
        description: "Please fill in all fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('contact-form', {
        body: formData
      });

      if (error) throw error;

      toast({
        title: "Message sent successfully!",
        description: "Thank you for reaching out. I'll get back to you soon.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error sending message",
        description: "Please try again or contact me directly via email.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: "📧",
      title: "Email",
      value: "aaf590@usask.ca",
      link: "mailto:aaf590@usask.ca"
    },
    {
      icon: "📱",
      title: "Phone",
      value: "(306) 229-2903",
      link: "tel:+13062292903"
    },
    {
      icon: "🌐",
      title: "LinkedIn",
      value: "LinkedIn Profile",
      link: "#"
    },
    {
      icon: "💻",
      title: "GitLab",
      value: "GitLab Profile",
      link: "#"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Let's Connect
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Based in Saskatoon, SK. Ready to collaborate on your next project.
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
                  <span>📍</span>
                  <span>Location: Saskatoon, Saskatchewan</span>
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
              <form onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Name</label>
                    <Input 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your name" 
                      className="border-accent-primary/20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input 
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com" 
                      className="border-accent-primary/20"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  <label className="text-sm font-medium text-foreground">Subject</label>
                  <Input 
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Project inquiry" 
                    className="border-accent-primary/20"
                    required
                  />
                </div>
                
                <div className="space-y-2 mb-6">
                  <label className="text-sm font-medium text-foreground">Message</label>
                  <Textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell me about your project..."
                    className="min-h-32 border-accent-primary/20"
                    required
                  />
                </div>
                
                <Button 
                  type="submit"
                  variant="professional" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;