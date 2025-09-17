import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  Search,
  BookOpen,
  CreditCard,
  Users,
  Calendar,
  Star,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Help = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
    email: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.subject || !contactForm.message || !contactForm.email) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setContactForm({ subject: "", message: "", email: "" });
      setSubmitting(false);
    }, 1000);
  };

  const faqCategories = [
    {
      icon: BookOpen,
      title: "Getting Started",
      color: "text-primary",
      faqs: [
        {
          question: "How do I create an account?",
          answer: "Click 'Sign Up' on the homepage and choose whether you're a makeup artist or client. Fill in your details and verify your email address to get started."
        },
        {
          question: "How do I complete my profile?",
          answer: "After signing up, go to your profile page and add your personal information, photos, and for artists - your services, rates, and portfolio."
        },
        {
          question: "Is Make-Up Lounge free to use?",
          answer: "Basic registration is free for both artists and clients. We charge a small service fee only when bookings are confirmed."
        }
      ]
    },
    {
      icon: Calendar,
      title: "Bookings & Scheduling",
      color: "text-coral",
      faqs: [
        {
          question: "How do I book a makeup artist?",
          answer: "Browse artists in your area, view their profiles and services, then click 'Book Now' on your preferred service. Fill in the booking details and submit your request."
        },
        {
          question: "Can I reschedule or cancel a booking?",
          answer: "Yes, you can reschedule or cancel bookings up to 24 hours before the appointment. Check our cancellation policy for refund details."
        },
        {
          question: "How do artists accept bookings?",
          answer: "Artists receive notifications for new booking requests and can accept, decline, or negotiate terms through their dashboard."
        }
      ]
    },
    {
      icon: CreditCard,
      title: "Payments & Pricing",
      color: "text-success",
      faqs: [
        {
          question: "How do payments work?",
          answer: "Payments are processed securely when bookings are confirmed. We support multiple payment methods including cards and bank transfers."
        },
        {
          question: "When am I charged?",
          answer: "You're charged when the artist accepts your booking request. For artists, we release payments after the service is completed."
        },
        {
          question: "What are the service fees?",
          answer: "We charge a small service fee (typically 5-10%) to cover platform costs. The exact fee is shown before you confirm any booking."
        }
      ]
    },
    {
      icon: Users,
      title: "For Artists",
      color: "text-secondary",
      faqs: [
        {
          question: "How do I set my rates?",
          answer: "Go to your Services page and add your different makeup services with corresponding rates. You can also enable custom pricing for special requests."
        },
        {
          question: "How do I get more bookings?",
          answer: "Complete your profile with high-quality photos, get good reviews, respond quickly to messages, and keep your availability updated."
        },
        {
          question: "Can I travel to clients?",
          answer: "Yes! You can offer both studio and travel services. Set your travel preferences and any additional fees in your profile."
        }
      ]
    },
    {
      icon: Star,
      title: "Reviews & Ratings",
      color: "text-warning",
      faqs: [
        {
          question: "How do reviews work?",
          answer: "After a completed booking, clients can leave a rating (1-5 stars) and written review. Artists can respond to reviews professionally."
        },
        {
          question: "Can I delete bad reviews?",
          answer: "Reviews cannot be deleted, but you can report inappropriate content. Focus on providing excellent service to earn positive reviews."
        },
        {
          question: "How do tips work?",
          answer: "Clients can add tips when leaving reviews. Tips are processed separately and go directly to the artist."
        }
      ]
    },
    {
      icon: Shield,
      title: "Safety & Security",
      color: "text-destructive",
      faqs: [
        {
          question: "How are artists verified?",
          answer: "We verify artist identities and encourage portfolio uploads. Look for verified badges and read reviews from previous clients."
        },
        {
          question: "What if something goes wrong?",
          answer: "Contact our support team immediately. We have policies in place to protect both artists and clients, including refunds for legitimate issues."
        },
        {
          question: "Is my payment information secure?",
          answer: "Yes, we use industry-standard encryption and work with trusted payment processors. We never store your full payment details."
        }
      ]
    }
  ];

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-playfair font-bold text-gradient flex items-center justify-center">
            <HelpCircle className="mr-3 h-10 w-10" />
            Help & Support
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions or get in touch with our support team
          </p>
        </div>

        {/* Search */}
        <Card className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Quick Contact Options */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4 text-center hover-lift cursor-pointer">
            <MessageCircle className="mx-auto h-8 w-8 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Live Chat</h3>
            <p className="text-sm text-muted-foreground mb-3">Get instant help</p>
            <Badge variant="secondary" className="text-xs">Online</Badge>
          </Card>
          
          <Card className="p-4 text-center hover-lift cursor-pointer">
            <Mail className="mx-auto h-8 w-8 text-coral mb-2" />
            <h3 className="font-semibold mb-1">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-3">24h response time</p>
            <Button variant="outline" size="sm">Send Email</Button>
          </Card>
          
          <Card className="p-4 text-center hover-lift cursor-pointer">
            <Phone className="mx-auto h-8 w-8 text-secondary mb-2" />
            <h3 className="font-semibold mb-1">Phone Support</h3>
            <p className="text-sm text-muted-foreground mb-3">Mon-Fri 9AM-6PM</p>
            <Button variant="outline" size="sm">Call Now</Button>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-playfair font-bold">Frequently Asked Questions</h2>
          
          {filteredFAQs.length === 0 && searchQuery && (
            <Card className="p-8 text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try different keywords or browse our FAQ categories below
              </p>
            </Card>
          )}
          
          {(searchQuery ? filteredFAQs : faqCategories).map((category, categoryIndex) => (
            <Card key={categoryIndex} className="p-6">
              <div className="flex items-center mb-4">
                <category.icon className={`h-6 w-6 ${category.color} mr-3`} />
                <h3 className="text-xl font-semibold">{category.title}</h3>
                <Badge variant="outline" className="ml-auto">
                  {category.faqs.length} {category.faqs.length === 1 ? 'question' : 'questions'}
                </Badge>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {category.faqs.map((faq, faqIndex) => (
                  <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                    <AccordionTrigger className="text-left hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          ))}
        </div>

        {/* Contact Form */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Still need help?</h3>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Send us a message and we'll get back to you soon.
          </p>
          
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input
                  placeholder="What do you need help with?"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                placeholder="Describe your issue or question in detail..."
                value={contactForm.message}
                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                rows={5}
              />
            </div>
            
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Help;