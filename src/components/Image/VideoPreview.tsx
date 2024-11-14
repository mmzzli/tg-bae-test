import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { X } from 'lucide-react';

interface VideoPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  isOpen,
  onClose,
  videoUrl,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoUrl);
      if (videoRef.current) {
        hls.attachMedia(videoRef.current);
      }
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const maxLevel = hls.levels.length - 1;
        hls.startLevel = maxLevel;
        hls.currentLevel = maxLevel;
      });
      return () => {
        hls.destroy();
      };
    } else {
      console.error('HLS.js is not supported in this browser.');
    }
  }, [videoUrl]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = false;
    }
  }, [isOpen]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white opacity-60 hover:opacity-100 transition-opacity z-10"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-[24px] w-[100%]">
        <video
          ref={videoRef}
          controls
          autoPlay
          loop
          width="100%"
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
        >
          <p>Your browser does not support HTML5 video.</p>
        </video>
      </div>
    </div>
  );
};

export default VideoPreview;
