import React, { useState, useEffect } from 'react';

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

  // Reset states when imageData changes
  useEffect(() => {
    setImageLoaded(false);
    setShowFallback(false);
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
          title: '准备生成',
          message: '正在准备为您生成专属奖励图片...',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
        };
      case 'generating':
        return {
          icon: '✨',
          title: '生成中',
          message: 'AI 正在创作您的专属奖励图片，请稍候...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        };
      case 'completed':
        return {
          icon: '🎉',
          title: '已完成',
          message: '您的专属奖励图片已生成！',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
      case 'failed':
        return {
          icon: '⚠️',
          title: '生成失败',
          message: '图片生成遇到问题，请重试',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        };
      default:
        return {
          icon: '❓',
          title: '未知状态',
          message: '请稍候...',
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
            <span>重试</span>
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
              <span className="text-sm text-gray-500 mt-2">加载中...</span>
            </div>
          </div>
        )}

        {/* Main image */}
        <img
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
            <span className="text-xs text-white/80">AI 生成</span>
            <span className="mx-2 text-white/40">•</span>
            <span className="text-xs text-green-400">✓ 已完成</span>
          </div>
        </div>

        {/* Corner badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            🎁 奖励
          </span>
        </div>
      </div>
    );
  }

  // Fallback: should not reach here, but just in case
  return (
    <div className={`flex items-center justify-center p-8 bg-gray-100 rounded-xl ${className}`}>
      <p className="text-gray-500">加载中...</p>
    </div>
  );
}

export default RewardImage;
