import Sentiment from 'sentiment';
import { MentalHealthInsight } from '@/app/types';

// Create a singleton instance for better performance
const sentiment = new Sentiment();

// Cache for processed messages to avoid redundant processing
const messageCache = new Map<string, {
  score: number,
  keywords: string[],
  riskLevel: RiskLevel
}>();

// Maximum cache size to prevent memory leaks
const MAX_CACHE_SIZE = 100;

// Keywords associated with mental health concerns with expanded vocabulary
const MENTAL_HEALTH_KEYWORDS = {
  depression: [
    'sad', 'depressed', 'hopeless', 'worthless', 'suicide', 'kill myself', 'end it all',
    'feeling down', 'not worth it', 'can\'t go on', 'giving up', 'tired of living',
    'don\'t want to be here', 'nobody cares', 'feeling empty', 'no reason to live',
    'hate myself', 'life is meaningless', 'better off dead', 'want to die'
  ],
  anxiety: [
    'anxious', 'worried', 'panic', 'fear', 'scared', 'nervous', 'overwhelmed',
    'freaking out', 'on edge', 'can\'t calm down', 'racing thoughts', 'heart racing',
    'can\'t breathe', 'dread', 'terrified', 'afraid', 'paranoid', 'uneasy'
  ],
  stress: [
    'stress', 'overwhelmed', 'pressure', 'can\'t handle', 'too much',
    'breaking point', 'burnout', 'exhausted', 'drained', 'can\'t cope',
    'falling apart', 'can\'t focus', 'can\'t sleep'
  ],
  crisis: [
    'help', 'emergency', 'crisis', 'urgent', 'desperate',
    'killing myself', 'going to end it', 'no way out', 'hurt myself',
    'harm myself', 'last resort', 'last message', 'goodbye forever',
    'final note', 'need help now'
  ],
  selfHarm: [
    'cutting', 'self-harm', 'hurting myself', 'burning myself', 'harming myself',
    'injuring myself', 'self-injury', 'self-destructive'
  ],
  positive: [
    'happy', 'grateful', 'wonderful', 'amazing', 'joy', 'great', 'excellent',
    'thankful', 'blessed', 'fantastic', 'terrific', 'content', 'love', 'hopeful',
    'excited', 'thrilled', 'delighted', 'optimistic', 'positive'
  ]
};

// Specific high-priority phrases that should always be treated as serious
const CONCERNING_PHRASES = [
  'killing myself', 'kill myself', 'end my life', 'suicide', 'want to die',
  'don\'t want to live', 'going to hurt myself', 'going to end it all'
];

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

const LOW: RiskLevel = 'LOW';
const MEDIUM: RiskLevel = 'MEDIUM';
const HIGH: RiskLevel = 'HIGH';

// Resource recommendations based on risk level with improved specificity
const RESOURCES: Record<RiskLevel, string[]> = {
  [LOW]: [
    "Your conversation seems positive. Keep nurturing these supportive connections!",
    "Consider journaling about what makes you happy and grateful in this relationship.",
    "Small daily positive interactions can strengthen your connections with others.",
    "This conversation shows good communication patterns. Keep it up!"
  ],
  [MEDIUM]: [
    "It's completely normal to have mixed feelings in conversations. Take a moment to breathe.",
    "Consider practicing active listening techniques to deepen understanding in this conversation.",
    "If you're feeling stressed, a quick break can help reset your emotional state.",
    "Remember that it's okay to set boundaries in any conversation that feels overwhelming."
  ],
  [HIGH]: [
    "If you or someone you're talking to is experiencing thoughts of self-harm, please call emergency services (911) immediately.",
    "The National Suicide Prevention Lifeline is available 24/7 at 988 or text HOME to 741741.",
    "Please reach out to a mental health professional as soon as possible for support.",
    "Remember that crisis situations are temporary and help is available right now."
  ]
};

export interface MentalHealthAnalysis {
  sentimentScore: number;
  emotionalState: string;
  riskLevel: RiskLevel;
  keywords: string[];
  recommendations: string[];
}

// Define the shape of a message for better type safety
interface MessageWithBody {
  body?: string | null;
  [key: string]: any;
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

// Helper function to detect concerning phrases that should override sentiment analysis
const detectConcerningPhrases = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  return CONCERNING_PHRASES.some(phrase => lowerMessage.includes(phrase));
};

