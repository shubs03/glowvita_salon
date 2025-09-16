
'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { cn } from '@repo/ui/cn';
import { Button } from '@repo/ui/button';
import { Sparkles, Zap, CheckCircle2, Clock } from 'lucide-react';

export function CrmLayout({ children }: { children: React.ReactNode; }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isWelcomeScreen, setIsWelcomeScreen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const { isCrmAuthenticated, isLoading, user } = useCrmAuth();
  const router = useRouter();

  // Enhanced loading progress simulation
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 200);
      
      return () => clearInterval(interval);
    } else {
      setLoadingProgress(100);
    }
  }, [isLoading]);

  // Enhanced first-time welcome logic
  useEffect(() => {
    if (!isLoading && isCrmAuthenticated && user) {
      const hasSeenWelcome = localStorage.getItem(`welcome-seen-${user.id}`);
      if (!hasSeenWelcome) {
        setIsWelcomeScreen(true);
        setTimeout(() => {
          setIsWelcomeScreen(false);
          localStorage.setItem(`welcome-seen-${user.id}`, 'true');
        }, 3500);
      }
    }
  }, [isLoading, isCrmAuthenticated, user]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isLoading && !isCrmAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isCrmAuthenticated, router]);
     
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Enhanced loading progress and welcome screen management
  if (isLoading || !isCrmAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 rounded-full animate-spin border-t-primary"></div>
          </div>
          
          <div className="w-64">
            <div className="flex justify-between items-center mb-2">
              <p className="text-muted-foreground font-medium">Loading...</p>
              <span className="text-primary font-semibold text-sm">{Math.round(loadingProgress)}%</span>
            </div>
            <div className="w-full bg-border/30 rounded-full h-2">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Initializing secure connection...</p>
            <p>Verifying credentials...</p>
            <p>Preparing dashboard...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Enhanced welcome screen
  if (isWelcomeScreen && user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center shadow-sm mx-auto">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome back, {user.businessName || user.name}!
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Your workspace is ready
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 rounded-lg bg-card border border-border/30">
              <Zap className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold text-sm mb-1">Fast</h3>
              <p className="text-xs text-muted-foreground text-center">Optimized performance</p>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-lg bg-card border border-border/30">
              <CheckCircle2 className="h-6 w-6 text-green-500 mb-2" />
              <h3 className="font-semibold text-sm mb-1">Secure</h3>
              <p className="text-xs text-muted-foreground text-center">Enterprise-grade security</p>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-lg bg-card border border-border/30">
              <Sparkles className="h-6 w-6 text-purple-500 mb-2" />
              <h3 className="font-semibold text-sm mb-1">Modern</h3>
              <p className="text-xs text-muted-foreground text-center">Beautiful interface</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
     
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        isMobile={isMobile}
      />
             
      <div className={cn(
        "flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden transition-all duration-300 ease-in-out",
        !isMobile && (isSidebarOpen ? "lg:ml-64" : "lg:ml-20")
      )}>
        <Header toggleSidebar={toggleSidebar} />
                 
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/20">
          <div className="w-full max-w-none overflow-hidden min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
