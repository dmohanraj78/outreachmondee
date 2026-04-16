import React, { useState } from 'react';
import { Check, Zap, Shield, Globe, Send, ArrowRight, Stars, ShieldCheck, Mail, Cpu } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { N8N_CONFIG } from '../config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { motion } from 'framer-motion';

const Pricing = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const MONDEE_LOGO = "https://www.mondee.com/app/uploads/2026/03/Mondee_logo.svg";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(N8N_CONFIG.INTENT_LEADS_WEBHOOK, {
        ...formData,
        page: window.location.href,
        source: 'website_pricing_form'
      });
      
      toast.success("Intelligence Received: Lead processed for synchronization.");
      setFormData({ name: '', email: '', company: '', message: '' });
    } catch (error) {
      console.error("Lead submission failed", error);
      toast.error("Network Error: Failed to synchronize lead data.");
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: "Starter Swarm",
      price: "$499",
      description: "Perfect for single founders looking to automate their initial outreach.",
      features: ["500 Verified Leads / mo", "AI Personalization", "LinkedIn Ghost Integration", "Email Verification"],
      accent: "slate"
    },
    {
      name: "Growth Agent",
      price: "$1,299",
      description: "Scale your revenue with multi-channel agentic intelligence.",
      features: ["2,500 Verified Leads / mo", "Advanced Research Swarm", "Priority Agent Support", "Custom API Access"],
      accent: "primary",
      popular: true
    },
    {
      name: "Enterprise Core",
      price: "Custom",
      description: "Full-scale agentic operations for large marketing teams.",
      features: ["Unlimited Leads", "Dedicated Infrastructure", "White-label Dashboard", "Custom Workflows"],
      accent: "accent"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-primary/10">
      {/* Standalone Navbar */}
      <nav className="h-20 border-b border-slate-100 px-6 sm:px-12 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <img src={MONDEE_LOGO} alt="Mondee" className="h-8 w-auto" />
          <div className="h-4 w-px bg-slate-200 mx-2 hidden sm:block" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 hidden sm:block">Agentic OS</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="/" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Go to App</a>
          <Button variant="primary" size="sm" className="hidden sm:flex h-10 px-6 font-bold uppercase tracking-widest text-[10px]">Contact Us</Button>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 sm:px-12 py-20 space-y-32">
        {/* Hero Section */}
        <section className="text-center space-y-10 py-12">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4"
            >
                <Stars size={12} className="text-amber-500" />
                Next-Gen Outreach Infrastructure
            </motion.div>
            <div className="space-y-4">
                <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 balance leading-tight">
                    Scale your revenue with <br />
                    <span className="text-primary italic">Agentic Intelligence</span>
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto font-normal leading-relaxed">
                    Deploy autonomous intelligence swarms that research, personalize, and close deals for you. No more manual prospecting—just raw pipeline.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button variant="primary" className="h-14 px-10 text-[11px] font-bold uppercase tracking-[0.2em] group">
                    Start Your Swarm
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-6">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    Secure & Verified Data
                </div>
            </div>
        </section>

        {/* Pricing Cards */}
        <section id="pricing" className="space-y-16">
            <header className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Flexible Investment Plans</h2>
                <p className="text-slate-500 text-sm">Choose the operational scale that fits your current mission.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                >
                    <Card className={`h-full border-slate-100 flex flex-col relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${plan.popular ? 'ring-2 ring-primary/20 shadow-xl' : 'shadow-sm'}`}>
                    {plan.popular && (
                        <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest shadow-sm">
                        Most Popular
                        </div>
                    )}
                    <CardHeader className="p-8">
                        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                        <CardDescription className="text-sm font-medium mt-2 leading-relaxed">{plan.description}</CardDescription>
                        <div className="mt-6 flex items-baseline gap-1">
                        <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                        {plan.price !== 'Custom' && <span className="text-slate-400 text-sm">/mo</span>}
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-between">
                        <ul className="space-y-4 mb-10">
                        {plan.features.map((feature, j) => (
                            <li key={j} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                            <div className="w-5 h-5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                                <Check size={12} className={plan.popular ? 'text-primary' : 'text-slate-400'} />
                            </div>
                            {feature}
                            </li>
                        ))}
                        </ul>
                        <Button variant={plan.popular ? 'primary' : 'outline'} className="w-full h-12 font-bold uppercase tracking-wider text-[11px]">
                        {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                        </Button>
                    </CardContent>
                    </Card>
                </motion.div>
                ))}
            </div>
        </section>

        {/* Contact/Integration Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center bg-slate-900 rounded-[48px] p-8 sm:p-20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-primary/10 rounded-[48px] blur-[120px] pointer-events-none" />
            <div className="space-y-8 relative z-10">
            <Badge variant="outline" className="bg-white/5 text-slate-400 border-white/10 uppercase tracking-[0.2em] px-4 py-1">Custom Swarms</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">Build your custom <br /><span className="text-primary">Engagement Terminal</span></h2>
            <p className="text-slate-400 font-normal leading-relaxed text-lg max-w-lg">
                Need a high-volume enterprise node? Our specialized agentic swarms can be custom-wired to your specific infrastructure.
            </p>
            <div className="space-y-6 pt-4">
                {[
                { icon: Zap, label: "Instant Webhook Activation", color: "text-amber-400" },
                { icon: Shield, label: "AES-256 Data Encryption", color: "text-emerald-400" },
                { icon: Globe, label: "Global Identity Rotation", color: "text-blue-400" }
                ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                    <item.icon size={18} className={item.color} />
                    </div>
                    <span className="text-[11px] font-bold text-white/70 uppercase tracking-[0.2em]">{item.label}</span>
                </div>
                ))}
            </div>
            </div>

            <Card className="shadow-2xl border-none overflow-hidden rounded-[2.5rem] bg-white relative z-10">
            <CardContent className="p-8 sm:p-12">
                <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                    <input 
                        required
                        type="text" 
                        placeholder="Dhanush M"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full h-14 rounded-2xl border-slate-100 bg-slate-50/80 px-5 text-sm font-semibold focus:ring-primary focus:border-primary transition-all"
                    />
                    </div>
                    <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Corporate Email</label>
                    <input 
                        required
                        type="email" 
                        placeholder="dhanush@mondee.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full h-14 rounded-2xl border-slate-100 bg-slate-50/80 px-5 text-sm font-semibold focus:ring-primary focus:border-primary transition-all"
                    />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Organization</label>
                    <input 
                    required
                    type="text" 
                    placeholder="Mondee AI Labs"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full h-14 rounded-2xl border-slate-100 bg-slate-50/80 px-5 text-sm font-semibold focus:ring-primary focus:border-primary transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Mission Requirement</label>
                    <textarea 
                    rows={4}
                    placeholder="Describe your revenue goals..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full rounded-2xl border-slate-100 bg-slate-50/80 p-5 text-sm font-semibold focus:ring-primary focus:border-primary transition-all resize-none"
                    />
                </div>
                <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={loading}
                    className="w-full h-16 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                >
                    {loading ? 'Transmitting...' : 'Initialize Connection'}
                    <Send size={16} />
                </Button>
                </form>
            </CardContent>
            </Card>
        </section>
      </main>

      {/* Standalone Footer */}
      <footer className="border-t border-slate-100 py-20 bg-slate-50">
          <div className="max-w-[1400px] mx-auto px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="col-span-1 md:col-span-2 space-y-6">
                <img src={MONDEE_LOGO} alt="Mondee" className="h-8 w-auto grayscale opacity-50" />
                <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                    Mondee Agentic OS is the world's most advanced autonomous revenue infrastructure. Built for the era of intelligence.
                </p>
              </div>
              <div className="space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Ecosystem</h4>
                  <ul className="space-y-4 text-xs font-semibold text-slate-400">
                      <li><a href="/" className="hover:text-primary transition-colors">Dashboard</a></li>
                      <li><a href="/" className="hover:text-primary transition-colors">Lead Finder</a></li>
                      <li><a href="/" className="hover:text-primary transition-colors">Mail Sender</a></li>
                  </ul>
              </div>
              <div className="space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Legal</h4>
                  <ul className="space-y-4 text-xs font-semibold text-slate-400">
                      <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                      <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                      <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                  </ul>
              </div>
          </div>
          <div className="max-w-[1400px] mx-auto px-12 pt-12 mt-12 border-t border-slate-200/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              <span>© 2026 Mondee. All Rights Reserved.</span>
              <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2"><Cpu size={14} /> Edge Intelligence</div>
                  <div className="flex items-center gap-2"><Mail size={14} /> Global Delivery</div>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default Pricing;
