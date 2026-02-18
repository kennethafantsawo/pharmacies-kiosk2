import { PhoneCall } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="absolute bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-t border-white/10">
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center gap-4 text-primary">
          <PhoneCall className="h-10 w-10 animate-pulse" />
          <div className="text-left">
            <p className="text-xl font-semibold text-foreground">Urgence / SAMU</p>
            <p className="text-5xl font-black tracking-widest">112</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
