import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Target, Heart, Zap, Users } from "lucide-react";

export default function About() {
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
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </button>
            <button onClick={() => navigate("/pricing")} className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </button>
            <button onClick={() => navigate("/about")} className="text-foreground font-semibold">
              About
            </button>
            <button onClick={() => navigate("/contact")} className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </button>
          </nav>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Log In
            </Button>
            <Button variant="gradient" onClick={() => navigate("/signup")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-5xl md:text-6xl font-bold">
            About <span className="bg-gradient-primary bg-clip-text text-transparent">AICOACHLY</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to make professional coaching accessible to everyone through the power of artificial intelligence.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 bg-gradient-to-br from-card/50 to-card/20 backdrop-blur-sm border-2">
            <div className="text-center mb-8">
              <Target className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-4">Our Mission</h3>
            </div>
            <p className="text-lg text-muted-foreground text-center leading-relaxed">
              Traditional coaching is expensive, time-consuming, and often inaccessible. We believe everyone deserves personalized guidance to achieve their goals. AICOACHLY combines cutting-edge AI technology with proven coaching methodologies to deliver expert advice 24/7, at a fraction of the cost of traditional coaching.
            </p>
          </Card>
        </div>
      </section>

      {/* Values Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold mb-4">Our Core Values</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-2">
            <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h4 className="text-xl font-semibold mb-3">Empathy First</h4>
            <p className="text-muted-foreground">
              We design every interaction with compassion and understanding, ensuring our AI coaches provide supportive, non-judgmental guidance.
            </p>
          </Card>
          
          <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-2">
            <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
            <h4 className="text-xl font-semibold mb-3">Innovation</h4>
            <p className="text-muted-foreground">
              We continuously improve our AI models and coaching methodologies to provide the most effective guidance possible.
            </p>
          </Card>
          
          <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-2">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h4 className="text-xl font-semibold mb-3">Accessibility</h4>
            <p className="text-muted-foreground">
              Everyone should have access to quality coaching, regardless of budget or location. We make it affordable and available 24/7.
            </p>
          </Card>
        </div>
      </section>

      {/* Story Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-card/20 to-transparent">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold mb-8 text-center">Our Story</h3>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              AICOACHLY was founded in 2024 by a team of AI researchers, professional coaches, and wellness experts who saw the growing need for accessible personal development resources.
            </p>
            <p>
              We noticed that while coaching was incredibly effective, it remained out of reach for most people due to high costs and limited availability. At the same time, AI technology was advancing rapidly, showing unprecedented capabilities in understanding and responding to human needs.
            </p>
            <p>
              By combining our expertise in coaching methodologies with cutting-edge AI technology, we created AICOACHLY - a platform that delivers personalized, expert guidance that's always available, affordable, and tailored to each individual's unique situation.
            </p>
            <p>
              Today, we're proud to serve thousands of users worldwide, helping them achieve their goals in fitness, career, mindfulness, finance, and relationships. Our journey has just begun, and we're committed to continuously improving and expanding our services.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-4">
            Join Our Growing Community
          </h3>
          <p className="text-muted-foreground mb-8 text-lg">
            Be part of the future of personal development. Start your journey today.
          </p>
          <Button size="lg" variant="gradient" onClick={() => navigate("/signup")}>
            Get Started Free
          </Button>
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
