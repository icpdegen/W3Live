import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, User, Clock, LogIn, AlertCircle, RefreshCw, Wifi, WifiOff, Calendar, Shield, Edit } from 'lucide-react';
import { useEventComments, useCreateComment, useUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { CreateCommentRequest } from '../types/events';
import { moderateComment, ModerationResult } from '../utils/perspectiveApi';
import LoginButton from './LoginButton';

interface CommentsSectionProps {
  eventId: bigint;
}

interface ErrorState {
  type: 'validation' | 'authentication' | 'network' | 'permission' | 'server' | 'backend' | 'event_not_found' | 'invalid_event' | 'moderation' | 'unknown';
  message: string;
  details?: string;
  canRetry?: boolean;
  originalError?: any;
}

export default function CommentsSection({ eventId }: CommentsSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [submitError, setSubmitError] = useState<ErrorState | null>(null);
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);
  const [lastModeratedText, setLastModeratedText] = useState<string>('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [isModeratingComment, setIsModeratingComment] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useUserProfile();
  const { data: comments = [], isLoading, error, refetch, isRefetching } = useEventComments(eventId);
  const createComment = useCreateComment();

  const isAuthenticated = !!identity;
  const hasUsername = !!userProfile?.name;

  // Auto-scroll to top when new comments are added (since newest are at top)
  useEffect(() => {
    if (commentsContainerRef.current && comments.length > 0) {
      commentsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [comments.length]);

  // Auto-refresh comments every 15 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refetch();
    }, 15000);

    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  // Clear moderation result when comment text changes
  useEffect(() => {
    if (moderationResult && commentText !== lastModeratedText) {
      setModerationResult(null);
      setLastModeratedText('');
    }
  }, [commentText, moderationResult, lastModeratedText]);

  const categorizeError = (error: any): ErrorState => {
    // Log the complete error details to console for troubleshooting
    console.error('Comment posting error - Full details:', {
      error,
      errorMessage: error?.message,
      errorString: error?.toString(),
      errorStack: error?.stack,
      errorName: error?.name,
      errorCode: error?.code,
      timestamp: new Date().toISOString(),
      eventId: eventId.toString(),
      commentText: commentText.trim(),
      userProfile,
      isAuthenticated,
      hasUsername
    });

    // Extract the actual error message from the backend
    let backendMessage = '';
    let errorMessage = '';

    if (error?.message) {
      errorMessage = error.message;
      backendMessage = error.message;
    } else if (error?.toString) {
      errorMessage = error.toString();
      backendMessage = error.toString();
    } else {
      errorMessage = 'Unknown error occurred';
      backendMessage = 'Unknown error occurred';
    }

    // Moderation errors (new)
    if (errorMessage.includes('moderation') || 
        errorMessage.includes('inappropriate') ||
        errorMessage.includes('flagged')) {
      return {
        type: 'moderation',
        message: backendMessage,
        details: 'Your comment was flagged by our content moderation system. Please revise your comment to be more respectful and try again.',
        canRetry: false,
        originalError: error
      };
    }

    // Event validation errors
    if (errorMessage.includes('Event not found') || 
        errorMessage.includes('event you\'re trying to comment on may have been deleted') ||
        errorMessage.includes('does not exist')) {
      return {
        type: 'event_not_found',
        message: backendMessage,
        details: 'The event you\'re trying to comment on no longer exists or has been deleted. Please refresh the page to see current events.',
        canRetry: false,
        originalError: error
      };
    }

    if (errorMessage.includes('Cannot post comments for invalid events') ||
        errorMessage.includes('invalid events') ||
        errorMessage.includes('select a valid event')) {
      return {
        type: 'invalid_event',
        message: backendMessage,
        details: 'Cannot post comments for this event. Please navigate to a valid event page.',
        canRetry: false,
        originalError: error
      };
    }

    // Network-related errors
    if (errorMessage.includes('NetworkError') || 
        errorMessage.includes('fetch') || 
        errorMessage.includes('network') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('timeout')) {
      return {
        type: 'network',
        message: backendMessage,
        details: 'Network connection issue. Please check your internet connection and try again.',
        canRetry: true,
        originalError: error
      };
    }
    
    // Authentication errors
    if (errorMessage.includes('Authentication required') ||
        errorMessage.includes('not authenticated') ||
        errorMessage.includes('login') ||
        errorMessage.includes('Unauthorized')) {
      return {
        type: 'authentication',
        message: backendMessage,
        details: 'Please log in with Internet Identity to post comments.',
        canRetry: false,
        originalError: error
      };
    }
    
    // Permission errors
    if (errorMessage.includes('permission') ||
        errorMessage.includes('username') ||
        errorMessage.includes('profile')) {
      return {
        type: 'permission',
        message: backendMessage,
        details: errorMessage.includes('username') 
          ? 'Please set up your username in your profile before posting comments.'
          : 'You do not have permission to post comments.',
        canRetry: false,
        originalError: error
      };
    }
    
    // Backend-specific errors (traps, canister errors)
    if (errorMessage.includes('trap') ||
        errorMessage.includes('canister') ||
        errorMessage.includes('Backend')) {
      return {
        type: 'backend',
        message: backendMessage,
        details: 'Backend service error. Please try again or contact support.',
        canRetry: true,
        originalError: error
      };
    }
    
    // Server/general errors
    if (errorMessage.includes('server') ||
        errorMessage.includes('internal') ||
        errorMessage.includes('500')) {
      return {
        type: 'server',
        message: backendMessage,
        details: 'Server error. Please try again later.',
        canRetry: true,
        originalError: error
      };
    }
    
    // Validation errors (client-side)
    if (errorMessage.includes('empty') ||
        errorMessage.includes('required') ||
        errorMessage.includes('too long') ||
        errorMessage.includes('invalid')) {
      return {
        type: 'validation',
        message: backendMessage,
        details: errorMessage,
        canRetry: false,
        originalError: error
      };
    }
    
    // Unknown errors - show the exact backend message
    return {
      type: 'unknown',
      message: backendMessage,
      details: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
      canRetry: true,
      originalError: error
    };
  };

  const getErrorIcon = (errorType: ErrorState['type']) => {
    switch (errorType) {
      case 'network':
        return <WifiOff className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />;
      case 'authentication':
        return <LogIn className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />;
      case 'permission':
        return <User className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />;
      case 'event_not_found':
      case 'invalid_event':
        return <MessageCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />;
      case 'moderation':
        return <Shield className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />;
      case 'backend':
      case 'server':
        return <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />;
    }
  };

  const getErrorColor = (errorType: ErrorState['type']) => {
    switch (errorType) {
      case 'network':
        return 'bg-orange-900/30 border-orange-500/50';
      case 'authentication':
        return 'bg-blue-900/30 border-blue-500/50';
      case 'permission':
        return 'bg-yellow-900/30 border-yellow-500/50';
      case 'event_not_found':
      case 'invalid_event':
        return 'bg-red-900/30 border-red-500/50';
      case 'moderation':
        return 'bg-purple-900/30 border-purple-500/50';
      case 'backend':
        return 'bg-purple-900/30 border-purple-500/50';
      case 'server':
        return 'bg-red-900/30 border-red-500/50';
      default:
        return 'bg-red-900/30 border-red-500/50';
    }
  };

  const handleRetry = async () => {
    if (!submitError?.canRetry) return;
    
    setIsRetrying(true);
    setSubmitError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay
      await handleSubmit(new Event('submit') as any, true);
    } catch (error) {
      // Error will be handled by handleSubmit
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, isRetry: boolean = false) => {
    e.preventDefault();
    if (!isRetry) {
      setSubmitError(null);
      setModerationResult(null);
      setLastModeratedText('');
    }
    
    // Client-side validation
    if (!commentText.trim()) {
      setSubmitError({
        type: 'validation',
        message: 'Comment cannot be empty',
        details: 'Please enter a comment before submitting.',
        canRetry: false
      });
      return;
    }

    if (commentText.trim().length > 1000) {
      setSubmitError({
        type: 'validation',
        message: 'Comment too long',
        details: 'Comments must be 1000 characters or less.',
        canRetry: false
      });
      return;
    }

    if (!isAuthenticated) {
      setSubmitError({
        type: 'authentication',
        message: 'Authentication required',
        details: 'Please log in with Internet Identity to post comments.',
        canRetry: false
      });
      return;
    }

    if (!hasUsername) {
      setSubmitError({
        type: 'permission',
        message: 'Username required',
        details: 'Please set up your username in your profile before posting comments.',
        canRetry: false
      });
      return;
    }

    // Enhanced event ID validation
    if (!eventId || eventId <= 0n) {
      setSubmitError({
        type: 'invalid_event',
        message: 'Invalid event ID',
        details: 'Cannot post comments for this event. Please navigate to a valid event page.',
        canRetry: false
      });
      return;
    }

    // Content moderation check
    try {
      setIsModeratingComment(true);
      console.log('Starting content moderation for comment:', {
        text: commentText.trim(),
        timestamp: new Date().toISOString()
      });

      const moderation = await moderateComment(commentText.trim());
      setModerationResult(moderation);
      setLastModeratedText(commentText.trim());

      if (!moderation.isAppropriate) {
        setSubmitError({
          type: 'moderation',
          message: 'Comment flagged by moderation',
          details: moderation.reason || 'Your comment was flagged as inappropriate. Please revise your comment to be more respectful.',
          canRetry: false
        });
        setIsModeratingComment(false);
        return;
      }

      console.log('Comment passed moderation:', {
        scores: moderation.scores,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Moderation error:', error);
      // If moderation fails, we'll allow the comment to proceed (fail open)
      console.log('Moderation failed, allowing comment to proceed');
    } finally {
      setIsModeratingComment(false);
    }

    try {
      const commentData: CreateCommentRequest = {
        eventId,
        text: commentText.trim(),
        author: userProfile!.name
      };

      // Log the request payload for troubleshooting (with serializable eventId)
      console.log('Comment submission request - Will be stored with unique metadata key:', {
        commentData: {
          ...commentData,
          eventId: eventId.toString() // Convert BigInt to string for logging
        },
        timestamp: new Date().toISOString(),
        eventId: eventId.toString(),
        userPrincipal: identity?.getPrincipal().toString(),
        userProfile,
        moderationPassed: true
      });
      
      await createComment.mutateAsync(commentData);
      setCommentText('');
      setSubmitError(null);
      setModerationResult(null);
      setLastModeratedText('');
      
      // Log successful submission
      console.log('Comment submitted successfully - Stored with unique metadata key:', {
        eventId: eventId.toString(),
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Comment submission failed:', error);
      const categorizedError = categorizeError(error);
      setSubmitError(categorizedError);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const formatFullDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatDateOnly = (timestamp: number) => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTimeOnly = (timestamp: number) => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleTimeString('en-US', options);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const scrollToTop = () => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (commentsContainerRef.current) {
      const container = commentsContainerRef.current;
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  };

  // Show warning for invalid event IDs
  if (!eventId || eventId <= 0n) {
    return (
      <div className="space-y-6">
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-white mb-2">Comments Unavailable</h4>
          <p className="text-red-200 mb-4">
            Comments cannot be loaded for this event. The event may be invalid or not properly loaded.
          </p>
          <p className="text-red-300 text-sm">
            Please refresh the page or navigate to a valid event to view and post comments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {isAuthenticated ? (
        hasUsername ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">{userProfile.name}</p>
                <p className="text-purple-300 text-sm">Posting as</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Your Comment
              </label>
              <textarea
                value={commentText}
                onChange={(e) => {
                  setCommentText(e.target.value);
                  if (submitError?.type === 'validation' || submitError?.type === 'moderation') {
                    setSubmitError(null);
                  }
                  if (moderationResult && e.target.value !== lastModeratedText) {
                    setModerationResult(null);
                    setLastModeratedText('');
                  }
                }}
                placeholder="Share your thoughts about this event..."
                rows={3}
                className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                required
                maxLength={1000}
                disabled={createComment.isPending || isRetrying || isModeratingComment}
              />
              <div className="mt-1 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Shield className="w-3 h-3 text-purple-400" />
                  <span className="text-purple-300">Comments are moderated for safety</span>
                </div>
                <span className="text-purple-300">{commentText.length}/1000</span>
              </div>
            </div>

            {/* Moderation Status */}
            {moderationResult && moderationResult.isAppropriate && (
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-green-200 text-sm">Comment approved by moderation</span>
                </div>
              </div>
            )}

            {/* Enhanced Error Display */}
            {submitError && (
              <div className={`rounded-lg p-4 ${getErrorColor(submitError.type)}`}>
                <div className="flex items-start space-x-3">
                  {getErrorIcon(submitError.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-red-200">
                        {submitError.type === 'moderation' ? 'Comment Blocked by Moderation' : 'Error Posting Comment'}
                      </h4>
                      {submitError.canRetry && (
                        <button
                          type="button"
                          onClick={handleRetry}
                          disabled={isRetrying}
                          className="flex items-center space-x-1 text-xs text-red-300 hover:text-red-200 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                          <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
                        </button>
                      )}
                    </div>
                    
                    {/* Display the exact backend error message */}
                    <div className="mb-2">
                      <p className="text-sm font-medium text-red-200 mb-1">
                        {submitError.type === 'moderation' ? 'Moderation Result:' : 'Error Message:'}
                      </p>
                      <p className="text-sm text-red-300 font-mono bg-black/20 p-2 rounded border-l-2 border-red-400">
                        {submitError.message}
                      </p>
                    </div>
                    
                    {/* Additional context */}
                    {submitError.details && (
                      <p className="text-sm text-red-300 leading-relaxed mb-2">
                        {submitError.details}
                      </p>
                    )}

                    {/* Edit suggestion for moderation errors */}
                    {submitError.type === 'moderation' && (
                      <div className="mt-3 bg-black/20 p-3 rounded border border-purple-500/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <Edit className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-medium text-purple-200">Suggestion</span>
                        </div>
                        <p className="text-sm text-purple-300">
                          Try rephrasing your comment to be more constructive and respectful. 
                          Avoid personal attacks, offensive language, or inflammatory content.
                        </p>
                      </div>
                    )}
                    
                    {/* Technical details for debugging */}
                    <details className="mt-3">
                      <summary className="text-xs text-red-400 cursor-pointer hover:text-red-300">
                        Technical Details (for troubleshooting)
                      </summary>
                      <div className="mt-2 text-xs text-red-400 bg-black/20 p-2 rounded">
                        <p><strong>Error Type:</strong> {submitError.type}</p>
                        <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
                        <p><strong>Event ID:</strong> {eventId.toString()}</p>
                        <p><strong>User Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
                        <p><strong>Has Username:</strong> {hasUsername ? 'Yes' : 'No'}</p>
                        {moderationResult && (
                          <p><strong>Moderation Scores:</strong> {JSON.stringify(moderationResult.scores, null, 2)}</p>
                        )}
                        {submitError.originalError && (
                          <p><strong>Original Error:</strong> {JSON.stringify(submitError.originalError, null, 2)}</p>
                        )}
                      </div>
                    </details>
                    
                    {/* Additional help based on error type */}
                    {submitError.type === 'network' && (
                      <div className="mt-3 text-xs text-red-400">
                        <p>• Check your internet connection</p>
                        <p>• Try refreshing the page</p>
                        <p>• Wait a moment and try again</p>
                      </div>
                    )}
                    
                    {submitError.type === 'backend' && (
                      <div className="mt-3 text-xs text-red-400">
                        <p>• Try refreshing the page and logging in again</p>
                        <p>• Contact support if the issue persists</p>
                      </div>
                    )}
                    
                    {submitError.type === 'permission' && submitError.details?.includes('username') && (
                      <div className="mt-3 text-xs text-red-400">
                        <p>• Go to "My Dashboard" to set up your username</p>
                        <p>• Username must be 3-20 characters long</p>
                        <p>• Only letters, numbers, hyphens, and underscores allowed</p>
                      </div>
                    )}

                    {(submitError.type === 'event_not_found' || submitError.type === 'invalid_event') && (
                      <div className="mt-3 text-xs text-red-400">
                        <p>• Refresh the page to reload the event</p>
                        <p>• Navigate back to the events list and select a valid event</p>
                        <p>• The event may have been deleted by its organizer</p>
                      </div>
                    )}

                    {submitError.type === 'moderation' && (
                      <div className="mt-3 text-xs text-red-400">
                        <p>• Review your comment for potentially offensive content</p>
                        <p>• Try rephrasing to be more constructive and respectful</p>
                        <p>• Avoid personal attacks, threats, or inflammatory language</p>
                        <p>• Focus on discussing the event content rather than attacking others</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={createComment.isPending || isRetrying || isModeratingComment || !commentText.trim()}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isModeratingComment ? (
                <>
                  <Shield className="w-4 h-4 animate-pulse" />
                  <span>Checking content...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {createComment.isPending || isRetrying 
                      ? (isRetrying ? 'Retrying...' : 'Posting...') 
                      : 'Post Comment'
                    }
                  </span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-white mb-2">Username Required</h4>
            <p className="text-yellow-200 mb-4">
              Please set up your username in your profile before posting comments.
            </p>
            <p className="text-yellow-300 text-sm">
              Go to "My Dashboard" to set up your username.
            </p>
          </div>
        )
      ) : (
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20 text-center">
          <MessageCircle className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-white mb-2">Join the Conversation</h4>
          <p className="text-purple-200 mb-4">
            Log in with Internet Identity to share your thoughts and engage with other viewers.
          </p>
          <p className="text-purple-300 text-sm mb-4">
            Your comments will be posted using your profile username.
          </p>
          <LoginButton />
        </div>
      )}

      {/* Comments List Header with Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Comments ({comments.length})</span>
            {comments.length > 0 && (
              <span className="text-xs text-purple-300 bg-purple-900/30 px-2 py-1 rounded-full">
                Newest first
              </span>
            )}
          </h4>
          
          <div className="flex items-center space-x-2">
            {/* Auto-refresh toggle */}
            <button
              onClick={toggleAutoRefresh}
              className={`flex items-center space-x-1 text-xs px-2 py-1 rounded transition-colors ${
                autoRefresh 
                  ? 'bg-green-600/20 text-green-300 hover:bg-green-600/30' 
                  : 'bg-gray-600/20 text-gray-300 hover:bg-gray-600/30'
              }`}
              title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
            >
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              <span>Auto</span>
            </button>

            {/* Manual refresh button */}
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="flex items-center space-x-1 text-sm text-purple-300 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              <span>{isRefetching ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <WifiOff className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-200 text-sm font-medium">Error loading comments</p>
                <p className="text-red-300 text-xs mt-1">
                  Unable to load comments. Please try refreshing the page.
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-2 flex items-center space-x-1 text-xs text-red-300 hover:text-red-200 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Try again</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-purple-200">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <p className="text-purple-200">No comments yet</p>
            <p className="text-purple-300 text-sm">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="comments-section">
            {/* Scroll controls for large comment lists */}
            {comments.length > 5 && (
              <div className="flex items-center justify-between mb-4 text-xs text-purple-400">
                <button
                  onClick={scrollToTop}
                  className="flex items-center space-x-1 hover:text-purple-300 transition-colors"
                >
                  <span>↑ Newest comments</span>
                </button>
                <span>Showing all {comments.length} comments</span>
                <button
                  onClick={scrollToBottom}
                  className="flex items-center space-x-1 hover:text-purple-300 transition-colors"
                >
                  <span>Oldest comments ↓</span>
                </button>
              </div>
            )}

            {/* Comments Container - Each comment is displayed as a unique entry, newest first */}
            <div 
              ref={commentsContainerRef}
              className="comments-container max-h-96 overflow-y-auto space-y-4 bg-black/10 rounded-lg p-4 border border-purple-500/20"
            >
              {comments.map((comment) => (
                <div
                  key={comment.id.toString()} // Each comment has its unique backend-generated ID
                  className="comment-item bg-black/30 rounded-lg p-4 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-200"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-white">
                              {comment.author || 'Anonymous User'}
                            </span>
                            <span className="text-purple-300 text-sm flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimestamp(comment.timestamp)}</span>
                            </span>
                          </div>
                          
                          {/* Enhanced Date and Time Display */}
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="flex items-center space-x-1 text-xs text-purple-400 bg-purple-900/20 px-2 py-1 rounded">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDateOnly(comment.timestamp)}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-purple-400 bg-purple-900/20 px-2 py-1 rounded">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeOnly(comment.timestamp)}</span>
                            </div>
                          </div>
                          
                          {/* Full date/time tooltip on hover */}
                          <div className="text-xs text-purple-500 mb-2" title={formatFullDateTime(comment.timestamp)}>
                            Posted on {formatFullDateTime(comment.timestamp)}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-purple-100 text-sm leading-relaxed whitespace-pre-wrap">
                        {comment.text}
                      </p>
                      
                      {/* Debug info for development - shows unique comment ID */}
                      {process.env.NODE_ENV === 'development' && (
                        <p className="text-xs text-purple-400 mt-2 opacity-50">
                          Unique Backend ID: {comment.id.toString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Scroll anchor for reference */}
              <div ref={commentsEndRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
