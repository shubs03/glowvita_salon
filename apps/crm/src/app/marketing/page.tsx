"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from '@repo/ui/input';
import { Textarea } from '@repo/ui/textarea';
import { Label } from '@repo/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { MessageSquare, Users, Send, Image as ImageIcon, X, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState('post');

  const handleOptionClick = (tab: string) => {
    setActiveTab(tab);
    // Handle navigation or action for each option
    console.log(`Selected: ${tab}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marketing</h1>
        <p className="text-muted-foreground">Create and manage your marketing content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleOptionClick('post')}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Social Post Creato</h3>
            <p className="text-sm text-muted-foreground">Create and schedule social media posts</p>
          </CardContent>
        </Card>

        <Link href="/marketing/social-media-templates">
          <Card className="cursor-pointer hover:shadow-md transition-colors border-blue-500 h-full">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Social Media Marketing</h3>
              <p className="text-sm text-muted-foreground">Create and manage marketing campaigns</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/marketing/message-blast">
          <Card className="cursor-pointer hover:shadow-md transition-colors hover:border-green-500 h-full">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Message Blast</h3>
              <p className="text-sm text-muted-foreground">Send bulk SMS to your customers</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      
    </div>
  );
}