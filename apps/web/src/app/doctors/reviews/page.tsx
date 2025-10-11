"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { Textarea } from '@repo/ui/textarea';
import { Label } from '@repo/ui/label';
import { Star, Search, Filter, ThumbsUp, MessageCircle, User, Calendar, Award, TrendingUp } from 'lucide-react';
import { cn } from '@repo/ui/cn';

interface Review {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
  appointmentType: 'In-person' | 'Video Call';
  condition: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

const sampleReviews: Review[] = [
  {
    id: "REV-001",
    doctorId: "DR-001",
    doctorName: "Dr. Sarah Johnson",
    specialty: "Dermatology",
    patientName: "John D.",
    rating: 5,
    comment: "Excellent doctor! Very knowledgeable and took time to explain my skin condition. The treatment plan worked perfectly and my acne has significantly improved.",
    date: "2024-02-15",
    verified: true,
    helpful: 12,
    appointmentType: "In-person",
    condition: "Acne Treatment"
  },
  {
    id: "REV-002",
    doctorId: "DR-002",
    doctorName: "Dr. Michael Chen",
    specialty: "General Medicine",
    patientName: "Maria S.",
    rating: 4,
    comment: "Very professional and caring doctor. Quick diagnosis and effective treatment. Only minor wait time in the office.",
    date: "2024-02-10",
    verified: true,
    helpful: 8,
    appointmentType: "In-person",
    condition: "Annual Checkup"
  },
  {
    id: "REV-003",
    doctorId: "DR-001",
    doctorName: "Dr. Sarah Johnson",
    specialty: "Dermatology",
    patientName: "Alice W.",
    rating: 5,
    comment: "Amazing experience with video consultation. Dr. Johnson was able to diagnose my skin issue accurately and prescribed the right medication. Highly recommend!",
    date: "2024-02-08",
    verified: true,
    helpful: 15,
    appointmentType: "Video Call",
    condition: "Eczema"
  },
  {
    id: "REV-004",
    doctorId: "DR-003",
    doctorName: "Dr. Emily Rodriguez",
    specialty: "Cardiology",
    patientName: "Robert K.",
    rating: 5,
    comment: "Outstanding cardiologist! Thorough examination, clear explanation of my heart condition, and excellent follow-up care. Couldn't ask for better treatment.",
    date: "2024-02-05",
    verified: true,
    helpful: 20,
    appointmentType: "In-person",
    condition: "Heart Palpitations"
  },
  {
    id: "REV-005",
    doctorId: "DR-002",
    doctorName: "Dr. Michael Chen",
    specialty: "General Medicine",
    patientName: "Jennifer L.",
    rating: 4,
    comment: "Good doctor with a friendly approach. Helped me manage my diabetes effectively with a comprehensive treatment plan.",
    date: "2024-01-28",
    verified: true,
    helpful: 6,
    appointmentType: "In-person",
    condition: "Diabetes Management"
  }
];

const sampleDoctors: Doctor[] = [
  {
    id: "DR-001",
    name: "Dr. Sarah Johnson",
    specialty: "Dermatology",
    averageRating: 4.9,
    totalReviews: 156,
    ratingDistribution: { 5: 120, 4: 25, 3: 8, 2: 2, 1: 1 }
  },
  {
    id: "DR-002",
    name: "Dr. Michael Chen",
    specialty: "General Medicine",
    averageRating: 4.7,
    totalReviews: 234,
    ratingDistribution: { 5: 180, 4: 35, 3: 15, 2: 3, 1: 1 }
  },
  {
    id: "DR-003",
    name: "Dr. Emily Rodriguez",
    specialty: "Cardiology",
    averageRating: 4.8,
    totalReviews: 98,
    ratingDistribution: { 5: 75, 4: 18, 3: 4, 2: 1, 1: 0 }
  }
];

export default function DoctorReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(sampleReviews);
  const [doctors, setDoctors] = useState<Doctor[]>(sampleDoctors);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newReview, setNewReview] = useState({
    doctorId: '',
    rating: 5,
    comment: '',
    condition: '',
    appointmentType: 'In-person' as 'In-person' | 'Video Call'
  });

  const filteredReviews = useMemo(() => {
    let filtered = reviews.filter(review => {
      const matchesSearch = review.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          review.condition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDoctor = selectedDoctor === 'all' || review.doctorId === selectedDoctor;
      const matchesRating = selectedRating === 'all' || review.rating.toString() === selectedRating;
      
      return matchesSearch && matchesDoctor && matchesRating;
    });

    // Sort reviews
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'highest-rated') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'most-helpful') {
      filtered.sort((a, b) => b.helpful - a.helpful);
    }

    return filtered;
  }, [reviews, searchTerm, selectedDoctor, selectedRating, sortBy]);

  const handleWriteReview = () => {
    if (newReview.doctorId && newReview.comment) {
      const doctor = doctors.find(d => d.id === newReview.doctorId);
      if (doctor) {
        const review: Review = {
          id: `REV-${Date.now()}`,
          doctorId: newReview.doctorId,
          doctorName: doctor.name,
          specialty: doctor.specialty,
          patientName: "You",
          rating: newReview.rating,
          comment: newReview.comment,
          date: new Date().toISOString().split('T')[0],
          verified: true,
          helpful: 0,
          appointmentType: newReview.appointmentType,
          condition: newReview.condition
        };
        
        setReviews([review, ...reviews]);
        setShowWriteReview(false);
        setNewReview({
          doctorId: '',
          rating: 5,
          comment: '',
          condition: '',
          appointmentType: 'In-person'
        });
      }
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClass,
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Reviews</h1>
            <p className="text-gray-600 mt-2">Read patient experiences and share your own</p>
          </div>
          <Button onClick={() => setShowWriteReview(true)}>
            Write Review
          </Button>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reviews.length}</p>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reviews.filter(r => r.verified).length}</p>
                  <p className="text-sm text-gray-600">Verified Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{doctors.length}</p>
                  <p className="text-sm text-gray-600">Reviewed Doctors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search reviews by doctor, condition, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {doctors.map(doctor => (
                  <SelectItem key={doctor.id} value={doctor.id}>{doctor.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedRating} onValueChange={setSelectedRating}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="highest-rated">Highest Rated</SelectItem>
                <SelectItem value="most-helpful">Most Helpful</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Doctor Ratings Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Top Rated Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold">{doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {renderStars(doctor.averageRating, 'md')}
                      <span className="font-semibold">{doctor.averageRating}</span>
                      <span className="text-sm text-gray-600">({doctor.totalReviews} reviews)</span>
                    </div>

                    <div className="space-y-1">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-2 text-sm">
                          <span className="w-8">{rating}★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${(doctor.ratingDistribution[rating as keyof typeof doctor.ratingDistribution] / doctor.totalReviews) * 100}%` }}
                            />
                          </div>
                          <span className="w-8 text-gray-600">{doctor.ratingDistribution[rating as keyof typeof doctor.ratingDistribution]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Reviews</CardTitle>
          <CardDescription>
            {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{review.doctorName}</h3>
                          <Badge variant="outline">{review.specialty}</Badge>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600">
                            by {review.patientName} • {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>{review.appointmentType}</p>
                        <p>{review.condition}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700">{review.comment}</p>
                    
                    <div className="flex items-center gap-4 pt-2">
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful ({review.helpful})
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredReviews.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No reviews found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Write Review Dialog */}
      <Dialog open={showWriteReview} onOpenChange={setShowWriteReview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with a doctor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor</Label>
              <Select value={newReview.doctorId} onValueChange={(value) => setNewReview({ ...newReview, doctorId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id}>{doctor.name} - {doctor.specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="sm"
                    className="p-1"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                  >
                    <Star
                      className={cn(
                        "h-6 w-6",
                        star <= newReview.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition Treated</Label>
              <Input
                id="condition"
                value={newReview.condition}
                onChange={(e) => setNewReview({ ...newReview, condition: e.target.value })}
                placeholder="e.g., Acne treatment, Annual checkup..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Appointment Type</Label>
              <Select value={newReview.appointmentType} onValueChange={(value: 'In-person' | 'Video Call') => setNewReview({ ...newReview, appointmentType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In-person">In-person</SelectItem>
                  <SelectItem value="Video Call">Video Call</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Your Review</Label>
              <Textarea
                id="comment"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Share your experience with this doctor..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWriteReview(false)}>
              Cancel
            </Button>
            <Button onClick={handleWriteReview}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}