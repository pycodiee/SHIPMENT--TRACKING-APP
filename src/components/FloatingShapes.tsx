import { motion } from 'framer-motion';
import { Package, TruckIcon, MapPin } from 'lucide-react';

export const FloatingShapes = () => {
  const shapes = [
    { Icon: Package, delay: 0, duration: 15 },
    { Icon: TruckIcon, delay: 5, duration: 20 },
    { Icon: MapPin, delay: 10, duration: 18 },
  ];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          className="absolute"
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0.1,
          }}
          animate={{
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
            rotate: [0, 360],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <shape.Icon className="w-16 h-16 text-primary" />
        </motion.div>
      ))}
    </div>
  );
};
