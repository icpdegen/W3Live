// Event types for the frontend
export interface EventVideo {
    title: string;
    url: string;
    posterImagePath: string;
    uploadedVideoPath: string;
  }
  
  export interface Event {
    id: bigint;
    title: string;
    description: string;
    heroImagePath: string;
    placeholderImagePath: string;
    hlsUrl: string;
    isPrivate: boolean;
    isDraft: boolean;
    videos: EventVideo[];
  }
  
  export interface CreateEventRequest {
    title: string;
    description: string;
    heroImagePath: string;
    placeholderImagePath: string;
    hlsUrl: string;
    isPrivate: boolean;
    isDraft: boolean;
    videos: EventVideo[];
  }
  
  export interface Comment {
    id: bigint;
    eventId: bigint;
    text: string;
    timestamp: number;
    author: string;
  }
  
  export interface CreateCommentRequest {
    eventId: bigint;
    text: string;
    author: string;
  }
  
  export interface LikesData {
    totalLikes: number;
    userHasLiked: boolean;
  }
  
  export interface ReactionsData {
    reactionCounts: { [key: string]: number };
    userReaction: string | null;
  }
  