"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Video, Clock, Calendar, User, Star, Phone, MessageSquare, Search, Filter } from 'lucide-react';
import { cn } from '@repo/ui/cn';

interface Consultation {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  type: 'Video Call' | 'Phone Call' | 'Chat';
  date: string;
  time: string;
  duration: number; // in minutes
  status: 'Scheduled' | 'Completed' | 'In Progress' | 'Cancelled';
  fee: number;
  notes?: string;
  rating?: number;
  followUpRequired?: boolean;
}

const sampleConsultations: Consultation[] = [
  {
    id: "CONS-001",
    doctorId: "DR-001",
    doctorName: "Dr. Sarah Johnson",
    specialty: "Dermatology",
    type: "Video Call",
    date: "2024-03-20",
    time: "10:00 AM",
    duration: 30,
    status: "Scheduled",
    fee: 150,
    notes: "Skin consultation for acne treatment",
    followUpRequired: true
  },
  {
    id: "CONS-002",
    doctorId: "DR-002",
    doctorName: "Dr. Michael Chen",
    specialty: "General Medicine",
    type: "Video Call",
    date: "2024-03-15",
    time: "02:30 PM",
    duration: 20,
    status: "Completed",
    fee: 120,
    notes: "Follow-up for hypertension management",
    rating: 5,
    followUpRequired: false
  },
  {
    id: "CONS-003",
    doctorId: "DR-003",
    doctorName: "Dr. Emily Rodriguez",
    specialty: "Cardiology",
    type: "Phone Call",
    date: "2024-03-18",
    time: "04:00 PM",
    duration: 25,
    status: "Completed",
    fee: 200,
    notes: "Heart palpitation concerns",
    rating: 4,
    followUpRequired: true
  },
  {
    id: "CONS-004",
    doctorId: "DR-001",
    doctorName: "Dr. Sarah Johnson",
    specialty: "Dermatology",
    type: "Chat",
    date: "2024-03-16",
    time: "11:00 AM",
    duration: 15,
    status: "Completed",
    fee: 80,
    notes: "Quick prescription renewal",
    rating: 5,
    followUpRequired: false
  }
];

export default function DoctorConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>(sampleConsultations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredConsultations = useMemo(() => {
    let filtered = consultations.filter(consultation => {
      const matchesSearch = consultation.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          consultation.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (consultation.notes && consultation.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
      const matchesType = typeFilter === 'all' || consultation.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort consultations
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime());
    }

    return filtered;
  }, [consultations, searchTerm, statusFilter, typeFilter, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Video Call':
        return <Video className="h-4 w-4" />;
      case 'Phone Call':
        return <Phone className="h-4 w-4" />;
      case 'Chat':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  const upcomingConsultations = consultations.filter(c => c.status === 'Scheduled').length;
  const completedConsultations = consultations.filter(c => c.status === 'Completed').length;
  const totalSpent = consultations.filter(c => c.status === 'Completed').reduce((sum, c) => sum + c.fee, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Consultations</h1>
          <p className="text-gray-600 mt-2">Manage your virtual and phone consultations with doctors</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingConsultations}</p>
                  <p className="text-sm text-gray-600">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Video className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedConsultations}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {consultations.reduce((sum, c) => sum + c.duration, 0)} min
                  </p>
                  <p className="text-sm text-gray-600">Total Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${totalSpent}</p>
                  <p className="text-sm text-gray-600">Total Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search consultations by doctor, specialty, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Video Call">Video Call</SelectItem>
                <SelectItem value="Phone Call">Phone Call</SelectItem>
                <SelectItem value="Chat">Chat</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col items-center gap-2">
              <Video className="h-6 w-6" />
              <span>Book Video Consultation</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
              <Phone className="h-6 w-6" />
              <span>Schedule Phone Call</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              <span>Start Chat Consultation</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Consultations List */}
      <Card>
        <CardHeader>
          <CardTitle>Consultation History</CardTitle>
          <CardDescription>
            {filteredConsultations.length} consultation{filteredConsultations.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredConsultations.map((consultation) => (
              <Card key={consultation.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{consultation.doctorName}</h3>
                          <Badge variant="outline">{consultation.specialty}</Badge>
                          <Badge className={getStatusColor(consultation.status)}>
                            {consultation.status}
                          </Badge>
                          {consultation.followUpRequired && (
                            <Badge variant="secondary">Follow-up Required</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(consultation.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {consultation.time} ({consultation.duration} min)
                          </span>
                          <span className="flex items-center gap-1">
                            {getTypeIcon(consultation.type)}
                            {consultation.type}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${consultation.fee}</p>
                        {consultation.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            {renderStars(consultation.rating)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {consultation.notes && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {consultation.notes}
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      {consultation.status === 'Scheduled' && (
                        <>
                          <Button size="sm" className="flex items-center gap-1">
                            {getTypeIcon(consultation.type)}
                            Join Consultation
                          </Button>
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                          <Button variant="outline" size="sm">
                            Cancel
                          </Button>
                        </>
                      )}
                      {consultation.status === 'Completed' && !consultation.rating && (
                        <Button variant="outline" size="sm">
                          Rate Consultation
                        </Button>
                      )}
                      {consultation.followUpRequired && consultation.status === 'Completed' && (
                        <Button size="sm">
                          Book Follow-up
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredConsultations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Video className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No consultations found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Consultation Types Info */}
      <Card>
        <CardHeader>
          <CardTitle>Consultation Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Video className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold">Video Call</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">Face-to-face consultation via video call</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Visual examination possible</li>
                <li>• Screen sharing for results</li>
                <li>• Most comprehensive remote option</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold">Phone Call</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">Voice consultation via phone call</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Quick and convenient</li>
                <li>• Good for follow-ups</li>
                <li>• No internet required</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="h-6 w-6 text-purple-600" />
                <h3 className="font-semibold">Chat</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">Text-based consultation via chat</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Asynchronous communication</li>
                <li>• Perfect for simple queries</li>
                <li>• Most affordable option</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}