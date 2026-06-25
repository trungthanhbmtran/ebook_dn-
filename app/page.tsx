"use client";

import dynamic from 'next/dynamic';

const FlipbookViewer = dynamic(() => import('../components/FlipbookViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-gradient-to-br from-[#002b5e] via-[#0056b3] to-[#0099ff]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 rounded-full border-4 border-white/30 border-t-white animate-spin mb-4 shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
        <p className="text-white font-bold text-sm tracking-widest uppercase drop-shadow-md">Đang khởi tạo không gian...</p>
      </div>
    </div>
  ),
});

export default function EbookPage() {
  return (

    <FlipbookViewer />
  );
}
