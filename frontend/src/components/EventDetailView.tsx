import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Video, MessageCircle, Globe, Lock, Users } from 'lucide-react';
import { useFileList } from '../file-storage/FileList';
import { Event, EventVideo } from '../types/events';
import CommentsSection from './CommentsSection';
import LikesAndReactions from './LikesAndReactions';

interface EventDetailViewProps {
  event: Event;
  onBack: () => void;
}

export default function EventDetailView({ event, onBack }: EventDetailViewProps) {
  const { getFileUrl } = useFileList();
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [placeholderImageUrl, setPlaceholderImageUrl] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<EventVideo | null>(null);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(false);

  // Load images
  useEffect(() => {
    if (event.heroImagePath) {
      getFileUrl({ path: event.heroImagePath, size: BigInt(0), mimeType: 'image/*' })
        .then(setHeroImageUrl)
        .catch(console.error);
    }
    if (event.placeholderImagePath) {
      getFileUrl({ path: event.placeholderImagePath, size: BigInt(0), mimeType: 'image/*' })
        .then(setPlaceholderImageUrl)
        .catch(console.error);
    }
  }, [event, getFileUrl]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-purple-300 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events</span>
      </button>

      {/* Hero Section */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-purple-500/20 overflow-hidden mb-8">
        <div className="h-64 md:h-80 bg-gradient-to-r from-purple-600 to-pink-600 relative overflow-hidden">
          {heroImageUrl ? (
            <img
              src={heroImageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Video className="w-16 h-16 text-white" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-end">
            <div className="p-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
              <p className="text-lg text-purple-100">{event.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-8">
        {/* Event Details Section - Now positioned first */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Event Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                {event.isPrivate ? (
                  <Lock className="w-6 h-6 text-purple-400" />
                ) : (
                  <Globe className="w-6 h-6 text-purple-400" />
                )}
              </div>
              <div>
                <p className="text-purple-200 text-sm">Event Type</p>
                <p className="text-white font-medium">{event.isPrivate ? 'Private' : 'Public'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-purple-200 text-sm">Video Content</p>
                <p className="text-white font-medium">{event.videos.length} videos</p>
              </div>
            </div>
            
            {event.hlsUrl && (
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <p className="text-purple-200 text-sm">Live Stream</p>
                  <p className="text-green-400 font-medium">Available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Likes and Reactions Section */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-purple-500/20">
          <div className="p-6 border-b border-purple-500/20">
            <h3 className="text-xl font-semibold text-white">Engagement</h3>
          </div>
          <div className="p-6">
            <LikesAndReactions eventId={event.id} />
          </div>
        </div>

        {/* Video Player Section with Live Stream Controls - Now positioned after Event Details */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-purple-500/20 overflow-hidden">
          <div className="p-6 border-b border-purple-500/20">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {event.hlsUrl && isLiveStreamActive ? 'Live Stream' : 'Video Player'}
              </h2>
              
              {/* Live Stream Control */}
              {event.hlsUrl && (
                <button
                  onClick={() => setIsLiveStreamActive(!isLiveStreamActive)}
                  className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                    isLiveStreamActive
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${isLiveStreamActive ? 'bg-white animate-pulse' : 'bg-white'}`} />
                  <span>{isLiveStreamActive ? 'Stop Live Stream' : 'Watch Live Stream'}</span>
                </button>
              )}
            </div>
          </div>
          <div className="aspect-video bg-black relative">
            {event.hlsUrl && isLiveStreamActive ? (
              <HLSPlayer src={event.hlsUrl} />
            ) : selectedVideo ? (
              <VideoPlayer video={selectedVideo} getFileUrl={getFileUrl} />
            ) : placeholderImageUrl ? (
              <img
                src={placeholderImageUrl}
                alt="Video placeholder"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Video className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-purple-200">Select a video to play</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video List */}
        {event.videos.length > 0 && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-purple-500/20">
            <div className="p-6 border-b border-purple-500/20">
              <h3 className="text-xl font-semibold text-white">Videos</h3>
            </div>
            <div className="p-6 space-y-4">
              {event.videos.map((video: EventVideo, index: number) => (
                <VideoListItem
                  key={index}
                  video={video}
                  isSelected={selectedVideo === video}
                  onClick={() => setSelectedVideo(video)}
                  getFileUrl={getFileUrl}
                />
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-purple-500/20">
          <div className="p-6 border-b border-purple-500/20">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Comments</span>
            </h3>
          </div>
          <div className="p-6">
            <CommentsSection eventId={event.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface VideoPlayerProps {
  video: EventVideo;
  getFileUrl: (metadata: { path: string; size: bigint; mimeType: string }) => Promise<string>;
}

function VideoPlayer({ video, getFileUrl }: VideoPlayerProps) {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (video.posterImagePath) {
      getFileUrl({ path: video.posterImagePath, size: BigInt(0), mimeType: 'image/*' })
        .then(setPosterUrl)
        .catch(console.error);
    }

    // Determine video source - prioritize uploaded file over URL
    if (video.uploadedVideoPath) {
      getFileUrl({ path: video.uploadedVideoPath, size: BigInt(0), mimeType: 'video/*' })
        .then(setVideoUrl)
        .catch(console.error);
    } else if (video.url) {
      setVideoUrl(video.url);
    }
  }, [video, getFileUrl]);

  return (
    <video
      controls
      className="w-full h-full"
      poster={posterUrl || undefined}
      src={videoUrl || undefined}
    >
      {videoUrl && <source src={videoUrl} type="video/mp4" />}
      Your browser does not support the video tag.
    </video>
  );
}

interface HLSPlayerProps {
  src: string;
}

function HLSPlayer({ src }: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if HLS is supported natively
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else {
      // For browsers that don't support HLS natively, we'll use a CDN version of HLS.js
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.onload = () => {
        if ((window as any).Hls && (window as any).Hls.isSupported()) {
          const hls = new (window as any).Hls();
          hls.loadSource(src);
          hls.attachMedia(video);
        }
      };
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      className="w-full h-full"
      autoPlay
    >
      Your browser does not support the video tag.
    </video>
  );
}

interface VideoListItemProps {
  video: EventVideo;
  isSelected: boolean;
  onClick: () => void;
  getFileUrl: (metadata: { path: string; size: bigint; mimeType: string }) => Promise<string>;
}

function VideoListItem({ video, isSelected, onClick, getFileUrl }: VideoListItemProps) {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  useEffect(() => {
    if (video.posterImagePath) {
      getFileUrl({ path: video.posterImagePath, size: BigInt(0), mimeType: 'image/*' })
        .then(setPosterUrl)
        .catch(console.error);
    }
  }, [video.posterImagePath, getFileUrl]);

  return (
    <div
      onClick={onClick}
      className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-purple-600/30 border border-purple-500'
          : 'hover:bg-purple-600/10 border border-transparent'
      }`}
    >
      <div className="w-16 h-12 bg-black rounded overflow-hidden flex-shrink-0">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-4 h-4 text-purple-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium truncate">{video.title}</h4>
        <p className="text-purple-300 text-sm">
          {video.uploadedVideoPath ? 'Uploaded Video' : 'External Video'}
        </p>
      </div>
      <Play className="w-4 h-4 text-purple-400 flex-shrink-0" />
    </div>
  );
}
