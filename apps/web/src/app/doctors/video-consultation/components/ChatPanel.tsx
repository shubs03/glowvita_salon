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
  Activity,
  Star,
  MapPin,
  Stethoscope,
  Award
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
      <div className="mb-4 md:mb-6 lg:mb-8">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-3 md:p-4 bg-primary/10 rounded-full text-primary">
            <MessageCircle className="h-6 w-6 md:h-8 md:w-8" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">Live Consultation</h2>
            <p className="text-sm md:text-base lg:text-lg text-muted-foreground">Chat with {consultationData.doctorName}</p>
          </div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {/* Left Column - Chat Interface (2/3 width) */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Card className="lg:sticky lg:top-4 h-[500px] md:h-[600px] lg:h-[calc(100vh-120px)] flex flex-col">
            <CardHeader className="border-b py-3 md:py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl">
                  <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  Chat with Doctor
                </CardTitle>
                <div className="flex gap-2 md:gap-3">
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-9 md:h-10 text-xs md:text-sm">
                    <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                    <span className="hidden sm:inline">Voice Call</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-9 md:h-10 text-xs md:text-sm">
                    <Video className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                    <span className="hidden sm:inline">Video Call</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 space-y-3 md:space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[75%] lg:max-w-[70%] rounded-xl p-3 md:p-4 ${
                        message.sender === 'patient'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          <span className="text-xs md:text-sm font-medium">
                            {message.sender === 'doctor' ? consultationData.doctorName : 'You'}
                          </span>
                        </div>
                        <span className="text-[10px] md:text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-muted-foreground rounded-xl p-3 md:p-4 max-w-[85%] md:max-w-[75%] lg:max-w-[70%]">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        <span className="text-xs md:text-sm font-medium">{consultationData.doctorName}</span>
                        <span className="text-[10px] md:text-xs opacity-70">typing...</span>
                      </div>
                      <div className="flex space-x-1 mt-2">
                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-current rounded-full animate-bounce"></div>
                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="border-t p-2 md:p-3 lg:p-4">
                <div className="flex gap-2 md:gap-3">
                  <Button variant="outline" size="sm" className="h-9 w-9 md:h-10 md:w-10 lg:h-12 lg:w-12 flex-shrink-0">
                    <Paperclip className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 h-9 md:h-10 lg:h-12 text-sm md:text-base"
                  />
                  <Button variant="outline" size="sm" className="h-9 w-9 md:h-10 md:w-10 lg:h-12 lg:w-12 flex-shrink-0 hidden sm:flex">
                    <Smile className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()} className="h-9 md:h-10 lg:h-12 px-4 md:px-5 lg:px-6 flex-shrink-0">
                    <Send className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Consultation Info (1/3 width) */}
        <div className="space-y-4 md:space-y-6 order-1 lg:order-2">
          {/* Doctor Profile Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="h-5 w-5 text-primary" />
                Your Doctor
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-3 py-2 border-b">
                  <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {consultationData.doctorName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {consultationData.doctorSpecialty}
                    </p>
                  </div>
                </div>
                
                {consultationData.doctorRating && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Rating</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm">{consultationData.doctorRating}</span>
                      <span className="text-xs text-muted-foreground">({consultationData.doctorReviewCount})</span>
                    </div>
                  </div>
                )}
                
                {consultationData.doctorYearsOfExperience && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Experience</span>
                    </div>
                    <span className="font-semibold text-sm">{consultationData.doctorYearsOfExperience} years</span>
                  </div>
                )}
                
                {consultationData.doctorClinic && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Clinic</span>
                    </div>
                    <span className="font-semibold text-sm text-right line-clamp-1">{consultationData.doctorClinic}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Consultation Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-primary" />
                Consultation Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Consultation ID</span>
                  <span className="font-semibold text-sm">{consultationData.consultationId}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Patient Name</span>
                  <span className="font-semibold text-sm">{consultationData.patientName}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="font-semibold text-sm">Active Session</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Concerns Reference */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Your Health Concerns
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">{consultationData.concerns}</p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Button variant="outline" className="w-full justify-start h-10">
                <FileText className="h-4 w-4 mr-2" />
                Request Prescription
              </Button>
              <Button variant="outline" className="w-full justify-start h-10">
                <Clock className="h-4 w-4 mr-2" />
                Schedule Follow-up
              </Button>
              <Button variant="outline" className="w-full justify-start h-10">
                <User className="h-4 w-4 mr-2" />
                Share Medical History
              </Button>
            </CardContent>
          </Card>

          {/* Consultation Guidelines */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-primary" />
                Consultation Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2 py-2 border-b">
                  <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">Be honest about symptoms</p>
                </div>
                <div className="flex items-start gap-2 py-2 border-b">
                  <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">Share relevant medical history</p>
                </div>
                <div className="flex items-start gap-2 py-2 border-b">
                  <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">Ask questions if unsure</p>
                </div>
                <div className="flex items-start gap-2 py-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">Take notes of instructions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}