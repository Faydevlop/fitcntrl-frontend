import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    price: '₹399',
    popular: false,
    features: [
      'Up to 100 members',
      'Member management',
      'Payment tracking',
      'Basic dashboard analytics',
      '1,000 WhatsApp messages/month',
      'Payment history',
    ],
  },
  {
    name: 'Pro',
    price: '₹699',
    popular: true,
    features: [
      'Up to 500 members',
      'Everything in Basic',
      'Advanced analytics & reports',
      'WhatsApp automation & reminders',
      '5,000 WhatsApp messages/month',
      'Owner reports via WhatsApp',
      'CSV import',
      'Dedicated WhatsApp number',
    ],
  },
];

const Pricing = () => (
  <main className="py-20">
    <div className="mx-auto max-w-7xl px-4 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">Pricing</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Affordable plans for gyms of every size.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:mx-auto lg:max-w-3xl">
        {plans.map(plan => (
          <Card
            key={plan.name}
            className={`relative ${plan.popular ? 'border-2 border-primary' : 'border-0'} card-shadow`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                Most Popular
              </div>
            )}
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground">{plan.name}</h2>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success" /> {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-8 w-full" variant={plan.popular ? 'default' : 'outline'} asChild>
                <Link to="/contact">Start Now</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </main>
);

export default Pricing;
