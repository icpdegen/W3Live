import React, { useState } from 'react';
import { Heart, ThumbsUp, Flame, Hand, Laugh, User, LogIn } from 'lucide-react';
import { useEventLikes, useEventReactions, useToggleLike, useSetReaction, useUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from 'ic-use-internet-identity';
import LoginButton from './LoginButton';

interface LikesAndReactionsProps {
  eventId: bigint;
  compact?: boolean; // For use in event listings
}

const EMOJI_REACTIONS = [
  { emoji: '❤️', name: 'heart', icon: Heart, color: 'text-red-400' },
  { emoji: '👍', name: 'thumbs_up', icon: ThumbsUp, color: 'text-blue-400' },
  { emoji: '🔥', name: 'fire', icon: Flame, color: 'text-orange-400' },
  { emoji: '👏', name: 'clap', icon: Hand, color: 'text-green-400' },
  { emoji: '😂', name: 'laugh', icon: Laugh, color: 'text-yellow-400' }
];

export default function LikesAndReactions({ eventId, compact = false }: LikesAndReactionsProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useUserProfile();
  
  const { data: likesData, isLoading: likesLoading } = useEventLikes(eventId);
  const { data: reactionsData, isLoading: reactionsLoading } = useEventReactions(eventId);
  const toggleLike = useToggleLike();
  const setReaction = useSetReaction();

  const isAuthenticated = !!identity;
  const hasUsername = !!userProfile?.name;
  const canInteract = isAuthenticated && hasUsername;

  const totalLikes = likesData?.totalLikes || 0;
  const userHasLiked = likesData?.userHasLiked || false;
  const userReaction = reactionsData?.userReaction;
  const reactionCounts = reactionsData?.reactionCounts || {};

  const handleToggleLike = async () => {
    if (!canInteract) return;
    
    try {
      await toggleLike.mutateAsync(eventId);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleSetReaction = async (reactionName: string) => {
    if (!canInteract) return;
    
    try {
      // If user clicks the same reaction they already have, remove it
      const newReaction = userReaction === reactionName ? null : reactionName;
      await setReaction.mutateAsync({ eventId, reaction: newReaction });
      setShowReactionPicker(false);
    } catch (error) {
      console.error('Failed to set reaction:', error);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-4 text-sm">
        {/* Likes */}
        <div className="flex items-center space-x-1">
          <Heart className={`w-4 h-4 ${userHasLiked ? 'text-red-400 fill-current' : 'text-purple-300'}`} />
          <span className="text-purple-200">{totalLikes}</span>
        </div>

        {/* Reactions */}
        {EMOJI_REACTIONS.map(({ name, emoji }) => {
          const count = reactionCounts[name] || 0;
          if (count === 0) return null;
          
          return (
            <div key={name} className="flex items-center space-x-1">
              <span className="text-sm">{emoji}</span>
              <span className="text-purple-200">{count}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Likes Section - Independent from reactions */}
      <div className="bg-black/20 rounded-lg p-4 border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Heart className={`w-5 h-5 ${userHasLiked ? 'text-red-400 fill-current' : 'text-purple-300'}`} />
              <span className="text-white font-medium">{totalLikes} {totalLikes === 1 ? 'Like' : 'Likes'}</span>
            </div>
          </div>

          {canInteract ? (
            <button
              onClick={handleToggleLike}
              disabled={toggleLike.isPending || likesLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                userHasLiked
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Heart className={`w-4 h-4 ${userHasLiked ? 'fill-current' : ''}`} />
              <span>{toggleLike.isPending ? 'Loading...' : userHasLiked ? 'Unlike' : 'Like'}</span>
            </button>
          ) : !isAuthenticated ? (
            <div className="text-center">
              <p className="text-purple-300 text-sm mb-2">Login to like this event</p>
              <LoginButton />
            </div>
          ) : (
            <div className="text-center">
              <p className="text-purple-300 text-sm">Set up your username to like events</p>
            </div>
          )}
        </div>
      </div>

      {/* Reactions Section - Independent from likes */}
      <div className="bg-black/20 rounded-lg p-4 border border-purple-500/20">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium">Emoji Reactions</h4>
            
            {canInteract && (
              <div className="relative">
                <button
                  onClick={() => setShowReactionPicker(!showReactionPicker)}
                  disabled={setReaction.isPending || reactionsLoading}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {userReaction ? (
                    <>
                      <span>{EMOJI_REACTIONS.find(r => r.name === userReaction)?.emoji}</span>
                      <span>Change Reaction</span>
                    </>
                  ) : (
                    <>
                      <span>😊</span>
                      <span>Add Reaction</span>
                    </>
                  )}
                </button>

                {/* Reaction Picker */}
                {showReactionPicker && (
                  <div className="absolute top-full right-0 mt-2 bg-black/90 backdrop-blur-sm border border-purple-500/30 rounded-lg p-3 z-10 min-w-max">
                    <div className="grid grid-cols-5 gap-2">
                      {EMOJI_REACTIONS.map(({ name, emoji }) => (
                        <button
                          key={name}
                          onClick={() => handleSetReaction(name)}
                          disabled={setReaction.isPending}
                          className={`p-2 rounded-lg transition-all duration-200 hover:bg-purple-600/50 ${
                            userReaction === name ? 'bg-purple-600/70 ring-2 ring-purple-400' : ''
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={name.replace('_', ' ')}
                        >
                          <span className="text-xl">{emoji}</span>
                        </button>
                      ))}
                    </div>
                    
                    {userReaction && (
                      <div className="mt-2 pt-2 border-t border-purple-500/30">
                        <button
                          onClick={() => handleSetReaction(userReaction)}
                          disabled={setReaction.isPending}
                          className="w-full text-sm text-purple-300 hover:text-white transition-colors disabled:opacity-50"
                        >
                          Remove Reaction
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reaction Counts Display */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {EMOJI_REACTIONS.map(({ name, emoji, color }) => {
              const count = reactionCounts[name] || 0;
              const isUserReaction = userReaction === name;
              
              return (
                <div
                  key={name}
                  className={`flex items-center space-x-2 p-3 rounded-lg border transition-all duration-200 ${
                    isUserReaction
                      ? 'border-purple-400 bg-purple-600/20'
                      : count > 0
                      ? 'border-purple-500/30 bg-black/30'
                      : 'border-purple-500/20 bg-black/20 opacity-60'
                  }`}
                >
                  <span className="text-lg">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{count}</p>
                    <p className="text-xs text-purple-300 capitalize truncate">
                      {name.replace('_', ' ')}
                    </p>
                  </div>
                  {isUserReaction && (
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Login prompt for non-authenticated users */}
          {!canInteract && (
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20 text-center">
              {!isAuthenticated ? (
                <>
                  <User className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-purple-200 mb-3">Login to react to this event</p>
                  <LoginButton />
                </>
              ) : (
                <>
                  <User className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-purple-200">Set up your username in your profile to react to events</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Status Display - Shows both like and reaction status */}
      {canInteract && (userHasLiked || userReaction) && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-4 border border-purple-400/30">
          <div className="flex items-center justify-center space-x-4">
            {userHasLiked && (
              <div className="flex items-center space-x-2 text-red-400">
                <Heart className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">You liked this event</span>
              </div>
            )}
            {userReaction && (
              <div className="flex items-center space-x-2 text-purple-300">
                <span>{EMOJI_REACTIONS.find(r => r.name === userReaction)?.emoji}</span>
                <span className="text-sm font-medium">Your reaction: {userReaction.replace('_', ' ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close reaction picker */}
      {showReactionPicker && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowReactionPicker(false)}
        />
      )}
    </div>
  );
}
