import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Send } from 'lucide-react';
import { enquiries, type Enquiry } from '@/data/enquiryData';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    gymName: '',
    city: '',
    membersCount: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEnquiry: Enquiry = {
      id: String(enquiries.length + 1),
      ...form,
      date: new Date().toISOString().split('T')[0],
      status: 'new',
    };
    enquiries.push(newEnquiry);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-foreground">Enquiry Sent!</h2>
          <p className="mt-2 text-muted-foreground">We'll get back to you within 24 hours.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="py-20">
      <div className="mx-auto max-w-2xl px-4 lg:px-8">
        <Card className="card-shadow border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Get In Touch</CardTitle>
            <CardDescription>Fill in your details and we'll reach out to you.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gymName">Gym Name</Label>
                  <Input id="gymName" required value={form.gymName} onChange={e => setForm(f => ({ ...f, gymName: e.target.value }))} placeholder="Your gym name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Number of Members</Label>
                <Select value={form.membersCount} onValueChange={v => setForm(f => ({ ...f, membersCount: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-20">1 – 20</SelectItem>
                    <SelectItem value="20-50">20 – 50</SelectItem>
                    <SelectItem value="50-100">50 – 100</SelectItem>
                    <SelectItem value="100-200">100 – 200</SelectItem>
                    <SelectItem value="200+">200+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us about your requirements..." />
              </div>
              <Button type="submit" className="w-full" size="lg">
                <Send className="mr-2 h-4 w-4" /> Send Enquiry
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Contact;
