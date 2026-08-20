import { PatientProfile } from '../types';

export const SAMPLE_PROFILES: PatientProfile[] = [
  {
    id: 'sarah-j',
    name: 'Sarah Jenkins',
    age: 34,
    healthGoals: ['Build stamina', 'Improve sleep quality', 'Reduce stress'],
    allergies: ['Peanuts', 'Dairy', 'Latex'],
    dietaryNotes: ['Lactose intolerant', 'Low sugar'],
    sleepHours: 6.5,
    exerciseHabits: '3x a week jogging (30 mins), light yoga',
    currentSymptoms: ['Mild fatigue', 'Tension headache', 'Dry eyes'],
    medicalHistoryNotes: 'Mild seasonal allergies in spring'
  },
  {
    id: 'marcus-v',
    name: 'Marcus Vance',
    age: 52,
    healthGoals: ['Lose weight', 'Boost energy', 'Lower blood pressure'],
    allergies: ['Penicillin', 'Pollen', 'Shellfish'],
    dietaryNotes: ['Low sodium', 'High protein', 'Heart-healthy'],
    sleepHours: 5.5,
    exerciseHabits: 'Mostly sedentary, weekend walking (20 mins)',
    currentSymptoms: ['Dizziness when standing fast', 'Lower back stiffness', 'Brain fog'],
    medicalHistoryNotes: 'Mild hypertension managed with lifestyle'
  },
  {
    id: 'elena-r',
    name: 'Elena Rostova',
    age: 28,
    healthGoals: ['Boost immunity', 'Enhance focus', 'Improve digestion'],
    allergies: ['Tree nuts', 'Latex', 'Dust mites'],
    dietaryNotes: ['Vegan', 'Gluten-free', 'Organic preferred'],
    sleepHours: 8.0,
    exerciseHabits: 'Daily vinyasa yoga (45 mins) & Pilates',
    currentSymptoms: ['Sore throat', 'Nasal congestion', 'Slight muscle aches'],
    medicalHistoryNotes: 'Sensitive skin, asthma history in childhood'
  }
];

export const COMMON_GOALS = [
  'Build stamina & fitness',
  'Improve sleep quality',
  'Lose weight healthily',
  'Boost daily energy',
  'Reduce stress & anxiety',
  'Improve digestion & gut health',
  'Strengthen immunity',
  'Manage joint stiffness'
];

export const COMMON_ALLERGIES = [
  'Peanuts',
  'Tree Nuts',
  'Dairy / Milk',
  'Penicillin',
  'Latex',
  'Pollen',
  'Shellfish',
  'Eggs',
  'Soy',
  'Bee Stings'
];

export const COMMON_DIETARY = [
  'Lactose Intolerant',
  'Vegan',
  'Vegetarian',
  'Low Sodium',
  'Gluten-Free',
  'Keto',
  'Diabetic-Friendly',
  'Low Sugar'
];

export const COMMON_SYMPTOMS = [
  'Mild headache',
  'Feeling fatigued',
  'Sore throat',
  'Lower back pain',
  'Nasal congestion',
  'Bloating / Indigestion',
  'Muscle soreness',
  'Trouble falling asleep',
  'Mild anxiety'
];
