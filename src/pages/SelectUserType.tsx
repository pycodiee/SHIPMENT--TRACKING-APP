import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Users, CreditCard, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SelectUserType = () => {
  const navigate = useNavigate();

  const userTypes = [
    {
      icon: ShieldCheck,
      title: 'Admin',
      description: 'Manage shipments, agents, and oversee entire operations with full control and analytics.',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      route: '/login',
      destination: '/admin',
    },
    {
      icon: User,
      title: 'Agent',
      description: 'Track and manage assigned deliveries, update status, and upload proof of delivery.',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      route: '/login',
      destination: '/agent',
    },
    {
      icon: Users,
      title: 'Customer',
      description: 'Track your shipments, view delivery status, and get real-time updates on your orders.',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      route: '/signup',
      destination: '/customer',
    },
    {
      icon: CreditCard,
      title: 'Subscription Plans',
      description: 'Choose the perfect plan for your business needs with flexible pricing options.',
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700',
      route: '/subscription',
      destination: '/subscription',
    },
  ];

  const handleCardClick = (userType: typeof userTypes[0]) => {
    // Store destination in sessionStorage for redirect after login
    if (userType.title !== 'Subscription Plans') {
      sessionStorage.setItem('redirectAfterLogin', userType.destination);
    }
    navigate(userType.route);
  };

  return (
    <div className="min-h-screen">
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="block text-gradient animate-gradient bg-[length:200%_200%]">
              Welcome to ShipTrack Pro
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Choose your user type to get started
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {userTypes.map((userType, index) => (
            <motion.div
              key={userType.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              onClick={() => handleCardClick(userType)}
              className="cursor-pointer"
            >
              <Card className="text-center hover-lift backdrop-blur-sm bg-white/50 dark:bg-black/50 border-white/20 group h-full transition-all duration-300 hover:border-primary/50">
                <CardHeader>
                  <motion.div 
                    className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${userType.color} ${userType.hoverColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <userType.icon className="h-10 w-10 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl mb-2">{userType.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-4 min-h-[60px]">
                    {userType.description}
                  </CardDescription>
                  <Button 
                    className={`w-full bg-gradient-to-r ${userType.color} ${userType.hoverColor} text-white border-0 group-hover:shadow-lg transition-all`}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <Link to="/">
            <Button variant="outline" className="backdrop-blur-sm bg-white/10 hover:bg-white/20 border-white/20">
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
};

export default SelectUserType;

