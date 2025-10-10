"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { ArrowLeft, Calendar, MapPin, Phone, Mail, Clock, Star, User, Award, GraduationCap, Building, CheckCircle, Video, CalendarDays, Heart, Share2, CircleCheck, Users, Trophy, MapPinIcon } from 'lucide-react';
import { useGetDoctorsQuery } from '@repo/store/services/api';

interface Doctor {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  registrationNumber: string;
  doctorType: string;
  specialties: string[];
  diseases: string[];
  experience: string;
  clinicName: string;
  clinicAddress: string;
  state: string;
  city: string;
  pincode: string;
  profileImage?: string;
  status?: 'Approved' | 'Pending' | 'Rejected';
  createdAt?: string;
  updatedAt?: string;
  qualification?: string;
  registrationYear?: string;
  physicalConsultationStartTime?: string;
  physicalConsultationEndTime?: string;
  faculty?: string;
  assistantName?: string;
  assistantContact?: string;
  doctorAvailability?: string;
  landline?: string;
  workingWithHospital?: boolean;
  videoConsultation?: boolean;
  subscription?: {
    status: string;
  };
}

export default function DoctorDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: doctorsData, isLoading, isError, error: apiError } = useGetDoctorsQuery(undefined);
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
    } else if (isError) {
      let errorMessage = 'Failed to fetch doctor details';
      if (apiError) {
        if ('status' in apiError) {
          const fetchError = apiError as { status: number; data?: any };
          errorMessage = `Error ${fetchError.status}: ${JSON.stringify(fetchError.data || 'Unknown error')}`;
        } else if ('message' in apiError) {
          errorMessage = apiError.message || errorMessage;
        }
      }
      setErrorState(errorMessage);
      setLoading(false);
    } else if (doctorsData) {
      // Find the doctor with the matching ID
      const foundDoctor = doctorsData.find((doc: any) => doc._id === params.id || doc.id === params.id);
      
      if (foundDoctor) {
        const transformedDoctor: Doctor = {
          _id: foundDoctor._id || foundDoctor.id,
          id: foundDoctor.id || foundDoctor._id,
          name: foundDoctor.name || 'Unnamed Doctor',
          email: foundDoctor.email || '',
          phone: foundDoctor.phone || '',
          gender: foundDoctor.gender || '',
          registrationNumber: foundDoctor.registrationNumber || '',
          doctorType: foundDoctor.doctorType || 'General Physician',
          specialties: foundDoctor.specialties || [],
          diseases: foundDoctor.diseases || [],
          experience: foundDoctor.experience || '0',
          clinicName: foundDoctor.clinicName || 'No Clinic Specified',
          clinicAddress: foundDoctor.clinicAddress || '',
          state: foundDoctor.state || '',
          city: foundDoctor.city || '',
          pincode: foundDoctor.pincode || '',
          profileImage: foundDoctor.profileImage || '/placeholder-doctor.jpg',
          status: foundDoctor.status || 'Pending',
          createdAt: foundDoctor.createdAt || '',
          updatedAt: foundDoctor.updatedAt || '',
          qualification: foundDoctor.qualification || '',
          registrationYear: foundDoctor.registrationYear || '',
          physicalConsultationStartTime: foundDoctor.physicalConsultationStartTime || '',
          physicalConsultationEndTime: foundDoctor.physicalConsultationEndTime || '',
          faculty: foundDoctor.faculty || '',
          assistantName: foundDoctor.assistantName || '',
          assistantContact: foundDoctor.assistantContact || '',
          doctorAvailability: foundDoctor.doctorAvailability || '',
          landline: foundDoctor.landline || '',
          workingWithHospital: foundDoctor.workingWithHospital || false,
          videoConsultation: foundDoctor.videoConsultation || false,
          subscription: foundDoctor.subscription || { status: 'Inactive' }
        };
        
        setDoctor(transformedDoctor);
      } else {
        setErrorState('Doctor not found');
      }
      
      setLoading(false);
    }
  }, [doctorsData, isLoading, isError, apiError, params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-muted mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-card p-6 shadow-lg h-96"></div>
              </div>
              <div className="lg:col-span-2">
                <div className="bg-card p-6 shadow-lg h-96"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorState || !doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="text-center bg-card p-8 shadow-xl max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-500">!</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Doctor</h2>
          <p className="text-muted-foreground mb-6">{errorState || 'Doctor not found'}</p>
          <Button onClick={() => router.back()} className="w-full">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with premium styling */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-sm">
        <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,white,transparent_70%)] opacity-15"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40 rounded-t-sm"></div>
        <div className="container mx-auto px-4 relative z-10 pt-4 pb-6 sm:pt-5 sm:pb-8">
          <div className="flex justify-between items-center mb-4 sm:mb-5">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-primary hover:text-primary/80 hover:bg-primary/10 transition-all duration-300 px-3 py-2 sm:px-4 sm:py-2 shadow-sm rounded-sm text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Doctors</span>
              <span className="sm:hidden">Back</span>
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="bg-white/90 backdrop-blur-sm hover:bg-white border border-border shadow-sm rounded-sm w-8 h-8 sm:w-10 sm:h-10"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="bg-white/90 backdrop-blur-sm hover:bg-white border border-border shadow-sm rounded-sm w-8 h-8 sm:w-10 sm:h-10"
              >
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-end max-w-6xl mx-auto">
            {/* Doctor Image with premium styling */}
            <div className="relative group">
              <div className="w-32 h-32 sm:w-40 sm:h-40 overflow-hidden bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center shadow-xl border-4 border-primary/20 backdrop-blur-sm transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 rounded-sm">
                {doctor.profileImage ? (
                  <img 
                    src={doctor.profileImage} 
                    alt={doctor.name} 
                    className="w-full h-full object-cover rounded-sm"
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl font-bold text-primary rounded-sm">
                    {doctor.name.charAt(0)}
                  </span>
                )}
              </div>
              {doctor.subscription?.status === 'Active' && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3.5 sm:py-1.5 shadow-lg flex items-center gap-1 rounded-sm">
                  <CheckCircle className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                  Verified
                </div>
              )}
            </div>
            
            {/* Doctor Info */}
            <div className="text-center md:text-left flex-1 pb-2 sm:pb-3 w-full">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div className="w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mb-1 sm:mb-1.5">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                      {doctor.name}
                    </h1>
                    <div className="flex items-center justify-center gap-2 mt-1 sm:mt-0">
                      <div className="flex items-center gap-1 bg-gradient-to-r from-amber-50 to-amber-100 px-2 py-1 sm:px-2.5 sm:py-1 shadow-sm border border-amber-200 rounded-sm">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 fill-amber-400" />
                        <span className="font-bold text-xs sm:text-sm text-amber-800">4.9</span>
                      </div>
                      <span className="text-slate-600 text-[10px] sm:text-xs">(248 reviews)</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2 sm:mb-2.5">
                    <span className="flex items-center gap-1 px-2.5 py-1 sm:px-2.5 sm:py-1 bg-primary/10 text-primary text-xs sm:text-sm font-medium rounded-sm">
                      <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
                      {doctor.qualification || 'MD'}
                    </span>
                    <span className="text-slate-400 hidden sm:block">•</span>
                    <p className="text-slate-700 text-base sm:text-lg font-medium">{doctor.doctorType}</p>
                  </div>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                    {doctor.specialties.slice(0, 3).map((specialty, index) => (
                      <span 
                        key={index} 
                        className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary text-xs sm:text-sm font-medium backdrop-blur-sm border border-primary/20 shadow-sm rounded-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                    {doctor.specialties.length > 3 && (
                      <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary text-xs sm:text-sm font-medium backdrop-blur-sm border border-primary/20 shadow-sm rounded-sm">
                        +{doctor.specialties.length - 3}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full justify-center sm:justify-end">
                  <div className="flex items-center justify-center sm:justify-start gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 sm:px-3 sm:py-1.5 border border-border shadow-sm rounded-sm w-full sm:w-auto max-w-[200px] sm:max-w-none">
                    <GraduationCap className="h-4 w-4 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    <p className="font-semibold text-sm sm:text-sm text-slate-700 whitespace-nowrap truncate">{doctor.experience}+ years</p>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 sm:px-3 sm:py-1.5 border border-border shadow-sm rounded-sm w-full sm:w-auto max-w-[200px] sm:max-w-none">
                    <Building className="h-4 w-4 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    <p className="font-semibold text-sm sm:text-sm text-slate-700 truncate">{doctor.clinicName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto">
          {/* Left Column - Contact Info and Actions */}
          <div className="lg:col-span-1 space-y-5 sm:space-y-6">
            {/* Action Buttons */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-5 sm:p-6 shadow-lg border border-primary/10 backdrop-blur-sm rounded-sm">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5 text-center text-slate-800">Book Consultation</h2>
              
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <Button className="w-full py-5 sm:py-6 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 sm:gap-3 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl rounded-sm" onClick={() => router.push(`/book-appointment?doctorId=${doctor._id}`)}>
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  Book Appointment
                </Button>
                
                {doctor.videoConsultation && (
                  <Button variant="outline" className="w-full py-5 sm:py-6 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 sm:gap-3 border-2 border-primary/30 hover:bg-primary/5 transition-all duration-300 shadow-sm hover:shadow-md rounded-sm">
                    <Video className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Video Consultation
                  </Button>
                )}
              </div>
              
              <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-600">Next Available</h3>
                  <span className="text-primary font-medium text-xs sm:text-sm">Today</span>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-600">Time</h3>
                  <span className="text-primary font-medium text-xs sm:text-sm">2:30 PM - 3:00 PM</span>
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="bg-white p-5 sm:p-6 shadow-md border border-slate-200 rounded-sm">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5 flex items-center gap-2 text-slate-800">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Contact Information
              </h2>
              
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-start gap-3 sm:gap-4 group hover:bg-slate-50 p-2.5 sm:p-3 transition-all duration-300 rounded-sm">
                  <div className="bg-primary/10 p-2.5 sm:p-3 flex-shrink-0 rounded-sm">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg text-slate-800 mb-1">Phone</h3>
                    <p className="font-medium text-sm sm:text-base text-slate-700">{doctor.phone}</p>
                    {doctor.landline && (
                      <p className="text-slate-500 text-xs sm:text-sm mt-1">{doctor.landline}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3 sm:gap-4 group hover:bg-slate-50 p-2.5 sm:p-3 transition-all duration-300 rounded-sm">
                  <div className="bg-primary/10 p-2.5 sm:p-3 flex-shrink-0 rounded-sm">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg text-slate-800 mb-1">Email</h3>
                    <p className="font-medium text-sm sm:text-base text-slate-700 break-all">{doctor.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 sm:gap-4 group hover:bg-slate-50 p-2.5 sm:p-3 transition-all duration-300 rounded-sm">
                  <div className="bg-primary/10 p-2.5 sm:p-3 flex-shrink-0 rounded-sm">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg text-slate-800 mb-1">Clinic</h3>
                    <p className="font-medium text-sm sm:text-base text-slate-700">{doctor.clinicName}</p>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">{doctor.clinicAddress}</p>
                    <p className="text-slate-500 text-xs sm:text-sm">{doctor.city}, {doctor.state} - {doctor.pincode}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 sm:gap-4 group hover:bg-slate-50 p-2.5 sm:p-3 transition-all duration-300 rounded-sm">
                  <div className="bg-primary/10 p-2.5 sm:p-3 flex-shrink-0 rounded-sm">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg text-slate-800 mb-1">Availability</h3>
                    <p className="font-medium text-sm sm:text-base text-slate-700 capitalize">{doctor.doctorAvailability || 'Not specified'}</p>
                    {doctor.physicalConsultationStartTime && doctor.physicalConsultationEndTime && (
                      <p className="text-slate-500 text-xs sm:text-sm mt-1">
                        {doctor.physicalConsultationStartTime} - {doctor.physicalConsultationEndTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Assistant Info */}
            {doctor.assistantName && (
              <div className="bg-white p-5 sm:p-6 shadow-md border border-slate-200 rounded-sm">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5 flex items-center gap-2 text-slate-800">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Assistant
                </h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-primary/10 p-2.5 sm:p-3 rounded-sm">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg text-slate-800 mb-1">{doctor.assistantName}</h3>
                      <p className="text-slate-600 text-sm sm:text-base">{doctor.assistantContact}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            {/* Professional Details */}
            <div className="bg-white p-5 sm:p-6 shadow-md border border-slate-200 rounded-sm">
              <h2 className="text-lg sm:text-xl font-bold mb-5 sm:mb-6 flex items-center gap-2 text-slate-800">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Professional Details
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="bg-slate-50 p-4 sm:p-5 border border-slate-200 hover:bg-slate-100 transition-all duration-300 rounded-sm">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary text-base sm:text-lg">
                    <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
                    Qualification
                  </h3>
                  <p className="font-medium text-sm sm:text-base text-slate-700">{doctor.qualification || 'Not specified'}</p>
                </div>
                
                <div className="bg-slate-50 p-4 sm:p-5 border border-slate-200 hover:bg-slate-100 transition-all duration-300 rounded-sm">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary text-base sm:text-lg">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    Registration Number
                  </h3>
                  <p className="font-medium text-sm sm:text-base text-slate-700">{doctor.registrationNumber || 'Not specified'}</p>
                </div>
                
                <div className="bg-slate-50 p-4 sm:p-5 border border-slate-200 hover:bg-slate-100 transition-all duration-300 rounded-sm">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary text-base sm:text-lg">
                    <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                    Experience
                  </h3>
                  <p className="font-medium text-sm sm:text-base text-slate-700">{doctor.experience}+ years</p>
                </div>
                
                <div className="bg-slate-50 p-4 sm:p-5 border border-slate-200 hover:bg-slate-100 transition-all duration-300 rounded-sm">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary text-base sm:text-lg">
                    <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                    Video Consultation
                  </h3>
                  <p className="font-medium text-sm sm:text-base text-slate-700">
                    {doctor.videoConsultation ? (
                      <span className="text-green-600 flex items-center gap-1 sm:gap-1.5">
                        <CircleCheck className="h-4 w-4 sm:h-5 sm:w-5 fill-green-600 text-white" />
                        Available
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1 sm:gap-1.5">
                        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-sm"></span>
                        Not available
                      </span>
                    )}
                  </p>
                </div>
                
                <div className="sm:col-span-2 bg-slate-50 p-4 sm:p-5 border border-slate-200 hover:bg-slate-100 transition-all duration-300 rounded-sm">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary text-base sm:text-lg">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                    Specialties
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {doctor.specialties.length > 0 ? (
                      doctor.specialties.map((specialty, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary text-sm font-medium shadow-sm rounded-sm"
                        >
                          {specialty}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-600 text-sm">Not specified</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-2 bg-slate-50 p-4 sm:p-5 border border-slate-200 hover:bg-slate-100 transition-all duration-300 rounded-sm">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary text-base sm:text-lg">
                    <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                    Diseases Treated
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {doctor.diseases.length > 0 ? (
                      doctor.diseases.map((disease, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-slate-200 text-sm shadow-sm text-slate-700 rounded-sm"
                        >
                          {disease}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-600 text-sm">Not specified</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Clinic Details */}
            <div className="bg-white p-5 sm:p-6 shadow-md border border-slate-200 rounded-sm">
              <h2 className="text-lg sm:text-xl font-bold mb-5 sm:mb-6 flex items-center gap-2 text-slate-800">
                <Building className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Clinic Details
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="bg-slate-50 p-4 sm:p-5 border border-slate-200 hover:bg-slate-100 transition-all duration-300 rounded-sm">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary text-base sm:text-lg">
                    <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                    Clinic Name
                  </h3>
                  <p className="font-medium text-sm sm:text-base text-slate-700">{doctor.clinicName}</p>
                </div>
                
                <div className="bg-slate-50 p-4 sm:p-5 border border-slate-200 hover:bg-slate-100 transition-all duration-300 rounded-sm">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary text-base sm:text-lg">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    Hospital Affiliation
                  </h3>
                  <p className="font-medium text-sm sm:text-base text-slate-700">
                    {doctor.workingWithHospital ? (
                      <span className="text-green-600 flex items-center gap-1 sm:gap-1.5">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        Affiliated
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1 sm:gap-1.5">
                        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-sm"></span>
                        Not affiliated
                      </span>
                    )}
                  </p>
                </div>
                
                <div className="sm:col-span-2 bg-slate-50 p-4 sm:p-5 border border-slate-200 hover:bg-slate-100 transition-all duration-300 rounded-sm">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary text-base sm:text-lg">
                    <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    Clinic Address
                  </h3>
                  <p className="font-medium text-sm sm:text-base text-slate-700">{doctor.clinicAddress}</p>
                  <p className="text-slate-600 text-sm sm:text-base mt-2">{doctor.city}, {doctor.state} - {doctor.pincode}</p>
                </div>
              </div>
            </div>
            
            {/* Additional Info */}
          </div>
        </div>
      </div>
    </div>
  );
}