"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  User,
  Award,
  GraduationCap,
  Building,
  CheckCircle,
  Video,
  CalendarDays,
  Heart,
  Share2,
  CircleCheck,
  Users,
  Trophy,
  MapPinIcon,
  Briefcase,
  Globe,
  BookIcon,
  BookOpenIcon,
} from "lucide-react";
import { useGetDoctorsQuery } from "@repo/store/services/api";
import { cn } from "@repo/ui/cn";

interface Doctor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  registrationNumber?: string;
  specialty: string;
  subSpecialty?: string;
  specialties?: string[];
  diseases?: string[];
  experience: number;
  location: {
    clinic: string;
    address: string;
    distance: string;
  };
  clinicName?: string;
  clinicAddress?: string;
  state?: string;
  city?: string;
  pincode?: string;
  profileImage?: string;
  image?: string;
  status?: "Approved" | "Pending" | "Rejected";
  education?: string[];
  qualification?: string;
  languages?: string[];
  rating: number;
  totalReviews: number;
  consultationFee: number;
  availableToday: boolean;
  nextAvailable: string;
  isVerified: boolean;
  hasVideoConsult: boolean;
  hasHomeVisit: boolean;
  physicalConsultationStartTime?: string;
  physicalConsultationEndTime?: string;
  faculty?: string;
  assistantName?: string;
  assistantContact?: string;
  doctorAvailability?: string;
  landline?: string;
  workingWithHospital?: boolean;
  videoConsultation?: boolean;
}

// Transform API doctor data to component format
const transformDoctor = (apiDoctor: any): Doctor => {
  return {
    id: apiDoctor._id || apiDoctor.id,
    name: apiDoctor.name || "Unknown Doctor",
    email: apiDoctor.email,
    phone: apiDoctor.phone,
    gender: apiDoctor.gender,
    registrationNumber: apiDoctor.registrationNumber,
    specialty:
      apiDoctor.doctorType ||
      (apiDoctor.specialties && apiDoctor.specialties[0]) ||
      "General Medicine",
    subSpecialty: apiDoctor.subSpecialty,
    specialties: apiDoctor.specialties || [],
    diseases: apiDoctor.diseases || [],
    experience:
      typeof apiDoctor.experience === "string"
        ? parseInt(apiDoctor.experience) || 0
        : apiDoctor.experience || 0,
    location: {
      clinic: apiDoctor.clinicName || "Clinic",
      address:
        apiDoctor.clinicAddress ||
        `${apiDoctor.city || ""}, ${apiDoctor.state || ""}`.trim() ||
        "Address not available",
      distance: "0 km",
    },
    clinicName: apiDoctor.clinicName,
    clinicAddress: apiDoctor.clinicAddress,
    state: apiDoctor.state,
    city: apiDoctor.city,
    pincode: apiDoctor.pincode,
    profileImage: apiDoctor.profileImage,
    image: apiDoctor.profileImage,
    status: apiDoctor.status as "Approved" | "Pending" | "Rejected",
    education: apiDoctor.qualification ? [apiDoctor.qualification] : [],
    qualification: apiDoctor.qualification,
    languages: apiDoctor.languages || ["English"],
    rating: apiDoctor.rating || 4.5,
    totalReviews: apiDoctor.totalReviews || 0,
    consultationFee: apiDoctor.consultationFee || 100,
    availableToday: apiDoctor.status === "Approved",
    nextAvailable:
      apiDoctor.status === "Approved" ? "Today 2:30 PM" : "Not Available",
    isVerified: apiDoctor.status === "Approved",
    hasVideoConsult: apiDoctor.videoConsultation || false,
    hasHomeVisit: apiDoctor.hasHomeVisit || false,
    physicalConsultationStartTime: apiDoctor.physicalConsultationStartTime,
    physicalConsultationEndTime: apiDoctor.physicalConsultationEndTime,
    faculty: apiDoctor.faculty,
    assistantName: apiDoctor.assistantName,
    assistantContact: apiDoctor.assistantContact,
    doctorAvailability: apiDoctor.doctorAvailability,
    landline: apiDoctor.landline,
    workingWithHospital: apiDoctor.workingWithHospital,
    videoConsultation: apiDoctor.videoConsultation,
  };
};

