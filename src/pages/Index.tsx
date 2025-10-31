import { Link } from 'react-router-dom';
import { Package, TruckIcon, Shield, Zap, ArrowRight, Sparkles, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const features = [
    {
      icon: TruckIcon,
      title: 'Real-Time Tracking',
      description: 'Monitor your shipments with live updates and location tracking',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security for all your delivery operations',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Instant notifications and seamless status updates',
    },
  ];

  return (
    <div className="min-h-screen">
      
      <nav className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Package className="h-8 w-8 text-primary" />
              </motion.div>
              <span className="text-xl font-bold text-gradient">
                ShipTrack Pro
              </span>
            </motion.div>
            <motion.div 
              className="flex gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link to="/login">
                <Button variant="outline" className="backdrop-blur-sm bg-white/10 hover:bg-white/20 border-white/20">
                  Login
                </Button>
              </Link>
              <Link to="/select-user-type">
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 animate-pulse-glow">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">New: Real-time location tracking</span>
          </motion.div>
          
          <motion.h1 
            className="text-6xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="block text-gradient animate-gradient bg-[length:200%_200%]">
              Track Your Shipments
            </span>
            <span className="block mt-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              With Confidence
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Complete shipment management solution for admins, agents, and customers. 
            Real-time tracking, proof of delivery, and seamless communication.
          </motion.p>
          
          <motion.div 
            className="flex gap-4 justify-center flex-wrap"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link to="/select-user-type">
              <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 hover-lift group">
                Start Tracking
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/customer">
              <Button size="lg" variant="outline" className="text-lg px-8 backdrop-blur-sm bg-white/5 hover:bg-white/10 border-white/20 hover-lift">
                Track Shipment
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.2 }}
            >
              <Card className="text-center hover-lift backdrop-blur-sm bg-white/50 dark:bg-black/50 border-white/20 group">
                <CardHeader>
                  <motion.div 
                    className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="h-8 w-8 text-primary" />
                  </motion.div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <Card className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_200%] animate-gradient text-primary-foreground border-0 hover-lift overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4YzAgNi44NSA4LjA2IDE4IDE4IDE4czE4LTExLjE1IDE4LTE4em0tMTggMTVjLTguMjcgMC0xNS05LjE1LTE1LTE1IDAtOC4yNyA2LjczLTE1IDE1LTE1czE1IDYuNzMgMTUgMTVjMCA1Ljg1LTYuNzMgMTUtMTUgMTV6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10" />
            <CardContent className="relative p-12 text-center">
              <motion.h2 
                className="text-4xl font-bold mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                Ready to Get Started?
              </motion.h2>
              <motion.p 
                className="text-lg mb-8 opacity-90"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.9 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Join thousands of businesses managing their shipments efficiently
              </motion.p>
              <Link to="/select-user-type">
                <Button size="lg" variant="secondary" className="text-lg px-8 hover-lift animate-bounce-slow">
                  Create Free Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <motion.div 
                className="flex items-center gap-2 mb-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Package className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-gradient">ShipTrack Pro</span>
              </motion.div>
              <p className="text-muted-foreground text-sm mb-4 max-w-md">
                Complete shipment management solution for admins, agents, and customers. 
                Real-time tracking, proof of delivery, and seamless communication.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/customer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Track Shipment
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <a href="mailto:support@shiptrackpro.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    support@shiptrackpro.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <a href="tel:+1234567890" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    +1 (234) 567-890
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    123 Commerce St, Business District<br />
                    New York, NY 10001
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} ShipTrack Pro. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
