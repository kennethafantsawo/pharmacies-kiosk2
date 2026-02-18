import { PhoneCall } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-slate-50 border-t">
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center gap-4 text-primary">
          <PhoneCall className="h-10 w-10" />
          <div className="text-left">
            <p className="text-xl font-semibold text-foreground">Urgence / SAMU</p>
            <p className="text-5xl font-black tracking-widest text-slate-800">112</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