export default function DoctorDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  // Fetch doctors from API
  const {
    data: doctorsData,
    isLoading: isLoadingApi,
    isError,
  } = useGetDoctorsQuery(undefined);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (isLoadingApi) {
      setLoading(true);
      return;
    }

    if (isError) {
      setErrorState("Failed to load doctor data");
      setLoading(false);
      return;
    }

    if (doctorsData) {
      // Find the doctor with the matching ID from API data
      const foundDoctor = doctorsData.find(
        (doc: any) => doc._id === params.id || doc.id === params.id
      );

      if (foundDoctor) {
        setDoctor(transformDoctor(foundDoctor));
        setErrorState(null);
      } else {
        setErrorState("Doctor not found");
      }

      setLoading(false);
    }
  }, [params.id, doctorsData, isLoadingApi, isError]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-lg mb-6"></div>
            <Card>
              <CardContent className="p-6">
                <div className="h-64 bg-muted rounded-lg"></div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardContent className="p-6">
                  <div className="h-96 bg-muted rounded-lg"></div>
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardContent className="p-6">
                  <div className="h-96 bg-muted rounded-lg"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorState || !doctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-destructive">!</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Error Loading Doctor</h2>
            <p className="text-muted-foreground mb-6">
              {errorState || "Doctor not found"}
            </p>
            <Button onClick={() => router.back()} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Doctors
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart
                  className={cn(
                    "h-4 w-4",
                    isFavorite ? "fill-red-500 text-red-500" : ""
                  )}
                />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Doctor Details
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                View complete profile and book consultation
              </p>
            </div>
          </div>
        </div>

        {/* Doctor Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Doctor Image */}
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center shadow-md border-2 border-primary/20">
                  {doctor.profileImage ? (
                    <img
                      src={doctor.profileImage}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-primary">
                      {doctor.name.charAt(0)}
                    </span>
                  )}
                </div>
                {doctor.isVerified && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </div>
                )}
              </div>

              {/* Doctor Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {doctor.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary/10 text-secondary-foreground text-xs font-semibold rounded-full border-2 border-secondary">
                        <GraduationCap className="h-4 w-4 text-xs font-semibold" />
                        {doctor.qualification || "MD"}
                      </span>
                      <span className="text-muted-foreground text-base font-semibold">
                        •
                      </span>
                      <p className="text-xs font-semibold text-foreground">
                        {doctor.specialty}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-2 bg-blue-50 px-2.5 py-1 bg-secondary/10 text-secondary-foreground text-xs font-semibold rounded-full border-2 border-secondary">
                      <Star className="h-3 w-3 text-blue-500 fill-blue-400" />
                      <span className="font-semibold text-sm text-blue-800">
                        4.9
                      </span>
                      <span className="text-muted-foreground text-xs">
                        (248 reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {doctor.specialties &&
                    doctor.specialties.slice(0, 3).map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-secondary/10 text-secondary-foreground text-xs font-semibold rounded-full border-2 border-secondary"
                      >
                        {specialty}
                      </span>
                    ))}
                  {doctor.specialties && doctor.specialties.length > 3 && (
                    <span className="px-2.5 py-1 bg-secondary/10 text-secondary-foreground text-xs font-medium rounded-md border border-secondary/20">
                      +{doctor.specialties.length - 3} more
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground">
                      {doctor.experience}+ years
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                    <Building className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground truncate">
                      {doctor.clinicName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground truncate">
                      {doctor.city}, {doctor.state}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto">
          {/* Left Column - Contact Info and Actions */}
          <div className="lg:col-span-1 space-y-5 sm:space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpenIcon className="h-5 w-5 text-primary" />
                  Book Consultation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full py-3 text-sm font-semibold gap-2"
                  onClick={() => {
                    // Encode doctor data as base64 JSON
                    console.log('🏥 Doctor object:', doctor);
                    console.log('🆔 Doctor ID:', doctor.id);
                    
                    const doctorData = {
                      id: doctor.id,
                      name: doctor.name,
                      specialty: doctor.specialty,
                      fee: doctor.consultationFee,
                      image: doctor.profileImage || '',
                      rating: doctor.rating,
                      reviews: doctor.totalReviews,
                      clinic: doctor.clinicName || '',
                      address: doctor.clinicAddress || ''
                    };
                    
                    console.log('📦 Doctor data to encode:', doctorData);
                    const encoded = btoa(JSON.stringify(doctorData));
                    console.log('🔐 Encoded data:', encoded);
                    console.log('🔗 Navigation URL:', `/doctors/physical-consultation?data=${encoded}`);
                    
                    router.push(`/doctors/physical-consultation?data=${encoded}`);
                  }}
                >
                  <Calendar className="h-4 w-4" />
                  Book Appointment
                </Button>

                {doctor.videoConsultation && (
                  <Button
                    variant="outline"
                    className="w-full py-3 text-sm font-semibold gap-2 border-2"
                    onClick={() =>
                      router.push(`/doctors/${doctor.id}/video-consultation`)
                    }
                  >
                    <Video className="h-4 w-4" />
                    Video Consultation
                  </Button>
                )}

                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Next Available
                    </span>
                    <span className="text-sm font-medium text-primary">
                      Today
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Time</span>
                    <span className="text-sm font-medium text-primary">
                      2:30 PM - 3:00 PM
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="bg-primary/10 p-2.5 rounded-lg flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      Phone
                    </h3>
                    <p className="text-sm text-foreground">{doctor.phone}</p>
                    {doctor.landline && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {doctor.landline}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="bg-primary/10 p-2.5 rounded-lg flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      Email
                    </h3>
                    <p className="text-sm text-foreground break-all">
                      {doctor.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="bg-primary/10 p-2.5 rounded-lg flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      Clinic
                    </h3>
                    <p className="text-sm text-foreground">
                      {doctor.clinicName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {doctor.clinicAddress}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doctor.city}, {doctor.state} - {doctor.pincode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="bg-primary/10 p-2.5 rounded-lg flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      Availability
                    </h3>
                    <p className="text-sm text-foreground capitalize">
                      {doctor.doctorAvailability || "Not specified"}
                    </p>
                    {doctor.physicalConsultationStartTime &&
                      doctor.physicalConsultationEndTime && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {doctor.physicalConsultationStartTime} -{" "}
                          {doctor.physicalConsultationEndTime}
                        </p>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assistant Info */}
            {doctor.assistantName && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="bg-primary/10 p-2.5 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        {doctor.assistantName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {doctor.assistantContact}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            {/* Professional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Professional Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg hover:bg-muted transition-colors">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-primary">
                      <GraduationCap className="h-4 w-4" />
                      Qualification
                    </h3>
                    <p className="text-sm font-semibold">
                      {doctor.qualification || "Not specified"}
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg hover:bg-muted transition-colors">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-primary">
                      <CheckCircle className="h-4 w-4" />
                      Registration Number
                    </h3>
                    <p className="text-sm font-semibold">
                      {doctor.registrationNumber || "Not specified"}
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg hover:bg-muted transition-colors">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-primary">
                      <CalendarDays className="h-4 w-4" />
                      Experience
                    </h3>
                    <p className="text-sm font-semibold">
                      {doctor.experience}+ years
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg hover:bg-muted transition-colors">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-primary">
                      <Video className="h-4 w-4" />
                      Video Consultation
                    </h3>
                    <p className="text-sm font-semibold">
                      {doctor.videoConsultation ? (
                        <span className="text-blue-500 flex items-center gap-1.5">
                          <CircleCheck className="h-4 w-4 fill-blue-500 text-white" />
                          Available
                        </span>
                      ) : (
                        <span className="text-destructive flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-destructive rounded-full"></span>
                          Not available
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="sm:col-span-2 bg-muted/50 p-4 rounded-lg hover:bg-muted transition-colors">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
                      <Star className="h-4 w-4" />
                      Specialties
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {doctor.specialties && doctor.specialties.length > 0 ? (
                        doctor.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 bg-secondary/10 text-secondary-foreground text-sm font-semibold rounded-full border-2 border-secondary"
                          >
                            {specialty}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Not specified
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2 bg-muted/50 p-4 rounded-lg hover:bg-muted transition-colors">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
                      <Briefcase className="h-4 w-4" />
                      Diseases Treated
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {doctor.diseases && doctor.diseases.length > 0 ? (
                        doctor.diseases.map((disease, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 bg-secondary/10 text-secondary-foreground font-semibold text-sm border border-secondary/20 rounded-md"
                          >
                            {disease}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Not specified
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clinic Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Clinic Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg hover:bg-muted transition-colors">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-primary">
                      <Building className="h-4 w-4" />
                      Clinic Name
                    </h3>
                    <p className="text-sm text-foreground">
                      {doctor.clinicName}
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg hover:bg-muted transition-colors">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-primary">
                      <Users className="h-4 w-4" />
                      Hospital Affiliation
                    </h3>
                    <p className="text-sm font-semibold">
                      {doctor.workingWithHospital ? (
                        <span className="text-blue-500 flex items-center gap-1.5">
                          <CircleCheck className="h-4 w-4 fill-blue-500 text-white" />
                          Affiliated
                        </span>
                      ) : (
                        <span className="text-destructive flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-destructive rounded-full"></span>
                          Not affiliated
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="sm:col-span-2 bg-muted/50 p-4 rounded-lg hover:bg-muted transition-colors">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-primary">
                      <MapPinIcon className="h-4 w-4" />
                      Clinic Address
                    </h3>
                    <p className="text-sm text-foreground">
                      {doctor.clinicAddress}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {doctor.city}, {doctor.state} - {doctor.pincode}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
