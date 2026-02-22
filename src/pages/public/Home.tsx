import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Users, Wallet, MessageSquare, BarChart3, AlertTriangle, FileSpreadsheet,
  ArrowRight, CheckCircle2, Dumbbell, Quote,
} from 'lucide-react';

const features = [
  { icon: Users, title: 'Member Management', desc: 'Add, edit, and track all your gym members in one place with complete lifecycle management.' },
  { icon: Wallet, title: 'Payment Tracking', desc: 'Record payments, track dues, and manage billing cycles effortlessly.' },
  { icon: MessageSquare, title: 'WhatsApp Reminders', desc: 'Automated payment reminders via WhatsApp keep members on track.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Data-driven insights into revenue, members, and gym performance.' },
  { icon: AlertTriangle, title: 'Defaulters Tracking', desc: 'Identify and follow up with overdue members automatically.' },
  { icon: FileSpreadsheet, title: 'CSV Import', desc: 'Bulk import members from spreadsheets in seconds.' },
];

const stats = [
  { value: '2024', label: 'Founded' },
  { value: '10K+', label: 'Active Members Tracked' },
  { value: '500+', label: 'Gym Partners' },
];

const Home = () => (
  <main>
    {/* Hero */}
    <section className="relative overflow-hidden bg-primary py-24 lg:py-36">
      {/* Decorative circles */}
      <div className="absolute left-10 top-16 h-20 w-20 rounded-full bg-primary-foreground/10 lg:h-32 lg:w-32" />
      <div className="absolute right-16 top-24 h-14 w-14 rounded-full bg-primary-foreground/10 lg:h-24 lg:w-24" />
      <div className="absolute bottom-20 left-1/4 h-10 w-10 rounded-full bg-primary-foreground/8" />

      <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm font-medium text-primary-foreground">
          <Dumbbell className="h-4 w-4" /> GYM MANAGEMENT
        </div>
        <h1 className="mt-8 text-4xl font-bold leading-tight tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
          One tool to <span className="underline decoration-primary-foreground/40 decoration-2 underline-offset-4">manage</span>
          <br />members and your gym
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/70">
          GymFlow helps gym owners work faster, smarter and more efficiently, delivering visibility and data-driven insights to grow their business.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" asChild>
            <Link to="/contact">Start Free Trial</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <Link to="/pricing">Get a Demo</Link>
          </Button>
        </div>
      </div>
    </section>

    {/* Trusted By / Logo strip */}
    <section className="border-b border-border py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
          More than 500+ gyms trust GymFlow
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-50 lg:gap-16">
          {['FitZone', 'Iron Paradise', 'PowerHouse', 'FlexFit', 'Peak Performance'].map(name => (
            <span key={name} className="text-lg font-bold text-foreground">{name}</span>
          ))}
        </div>
      </div>
    </section>

    {/* Features - Bento grid style */}
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">✦ Features</span>
          <h2 className="mt-3 text-3xl font-bold text-foreground lg:text-4xl">
            Latest advanced technologies to<br />ensure everything you need
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Maximize your gym's productivity and efficiency with our affordable, user-friendly management system.
          </p>
        </div>

        {/* Bento Cards */}
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {/* Large card */}
          <Card className="border border-border bg-card">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-foreground">{features[0].title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{features[0].desc}</p>
              <Button size="sm" className="mt-6" asChild>
                <Link to="/features">Explore all <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
              <div className="mt-6 flex h-40 items-end justify-center rounded-xl bg-muted/60 p-4">
                <div className="flex gap-2">
                  {[60, 85, 45, 90, 70].map((h, i) => (
                    <div key={i} className="w-8 rounded-t bg-primary/60" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Two stacked small cards */}
          <div className="grid gap-5">
            <Card className="border border-border bg-card">
              <CardContent className="p-8">
                <h3 className="text-lg font-bold text-foreground">{features[2].title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{features[2].desc}</p>
                <div className="mt-4 space-y-2">
                  {['New messages, comments, or replies', 'Broadcast emails', 'Announcement and Updates'].map(item => (
                    <div key={item} className="flex items-center justify-between rounded-lg bg-muted/60 px-4 py-2.5">
                      <span className="text-sm text-foreground">{item}</span>
                      <div className="h-5 w-9 rounded-full bg-primary" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card">
              <CardContent className="p-8">
                <h3 className="text-lg font-bold text-foreground">{features[1].title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{features[1].desc}</p>
                <div className="mt-4 space-y-2">
                  <div className="rounded-lg bg-muted/60 p-3">
                    <p className="text-xs text-muted-foreground">Activity</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/20" />
                      <p className="text-xs text-foreground">Payment of ₹1,500 recorded for Amit Kumar</p>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/20" />
                      <p className="text-xs text-foreground">Sneha Reddy renewed quarterly plan</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section className="bg-muted/50 py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">✦ How It Works</span>
          <h2 className="mt-3 text-3xl font-bold text-foreground">Get started in three easy steps</h2>
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {[
            { num: '1', title: 'Add Your Members', desc: 'Import or manually add your gym members with their details.' },
            { num: '2', title: 'Track Payments', desc: 'Record payments and automatically track due dates.' },
            { num: '3', title: 'Send Reminders', desc: 'WhatsApp reminders go out to members automatically.' },
          ].map(s => (
            <div key={s.num} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                {s.num}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Testimonial */}
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Quote className="h-6 w-6 text-primary" />
        </div>
        <blockquote className="mt-8 text-xl font-medium leading-relaxed text-foreground lg:text-2xl">
          "GymFlow is helping our gym to decrease operational expenses and turnaround time, while increasing the efficiency of member management and payment collection."
        </blockquote>
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">RS</div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Rahul Sharma</p>
            <p className="text-xs text-muted-foreground">Owner, FitZone Gym</p>
          </div>
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="border-y border-border py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-bold text-foreground lg:text-5xl">{s.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA Banner */}
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-primary px-8 py-14 text-center lg:px-16">
          <h2 className="text-3xl font-bold text-primary-foreground lg:text-4xl">
            Discover the full scale of<br /><span className="underline decoration-primary-foreground/40 underline-offset-4">GymFlow</span> capabilities
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/pricing">Get a Demo</Link>
            </Button>
            <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" asChild>
              <Link to="/contact">Start for Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  </main>
);

export default Home;
