import Sentiment from 'sentiment';

const sentiment = new Sentiment();

// Keywords associated with mental health concerns
const MENTAL_HEALTH_KEYWORDS = {
  depression: ['sad', 'depressed', 'hopeless', 'worthless', 'suicide', 'kill myself', 'end it all'],
  anxiety: ['anxious', 'worried', 'panic', 'fear', 'scared', 'nervous', 'overwhelmed'],
  stress: ['stress', 'overwhelmed', 'pressure', 'can\'t handle', 'too much'],
  crisis: ['help', 'emergency', 'crisis', 'urgent', 'desperate']
};

// Resource recommendations based on risk level
const RESOURCES = {
  LOW: [
    "Consider talking to a trusted friend or family member about your feelings.",
    "Try some relaxation techniques like deep breathing or meditation.",
    "Take a walk or engage in physical activity to improve your mood."
  ],
  MEDIUM: [
    "Consider scheduling an appointment with a mental health professional.",
    "Call or text a mental health helpline for support.",
    "Practice self-care activities and maintain a regular sleep schedule."
  ],
  HIGH: [
    "If you're having thoughts of self-harm, please call emergency services (911) immediately.",
    "Contact the National Suicide Prevention Lifeline at 988.",
    "Reach out to a mental health professional as soon as possible."
  ]
};

export interface MentalHealthAnalysis {
  sentimentScore: number;
  emotionalState: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  keywords: string[];
  recommendations: string[];
}

export function analyzeMentalHealth(message: string): MentalHealthAnalysis {
  // Perform sentiment analysis
  const sentimentResult = sentiment.analyze(message);
  const sentimentScore = sentimentResult.score;
  
  // Find matching keywords
  const foundKeywords: string[] = [];
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  
  // Check for crisis keywords first
  if (MENTAL_HEALTH_KEYWORDS.crisis.some(keyword => 
    message.toLowerCase().includes(keyword))) {
    riskLevel = 'HIGH';
    foundKeywords.push(...MENTAL_HEALTH_KEYWORDS.crisis.filter(keyword => 
      message.toLowerCase().includes(keyword)));
  }
  
  // Check other categories
  Object.entries(MENTAL_HEALTH_KEYWORDS).forEach(([category, keywords]) => {
    const matches = keywords.filter(keyword => message.toLowerCase().includes(keyword));
    if (matches.length > 0) {
      foundKeywords.push(...matches);
      if (category === 'depression' || category === 'anxiety') {
        riskLevel = riskLevel === 'LOW' ? 'MEDIUM' : riskLevel;
      }
    }
  });

  // Determine emotional state based on sentiment score
  let emotionalState = 'NEUTRAL';
  if (sentimentScore > 2) emotionalState = 'POSITIVE';
  else if (sentimentScore < -2) emotionalState = 'NEGATIVE';

  // Get recommendations based on risk level
  const recommendations = RESOURCES[riskLevel];

  return {
    sentimentScore,
    emotionalState,
    riskLevel,
    keywords: foundKeywords,
    recommendations
  };
}

export function shouldTriggerAlert(analysis: MentalHealthAnalysis): boolean {
  return analysis.riskLevel === 'HIGH' || 
         (analysis.riskLevel === 'MEDIUM' && analysis.sentimentScore < -3);
} 