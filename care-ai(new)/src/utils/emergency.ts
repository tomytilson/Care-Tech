// Emergency keywords and phrases trigger high-priority critical safety overrides
export const EMERGENCY_KEYWORDS = [
  'chest pain',
  'tightness in chest',
  'chest tightness',
  'pressure in chest',
  'difficulty breathing',
  'shortness of breath',
  'cannot breathe',
  "can't breathe",
  'gasping for air',
  'unable to breathe',
  'severe bleeding',
  'heavy bleeding',
  'uncontrolled bleeding',
  'coughing blood',
  'coughing up blood',
  'fainting',
  'passed out',
  'passing out',
  'unconscious',
  'loss of consciousness',
  'sudden numbness',
  'facial drooping',
  'arm weakness',
  'slurred speech',
  'stroke',
  'heart attack',
  'thoughts of self-harm',
  'self harm',
  'suicide',
  'suicidal',
  'want to die',
  'ending my life',
  'severe allergic reaction',
  'anaphylaxis',
  'throat swelling',
  'throat closing',
  'seizure',
  'convulsions',
  'head trauma',
  'severe head injury',
  'overdose'
];

export const EMERGENCY_ALERT_TEXT = `🚨 CRITICAL EMERGENCY NOTICE: The symptoms described may require immediate medical attention. Please call emergency services (911 or your local emergency number) or proceed to the nearest emergency room immediately.`;

export function isEmergencyQuery(input: string): boolean {
  if (!input) return false;
  const lower = input.toLowerCase();
  return EMERGENCY_KEYWORDS.some((keyword) => lower.includes(keyword));
}
