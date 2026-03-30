import { Users, Wallet, MessageSquare, BarChart3, Bot } from 'lucide-react';

const sections = [
  {
    icon: Users,
    title: 'Member Management',
    desc: 'Complete member lifecycle management from onboarding to renewal.',
    points: ['Add and edit member profiles', 'Track membership plans and expiry', 'Pause, expire, or blacklist members', 'Search and filter members instantly'],
  },
  {
    icon: Wallet,
    title: 'Payments & Billing',
    desc: 'Effortless payment tracking with full history and reporting.',
    points: ['Record cash, UPI, card, and online payments', 'Track partial payments and dues', 'Monthly and quarterly billing cycles', 'Payment history per member'],
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp Automation',
    desc: 'Automated reminders that keep your members on track.',
    points: ['Automated payment due reminders', 'Customizable message templates', 'Delivery tracking and analytics', 'Shared or dedicated WhatsApp number'],
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    desc: 'Data-driven insights to grow your gym business.',
    points: ['Revenue trends and projections', 'Member growth analytics', 'Defaulter reports', 'Collection efficiency metrics'],
  },
  {
    icon: Bot,
    title: 'Owner Assistant via WhatsApp',
    desc: 'Get daily reports and manage your gym from WhatsApp.',
    points: ['Daily summary reports', 'Quick member lookup', 'Payment confirmations', 'Renewal alerts'],
  },
];

const Features = () => (
  <main className="py-20">
    <div className="mx-auto max-w-7xl px-4 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">Features</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Everything you need to run a successful gym business.
        </p>
      </div>

      <div className="mt-16 space-y-20">
        {sections.map((s, i) => (
          <div key={s.title} className={`flex flex-col items-center gap-12 md:flex-row ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
            <div className="flex-1">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <s.icon className="h-7 w-7 text-primary" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-foreground">{s.title}</h2>
              <p className="mt-2 text-muted-foreground">{s.desc}</p>
              <ul className="mt-6 space-y-3">
                {s.points.map(p => (
                  <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex h-56 w-full flex-1 items-center justify-center rounded-xl bg-muted">
              <p className="text-muted-foreground">{s.title} Preview</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </main>
);

export default Features;
