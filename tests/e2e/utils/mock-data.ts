/**
 * Mock Data for E2E Tests
 *
 * Test data fixtures and sample data
 */

import { TestUser } from './test-helpers';

// ============================================================================
// User Data
// ============================================================================

export const mockUsers: TestUser[] = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'SecurePass123!',
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'SecurePass456!',
  },
  {
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    password: 'SecurePass789!',
  },
];

export const invalidUser: TestUser = {
  name: 'Invalid User',
  email: 'invalid@example.com',
  password: 'WrongPassword123!',
};

// ============================================================================
// Interview Session Data
// ============================================================================

export const mockSessions = [
  {
    id: 'session-1',
    jobRole: 'Software Engineer',
    difficulty: 'Intermediate',
    status: 'completed',
    overallScore: 85,
    communicationScore: 90,
    technicalScore: 80,
    confidenceScore: 85,
    createdAt: new Date('2024-01-15T10:30:00Z'),
    duration: 1800, // 30 minutes in seconds
  },
  {
    id: 'session-2',
    jobRole: 'Frontend Developer',
    difficulty: 'Advanced',
    status: 'completed',
    overallScore: 72,
    communicationScore: 75,
    technicalScore: 70,
    confidenceScore: 70,
    createdAt: new Date('2024-01-14T14:00:00Z'),
    duration: 2100, // 35 minutes
  },
  {
    id: 'session-3',
    jobRole: 'Full Stack Developer',
    difficulty: 'Beginner',
    status: 'completed',
    overallScore: 91,
    communicationScore: 95,
    technicalScore: 88,
    confidenceScore: 90,
    createdAt: new Date('2024-01-13T09:15:00Z'),
    duration: 1500, // 25 minutes
  },
];

// ============================================================================
// Job Roles
// ============================================================================

export const jobRoles = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Data Engineer',
  'Machine Learning Engineer',
  'Mobile Developer',
  'QA Engineer',
  'Technical Lead',
];

// ============================================================================
// Difficulty Levels
// ============================================================================

export const difficultyLevels = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
];

// ============================================================================
// Score Categories
// ============================================================================

export const scoreCategories = [
  { name: 'Overall', min: 0, max: 100, weight: 1 },
  { name: 'Communication', min: 0, max: 100, weight: 0.3 },
  { name: 'Technical', min: 0, max: 100, weight: 0.4 },
  { name: 'Confidence', min: 0, max: 100, weight: 0.3 },
];

// ============================================================================
// Grade Labels
// ============================================================================

export const gradeLabels = [
  { min: 90, max: 100, label: 'A', description: 'Excellent' },
  { min: 80, max: 89, label: 'B', description: 'Good' },
  { min: 70, max: 79, label: 'C', description: 'Satisfactory' },
  { min: 60, max: 69, label: 'D', description: 'Needs Improvement' },
  { min: 0, max: 59, label: 'F', description: 'Fail' },
];

// ============================================================================
// Confidence Metrics
// ============================================================================

export const confidenceMetrics = [
  'eyeContact',
  'posture',
  'facialExpression',
  'speakingRate',
  'fillerWords',
  'pauses',
];

export const mockConfidenceData = {
  eyeContact: 85,
  posture: 90,
  facialExpression: 80,
  speakingRate: 75,
  fillerWords: 70,
  pauses: 85,
};

// ============================================================================
// Transcript Messages
// ============================================================================

export const mockTranscript = [
  {
    id: 'msg-1',
    role: 'assistant' as const,
    content: 'Hello! Thank you for joining this interview session. Let\'s start with a brief introduction.',
    timestamp: new Date('2024-01-15T10:30:10Z'),
  },
  {
    id: 'msg-2',
    role: 'user' as const,
    content: 'Hi! I\'m a software engineer with 5 years of experience in web development.',
    timestamp: new Date('2024-01-15T10:30:25Z'),
  },
  {
    id: 'msg-3',
    role: 'assistant' as const,
    content: 'That\'s great! Can you tell me about your experience with React and TypeScript?',
    timestamp: new Date('2024-01-15T10:30:40Z'),
  },
  {
    id: 'msg-4',
    role: 'user' as const,
    content: 'I\'ve been working with React for 4 years and TypeScript for 2 years. I\'ve built several enterprise applications.',
    timestamp: new Date('2024-01-15T10:31:00Z'),
  },
];

// ============================================================================
// AI Feedback Messages
// ============================================================================

