import { FC } from 'react';
import { FiSmile, FiFrown, FiMeh, FiInfo } from 'react-icons/fi';
import { ConversationSentiment as ConversationSentimentType } from '@/app/types';

interface ConversationSentimentProps {
  sentiment: ConversationSentimentType;
}

const ConversationSentiment: FC<ConversationSentimentProps> = ({ sentiment }) => {
  const getSentimentIcon = () => {
    switch (sentiment.emotionalState) {
      case 'POSITIVE':
        return <FiSmile className="h-5 w-5 text-green-500" />;
      case 'NEGATIVE':
        return <FiFrown className="h-5 w-5 text-red-500" />;
      default:
        return <FiMeh className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getRiskLevelColor = () => {
    switch (sentiment.riskLevel) {
      case 'HIGH':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getRiskLevelColor()} mb-4`}>
      <div className="flex items-center gap-2">
        {getSentimentIcon()}
        <div>
          <div className="text-sm font-medium">
            Conversation Sentiment: {sentiment.emotionalState}
          </div>
          <div className="text-xs">
            Score: {sentiment.sentimentScore > 0 ? '+' : ''}{sentiment.sentimentScore}
          </div>
        </div>
      </div>
      {sentiment.recommendations.length > 0 && (
        <div className="mt-2 text-xs">
          <div className="font-medium mb-1">Recommendations:</div>
          <ul className="list-disc pl-4 space-y-1">
            {sentiment.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ConversationSentiment; 