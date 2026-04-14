'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Briefcase, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Add Firebase sign-in logic here
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block animate-slide-up">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-gradient">PlacementHub</span>
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Welcome Back to Your{' '}
            <span className="text-gradient">Career Journey</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Access your personalized dashboard, track applications, and never miss an opportunity.
          </p>
          <div className="space-y-4">
            {[
              'View eligible drives instantly',
              'One-click application system',
              'Real-time status updates',
              'Manage your career vault',
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <Card className="p-8 glass-effect animate-scale-in">
          <div className="mb-8">
            <Badge className="mb-4 gradient-primary text-white border-0">Sign In</Badge>
            <h2 className="text-3xl font-bold mb-2">Access Your Account</h2>
            <p className="text-gray-600">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="student@college.edu"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary text-white border-0 text-lg h-12"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner mx-auto" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/sign-up" className="text-primary font-semibold hover:underline">
                Sign up now
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-500 text-center">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
