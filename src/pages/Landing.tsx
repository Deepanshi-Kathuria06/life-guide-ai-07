import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Sparkles, Check, Star, TrendingUp, Clock, Shield,
  Menu, MessageSquare, CheckSquare, FileText, Target,
  StickyNote, Calendar, Brain, Heart
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const features = [
  {
    title: "AI Chat Assistant",
    description: "Have natural conversations with ARIA — get life advice, task planning, and emotional support",
    icon: MessageSquare,
    emoji: "💬",
  },
  {
    title: "Smart Task Manager",
    description: "Kanban & list views, auto-created tasks from chat, priority filters, and due dates",
    icon: CheckSquare,
    emoji: "✅",
  },
  {
    title: "Document Vault",
    description: "Upload and organize documents. ARIA summarizes them and answers questions about them",
    icon: FileText,
    emoji: "📄",
  },
  {
    title: "Goal Tracker",
    description: "Set life goals with milestones, track progress, and get AI-powered accountability",
    icon: Target,
    emoji: "🎯",
  },
  {
    title: "Quick Notes",
    description: "Capture ideas fast. Pin important notes and let ARIA expand or structure them",
    icon: StickyNote,
    emoji: "📝",
  },
  {
    title: "Life Calendar",
    description: "See tasks, reminders, and goal milestones in a unified calendar view",
    icon: Calendar,
    emoji: "📅",
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Manager",
    content: "ARIA helped me organize my entire life — tasks, goals, documents, everything in one place.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Entrepreneur",
    content: "Having an AI that knows my goals and holds me accountable has been a game-changer.",
    rating: 5,
  },
  {
    name: "Emma Davis",
    role: "Freelance Designer",
    content: "I replaced 5 different apps with ARIA. It's like having a personal chief of staff.",
    rating: 5,
  },
];

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "1M+", label: "Tasks Completed" },
  { value: "4.9/5", label: "User Rating" },
  { value: "24/7", label: "AI Available" },
];

const faqs = [
  {
    question: "What is ARIA?",
    answer: "ARIA is your AI-powered personal life operating system. It combines a life coach, personal assistant, task manager, document organizer, and accountability partner into one unified platform.",
  },
  {
    question: "How does the free trial work?",
    answer: "Sign up for free and get full access for 7 days. No credit card required. Experience all of ARIA's features risk-free.",
  },
  {
    question: "How personalized is ARIA?",
    answer: "ARIA learns about your goals, work situation, challenges, and preferred communication style during onboarding. It references your context in every conversation and adapts its approach to you.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes! We use enterprise-grade encryption and row-level security. Your data is private and only accessible to you. We never share your information with third parties.",
  },
  {
    question: "Can ARIA create tasks from conversations?",
    answer: "Absolutely! When you mention wanting to do something by a specific time, ARIA detects it and automatically creates a task for you. It's like having a secretary who never misses anything.",
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
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ARIA
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
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Log In
            </Button>
            <Button variant="gradient" onClick={() => navigate("/signup")}>
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
                    ARIA
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
                  <Button variant="outline" className="w-full" onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}>
                    Log In
                  </Button>
                  <Button variant="gradient" className="w-full" onClick={() => { navigate("/signup"); setMobileMenuOpen(false); }}>
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
            <span className="text-sm font-medium text-primary">✨ Your Personal AI Life Operating System</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Meet <span className="bg-gradient-primary bg-clip-text text-transparent">ARIA</span> — Your AI Chief of Staff
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            One intelligent assistant that acts as your life coach, personal assistant, task manager, document organizer, and accountability partner — all in one app.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" variant="gradient" onClick={() => navigate("/signup")} className="px-8">
              <Sparkles className="h-5 w-5 mr-2" />
              Start Free — 7 Day Trial
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="px-8">
              See Features
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>All features included</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Everything You Need, <span className="bg-gradient-primary bg-clip-text text-transparent">One Place</span>
          </h3>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            ARIA replaces your separate coaching apps, task managers, and note tools with one unified system
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="relative p-6 bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 border-2 border-border hover:border-primary/30 group overflow-hidden hover:scale-[1.02] cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{feature.emoji}</div>
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
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
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { num: "1", title: "Tell ARIA About You", desc: "Complete a quick onboarding — your goals, work, challenges, and preferred style" },
            { num: "2", title: "Start Chatting", desc: "Ask ARIA anything. It creates tasks, gives advice, and manages your life proactively" },
            { num: "3", title: "Stay Organized", desc: "Tasks, goals, documents, and notes — all managed by ARIA and accessible anywhere" },
          ].map((step) => (
            <Card key={step.num} className="p-8 text-center bg-card/50 backdrop-blur-sm border-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{step.num}</span>
                </div>
                <h4 className="text-xl font-semibold mb-3">{step.title}</h4>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats */}
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

      {/* Benefits */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="bg-gradient-primary bg-clip-text text-transparent">ARIA</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { icon: Clock, title: "24/7 Availability", desc: "ARIA is always ready — morning check-ins, late-night brainstorms, anytime." },
            { icon: Brain, title: "Context-Aware", desc: "ARIA remembers your goals, challenges, and preferences across every conversation." },
            { icon: Heart, title: "Empathetic & Direct", desc: "Warm when you need support, direct when you need action steps." },
            { icon: Shield, title: "Private & Secure", desc: "Enterprise-grade encryption. Your data stays yours, always." },
            { icon: TrendingUp, title: "Proactive Guidance", desc: "ARIA anticipates needs and suggests actions before you ask." },
            { icon: Target, title: "Results-Driven", desc: "Concrete steps, accountability tracking, and measurable progress." },
          ].map((b, i) => (
            <div key={i} className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <b.icon className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">{b.title}</h4>
              <p className="text-muted-foreground">{b.desc}</p>
            </div>
          ))}
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
          {testimonials.map((t, index) => (
            <Card key={index} className="p-6 bg-card/50 backdrop-blur-sm border">
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">"{t.content}"</p>
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
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
                <AccordionTrigger className="text-left hover:no-underline">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Ready to Let ARIA Run Your Life?
          </h3>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who replaced 5+ apps with one intelligent assistant
          </p>
          <Button size="lg" variant="gradient" onClick={() => navigate("/signup")} className="px-10">
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
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-gradient-primary flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">ARIA</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Your AI-powered personal life operating system.
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
            © {new Date().getFullYear()} ARIA LifeOS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
