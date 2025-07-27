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
        const response = await fetch('./env.json');
        const config = await response.json();
        
        // Try multiple possible key names for flexibility
        const apiKey = config.perspective_api_key || 
                      config.PERSPECTIVE_API_KEY || 
                      config.perspectiveApiKey ||
                      'AIzaSyAnJ55WLjMfyOCU_7pcNCjdMemauS7Ls_M'; // Fallback to provided key
        
        cachedApiKey = apiKey;
        return apiKey;
      } catch (error) {
        console.warn('Failed to load Perspective API configuration:', error);
        // Use the provided API key as fallback
        cachedApiKey = 'AIzaSyAnJ55WLjMfyOCU_7pcNCjdMemauS7Ls_M';
        return cachedApiKey;
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
  