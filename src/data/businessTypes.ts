export type BusinessType = 'gym' | 'yoga' | 'fitness' | 'dance' | 'personal_training' | 'other';

export interface BusinessLabels {
  entityLabel: string;
  entityLabelPlural: string;
  feeLabel: string;
  planLabel: string;
  categoryLabel: string;
  categories: string[];
}

export const BUSINESS_TYPE_OPTIONS: { value: BusinessType; label: string; icon: string }[] = [
  { value: 'gym', label: 'Gym', icon: 'Dumbbell' },
  { value: 'yoga', label: 'Yoga Studio', icon: 'Flower2' },
  { value: 'fitness', label: 'Fitness Classes', icon: 'PersonStanding' },
  { value: 'dance', label: 'Dance Studio', icon: 'Music' },
  { value: 'personal_training', label: 'Personal Training', icon: 'Target' },
  { value: 'other', label: 'Other', icon: 'Building2' },
];

export const BUSINESS_LABELS: Record<BusinessType, BusinessLabels> = {
  gym: {
    entityLabel: 'Member',
    entityLabelPlural: 'Members',
    feeLabel: 'Monthly Fee',
    planLabel: 'Workout Plan',
    categoryLabel: 'Plan',
    categories: ['Weight Loss', 'Strength', 'Cardio', 'General Fitness', 'Bodybuilding'],
  },
  yoga: {
    entityLabel: 'Student',
    entityLabelPlural: 'Students',
    feeLabel: 'Monthly Fee',
    planLabel: 'Batch / Session',
    categoryLabel: 'Batch',
    categories: ['Morning Batch', 'Evening Batch', 'Beginner', 'Advanced', 'Prenatal Yoga'],
  },
  fitness: {
    entityLabel: 'Student',
    entityLabelPlural: 'Students',
    feeLabel: 'Class Fee',
    planLabel: 'Class Type',
    categoryLabel: 'Class',
    categories: ['HIIT', 'Zumba', 'Aerobics', 'CrossFit', 'Pilates'],
  },
  dance: {
    entityLabel: 'Student',
    entityLabelPlural: 'Students',
    feeLabel: 'Course Fee',
    planLabel: 'Batch',
    categoryLabel: 'Batch',
    categories: ['HipHop', 'Classical', 'Kids', 'Bollywood', 'Contemporary'],
  },
  personal_training: {
    entityLabel: 'Client',
    entityLabelPlural: 'Clients',
    feeLabel: 'Session Fee',
    planLabel: 'Session Type',
    categoryLabel: 'Session Type',
    categories: ['1-on-1', 'Group (2-3)', 'Online', 'Assessment', 'Rehabilitation'],
  },
  other: {
    entityLabel: 'Member',
    entityLabelPlural: 'Members',
    feeLabel: 'Fee',
    planLabel: 'Plan',
    categoryLabel: 'Category',
    categories: ['General', 'Premium', 'Basic'],
  },
};

export function getBusinessLabel(type: BusinessType): BusinessLabels {
  return BUSINESS_LABELS[type] || BUSINESS_LABELS.other;
}

export function getBusinessTypeName(type: BusinessType): string {
  return BUSINESS_TYPE_OPTIONS.find(o => o.value === type)?.label || 'Other';
}
