import { useState } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import { FiSmile, FiFrown, FiMeh } from 'react-icons/fi';

interface MentalHealthAlertProps {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendations: string[];
  onClose: () => void;
  emotionalState?: string;
  sentimentScore?: number;
}

const MentalHealthAlert: React.FC<MentalHealthAlertProps> = ({
  riskLevel,
  recommendations,
  onClose,
  emotionalState = 'NEUTRAL',
  sentimentScore = 0
}) => {
  const getAlertColor = () => {
    switch (riskLevel) {
      case 'HIGH':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  // Get sentiment icon based on emotional state
  const getSentimentIcon = () => {
    switch (emotionalState) {
      case 'POSITIVE':
        return <FiSmile className="h-5 w-5 text-green-500" />;
      case 'NEGATIVE':
        return <FiFrown className="h-5 w-5 text-red-500" />;
      default:
        return <FiMeh className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getAlertColor()} mb-4`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FiAlertTriangle className="h-5 w-5" />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center">
            <h3 className="text-sm font-medium">
              {riskLevel === 'HIGH' ? 'Urgent Support Available' :
               riskLevel === 'MEDIUM' ? 'Support Available' :
               'Sentiment Analysis'}
            </h3>
            <div className="ml-2 flex items-center">
              {getSentimentIcon()}
              <span className="ml-1 text-sm">
                {emotionalState} ({sentimentScore > 0 ? '+' : ''}{sentimentScore})
              </span>
            </div>
          </div>
          <div className="mt-2 text-sm">
            <ul className="list-disc pl-5 space-y-1">
              {recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            className="inline-flex text-gray-400 hover:text-gray-500"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthAlert; 