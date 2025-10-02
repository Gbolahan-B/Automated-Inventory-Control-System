export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0-4 (weak to very strong)
  feedback: string[];
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    notCommon: boolean;
  };
}

// Common weak passwords to avoid
const COMMON_PASSWORDS = [
  'password', 'password123', '123456', '123456789', 'qwerty', 'abc123',
  'password1', 'admin', 'letmein', 'welcome', 'monkey', 'dragon',
  'master', 'hello', 'freedom', 'whatever', 'qwertyuiop', 'trustno1',
  'jordan23', 'harley', 'robert', 'matthew', 'daniel', 'andrew',
  'joshua', 'amanda', 'jessica', 'christopher', 'ashley', 'david',
  'james', 'robert', 'john', 'michael', 'william', 'mary', 'patricia',
  'jennifer', 'linda', 'elizabeth', 'barbara', 'susan', 'maria',
  'karen', 'lisa', 'nancy', 'betty', 'helen', 'sandra', 'donna',
  'carol', 'ruth', 'sharon', 'michelle', 'laura', 'sarah', 'kimberly',
  'deborah', 'dorothy', 'lisa', 'nancy', 'karen', 'betty', 'helen'
];

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;
  
  // Check minimum length
  const hasMinLength = password.length >= 8;
  if (!hasMinLength) {
    const currentLength = password.length;
    const needed = 8 - currentLength;
    feedback.push(`Password is too short (${currentLength} characters). Add ${needed} more character${needed > 1 ? 's' : ''}.`);
  } else {
    score += 1;
  }
  
  // Check for uppercase letter
  const hasUppercase = /[A-Z]/.test(password);
  if (!hasUppercase) {
    feedback.push('Add at least one uppercase letter (A, B, C, etc.)');
  } else {
    score += 1;
  }
  
  // Check for lowercase letter
  const hasLowercase = /[a-z]/.test(password);
  if (!hasLowercase) {
    feedback.push('Add at least one lowercase letter (a, b, c, etc.)');
  } else {
    score += 1;
  }
  
  // Check for number
  const hasNumber = /\d/.test(password);
  if (!hasNumber) {
    feedback.push('Add at least one number (0, 1, 2, etc.)');
  } else {
    score += 1;
  }
  
  // Check for special character
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  if (!hasSpecialChar) {
    feedback.push('Add at least one special character (!, @, #, $, %, etc.)');
  } else {
    score += 1;
  }
  
  // Check if password is too common
  const isNotCommon = !COMMON_PASSWORDS.includes(password.toLowerCase());
  if (!isNotCommon) {
    feedback.push('This password is too common and easily guessed. Choose a more unique password.');
    score = Math.max(0, score - 2); // Heavily penalize common passwords
  }
  
  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Avoid repeating the same character more than twice in a row.');
    score = Math.max(0, score - 0.5);
  }
  
  // Check for sequential patterns
  if (/123|abc|qwe|password|admin/i.test(password)) {
    feedback.push('Avoid common patterns like "123", "abc", or dictionary words.');
    score = Math.max(0, score - 0.5);
  }
  
  // Additional checks for stronger passwords
  if (password.length >= 12) {
    score += 1;
  }
  
  if (/[A-Z].*[A-Z]/.test(password)) { // Multiple uppercase
    score += 0.5;
  }
  
  if (/\d.*\d/.test(password)) { // Multiple numbers
    score += 0.5;
  }
  
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) { // Multiple special chars
    score += 0.5;
  }
  
  // Cap the score at 4
  score = Math.min(4, Math.floor(score));
  
  const requirements = {
    minLength: hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    notCommon: isNotCommon
  };
  
  const isValid = Object.values(requirements).every(req => req === true);
  
  return {
    isValid,
    score,
    feedback,
    requirements
  };
}

export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'Very Weak';
    case 2:
      return 'Weak';
    case 3:
      return 'Fair';
    case 4:
      return 'Strong';
    default:
      return 'Very Weak';
  }
}

export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'text-red-600';
    case 2:
      return 'text-orange-500';
    case 3:
      return 'text-yellow-500';
    case 4:
      return 'text-green-600';
    default:
      return 'text-red-600';
  }
}

export function getPasswordStrengthBarColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'bg-red-500';
    case 2:
      return 'bg-orange-500';
    case 3:
      return 'bg-yellow-500';
    case 4:
      return 'bg-green-500';
    default:
      return 'bg-red-500';
  }
}