// Helper function to manage the message cache
const manageCache = (message: string, data: any): void => {
  // Clear oldest entries if cache is too large
  if (messageCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = messageCache.keys().next().value;
    messageCache.delete(oldestKey);
  }
  
  // Add new entry to cache
  messageCache.set(message, data);
};

export function analyzeMentalHealth(message: string): MentalHealthAnalysis {
  // Check cache first for improved performance
  if (messageCache.has(message)) {
    const cached = messageCache.get(message)!;
    return {
      sentimentScore: cached.score,
      emotionalState: cached.score > 65 ? 'POSITIVE' : cached.score < 35 ? 'NEGATIVE' : 'NEUTRAL',
      riskLevel: cached.riskLevel,
      keywords: cached.keywords,
      recommendations: RESOURCES[cached.riskLevel]
    };
  }

  // Check for concerning phrases first - this overrides standard sentiment analysis
  const hasConcerningPhrases = detectConcerningPhrases(message);
  
  // Perform sentiment analysis
  const sentimentResult = sentiment.analyze(message);
  let rawScore = roundToOneDecimal(sentimentResult.score);
  
  // Override the sentiment score for concerning phrases
  if (hasConcerningPhrases) {
    // Force a very negative score for concerning phrases regardless of what the sentiment library says
    rawScore = -4.0; // This will convert to a 10% sentiment score
  }
  
  let sentimentScore = convertToPercentage(rawScore);
  
  // Find matching keywords
  const foundKeywords: string[] = [];
  let riskLevel: RiskLevel = LOW;
  
  // Check for crisis or selfHarm keywords first
  if (MENTAL_HEALTH_KEYWORDS.crisis.some(keyword => 
    message.toLowerCase().includes(keyword)) ||
    MENTAL_HEALTH_KEYWORDS.selfHarm.some(keyword => 
    message.toLowerCase().includes(keyword))) {
    riskLevel = HIGH;
    
    // Add matched keywords to found keywords
    foundKeywords.push(
      ...MENTAL_HEALTH_KEYWORDS.crisis.filter(keyword => 
        message.toLowerCase().includes(keyword)),
      ...MENTAL_HEALTH_KEYWORDS.selfHarm.filter(keyword => 
        message.toLowerCase().includes(keyword))
    );
    
    // Force a lower sentiment score for crisis situations
    sentimentScore = Math.min(sentimentScore, 20);
  }
  
  // Check other categories
  Object.entries(MENTAL_HEALTH_KEYWORDS).forEach(([category, keywords]) => {
    // Skip the categories we've already processed
    if (category === 'crisis' || category === 'selfHarm') return;
    
    const matches = keywords.filter(keyword => message.toLowerCase().includes(keyword));
    if (matches.length > 0) {
      foundKeywords.push(...matches);
      
      // Adjust risk level and sentiment score based on depression keywords
      if (category === 'depression') {
        // Depression keywords have a stronger impact on sentiment score
        sentimentScore = Math.min(sentimentScore, sentimentScore - (matches.length * 5));
        riskLevel = riskLevel === LOW ? MEDIUM : riskLevel;
      } 
      // Adjust risk level and sentiment score based on anxiety keywords
      else if (category === 'anxiety') {
        // Anxiety keywords have a moderate impact on sentiment score
        sentimentScore = Math.min(sentimentScore, sentimentScore - (matches.length * 3));
        riskLevel = riskLevel === LOW ? MEDIUM : riskLevel;
      }
      // Adjust based on stress keywords
      else if (category === 'stress') {
        // Stress keywords have a minor impact on sentiment score
        sentimentScore = Math.min(sentimentScore, sentimentScore - (matches.length * 2));
      }
      // Boost score for positive keywords
      else if (category === 'positive') {
        // Positive keywords have a moderate boost on sentiment score
        sentimentScore = Math.min(100, sentimentScore + (matches.length * 3));
      }
    }
  });

  // Ensure sentiment score stays within 0-100 range
  sentimentScore = Math.max(0, Math.min(100, sentimentScore));

  // Determine emotional state based on sentiment score
  let emotionalState = 'NEUTRAL';
  if (sentimentScore > 65) emotionalState = 'POSITIVE';
  else if (sentimentScore < 35) emotionalState = 'NEGATIVE';

  // If we found concerning phrases, ensure the emotional state is NEGATIVE
  if (hasConcerningPhrases) {
    emotionalState = 'NEGATIVE';
  }

  // Adjust risk level based on sentiment score and emotional state
  if (riskLevel === MEDIUM && sentimentScore > 60) {
    // Only downgrade to LOW if sentiment is significantly positive
    riskLevel = LOW;
  }
  
  // For very negative sentiment scores, increase risk level
  if (sentimentScore < 20 && riskLevel === LOW) {
    riskLevel = MEDIUM;
  }

  // Get recommendations based on risk level
  const recommendations = RESOURCES[riskLevel];

  // Cache the result
  manageCache(message, {
    score: sentimentScore,
    keywords: foundKeywords,
    riskLevel
  });

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

// Modified to work with client-side data without database dependencies
export function analyzeConversationSentiment(messages: MessageWithBody[]): MentalHealthAnalysis {
  // If there are no messages or too few to analyze meaningfully, return a default
  if (!messages || messages.length < 3) {
    return {
      sentimentScore: 50,
      emotionalState: 'NEUTRAL',
      riskLevel: LOW,
      keywords: [],
      recommendations: RESOURCES[LOW]
    };
  }

  // If messages have no sentiment data, analyze each message text
  const messageAnalyses = messages.map(msg => {
    if (msg && typeof msg.body === 'string') {
      return analyzeMentalHealth(msg.body);
    }
    return null;
  }).filter(Boolean) as MentalHealthAnalysis[];

  // Default sentiment if no analyses
  if (messageAnalyses.length === 0) {
    return {
      sentimentScore: 50,
      emotionalState: 'NEUTRAL',
      riskLevel: LOW,
      keywords: [],
      recommendations: RESOURCES[LOW]
    };
  }

  // Calculate average sentiment score
  const totalScore = messageAnalyses.reduce((sum, analysis) => sum + (analysis?.sentimentScore || 50), 0);
  const averageScore = Math.round(totalScore / messageAnalyses.length);

  // Collect all keywords
  const allKeywords = new Set<string>();
  let highestRiskLevel: RiskLevel = LOW;

  messageAnalyses.forEach(analysis => {
    if (!analysis) return;
    
    analysis.keywords.forEach(keyword => allKeywords.add(keyword));
    
    if (analysis.riskLevel === HIGH) {
      highestRiskLevel = HIGH;
    } else if (analysis.riskLevel === MEDIUM && highestRiskLevel !== HIGH) {
      highestRiskLevel = MEDIUM;
    }
  });

  // Determine emotional state based on average score
  let emotionalState = 'NEUTRAL';
  if (averageScore > 65) emotionalState = 'POSITIVE';
  else if (averageScore < 35) emotionalState = 'NEGATIVE';

  // Recent messages should have more weight in determining risk level
  // Take the last 5 messages or fewer if there aren't that many
  const recentMessages = messages.slice(-5);
  const recentAnalyses = recentMessages
    .map(msg => {
      if (msg && typeof msg.body === 'string') {
        return analyzeMentalHealth(msg.body);
      }
      return null;
    })
    .filter(Boolean) as MentalHealthAnalysis[];
  
  // If there are recent analyses with HIGH risk, prioritize that
  if (recentAnalyses.some(analysis => analysis?.riskLevel === HIGH)) {
    highestRiskLevel = HIGH;
  } 
  // If there are recent analyses with MEDIUM risk and overall is not HIGH
  else if (highestRiskLevel !== HIGH && 
          recentAnalyses.some(analysis => analysis?.riskLevel === MEDIUM)) {
    highestRiskLevel = MEDIUM;
  }

  // Adjust risk level based on average sentiment score
  if (highestRiskLevel === MEDIUM && averageScore > 60) {
    highestRiskLevel = LOW;
  }
  
  // For very negative sentiment scores, increase risk level
  if (averageScore < 20 && highestRiskLevel === LOW) {
    highestRiskLevel = MEDIUM;
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