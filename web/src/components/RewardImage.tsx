import { useState, useEffect, useRef } from 'react';

export type ImageStatus = 'pending' | 'generating' | 'completed' | 'failed';

interface RewardImageProps {
  imageData?: string;
  status: ImageStatus;
  description: string;
  onRetry?: () => void;
  className?: string;
}

export function RewardImage({
  imageData,
  status,
  description,
  onRetry,
  className = '',
}: RewardImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset states when imageData changes
  useEffect(() => {
    setImageLoaded(false);
    setShowFallback(false);
  }, [imageData]);

  // Check if image is already loaded (cached)
  useEffect(() => {
    if (imgRef.current && imageData) {
      if (imgRef.current.complete) {
        setImageLoaded(true);
      }
    }
  }, [imageData]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setShowFallback(true);
  };

  // Get status icon and message
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          icon: '⏳',
          title: 'Preparing',
          message: 'Preparing to generate your exclusive reward image...',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
        };
      case 'generating':
        return {
          icon: '✨',
          title: 'Generating',
          message: 'AI is creating your exclusive reward image, please wait...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        };
      case 'completed':
        return {
          icon: '🎉',
          title: 'Completed',
          message: 'Your exclusive reward image has been generated!',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
      case 'failed':
        return {
          icon: '⚠️',
          title: 'Generation Failed',
          message: 'Image generation encountered an issue, please retry',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        };
      default:
        return {
          icon: '❓',
          title: 'Unknown Status',
          message: 'Please wait...',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
        };
    }
  };

  const statusInfo = getStatusInfo();

  // Render loading/generating state
  if (status === 'pending' || status === 'generating') {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed ${statusInfo.bgColor} ${className}`}
      >
        <div className="relative">
          <div className="text-5xl mb-4 animate-pulse">{statusInfo.icon}</div>
          <div className="absolute -bottom-1 -right-1">
            <div className="w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>

        <h3 className={`text-lg font-semibold ${statusInfo.color} mt-4`}>
          {statusInfo.title}
        </h3>

        <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
          {statusInfo.message}
        </p>

        <div className="mt-4 flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Render failed state
  if (status === 'failed') {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed ${statusInfo.bgColor} ${className}`}
      >
        <div className="text-5xl mb-4">{statusInfo.icon}</div>

        <h3 className={`text-lg font-semibold ${statusInfo.color} mt-4`}>
          {statusInfo.title}
        </h3>

        <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
          {statusInfo.message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Retry</span>
          </button>
        )}
      </div>
    );
  }

  // Render completed state with image
  if (status === 'completed' && imageData) {
    return (
      <div className={`relative rounded-xl overflow-hidden shadow-lg ${className}`}>
        {/* Loading overlay */}
        {!imageLoaded && !showFallback && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
              <span className="text-sm text-gray-500 mt-2">Loading...</span>
            </div>
          </div>
        )}

        {/* Main image */}
        <img
          ref={imgRef}
          key={imageData}
          src={imageData}
          alt={description}
          className={`w-full h-auto transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Overlay gradient for text readability */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white text-sm font-medium truncate">{description}</p>
          <div className="flex items-center mt-2">
            <span className="text-xs text-white/80">AI Generated</span>
            <span className="mx-2 text-white/40">•</span>
            <span className="text-xs text-green-400">✓ Completed</span>
          </div>
        </div>

        {/* Corner badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            🎁 Reward
          </span>
        </div>
      </div>
    );
  }

  // Fallback: should not reach here, but just in case
  return (
    <div className={`flex items-center justify-center p-8 bg-gray-100 rounded-xl ${className}`}>
      <p className="text-gray-500">Loading...</p>
    </div>
  );
}

export default RewardImage;
