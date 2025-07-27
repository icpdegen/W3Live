import React, { useState } from 'react';
import { Upload, Image, Video, Save, X, FileText, Globe, Link, Upload as UploadIcon } from 'lucide-react';
import { useUpdateEvent } from '../hooks/useQueries';
import { CreateEventRequest, EventVideo, Event } from '../types/events';
import ImageUpload from './ImageUpload';
import VideoUpload from './VideoUpload';

interface EventEditorProps {
  event: Event;
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function EventEditor({ event, onCancel, onSuccess }: EventEditorProps) {
  const [eventData, setEventData] = useState<CreateEventRequest>({
    title: event.title,
    description: event.description,
    isPrivate: event.isPrivate,
    isDraft: event.isDraft,
    heroImagePath: event.heroImagePath,
    placeholderImagePath: event.placeholderImagePath,
    hlsUrl: event.hlsUrl,
    videos: event.videos
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'videos'>('basic');
  const updateEvent = useUpdateEvent();

  const handleAddVideo = () => {
    setEventData((prev: CreateEventRequest) => ({
      ...prev,
      videos: [...prev.videos, { title: '', url: '', posterImagePath: '', uploadedVideoPath: '' }]
    }));
  };

  const handleRemoveVideo = (index: number) => {
    setEventData((prev: CreateEventRequest) => ({
      ...prev,
      videos: prev.videos.filter((_: EventVideo, i: number) => i !== index)
    }));
  };

  const handleVideoChange = (index: number, field: keyof EventVideo, value: string) => {
    setEventData((prev: CreateEventRequest) => ({
      ...prev,
      videos: prev.videos.map((video: EventVideo, i: number) => 
        i === index ? { ...video, [field]: value } : video
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = eventData.isDraft) => {
    e.preventDefault();
    try {
      const finalEventData = { ...eventData, isDraft };
      await updateEvent.mutateAsync({ id: event.id, eventData: finalEventData });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update event:', error);
      alert('Failed to update event. Please try again.');
    }
  };

  const handleSaveDraft = (e: React.FormEvent) => handleSubmit(e, true);
  const handlePublish = (e: React.FormEvent) => handleSubmit(e, false);

  return (
    <div className="max-w-4xl mx-auto">
      <form className="space-y-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-black/30 backdrop-blur-sm rounded-lg p-1 border border-purple-500/20">
          {[
            { id: 'basic', label: 'Basic Info', icon: Save },
            { id: 'media', label: 'Media', icon: Image },
            { id: 'videos', label: 'Videos', icon: Video }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-purple-300 hover:text-white hover:bg-purple-600/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Event Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Event Title
              </label>
              <input
                type="text"
                value={eventData.title}
                onChange={(e) => setEventData((prev: CreateEventRequest) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter event title"
                className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Description
              </label>
              <textarea
                value={eventData.description}
                onChange={(e) => setEventData((prev: CreateEventRequest) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your event"
                rows={4}
                className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                HLS Stream URL (Optional)
              </label>
              <input
                type="url"
                value={eventData.hlsUrl}
                onChange={(e) => setEventData((prev: CreateEventRequest) => ({ ...prev, hlsUrl: e.target.value }))}
                placeholder="https://example.com/stream.m3u8"
                className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isPrivate"
                checked={eventData.isPrivate}
                onChange={(e) => setEventData((prev: CreateEventRequest) => ({ ...prev, isPrivate: e.target.checked }))}
                className="w-4 h-4 text-purple-600 bg-black/50 border-purple-500/30 rounded focus:ring-purple-500 focus:ring-2"
              />
              <label htmlFor="isPrivate" className="text-purple-200">
                Make this a private event (accessible only via shareable URL)
              </label>
            </div>
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Event Images</h3>
            
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Hero Image
              </label>
              <ImageUpload
                onImageUploaded={(path) => setEventData((prev: CreateEventRequest) => ({ ...prev, heroImagePath: path }))}
                currentImage={eventData.heroImagePath}
                placeholder="Upload hero image for your event"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Video Player Placeholder
              </label>
              <ImageUpload
                onImageUploaded={(path) => setEventData((prev: CreateEventRequest) => ({ ...prev, placeholderImagePath: path }))}
                currentImage={eventData.placeholderImagePath}
                placeholder="Upload placeholder image for video player"
              />
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Video Content</h3>
              <button
                type="button"
                onClick={handleAddVideo}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Video className="w-4 h-4" />
                <span>Add Video</span>
              </button>
            </div>

            {eventData.videos.length === 0 ? (
              <div className="text-center py-8">
                <Video className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <p className="text-purple-200">No videos added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {eventData.videos.map((video: EventVideo, index: number) => (
                  <div key={index} className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">Video {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">
                          Video Title
                        </label>
                        <input
                          type="text"
                          value={video.title}
                          onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                          placeholder="Enter video title"
                          className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      {/* Video Source Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-purple-200 mb-2 flex items-center space-x-2">
                            <Link className="w-4 h-4" />
                            <span>Video URL</span>
                          </label>
                          <input
                            type="url"
                            value={video.url}
                            onChange={(e) => handleVideoChange(index, 'url', e.target.value)}
                            placeholder="https://example.com/video.mp4"
                            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-purple-200 mb-2 flex items-center space-x-2">
                            <UploadIcon className="w-4 h-4" />
                            <span>Upload Video File</span>
                          </label>
                          <VideoUpload
                            onVideoUploaded={(path) => handleVideoChange(index, 'uploadedVideoPath', path)}
                            currentVideo={video.uploadedVideoPath}
                            placeholder="Upload MP4 video file"
                          />
                        </div>
                      </div>

                      {(video.url || video.uploadedVideoPath) && (
                        <div className="text-xs text-purple-300 bg-purple-900/20 p-2 rounded">
                          {video.url && video.uploadedVideoPath 
                            ? "Both URL and uploaded file provided. Uploaded file will be used."
                            : video.url 
                            ? "Using external video URL"
                            : "Using uploaded video file"
                          }
                        </div>
                      )}
                    
                      <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">
                          Poster Image
                        </label>
                        <ImageUpload
                          onImageUploaded={(path) => handleVideoChange(index, 'posterImagePath', path)}
                          currentImage={video.posterImagePath}
                          placeholder="Upload poster image for this video"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-purple-300 hover:text-white transition-colors"
            disabled={updateEvent.isPending}
          >
            Cancel
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={updateEvent.isPending}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-gray-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-5 h-5" />
              <span>{updateEvent.isPending ? 'Saving...' : 'Save as Draft'}</span>
            </button>
            
            <button
              type="button"
              onClick={handlePublish}
              disabled={updateEvent.isPending}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Globe className="w-5 h-5" />
              <span>{updateEvent.isPending ? 'Publishing...' : event.isDraft ? 'Publish Event' : 'Update Event'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
