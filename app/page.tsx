'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  ArrowRight, 
  Briefcase, 
  Users, 
  Building2, 
  Zap, 
  Shield, 
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Target,
  Clock,
  Award
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'glass-effect shadow-lg' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">PlacementHub</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-700 hover:text-primary transition-colors">
                How It Works
              </Link>
              <Link href="#pricing" className="text-gray-700 hover:text-primary transition-colors">
                Pricing
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button className="gradient-primary text-white border-0">
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <Badge className="mb-4 gradient-primary text-white border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                Smart Placement Platform
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Transform Your Campus{' '}
                <span className="text-gradient">Placement Process</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Say goodbye to WhatsApp chaos and Excel sheets. PlacementHub brings intelligent automation, 
                personalized opportunities, and seamless collaboration to campus placements.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/sign-up">
                  <Button size="lg" className="gradient-primary text-white border-0 text-lg px-8">
                    Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Watch Demo
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center space-x-6">
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">No credit card required</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">14-day free trial</span>
                </div>
              </div>
            </div>
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 gradient-primary opacity-20 blur-3xl rounded-full"></div>
              <Card className="relative p-8 glass-effect">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">500+ Students</p>
                        <p className="text-sm text-gray-500">Registered</p>
                      </div>
                    </div>
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 gradient-secondary rounded-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">45 Companies</p>
                        <p className="text-sm text-gray-500">Active Drives</p>
                      </div>
                    </div>
                    <Badge className="gradient-success text-white border-0">Live</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 gradient-success rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">85% Placement</p>
                        <p className="text-sm text-gray-500">Success Rate</p>
                      </div>
                    </div>
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-white/50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Users, label: 'Active Students', value: '10,000+' },
              { icon: Building2, label: 'Partner Companies', value: '500+' },
              { icon: Briefcase, label: 'Placements', value: '8,500+' },
              { icon: Award, label: 'Success Rate', value: '92%' },
            ].map((stat, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow animate-fade-in">
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <Badge className="mb-4 gradient-primary text-white border-0">Features</Badge>
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your entire placement process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'Smart Eligibility Engine',
                description: 'Automatic filtering based on CGPA, department, skills, and backlogs. Students see only relevant opportunities.',
                color: 'gradient-primary',
              },
              {
                icon: Zap,
                title: 'One-Click Apply',
                description: 'Progressive profile system eliminates repetitive form filling. Apply to multiple drives in seconds.',
                color: 'gradient-secondary',
              },
              {
                icon: Shield,
                title: 'Career Vault',
                description: 'Centralized storage for resumes, certificates, projects, and internships. Build once, use everywhere.',
                color: 'gradient-success',
              },
              {
                icon: Clock,
                title: 'Real-time Notifications',
                description: 'Never miss a deadline. Get instant alerts via email, in-app, and WhatsApp for important updates.',
                color: 'gradient-primary',
              },
              {
                icon: TrendingUp,
                title: 'Analytics Dashboard',
                description: 'Track placement rates, popular skills, and trends. Make data-driven decisions for better outcomes.',
                color: 'gradient-secondary',
              },
              {
                icon: Users,
                title: 'Multi-Role Access',
                description: 'Tailored experiences for students, placement officers, and companies. Everyone gets what they need.',
                color: 'gradient-success',
              },
            ].map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-xl transition-all hover:-translate-y-1 animate-scale-in">
                <div className={`w-14 h-14 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <Card className="gradient-primary p-12 text-center text-white animate-scale-in">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Placements?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join 100+ colleges already using PlacementHub
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 text-lg px-8">
                  Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">PlacementHub</span>
              </div>
              <p className="text-gray-400">
                Smart campus placement ecosystem for the modern era.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#demo" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="#security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PlacementHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
