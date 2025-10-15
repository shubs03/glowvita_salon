"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { 
  MessageCircle, 
  Send, 
  User, 
  Clock, 
  CheckCircle, 
  Phone, 
  Video,
  FileText,
  Paperclip,
  Smile,
  Activity
} from "lucide-react";
import { ConsultationData } from '../page';

interface Message {
  id: string;
  sender: 'doctor' | 'patient';
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
}

interface ChatPanelProps {
  consultationData: ConsultationData;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export function ChatPanel({ consultationData, currentStep, setCurrentStep }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'doctor',
      content: `Hello ${consultationData.patientName}! I'm ${consultationData.doctorName}. I've reviewed your health concerns: ${consultationData.concerns}. How can I help you today?`,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        sender: 'patient',
        content: newMessage,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      setIsTyping(true);
      
      // Simulate doctor response
      setTimeout(() => {
        const doctorResponse: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'doctor',
          content: getDoctorResponse(newMessage),
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, doctorResponse]);
        setIsTyping(false);
      }, 2000);
    }
  };

  const getDoctorResponse = (userMessage: string): string => {
    const responses = [
      "I understand your concern. Can you tell me more about when this started?",
      "That's helpful information. Have you experienced any other symptoms?",
      "Based on what you've described, I'd recommend...",
      "Let me suggest a treatment plan for you.",
      "Have you tried any medications for this before?",
      "I'd like to schedule a follow-up consultation. How does that sound?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-primary/10 rounded-full text-primary">
            <MessageCircle className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Live Consultation</h2>
            <p className="text-lg text-muted-foreground">Chat with {consultationData.doctorName}</p>
          </div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Chat Interface (2/3 width) */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <MessageCircle className="h-6 w-6 text-primary" />
                  Chat with Doctor
                </CardTitle>
                <div className="flex gap-3">
                  <Button variant="outline" className="px-4 py-2">
                    <Phone className="h-4 w-4 mr-2" />
                    Voice Call
                  </Button>
                  <Button variant="outline" className="px-4 py-2">
                    <Video className="h-4 w-4 mr-2" />
                    Video Call
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-xl p-4 ${
                        message.sender === 'patient'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {message.sender === 'doctor' ? consultationData.doctorName : 'You'}
                          </span>
                        </div>
                        <span className="text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-muted-foreground rounded-xl p-4 max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm font-medium">{consultationData.doctorName}</span>
                        <span className="text-xs opacity-70">typing...</span>
                      </div>
                      <div className="flex space-x-1 mt-2">
                        <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="h-12 w-12">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 h-12 text-base"
                  />
                  <Button variant="outline" size="sm" className="h-12 w-12">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()} className="h-12 px-6">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Consultation Info (1/3 width) */}
        <div className="space-y-6">
          {/* Consultation Status */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Consultation Active
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Consultation ID</p>
                  <p className="font-medium text-sm">{consultationData.consultationId}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Doctor</p>
                  <p className="font-medium text-sm">{consultationData.doctorName}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="font-medium text-sm">{consultationData.patientName}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-600">Status</p>
                  <p className="font-medium text-sm text-green-700">Active Session</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Concerns Reference */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Your Health Concerns
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground mb-2">Patient's concerns:</p>
                <p className="text-sm font-medium text-primary">{consultationData.concerns}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Request Prescription
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Schedule Follow-up
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Share Medical History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}