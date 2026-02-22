export type EnquiryStatus = 'new' | 'contacted' | 'closed';

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  gymName: string;
  city: string;
  membersCount: string;
  message: string;
  date: string;
  status: EnquiryStatus;
}

export const enquiries: Enquiry[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    phone: '+91 98765 11111',
    email: 'rajesh@gmail.com',
    gymName: 'Strength Hub',
    city: 'Mumbai',
    membersCount: '50-100',
    message: 'Looking for a gym management solution with WhatsApp integration. Currently managing everything manually.',
    date: '2026-02-20',
    status: 'new',
  },
  {
    id: '2',
    name: 'Priya Mehta',
    phone: '+91 87654 22222',
    email: 'priya.mehta@yahoo.com',
    gymName: 'FitLife Studio',
    city: 'Delhi',
    membersCount: '100-200',
    message: 'We need payment tracking and automated reminders for our members. Interested in Pro plan.',
    date: '2026-02-19',
    status: 'contacted',
  },
  {
    id: '3',
    name: 'Arun Nair',
    phone: '+91 76543 33333',
    email: 'arun.nair@outlook.com',
    gymName: 'PowerZone Fitness',
    city: 'Bangalore',
    membersCount: '200+',
    message: 'Need a comprehensive solution for our chain of 3 gyms. Want centralized management.',
    date: '2026-02-18',
    status: 'new',
  },
  {
    id: '4',
    name: 'Sunita Sharma',
    phone: '+91 65432 44444',
    email: 'sunita@fitgym.in',
    gymName: 'FitGym Express',
    city: 'Pune',
    membersCount: '20-50',
    message: 'Small gym, looking for affordable basic plan. Need member management and payment tracking.',
    date: '2026-02-15',
    status: 'closed',
  },
  {
    id: '5',
    name: 'Vikram Reddy',
    phone: '+91 54321 55555',
    email: 'vikram.reddy@gmail.com',
    gymName: 'Iron Will Gym',
    city: 'Hyderabad',
    membersCount: '100-200',
    message: 'Interested in WhatsApp automation features. Can we get a demo?',
    date: '2026-02-21',
    status: 'new',
  },
];
