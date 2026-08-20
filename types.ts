export interface PatientProfile {
  id: string;
  email?: string;
  name: string;
  age: number | string;
  healthGoals: string[];
  allergies: string[];
  dietaryNotes: string[];
  sleepHours: number | string;
  exerciseHabits: string;
  currentSymptoms: string[];
  customDietary?: string;
  customAllergies?: string;
  customSymptoms?: string;
  medicalHistoryNotes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isEmergency?: boolean;
  metadata?: {
    riskLevel?: 'low' | 'moderate' | 'high' | 'emergency';
    suggestedActions?: string[];
  };
}

export interface DailyWellnessPlan {
  title: string;
  summary: string;
  morningRoutine: string[];
  afternoonRoutine: string[];
  eveningRoutine: string[];
  nutritionTips: string[];
  allergyWarnings: string[];
  sleepRecommendations: string[];
}
