import React, { useState } from 'react';
import { Calendar, Users, Video, Play, Globe, Lock, LogIn, AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { usePublicEvents } from '../hooks/useQueries';
import { useFileList } from '../file-storage/FileList';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { Event } from '../types/events';
import EventDetailView from './EventDetailView';
import LoginButton from './LoginButton';
import LikesAndReactions from './LikesAndReactions';

export default function PublicEventView() {
  const { data: events = [], isLoading, error, refetch, isRefetching } = usePublicEvents();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { getFileUrl } = useFileList();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity;

  if (selectedEvent) {
    return (
      <EventDetailView 
        event={selectedEvent} 
        onBack={() => setSelectedEvent(null)} 
      />
    );
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">Discover Live Events</h2>
        <p className="text-xl text-purple-200">
          Join amazing livestreaming experiences on the decentralized web
        </p>
      </div>

      {/* Login Message for Non-Authenticated Users */}
      {!isAuthenticated && (
        <div className="mb-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <LogIn className="w-6 h-6 text-purple-300" />
            <h3 className="text-xl font-semibold text-white">Login Required for Live Events</h3>
          </div>
          <p className="text-purple-200 text-center mb-4">
            To view and access live events, please log in with Internet Identity. 
            This ensures secure access to all event features and content.
          </p>
          <div className="flex justify-center">
            <LoginButton />
          </div>
        </div>
      )}

      {/* Enhanced Error Handling Section */}
      {error && (
        <div className="mb-8 bg-red-900/30 border border-red-500/50 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <WifiOff className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Unable to Load Events</h3>
              <p className="text-red-200 mb-4">
                We're having trouble loading the public events. This could be due to a network issue or temporary server problem.
              </p>
              <div className="bg-red-900/20 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-300 font-mono">
                  Error: {error?.message || 'Unknown error occurred'}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
                  <span>{isRefetching ? 'Retrying...' : 'Try Again'}</span>
                </button>
                <div className="text-sm text-red-300">
                  <p>• Check your internet connection</p>
                  <p>• Try refreshing the page</p>
                  <p>• Contact support if the problem persists</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Events Section with Enhanced Loading States */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Public Events</h3>
          
          {/* Manual Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isRefetching || isLoading}
            className="flex items-center space-x-2 text-sm text-purple-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>{isRefetching ? 'Refreshing...' : 'Refresh Events'}</span>
          </button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-16 bg-black/30 backdrop-blur-sm rounded-xl border border-purple-500/20">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-purple-200 mb-2">Loading public events...</p>
            <p className="text-purple-300 text-sm">
              Fetching the latest events from the decentralized network
            </p>
          </div>
        ) : events.length === 0 && !error ? (
          <div className="text-center py-16 bg-black/30 backdrop-blur-sm rounded-xl border border-purple-500/20">
            <Calendar className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-white mb-2">No public events available</h4>
            <p className="text-purple-200 mb-4">
              Events will appear here once organizers start creating them
            </p>
            <div className="bg-purple-900/20 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center space-x-2 mb-2">
                <Wifi className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-200">System Status</span>
              </div>
              <p className="text-xs text-purple-300">
                The event system is running normally. New events will appear automatically when published by organizers.
              </p>
            </div>
          </div>
        ) : !error ? (
          <div className="space-y-6">
            {/* Connection Status Indicator */}
            <div className="flex items-center justify-center space-x-2 text-sm text-purple-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Connected to decentralized network</span>
              <span>•</span>
              <span>{events.length} {events.length === 1 ? 'event' : 'events'} loaded</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <PublicEventCard
                  key={event.id.toString()}
                  event={event}
                  onClick={() => setSelectedEvent(event)}
                  getFileUrl={getFileUrl}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* How It Works Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h4 className="text-xl font-semibold text-white mb-2">Join Events</h4>
          <p className="text-purple-200">
            Access public events or use private event links shared by organizers
          </p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h4 className="text-xl font-semibold text-white mb-2">Watch Content</h4>
          <p className="text-purple-200">
            Enjoy high-quality video content and live streams powered by HLS
          </p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-white" />
          </div>
          <h4 className="text-xl font-semibold text-white mb-2">Interact</h4>
          <p className="text-purple-200">
            Participate in live events and engage with content creators
          </p>
        </div>
      </div>

      {/* System Reliability Information */}
      <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
            <Wifi className="w-4 h-4 text-purple-400" />
          </div>
          <h4 className="text-lg font-semibold text-white">Decentralized & Reliable</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-200">
          <div>
            <p className="mb-2">
              <strong className="text-purple-100">Persistent Storage:</strong> All events are stored on the Internet Computer blockchain for maximum reliability.
            </p>
            <p>
              <strong className="text-purple-100">Auto-Recovery:</strong> The system automatically retries failed requests and recovers from temporary issues.
            </p>
          </div>
          <div>
            <p className="mb-2">
              <strong className="text-purple-100">Real-time Updates:</strong> Events are refreshed automatically to show the latest content.
            </p>
            <p>
              <strong className="text-purple-100">Fail-safe Design:</strong> Events are preserved even during system maintenance or upgrades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PublicEventCardProps {
  event: Event;
  onClick: () => void;
  getFileUrl: (metadata: { path: string; size: bigint; mimeType: string }) => Promise<string>;
}

function PublicEventCard({ event, onClick, getFileUrl }: PublicEventCardProps) {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  React.useEffect(() => {
    if (event.heroImagePath) {
      getFileUrl({ path: event.heroImagePath, size: BigInt(0), mimeType: 'image/*' })
        .then(url => {
          setHeroImageUrl(url);
          setImageLoadError(false);
        })
        .catch(error => {
          console.error('Error loading hero image:', error);
          setImageLoadError(true);
        });
    }
  }, [event.heroImagePath, getFileUrl]);

  return (
    <div 
      onClick={onClick}
      className="bg-black/30 backdrop-blur-sm rounded-xl border border-purple-500/20 overflow-hidden cursor-pointer hover:border-purple-400/40 transition-all duration-200 event-card group"
    >
      {/* Hero Image with Error Handling */}
      <div className="h-48 bg-gradient-to-r from-purple-600 to-pink-600 relative overflow-hidden">
        {heroImageUrl && !imageLoadError ? (
          <img
            src={heroImageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageLoadError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            {imageLoadError ? (
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-white/70 mx-auto mb-2" />
                <p className="text-white/70 text-xs">Image unavailable</p>
              </div>
            ) : (
              <Video className="w-12 h-12 text-white" />
            )}
          </div>
        )}
        <div className="absolute top-2 right-2 flex space-x-1">
          <span className="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
            <Globe className="w-3 h-3" />
            <span>Public</span>
          </span>
          {event.hlsUrl && (
            <span className="bg-red-600/80 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Live</span>
            </span>
          )}
        </div>
        
        {/* Hover overlay with play icon */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h4 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-200 transition-colors">
          {event.title}
        </h4>
        <p className="text-purple-200 mb-4 line-clamp-3">{event.description}</p>
        
        {/* Engagement Stats */}
        <div className="mb-4">
          <LikesAndReactions eventId={event.id} compact />
        </div>
        
        <div className="flex items-center justify-between text-sm text-purple-300">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Video className="w-4 h-4" />
              <span>{event.videos.length} videos</span>
            </span>
            {event.hlsUrl && (
              <span className="flex items-center space-x-1 text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>Live Stream</span>
              </span>
            )}
          </div>
          
          {/* Click to join indicator */}
          <div className="flex items-center space-x-1 text-purple-400 group-hover:text-purple-300 transition-colors">
            <Users className="w-4 h-4" />
            <span className="text-xs">Click to join</span>
          </div>
        </div>
      </div>
    </div>
  );
}