export const mockFeedback = {
  strengths: [
    'Clear communication and articulation',
    'Good technical knowledge',
    'Confident demeanor throughout the interview',
  ],
  improvements: [
    'Consider providing more specific examples',
    'Could elaborate more on problem-solving approaches',
    'Practice STAR method for behavioral questions',
  ],
  overall: 'The candidate demonstrated strong technical skills and good communication abilities. With some practice in structuring answers, they could perform even better.',
};

// ============================================================================
// Report Data
// ============================================================================

export const mockReport = {
  sessionId: 'session-1',
  overallScore: 85,
  grade: 'B',
  communicationScore: 90,
  technicalScore: 80,
  confidenceScore: 85,
  strengths: mockFeedback.strengths,
  improvements: mockFeedback.improvements,
  overallFeedback: mockFeedback.overall,
  transcript: mockTranscript,
  confidenceHistory: [
    { timestamp: new Date('2024-01-15T10:30:00Z'), score: 80 },
    { timestamp: new Date('2024-01-15T10:31:00Z'), score: 85 },
    { timestamp: new Date('2024-01-15T10:32:00Z'), score: 82 },
    { timestamp: new Date('2024-01-15T10:33:00Z'), score: 88 },
    { timestamp: new Date('2024-01-15T10:34:00Z'), score: 85 },
  ],
};

// ============================================================================
// API Response Mocks
// ============================================================================

export const mockSessionListResponse = {
  sessions: mockSessions,
  total: mockSessions.length,
  page: 1,
  pageSize: 10,
};

export const mockSessionDetailResponse = {
  session: mockSessions[0],
  transcript: mockTranscript,
  confidenceHistory: mockReport.confidenceHistory,
};

export const mockAnalyticsResponse = {
  totalSessions: 3,
  completedSessions: 3,
  averageScore: 82.7,
  gradeDistribution: {
    A: 1,
    B: 1,
    C: 1,
    D: 0,
    F: 0,
  },
  recentSessions: mockSessions,
};

// ============================================================================
// Error Messages
// ============================================================================

export const errorMessages = {
  invalidCredentials: 'Invalid email or password',
  emailRequired: 'Email is required',
  passwordRequired: 'Password is required',
  nameRequired: 'Name is required',
  invalidEmail: 'Please enter a valid email address',
  passwordTooShort: 'Password must be at least 8 characters',
  sessionNotFound: 'Session not found',
  unauthorized: 'You must be logged in to access this resource',
  serverError: 'Something went wrong. Please try again.',
};

// ============================================================================
// Form Validation Test Data
// ============================================================================

export const invalidFormData = {
  emptyEmail: {
    email: '',
    password: 'Password123!',
    name: 'Test User',
  },
  invalidEmail: {
    email: 'not-an-email',
    password: 'Password123!',
    name: 'Test User',
  },
  emptyPassword: {
    email: 'test@example.com',
    password: '',
    name: 'Test User',
  },
  shortPassword: {
    email: 'test@example.com',
    password: '123',
    name: 'Test User',
  },
  emptyName: {
    email: 'test@example.com',
    password: 'Password123!',
    name: '',
  },
};

// ============================================================================
// URL Patterns
// ============================================================================

export const urlPatterns = {
  login: /\/login/,
  register: /\/register/,
  dashboard: /\/dashboard/,
  interview: /\/interview/,
  sessionReport: /\/dashboard\/[\w-]+/,
  apiSessions: /\/api\/sessions/,
  apiAuth: /\/api\/auth/,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get grade label from score
 */
export function getGradeFromScore(score: number): string {
  const grade = gradeLabels.find((g) => score >= g.min && score <= g.max);
  return grade?.label || 'F';
}

/**
 * Calculate weighted score
 */
export function calculateWeightedScore(scores: Record<string, number>): number {
  let total = 0;
  let totalWeight = 0;

  for (const category of scoreCategories) {
    if (category.name !== 'Overall') {
      const score = scores[category.name.toLowerCase()];
      if (score !== undefined) {
        total += score * category.weight;
        totalWeight += category.weight;
      }
    }
  }

  return totalWeight > 0 ? Math.round(total / totalWeight) : 0;
}

/**
 * Format duration from seconds to human-readable
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return remainingSeconds > 0
    ? `${minutes}m ${remainingSeconds}s`
    : `${minutes}m`;
}

/**
 * Generate mock confidence history
 */
export function generateConfidenceHistory(
  baseScore: number,
  points = 10
): Array<{ timestamp: Date; score: number }> {
  const history = [];
  const now = Date.now();

  for (let i = 0; i < points; i++) {
    const variation = Math.floor(Math.random() * 20) - 10;
    history.push({
      timestamp: new Date(now - (points - i) * 60000),
      score: Math.max(0, Math.min(100, baseScore + variation)),
    });
  }

  return history;
}
