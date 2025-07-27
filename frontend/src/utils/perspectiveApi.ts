// Perspective API integration for comment moderation
export interface PerspectiveApiResponse {
    attributeScores: {
      [key: string]: {
        summaryScore: {
          value: number;
        };
      };
    };
  }
  
  export interface ModerationResult {
    isAppropriate: boolean;
    reason?: string;
    scores?: { [key: string]: number };
  }
  
  // Configuration for Perspective API
  const PERSPECTIVE_API_URL = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze';
  
  // Toxicity threshold (0-1, where 1 is most toxic)
  const TOXICITY_THRESHOLD = 0.7;
  const SEVERE_TOXICITY_THRESHOLD = 0.5;
  const IDENTITY_ATTACK_THRESHOLD = 0.7;
  const INSULT_THRESHOLD = 0.7;
  const PROFANITY_THRESHOLD = 0.7;
  const THREAT_THRESHOLD = 0.7;
  
  // Cache for the API key to avoid multiple config loads
  let cachedApiKey: string | null = null;
  let configLoadPromise: Promise<string | null> | null = null;
  
  async function loadPerspectiveApiKey(): Promise<string | null> {
    // Return cached key if available
    if (cachedApiKey !== null) {
      return cachedApiKey;
    }
  
    // Return existing promise if already loading
    if (configLoadPromise) {
      return configLoadPromise;
    }
  
      // Create new promise to load config
  configLoadPromise = (async () => {
    try {
      // First try to get from Vite environment variables
      const viteApiKey = import.meta.env.VITE_PERSPECTIVE_API_KEY;
      if (viteApiKey && viteApiKey !== 'your_perspective_api_key_here') {
        cachedApiKey = viteApiKey;
        return viteApiKey;
      }

      // Fallback: try to load from env.json file
      const response = await fetch('./env.json');
      const config = await response.json();
      
      // Try multiple possible key names for flexibility
      const apiKey = config.perspective_api_key || 
                    config.PERSPECTIVE_API_KEY || 
                    config.perspectiveApiKey;
      
      if (apiKey && apiKey !== 'your_perspective_api_key_here') {
        cachedApiKey = apiKey;
        return apiKey;
      }

      // No valid API key found
      console.warn('No valid Perspective API key found. Please set VITE_PERSPECTIVE_API_KEY in your environment.');
      cachedApiKey = null;
      return null;
    } catch (error) {
      console.warn('Failed to load Perspective API configuration:', error);
      console.warn('Please set VITE_PERSPECTIVE_API_KEY in your environment variables.');
      cachedApiKey = null;
      return null;
    }
  })();
  
    return configLoadPromise;
  }
  
  export async function moderateComment(text: string): Promise<ModerationResult> {
    try {
      // Load API key from configuration
      const apiKey = await loadPerspectiveApiKey();
      
      if (!apiKey) {
        console.warn('Perspective API key not available, skipping moderation');
        return { isAppropriate: true };
      }
  
      const requestBody = {
        comment: { text },
        requestedAttributes: {
          TOXICITY: {},
          SEVERE_TOXICITY: {},
          IDENTITY_ATTACK: {},
          INSULT: {},
          PROFANITY: {},
          THREAT: {}
        },
        languages: ['en'],
        doNotStore: true
      };
  
      const response = await fetch(`${PERSPECTIVE_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
  
      if (!response.ok) {
        console.error('Perspective API error:', response.status, response.statusText);
        // On API error, allow the comment (fail open)
        return { isAppropriate: true };
      }
  
      const data: PerspectiveApiResponse = await response.json();
      const scores = data.attributeScores;
  
      // Extract scores
      const toxicityScore = scores.TOXICITY?.summaryScore?.value || 0;
      const severeToxicityScore = scores.SEVERE_TOXICITY?.summaryScore?.value || 0;
      const identityAttackScore = scores.IDENTITY_ATTACK?.summaryScore?.value || 0;
      const insultScore = scores.INSULT?.summaryScore?.value || 0;
      const profanityScore = scores.PROFANITY?.summaryScore?.value || 0;
      const threatScore = scores.THREAT?.summaryScore?.value || 0;
  
      // Check if any score exceeds threshold
      const violations = [];
      if (severeToxicityScore > SEVERE_TOXICITY_THRESHOLD) violations.push('severe toxicity');
      if (threatScore > THREAT_THRESHOLD) violations.push('threats');
      if (identityAttackScore > IDENTITY_ATTACK_THRESHOLD) violations.push('identity attacks');
      if (insultScore > INSULT_THRESHOLD) violations.push('insults');
      if (profanityScore > PROFANITY_THRESHOLD) violations.push('profanity');
      if (toxicityScore > TOXICITY_THRESHOLD) violations.push('toxicity');
  
      const isAppropriate = violations.length === 0;
      const reason = violations.length > 0 
        ? `Your comment was flagged for: ${violations.join(', ')}. Please revise your comment to be more respectful.`
        : undefined;
  
      return {
        isAppropriate,
        reason,
        scores: {
          toxicity: toxicityScore,
          severeToxicity: severeToxicityScore,
          identityAttack: identityAttackScore,
          insult: insultScore,
          profanity: profanityScore,
          threat: threatScore
        }
      };
    } catch (error) {
      console.error('Error calling Perspective API:', error);
      // On error, allow the comment (fail open)
      return { isAppropriate: true };
    }
  }
  