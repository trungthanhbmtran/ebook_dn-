'use client';

import React, { memo, useEffect, useState } from 'react';
import { Cpu, Building2, Users, Leaf, Monitor, Network, Globe, Activity } from 'lucide-react';

const FloatingIcons = [Cpu, Building2, Users, Leaf, Monitor, Network, Globe, Activity];

// Helper to spawn icons only on the perimeter
const getPerimeterPos = () => {
  const edge = Math.floor(Math.random() * 4);
  let x, y;
  if (edge === 0) { x = Math.random() * 100; y = Math.random() * 15; }
  else if (edge === 1) { x = Math.random() * 15 + 85; y = Math.random() * 100; }
  else if (edge === 2) { x = Math.random() * 100; y = Math.random() * 20 + 75; }
  else { x = Math.random() * 15; y = Math.random() * 100; }
  return { x, y };
};

const ConferenceBackground = memo(function ConferenceBackground() {
  const [nodes, setNodes] = useState<{x: number, y: number, r: number}[]>([]);
  const [iconNodes, setIconNodes] = useState<{x: number, y: number, iconIndex: number, delay: number, duration: number}[]>([]);
  const [binaryNodes, setBinaryNodes] = useState<{x: number, y: number, duration: number, delay: number, val: string}[]>([]);

  useEffect(() => {
    // 1. Giảm số lượng Node để giảm O(N^2) tính toán SVG line (40 -> 25)
    const newNodes = [...Array(25)].map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 3 + 1.5
    }));
    setNodes(newNodes);

    // 2. Giảm số lượng Icon và bỏ backdrop-blur nặng nề (14 -> 8)
    const newIconNodes = [...Array(8)].map(() => {
      const pos = getPerimeterPos();
      return {
        x: pos.x,
        y: pos.y,
        iconIndex: Math.floor(Math.random() * FloatingIcons.length),
        delay: Math.random() * -15,
        duration: Math.random() * 10 + 20 // Tăng duration để float mượt hơn
      };
    });
    setIconNodes(newIconNodes);

    // 3. Giảm dải Binary data (25 -> 12)
    const newBinary = [...Array(12)].map(() => ({
       x: Math.random() * 100,
       y: Math.random() * 100,
       duration: Math.random() * 25 + 15, // Chạy chậm lại
       delay: Math.random() * -20,
       val: Math.random() > 0.5 ? '1' : '0'
    }));
    setBinaryNodes(newBinary);
  }, []);

  // Chỉ render UI nếu đã gen xong (Tránh Hydration Mismatch chuẩn Next 14/15)
  if (nodes.length === 0) return <div className="absolute inset-0 bg-[#003366]" />;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#003366] animate-fade-in">

      {/* Màu Xanh chủ động Chuyển đổi số (Digital Transformation Blue) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#002b5e] via-[#0056b3] to-[#0099ff] opacity-95" />

      {/* 3D Infinity Cyber Grid - Render 1 lần bằng static CSS backgroundImage */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 z-0 opacity-[0.15]" style={{ perspective: '800px' }}>
         <div className="absolute w-[200%] h-[200%] left-[-50%] top-0 will-change-transform" 
              style={{
                 backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
                 backgroundSize: '60px 60px',
                 transform: 'rotateX(75deg)',
                 transformOrigin: 'top center'
              }}
         />
      </div>

      {/* Static Light Ripples (Thay vì animate-ping tốn tài nguyên redraw khổng lồ trên 120vw) */}
      <div className="absolute inset-0 flex items-center justify-center z-0 opacity-20">
         <div className="w-[120vw] h-[120vw] rounded-full border-[1px] border-white/20 absolute" />
         <div className="w-[80vw] h-[80vw] rounded-full border-[1px] border-white/30 absolute" />
         <div className="w-[40vw] h-[40vw] rounded-full border-[1px] border-white/40 absolute" />
      </div>

      {/* Floating Binary Data Streams (Luồng dữ liệu nhẹ) */}
      <div className="absolute inset-0 z-10 opacity-30 font-mono text-cyan-200 font-bold text-xs sm:text-sm">
         {binaryNodes.map((b, i) => (
            <div 
               key={`bin-${i}`}
               className="absolute tech-node will-change-transform"
               style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  animationDuration: `${b.duration}s`,
                  animationDelay: `${b.delay}s`,
               }}
            >
               {b.val}
            </div>
         ))}
      </div>

      {/* Watermark Text - Horizontal Banners (Text shadow is fine because it's static) */}
      <div className="absolute top-[3vh] sm:top-[5vh] left-0 w-full flex flex-col items-center opacity-90 select-none z-10 px-4">
         <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] text-center">
            SỞ KHOA HỌC & CÔNG NGHỆ <span className="text-[#a5f3fc]">ĐẮK LẮK</span>
         </h1>
      </div>

      <div className="absolute bottom-[60px] sm:bottom-[80px] left-0 w-full flex flex-col items-center opacity-90 select-none z-10 px-4">
         <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-[0.2em] text-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] text-center">
            AI - Chuyển đổi số
         </h2>
         <h3 className="text-xs sm:text-sm lg:text-base font-bold tracking-[0.4em] text-cyan-200 mt-2 uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] text-center">
            Phục vụ Người dân & Doanh nghiệp
         </h3>
      </div>

      {/* AI Neural Network Connections (Removed drop-shadow SVG filter for HUGE performance boost) */}
      <div className="absolute inset-0 z-10 opacity-30">
         <svg width="100%" height="100%" className="absolute inset-0">
            {nodes.map((n1, i) => 
               nodes.slice(i + 1).map((n2, j) => {
                  const dist = Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2));
                  if (dist < 15) {
                     return (
                        <line 
                           key={`${i}-${j}`}
                           x1={`${n1.x}%`} y1={`${n1.y}%`}
                           x2={`${n2.x}%`} y2={`${n2.y}%`}
                           stroke="#ffffff"
                           strokeWidth="1"
                           strokeOpacity={(1 - dist / 15) * 0.5}
                        />
                     )
                  }
                  return null;
               })
            )}
            {nodes.map((n, i) => (
               <circle key={i} cx={`${n.x}%`} cy={`${n.y}%`} r={n.r} fill="#ffffff" className="tech-node will-change-transform" 
                  style={{ animationDuration: `${Math.random() * 8 + 5}s`, animationDelay: `${Math.random() * -5}s` }} 
               />
            ))}
         </svg>
      </div>

      {/* Floating Icons (Removed backdrop-blur, added will-change, reduced count) */}
      <div className="absolute inset-0 z-10 opacity-80">
         {iconNodes.map((node, i) => {
            const IconComponent = FloatingIcons[node.iconIndex];
            return (
               <div 
                  key={`icon-${i}`}
                  className="absolute text-cyan-100 bg-[#004080] p-3 rounded-full border border-cyan-400/40 shadow-lg tech-node will-change-transform"
                  style={{
                     left: `${node.x}%`,
                     top: `${node.y}%`,
                     animationDuration: `${node.duration}s`,
                     animationDelay: `${node.delay}s`,
                  }}
               >
                  <IconComponent size={24} />
               </div>
            );
         })}
      </div>

    </div>
  );
});

export default ConferenceBackground;
