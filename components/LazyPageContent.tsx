import React, { createContext, useContext, useState, useEffect } from 'react';

export const FlipbookContext = createContext({ currentPage: 0, targetPage: 0, isDesktop: true });

export const LazyPageContent = ({ pageIndex, alwaysRender = false, children }: { pageIndex: number, alwaysRender?: boolean, children: React.ReactNode }) => {
    const { currentPage, targetPage, isDesktop } = useContext(FlipbookContext);
    
    // Tải trước số lượng trang tùy theo thiết bị để tránh treo máy.
    // Điện thoại (isDesktop=false) có RAM và VRAM rất yếu, nếu tải 14 trang sẽ gây treo (crash) app khi vuốt lật.
    // Giảm xuống tải trước 2 trang (1 tờ) cho mobile, và 6 trang (3 tờ) cho máy tính.
    const preloadDistance = isDesktop ? 6 : 2;
    const isVisible = alwaysRender || Math.abs(currentPage - pageIndex) <= preloadDistance || Math.abs(targetPage - pageIndex) <= preloadDistance;

    if (!isVisible) {
        return (
            <div className="w-full h-full bg-[#faf8f4] flex flex-col items-center justify-center text-gray-400">
                <div className="h-8 w-8 rounded-full border-4 border-[#cba365]/30 border-t-[#cba365] animate-spin mb-2"></div>
                <span className="text-[10px] uppercase font-bold tracking-wider">Đang tải...</span>
            </div>
        );
    }

    return <>{children}</>;
};
