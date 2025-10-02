import React from 'react';
import { Check, X } from 'lucide-react';
import { 
  validatePasswordStrength, 
  getPasswordStrengthLabel, 
  getPasswordStrengthColor,
  getPasswordStrengthBarColor,
  PasswordStrengthResult 
} from '../utils/passwordValidation';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export function PasswordStrengthIndicator({ password, showRequirements = true }: PasswordStrengthIndicatorProps) {
  const result: PasswordStrengthResult = validatePasswordStrength(password);
  
  if (!password) {
    return null;
  }
  
  return (
    <div className="space-y-3 mt-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Password Strength</span>
          <span className={`text-sm font-medium ${getPasswordStrengthColor(result.score)}`}>
            {getPasswordStrengthLabel(result.score)}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthBarColor(result.score)}`}
            style={{ width: `${(result.score / 4) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground mb-2">Password Requirements:</div>
          <RequirementItem 
            met={result.requirements.minLength} 
            text="At least 8 characters long" 
          />
          <RequirementItem 
            met={result.requirements.hasUppercase} 
            text="Contains uppercase letter (A-Z)" 
          />
          <RequirementItem 
            met={result.requirements.hasLowercase} 
            text="Contains lowercase letter (a-z)" 
          />
          <RequirementItem 
            met={result.requirements.hasNumber} 
            text="Contains number (0-9)" 
          />
          <RequirementItem 
            met={result.requirements.hasSpecialChar} 
            text="Contains special character (!@#$%^&*)" 
          />
          <RequirementItem 
            met={result.requirements.notCommon} 
            text="Not a common password" 
          />
        </div>
      )}
      
      {/* Missing Requirements Feedback */}
      {result.feedback.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
          <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
            Password Issues:
          </div>
          <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
            {result.feedback.map((message, index) => (
              <div key={index} className="flex items-start space-x-2">
                <X className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {result.isValid && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3 flex items-center space-x-2">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            Password meets all security requirements!
          </span>
        </div>
      )}
    </div>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center space-x-2 text-sm transition-colors duration-200 ${
      met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
    }`}>
      {met ? (
        <Check className="h-3 w-3 flex-shrink-0" />
      ) : (
        <X className="h-3 w-3 flex-shrink-0" />
      )}
      <span className={met ? 'line-through opacity-75' : ''}>{text}</span>
    </div>
  );
}