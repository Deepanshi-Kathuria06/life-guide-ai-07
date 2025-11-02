import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Dumbbell, Briefcase, Brain, DollarSign, Heart, Sparkles, 
  Check, Star, TrendingUp, Users, Clock, Shield,
  ChevronDown
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AICOACHLY
            </h1>
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </button>
            <button onClick={() => navigate("/pricing")} className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </button>
            <button onClick={() => navigate("/about")} className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </button>
            <button onClick={() => navigate("/contact")} className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </button>
          </nav>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Log In
            </Button>
            <Button variant="gradient" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="max-w-4xl mx-auto space-y-8 relative">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm font-medium text-primary">🚀 Powered by Advanced AI Technology</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Your <span className="bg-gradient-primary bg-clip-text text-transparent">AI-Powered</span>
            <br />
            Life Coach for Success
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Get personalized guidance from specialized AI coaches in fitness, career, mindfulness, finance, and relationships. Available 24/7, whenever you need support.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" variant="gradient" onClick={() => navigate("/auth")} className="text-lg px-8">
              <Sparkles className="h-5 w-5 mr-2" />
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/pricing")} className="text-lg px-8">
              View Pricing
            </Button>
          </div>
          
          <div className="pt-8">
            <p className="text-sm text-muted-foreground mb-3">Trusted by thousands of professionals</p>
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
              ))}
              <span className="ml-2 text-sm font-semibold">4.9/5 from 2,500+ reviews</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        >
          <ChevronDown className="h-8 w-8 text-muted-foreground" />
        </button>
      </section>

      {/* Stats Section */}
      <section id="stats" className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-bold mb-4">
            How It <span className="bg-gradient-primary bg-clip-text text-transparent">Works</span>
          </h3>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes and transform your life with AI-powered coaching
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">1</span>
              </div>
              <h4 className="text-xl font-semibold mb-3">Choose Your Coach</h4>
              <p className="text-muted-foreground">Select from 5 specialized AI coaches based on your goals</p>
            </div>
          </Card>
          
          <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">2</span>
              </div>
              <h4 className="text-xl font-semibold mb-3">Start Chatting</h4>
              <p className="text-muted-foreground">Have natural conversations and get personalized advice instantly</p>
            </div>
          </Card>
          
          <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">3</span>
              </div>
              <h4 className="text-xl font-semibold mb-3">Achieve Your Goals</h4>
              <p className="text-muted-foreground">Follow personalized action plans and track your progress</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Coaches Grid */}
      <section id="features" className="container mx-auto px-4 py-20 bg-gradient-to-b from-transparent to-card/20">
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-bold mb-4">
            Meet Your <span className="bg-gradient-primary bg-clip-text text-transparent">AI Coaches</span>
          </h3>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Each coach is specialized in their domain to provide expert guidance
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {coaches.map((coach) => {
            const Icon = coach.icon;
            return (
              <Card
                key={coach.name}
                className="relative p-8 bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 border-2 group overflow-hidden hover:scale-105"
                style={{
                  borderImage: `linear-gradient(135deg, hsl(var(--${coach.color})), transparent) 1`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="text-5xl mb-4 animate-float">{coach.icon === Dumbbell ? "💪" : coach.icon === Briefcase ? "💼" : coach.icon === Brain ? "🧠" : coach.icon === DollarSign ? "💰" : "❤️"}</div>
                  <h4 className="text-xl font-semibold mb-3" style={{ color: `hsl(var(--${coach.color}))` }}>
                    {coach.name}
                  </h4>
                  <p className="text-muted-foreground mb-6">{coach.description}</p>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    style={{ 
                      borderColor: `hsl(var(--${coach.color}))`,
                      color: `hsl(var(--${coach.color}))`
                    }}
                    onClick={() => navigate("/signup")}
                  >
                    Start Chatting
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="bg-gradient-primary bg-clip-text text-transparent">AICOACHLY</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-2">24/7 Availability</h4>
            <p className="text-muted-foreground">Get expert advice instantly, anytime you need it. No scheduling, no waiting.</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Specialized Expertise</h4>
            <p className="text-muted-foreground">Each AI coach is trained specifically in their domain for accurate guidance.</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Personalized Experience</h4>
            <p className="text-muted-foreground">Conversations tailored to your unique goals, challenges, and preferences.</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Private & Secure</h4>
            <p className="text-muted-foreground">Your conversations are encrypted and never shared with third parties.</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Proven Results</h4>
            <p className="text-muted-foreground">Join thousands who've achieved their goals with AI coaching.</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Multiple Coaches</h4>
            <p className="text-muted-foreground">Switch between coaches to get comprehensive life guidance.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-card/20 to-transparent">
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-bold mb-4">
            What Our <span className="bg-gradient-primary bg-clip-text text-transparent">Users Say</span>
          </h3>
          <p className="text-xl text-muted-foreground">
            Real stories from people who transformed their lives
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-8 bg-card/50 backdrop-blur-sm border-2">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground mb-6 italic">"{testimonial.content}"</p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="bg-gradient-primary bg-clip-text text-transparent">Questions</span>
          </h3>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-2 border-border rounded-lg px-6 bg-card/30">
                <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center bg-gradient-primary rounded-2xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]" />
          <div className="relative">
            <h3 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Ready to Transform Your Life?
            </h3>
            <p className="text-white/90 mb-8 text-lg max-w-2xl mx-auto">
              Join thousands of people achieving their goals with personalized AI coaching. Start your free trial today.
            </p>
            <Button size="lg" variant="secondary" onClick={() => navigate("/signup")} className="text-lg px-8">
              <Sparkles className="h-5 w-5 mr-2" />
              Start Free Trial - No Credit Card Required
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
                AICOACHLY
              </h1>
              <p className="text-muted-foreground text-sm">
                Your AI-powered personal coach for every aspect of life.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">Pricing</button></li>
                <li><button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">Features</button></li>
                <li><button onClick={() => navigate("/signup")} className="hover:text-foreground transition-colors">Get Started</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/about")} className="hover:text-foreground transition-colors">About Us</button></li>
                <li><button onClick={() => navigate("/contact")} className="hover:text-foreground transition-colors">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2025 AICOACHLY. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
