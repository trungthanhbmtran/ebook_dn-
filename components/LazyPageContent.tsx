import React, { useState, useEffect, memo } from 'react';

// Tối ưu hóa thuật toán: Sử dụng Event Emitter (Pub/Sub) thay vì React Context
// để tránh hiện tượng O(N) re-render (cả 100 trang cùng re-render khi lật 1 trang).
// Chỉ những trang thực sự thay đổi trạng thái mới bị render lại.
type FlipState = { currentPage: number, targetPage: number, isDesktop: boolean };

class FlipbookStore {
    private state: FlipState = { currentPage: 0, targetPage: 0, isDesktop: true };
    private listeners: Set<() => void> = new Set();

    getState() { return this.state; }

    setState(newState: Partial<FlipState>) {
        this.state = { ...this.state, ...newState };
        this.listeners.forEach(listener => listener());
    }

    subscribe(listener: () => void) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
}

export const flipbookStore = new FlipbookStore();

export const LazyPageContent = memo(({ pageIndex, alwaysRender = false, children }: { pageIndex: number, alwaysRender?: boolean, children: React.ReactNode }) => {
    const [isVisible, setIsVisible] = useState(alwaysRender);

    useEffect(() => {
        if (alwaysRender) return;

        const checkVisibility = () => {
            const { currentPage, targetPage, isDesktop } = flipbookStore.getState();
            // Tăng preloadDistance lên 10 để bao phủ mượt mà, nhưng SẼ UNMOUNT các trang quá xa để giải phóng RAM
            const preloadDistance = isDesktop ? 10 : 6;
            const newIsVisible = Math.abs(currentPage - pageIndex) <= preloadDistance || Math.abs(targetPage - pageIndex) <= preloadDistance;

            setIsVisible(newIsVisible);
        };

        checkVisibility();
        return flipbookStore.subscribe(checkVisibility);
    }, [pageIndex, alwaysRender]);

    if (!isVisible) {
        return (
            <div className="w-full h-full bg-[#faf8f4] flex flex-col items-center justify-center text-gray-400">
                <div className="h-8 w-8 rounded-full border-4 border-[#cba365]/30 border-t-[#cba365] animate-spin mb-2"></div>
                <span className="text-[10px] uppercase font-bold tracking-wider">Đang tải...</span>
            </div>
        );
    }

    return <>{children}</>;
});
LazyPageContent.displayName = 'LazyPageContent';
