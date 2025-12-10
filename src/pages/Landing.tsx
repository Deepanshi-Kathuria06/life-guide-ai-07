import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dumbbell, Briefcase, Brain, DollarSign, Heart, Sparkles, 
  Check, Star, TrendingUp, Users, Clock, Shield,
  ChevronDown, Menu
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const coaches = [
  {
    name: "Fitness Coach",
    description: "Personalized workout plans, form tips, and motivational support",
    icon: Dumbbell,
    color: "coach-fitness",
    emoji: "💪",
  },
  {
    name: "Career Coach",
    description: "Resume reviews, interview prep, and career advancement strategies",
    icon: Briefcase,
    color: "coach-career",
    emoji: "💼",
  },
  {
    name: "Mindfulness Coach",
    description: "Meditation techniques, stress management, and peaceful living",
    icon: Brain,
    color: "coach-mindfulness",
    emoji: "🧠",
  },
  {
    name: "Finance Coach",
    description: "Budgeting, saving strategies, and investment guidance",
    icon: DollarSign,
    color: "coach-finance",
    emoji: "💰",
  },
  {
    name: "Relationship Coach",
    description: "Communication skills and relationship dynamics guidance",
    icon: Heart,
    color: "coach-relationship",
    emoji: "❤️",
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Manager",
    content: "The Career Coach helped me land my dream job! The interview prep was invaluable.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Entrepreneur",
    content: "Finance Coach transformed how I manage my business finances. Highly recommend!",
    rating: 5,
  },
  {
    name: "Emma Davis",
    role: "Yoga Instructor",
    content: "The Mindfulness Coach has been a game-changer for my mental well-being.",
    rating: 5,
  },
];

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "1M+", label: "Conversations" },
  { value: "4.9/5", label: "User Rating" },
  { value: "24/7", label: "Availability" },
];

const faqs = [
  {
    question: "How does the free trial work?",
    answer: "Start with 10 free messages to try any of our AI coaches. No credit card required. Experience the full power of personalized AI coaching risk-free.",
  },
  {
    question: "Can I switch between different coaches?",
    answer: "Absolutely! You have unlimited access to all 5 specialized coaches. Switch between them anytime to get the right guidance for different areas of your life.",
  },
  {
    question: "How personalized are the coaching sessions?",
    answer: "Each coach uses advanced AI to understand your unique situation, goals, and preferences. The more you interact, the more personalized your experience becomes.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes! We use enterprise-grade encryption and security measures. Your conversations are private and securely stored. We never share your personal data with third parties.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. No questions asked, no hidden fees. Your access will continue until the end of your billing period.",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Features", action: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: "Pricing", action: () => navigate("/pricing") },
    { label: "About", action: () => navigate("/about") },
    { label: "Contact", action: () => navigate("/contact") },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 border-b border-border/50 bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AICOACHLY
            </h1>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 items-center">
            {navItems.map((item) => (
              <button 
                key={item.label}
                onClick={item.action} 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Log In
            </Button>
            <Button variant="gradient" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    AICOACHLY
                  </h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                  {navItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => { item.action(); setMobileMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors text-foreground"
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
                <div className="p-4 border-t border-border space-y-3">
                  <Button variant="outline" className="w-full" onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}>
                    Log In
                  </Button>
                  <Button variant="gradient" className="w-full" onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}>
                    Get Started
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />
        <div className="absolute top-20 left-10 w-32 md:w-64 h-32 md:h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 md:w-80 h-40 md:h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="max-w-4xl mx-auto text-center space-y-6 relative">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-sm font-medium text-primary">🚀 Powered by Advanced AI</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Your <span className="bg-gradient-primary bg-clip-text text-transparent">AI-Powered</span> Life Coach
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Get personalized guidance from 5 specialized AI coaches. Available 24/7 to help you achieve your goals in fitness, career, mindfulness, finance, and relationships.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" variant="gradient" onClick={() => navigate("/auth")} className="px-8">
              <Sparkles className="h-5 w-5 mr-2" />
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/pricing")} className="px-8">
              View Pricing
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>10 free messages</span>
            </div>
          </div>
        </div>
      </section>

      {/* Coaches Section */}
      <section id="features" className="container mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Meet Your <span className="bg-gradient-primary bg-clip-text text-transparent">AI Coaches</span>
          </h3>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Five specialized coaches ready to help you excel in every aspect of life
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {coaches.map((coach) => (
            <Card
              key={coach.name}
              className="relative p-6 bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 border-2 group overflow-hidden hover:scale-105 cursor-pointer"
              style={{
                borderColor: `hsl(var(--${coach.color}) / 0.3)`,
              }}
              onClick={() => navigate("/auth")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-4xl mb-4 animate-float">
                  {coach.emoji}
                </div>
                <h4 className="text-lg font-semibold mb-2" style={{ color: `hsl(var(--${coach.color}))` }}>
                  {coach.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {coach.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            How It <span className="bg-gradient-primary bg-clip-text text-transparent">Works</span>
          </h3>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes and transform your life with AI-powered coaching
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h4 className="text-xl font-semibold mb-3">Choose Your Coach</h4>
              <p className="text-muted-foreground">Select from 5 specialized AI coaches based on your goals</p>
            </div>
          </Card>
          
          <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h4 className="text-xl font-semibold mb-3">Start Chatting</h4>
              <p className="text-muted-foreground">Have natural conversations and get personalized advice instantly</p>
            </div>
          </Card>
          
          <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h4 className="text-xl font-semibold mb-3">Achieve Your Goals</h4>
              <p className="text-muted-foreground">Follow personalized action plans and track your progress</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm sm:text-base text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="bg-gradient-primary bg-clip-text text-transparent">AICOACHLY</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-2">24/7 Availability</h4>
            <p className="text-muted-foreground">Get expert advice instantly, anytime you need it.</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Specialized Expertise</h4>
            <p className="text-muted-foreground">Each AI coach is trained specifically in their domain.</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Personalized</h4>
            <p className="text-muted-foreground">Tailored to your unique goals and challenges.</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Private & Secure</h4>
            <p className="text-muted-foreground">Your conversations are encrypted and private.</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Proven Results</h4>
            <p className="text-muted-foreground">Join thousands achieving their goals.</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Community</h4>
            <p className="text-muted-foreground">Join a community of growth-minded individuals.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="bg-gradient-primary bg-clip-text text-transparent">Users Say</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-card/50 backdrop-blur-sm border">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked <span className="bg-gradient-primary bg-clip-text text-transparent">Questions</span>
          </h3>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Life?
          </h3>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already started their journey with AICOACHLY
          </p>
          <Button size="lg" variant="gradient" onClick={() => navigate("/auth")} className="px-10">
            <Sparkles className="h-5 w-5 mr-2" />
            Start Your Free Trial
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
                AICOACHLY
              </h4>
              <p className="text-sm text-muted-foreground">
                Your AI-powered life coach for personal and professional growth.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/features")} className="hover:text-foreground transition-colors">Features</button></li>
                <li><button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">Pricing</button></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/about")} className="hover:text-foreground transition-colors">About</button></li>
                <li><button onClick={() => navigate("/contact")} className="hover:text-foreground transition-colors">Contact</button></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="hover:text-foreground transition-colors">Privacy Policy</button></li>
                <li><button className="hover:text-foreground transition-colors">Terms of Service</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} AICOACHLY. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
