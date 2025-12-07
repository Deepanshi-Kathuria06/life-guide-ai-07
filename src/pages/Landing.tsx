import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MiniAIDemo from "@/components/MiniAIDemo";
import {
  Dumbbell, Briefcase, Brain, DollarSign, Heart, Sparkles, 
  Check, Star, TrendingUp, Users, Clock, Shield,
  ChevronDown, Menu, X
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
  },
  {
    name: "Career Coach",
    description: "Resume reviews, interview prep, and career advancement strategies",
    icon: Briefcase,
    color: "coach-career",
  },
  {
    name: "Mindfulness Coach",
    description: "Meditation techniques, stress management, and peaceful living",
    icon: Brain,
    color: "coach-mindfulness",
  },
  {
    name: "Finance Coach",
    description: "Budgeting, saving strategies, and investment guidance",
    icon: DollarSign,
    color: "coach-finance",
  },
  {
    name: "Relationship Coach",
    description: "Communication skills and relationship dynamics guidance",
    icon: Heart,
    color: "coach-relationship",
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AICOACHLY
            </h1>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6 items-center">
            {navItems.map((item) => (
              <button 
                key={item.label}
                onClick={item.action} 
                className="text-muted-foreground hover:text-foreground transition-colors"
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
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-border">
                  <h2 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
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
                <div className="p-4 border-t border-border space-y-2">
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
      <section className="container mx-auto px-4 py-8 sm:py-12 md:py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />
        <div className="absolute top-10 left-10 w-32 sm:w-72 h-32 sm:h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 sm:w-96 h-40 sm:h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 relative">
          <div className="inline-block px-3 sm:px-4 py-1 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-2">
            <span className="text-xs sm:text-sm font-medium text-primary">🚀 Powered by Advanced AI</span>
          </div>
          
          <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Your <span className="bg-gradient-primary bg-clip-text text-transparent">AI-Powered</span>
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>Life Coach
          </h2>
          
          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Get personalized guidance from 5 specialized AI coaches. Available 24/7.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center pt-2 px-4">
            <Button size="default" variant="gradient" onClick={() => navigate("/auth")} className="text-sm sm:text-lg px-4 sm:px-8 w-full sm:w-auto">
              <Sparkles className="h-4 w-4 mr-2" />
              Start Free Trial
            </Button>
            <Button size="default" variant="outline" onClick={() => navigate("/pricing")} className="text-sm sm:text-lg px-4 sm:px-8 w-full sm:w-auto">
              View Pricing
            </Button>
          </div>
          
          <div className="pt-2 sm:pt-4">
            <div className="flex items-center justify-center gap-1 flex-wrap">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 sm:h-5 sm:w-5 fill-primary text-primary" />
              ))}
              <span className="ml-2 text-xs sm:text-sm font-semibold">4.9/5 from 2,500+ reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* Coaches Grid - Featured prominently */}
      <section id="features" className="container mx-auto px-4 py-6 sm:py-12 md:py-16">
        <div className="text-center mb-4 sm:mb-8 px-2">
          <h3 className="text-xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
            Choose Your <span className="bg-gradient-primary bg-clip-text text-transparent">AI Coach</span>
          </h3>
          <p className="text-xs sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Each coach is specialized in their domain to provide expert guidance
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 max-w-6xl mx-auto">
          {coaches.map((coach) => {
            const Icon = coach.icon;
            return (
              <Card
                key={coach.name}
                className="relative p-3 sm:p-4 md:p-6 bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 border-2 group overflow-hidden hover:scale-[1.02] cursor-pointer"
                style={{
                  borderImage: `linear-gradient(135deg, hsl(var(--${coach.color})), transparent) 1`,
                }}
                onClick={() => navigate("/auth")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl mb-2 animate-float">{coach.icon === Dumbbell ? "💪" : coach.icon === Briefcase ? "💼" : coach.icon === Brain ? "🧠" : coach.icon === DollarSign ? "💰" : "❤️"}</div>
                  <h4 className="text-xs sm:text-sm md:text-base font-semibold" style={{ color: `hsl(var(--${coach.color}))` }}>
                    {coach.name.replace(" Coach", "")}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block line-clamp-2">{coach.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="container mx-auto px-4 py-6 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-2 sm:p-0">
              <div className="text-xl sm:text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 px-2">
          <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            How It <span className="bg-gradient-primary bg-clip-text text-transparent">Works</span>
          </h3>
          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes and transform your life with AI-powered coaching
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
          <Card className="p-5 sm:p-6 md:p-8 text-center bg-card/50 backdrop-blur-sm border-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">1</span>
              </div>
              <h4 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Choose Your Coach</h4>
              <p className="text-sm sm:text-base text-muted-foreground">Select from 5 specialized AI coaches based on your goals</p>
            </div>
          </Card>
          
          <Card className="p-5 sm:p-6 md:p-8 text-center bg-card/50 backdrop-blur-sm border-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">2</span>
              </div>
              <h4 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Start Chatting</h4>
              <p className="text-sm sm:text-base text-muted-foreground">Have natural conversations and get personalized advice instantly</p>
            </div>
          </Card>
          
          <Card className="p-5 sm:p-6 md:p-8 text-center bg-card/50 backdrop-blur-sm border-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">3</span>
              </div>
              <h4 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Achieve Your Goals</h4>
              <p className="text-sm sm:text-base text-muted-foreground">Follow personalized action plans and track your progress</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 px-2">
          <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Why Choose <span className="bg-gradient-primary bg-clip-text text-transparent">AICOACHLY</span>
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          <div className="text-center p-3 sm:p-4 md:p-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Clock className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
            </div>
            <h4 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2">24/7 Availability</h4>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Get expert advice instantly, anytime you need it.</p>
          </div>
          
          <div className="text-center p-3 sm:p-4 md:p-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Brain className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
            </div>
            <h4 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2">Specialized Expertise</h4>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Each AI coach is trained specifically in their domain.</p>
          </div>
          
          <div className="text-center p-3 sm:p-4 md:p-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Heart className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
            </div>
            <h4 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2">Personalized</h4>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Tailored to your unique goals and challenges.</p>
          </div>
          
          <div className="text-center p-3 sm:p-4 md:p-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Shield className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
            </div>
            <h4 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2">Private & Secure</h4>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Your conversations are encrypted and private.</p>
          </div>
          
          <div className="text-center p-3 sm:p-4 md:p-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
            </div>
            <h4 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2">Proven Results</h4>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Join thousands achieving their goals.</p>
          </div>
          
          <div className="text-center p-3 sm:p-4 md:p-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Users className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
            </div>
            <h4 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2">Multiple Coaches</h4>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Switch between coaches for comprehensive guidance.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20 bg-gradient-to-b from-card/20 to-transparent">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 px-2">
          <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            What Our <span className="bg-gradient-primary bg-clip-text text-transparent">Users Say</span>
          </h3>
          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground">
            Real stories from people who transformed their lives
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-5 sm:p-6 md:p-8 bg-card/50 backdrop-blur-sm border-2">
              <div className="flex gap-1 mb-3 sm:mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm sm:text-base text-foreground mb-4 sm:mb-6 italic">"{testimonial.content}"</p>
              <div>
                <p className="font-semibold text-sm sm:text-base">{testimonial.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 px-2">
          <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Frequently Asked <span className="bg-gradient-primary bg-clip-text text-transparent">Questions</span>
          </h3>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-2 border-border rounded-lg px-4 sm:px-6 bg-card/30">
                <AccordionTrigger className="text-left text-sm sm:text-base font-semibold hover:text-primary transition-colors py-3 sm:py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm md:text-base text-muted-foreground pt-1 sm:pt-2 pb-3 sm:pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center bg-gradient-primary rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]" />
          <div className="relative">
            <h3 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4 text-primary-foreground">
              Ready to Transform Your Life?
            </h3>
            <p className="text-primary-foreground/90 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
              Join thousands of people achieving their goals with personalized AI coaching.
            </p>
            <Button size="lg" variant="secondary" onClick={() => navigate("/auth")} className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 w-full sm:w-auto">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Start Free Trial - No Credit Card Required</span>
              <span className="sm:hidden">Start Free Trial</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/20">
        <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 sm:col-span-2 md:col-span-1">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3 sm:mb-4">
                AICOACHLY
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Your AI-powered personal coach for every aspect of life.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Product</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">Pricing</button></li>
                <li><button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">Features</button></li>
                <li><button onClick={() => navigate("/auth")} className="hover:text-foreground transition-colors">Get Started</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Company</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/about")} className="hover:text-foreground transition-colors">About Us</button></li>
                <li><button onClick={() => navigate("/contact")} className="hover:text-foreground transition-colors">Contact</button></li>
              </ul>
            </div>
            
            <div className="hidden md:block">
              <h4 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Legal</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-6 sm:pt-8 text-center text-muted-foreground text-xs sm:text-sm">
            <p>&copy; 2025 AICOACHLY. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Mini AI Demo */}
      <MiniAIDemo />
    </div>
  );
}
