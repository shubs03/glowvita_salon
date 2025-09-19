
"use client";

import { Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Textarea } from '@repo/ui/textarea';
import { Label } from '@repo/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { PageContainer } from '@repo/ui/page-container';

export default function ContactPage() {
  return (
    <PageContainer padding="none">
      {/* Section 1: Hero */}
      <section className="py-20 md:py-32 bg-secondary/50 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">Get in Touch</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            We'd love to hear from you. Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
          </p>
        </div>
      </section>

      {/* Section 2: Contact Info */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4">
                  <Mail className="h-8 w-8" />
                </div>
                <CardTitle>Email Us</CardTitle>
                <CardDescription>Our team will get back to you within 24 hours.</CardDescription>
              </CardHeader>
              <CardContent>
                <a href="mailto:support@glowvita.com" className="font-semibold text-primary">support@glowvita.com</a>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4">
                  <Phone className="h-8 w-8" />
                </div>
                <CardTitle>Call Us</CardTitle>
                <CardDescription>Mon-Fri from 9am to 5pm.</CardDescription>
              </CardHeader>
              <CardContent>
                <a href="tel:+1234567890" className="font-semibold text-primary">+1 (234) 567-890</a>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4">
                  <MapPin className="h-8 w-8" />
                </div>
                <CardTitle>Visit Us</CardTitle>
                <CardDescription>Our headquarters are open for visitors.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">123 Beauty Lane, Suite 100, Glamour City, 54321</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 3: Contact Form */}
      <section className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">Send us a Message</CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john.doe@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Question about pricing" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Your message here..." rows={5} />
                  </div>
                  <Button type="submit" className="w-full" size="lg">Send Message</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 4: Map */}
      <section className="h-[400px] md:h-[500px]">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.219356972828!2d-73.9855018845941!3d40.7484409793284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2596f5c5a0b5b%3A0x4f4b9f3d5d7d9b93!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1626280053924!5m2!1sen!2sus"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          title="Office Location"
        ></iframe>
      </section>

      {/* Section 5: FAQ */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>What are your support hours?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Our team is available from 9am to 5pm, Monday to Friday.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>How long does it take to get a response?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We typically respond to emails within 24 hours.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* 5 more sections */}
      <section></section><section></section><section></section><section></section><section></section>
    </PageContainer>
  );
}
