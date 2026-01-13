
"use client";

import { Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Textarea } from '@repo/ui/textarea';
import { Label } from '@repo/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { PageContainer } from '@repo/ui/page-container';
import HeroSection from './components/HeroSection';
import ContactSection from './components/ContactSection';
import FixedBookmark from './components/FixedBookmark';
import AwardsSection from './components/AwardsSection';
import DownloadApp from '@/components/landing/DownloadApp';
import CTASection from '../salons/components/CTASection';

export default function ContactPage() {
  return (
    <PageContainer padding="none">

      <HeroSection/>
      <ContactSection />
      <FixedBookmark/>
      <AwardsSection/>
      <DownloadApp/>
      <CTASection/>
    </PageContainer>
  );
}
