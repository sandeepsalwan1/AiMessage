import Sentiment from 'sentiment';
import { MentalHealthInsight } from '@/app/types';

const sentiment = new Sentiment();

// Keywords associated with mental health concerns
const MENTAL_HEALTH_KEYWORDS = {
  depression: ['sad', 'depressed', 'hopeless', 'worthless', 'suicide', 'kill myself', 'end it all'],
  anxiety: ['anxious', 'worried', 'panic', 'fear', 'scared', 'nervous', 'overwhelmed'],
  stress: ['stress', 'overwhelmed', 'pressure', 'can\'t handle', 'too much'],
  crisis: ['help', 'emergency', 'crisis', 'urgent', 'desperate']
};

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

const LOW: RiskLevel = 'LOW';
const MEDIUM: RiskLevel = 'MEDIUM';
const HIGH: RiskLevel = 'HIGH';

// Resource recommendations based on risk level
const RESOURCES: Record<RiskLevel, string[]> = {
  [LOW]: [
    "You're doing great! Keep focusing on the positive things in your life.",
    "Consider journaling about what makes you happy and grateful.",
    "Take a moment to appreciate the small joys in your day."
  ],
  [MEDIUM]: [
    "It's okay to have ups and downs. Remember to be kind to yourself.",
    "Try some mindfulness exercises to stay present and centered.",
    "Reach out to friends or family for a chat - connection can be healing."
  ],
  [HIGH]: [
    "If you're having thoughts of self-harm, please call emergency services (911) immediately.",
    "Contact the National Suicide Prevention Lifeline at 988.",
    "Reach out to a mental health professional as soon as possible."
  ]
};

export interface MentalHealthAnalysis {
  sentimentScore: number;
  emotionalState: string;
  riskLevel: RiskLevel;
  keywords: string[];
  recommendations: string[];
}

// Helper function to convert sentiment score to percentage (0-100)
const convertToPercentage = (score: number): number => {
  // Sentiment scores typically range from -5 to 5
  // Convert to 0-100 scale where:
  // -5 = 0%
  // 0 = 50%
  // 5 = 100%
  const percentage = ((score + 5) / 10) * 100;
  return Math.round(Math.max(0, Math.min(100, percentage))); // Ensure between 0-100
};

// Helper function to round to 0.1 digits
const roundToOneDecimal = (num: number): number => {
  return Math.round(num * 10) / 10;
};

export function analyzeMentalHealth(message: string): MentalHealthAnalysis {
  // Perform sentiment analysis
  const sentimentResult = sentiment.analyze(message);
  const rawScore = roundToOneDecimal(sentimentResult.score);
  const sentimentScore = convertToPercentage(rawScore);
  
  // Find matching keywords
  const foundKeywords: string[] = [];
  let riskLevel: RiskLevel = LOW;
  
  // Check for crisis keywords first
  if (MENTAL_HEALTH_KEYWORDS.crisis.some(keyword => 
    message.toLowerCase().includes(keyword))) {
    riskLevel = HIGH;
    foundKeywords.push(...MENTAL_HEALTH_KEYWORDS.crisis.filter(keyword => 
      message.toLowerCase().includes(keyword)));
  }
  
  // Check other categories
  Object.entries(MENTAL_HEALTH_KEYWORDS).forEach(([category, keywords]) => {
    const matches = keywords.filter(keyword => message.toLowerCase().includes(keyword));
    if (matches.length > 0) {
      foundKeywords.push(...matches);
      if (category === 'depression' || category === 'anxiety') {
        riskLevel = riskLevel === LOW ? MEDIUM : riskLevel;
      }
    }
  });

  // Determine emotional state based on sentiment score
  let emotionalState = 'NEUTRAL';
  if (sentimentScore > 65) emotionalState = 'POSITIVE';
  else if (sentimentScore < 35) emotionalState = 'NEGATIVE';

  // Adjust risk level based on sentiment score and emotional state
  if (riskLevel === MEDIUM && sentimentScore > 50) {
    riskLevel = LOW;
  }

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
  return analysis.riskLevel === HIGH || 
         (analysis.riskLevel === MEDIUM && analysis.sentimentScore < 20);
}

export function analyzeConversationSentiment(messages: { mentalHealthInsights: MentalHealthInsight[] }[]): MentalHealthAnalysis {
  // Calculate average sentiment score
  const totalScore = messages.reduce((sum, msg) => {
    if (msg.mentalHealthInsights && msg.mentalHealthInsights.length > 0) {
      // The scores are already in 0-100 scale, no need to convert
      return sum + msg.mentalHealthInsights[0].sentimentScore;
    }
    return sum;
  }, 0);
  const averageScore = Math.round(messages.length > 0 ? totalScore / messages.length : 50);

  // Collect all keywords and recommendations
  const allKeywords = new Set<string>();
  let highestRiskLevel: RiskLevel = LOW;

  messages.forEach(msg => {
    if (msg.mentalHealthInsights && msg.mentalHealthInsights.length > 0) {
      const insight = msg.mentalHealthInsights[0];
      if (insight.keywords) {
        insight.keywords.split(',').forEach((keyword: string) => allKeywords.add(keyword));
      }
      if (insight.riskLevel === HIGH) {
        highestRiskLevel = HIGH;
      } else if (insight.riskLevel === MEDIUM && highestRiskLevel !== HIGH) {
        highestRiskLevel = MEDIUM;
      }
    }
  });

  // Determine emotional state based on average score
  let emotionalState = 'NEUTRAL';
  if (averageScore > 65) emotionalState = 'POSITIVE';
  else if (averageScore < 35) emotionalState = 'NEGATIVE';

  // Adjust risk level based on average sentiment score
  if (highestRiskLevel === MEDIUM && averageScore > 50) {
    highestRiskLevel = LOW;
  }

  // Get recommendations based on highest risk level
  const recommendations = RESOURCES[highestRiskLevel];

  return {
    sentimentScore: averageScore,
    emotionalState,
    riskLevel: highestRiskLevel,
    keywords: Array.from(allKeywords),
    recommendations
  };
} 