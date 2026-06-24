import React, { memo } from "react";
import { useScreenSize } from "../hooks/useScreenSize";
import {
    ZoomIn, ZoomOut, Maximize, Minimize, Volume2, VolumeX,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Download, Printer
} from "lucide-react";

interface ToolbarProps {
    inputPage: string;
    totalPages: number;
    zoom: number;
    soundEnabled: boolean;
    isFullscreen: boolean;
    setInputPage: (val: string) => void;
    handlePageInput: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    goToPage: (page: number) => void;
    bookRef: React.RefObject<any>;
    setZoom: React.Dispatch<React.SetStateAction<number>>;
    setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    toggleFullscreen: () => void;
    isDesktop?: boolean;
    mobileLang?: 'vi' | 'en';
    onLanguageToggle?: (lang: 'vi' | 'en') => void;
}

const Toolbar = memo(function Toolbar({
    inputPage, totalPages, zoom, soundEnabled, isFullscreen,
    setInputPage, handlePageInput, goToPage, bookRef, setZoom, setSoundEnabled, toggleFullscreen,
    isDesktop, mobileLang, onLanguageToggle
}: ToolbarProps) {
    const { isSm, isMd, isLg, isLoaded } = useScreenSize();

    return (
        <div className="print:hidden h-[50px] w-full bg-[#1a202c] border-t border-white/5 flex items-center justify-between px-2 md:px-4 z-50 text-gray-300 shrink-0 shadow-[0_-4px_15px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-0.5 md:gap-1">

                {isLoaded && (
                    <>
                        <button className="hidden p-1.5 md:p-2 hover:text-[#cba365] hover:bg-[#2d3748] rounded transition-all" title="Tìm kiếm"><Search size={18} /></button>
                        <div className="hidden w-[1px] h-4 bg-gray-600 mx-1 md:mx-2"></div>
                        <button onClick={() => setZoom(z => Math.min(z + 0.3, 2.5))} className="p-1.5 md:p-2 hover:text-[#cba365] hover:bg-[#2d3748] rounded transition-all" title="Phóng to"><ZoomIn size={18} /></button>
                        <button onClick={() => setZoom(z => Math.max(z - 0.3, 0.7))} className="p-1.5 md:p-2 hover:text-[#cba365] hover:bg-[#2d3748] rounded transition-all" title="Thu nhỏ"><ZoomOut size={18} /></button>
                    </>
                )}
            </div>

            <div className="flex items-center gap-0.5 md:gap-1">
                <button onClick={() => goToPage(0)} className="p-1 md:p-1.5 hover:text-[#cba365] hover:bg-[#2d3748] rounded"><ChevronsLeft size={18} /></button>
                <button onClick={() => bookRef.current?.pageFlip()?.flipPrev()} className="p-1 md:p-1.5 hover:text-[#cba365] hover:bg-[#2d3748] rounded"><ChevronLeft size={18} /></button>
                <div className="flex items-center gap-1 md:gap-2 mx-1 md:mx-2">
                    <input
                        type="text"
                        value={inputPage}
                        onChange={(e) => setInputPage(e.target.value)}
                        onKeyDown={handlePageInput}
                        className="w-16 md:w-24 h-6 md:h-7 px-1 bg-[#111622] text-center text-[#cba365] text-xs md:text-sm font-bold border border-white/10 rounded outline-none focus:border-[#cba365] transition-colors"
                    />
                    <span className="text-xs md:text-sm font-medium text-gray-400">/ {totalPages}</span>
                </div>
                <button onClick={() => bookRef.current?.pageFlip()?.flipNext()} className="p-1 md:p-1.5 hover:text-[#cba365] hover:bg-[#2d3748] rounded"><ChevronRight size={18} /></button>
                <button onClick={() => goToPage(totalPages - 1)} className="p-1 md:p-1.5 hover:text-[#cba365] hover:bg-[#2d3748] rounded"><ChevronsRight size={18} /></button>
            </div>

            <div className="flex items-center gap-0.5 md:gap-1">
                {isLoaded && isLg && (
                    <button
                        onClick={() => window.print()}
                        title="In sách"
                        className="p-1.5 md:p-2 hover:text-[#cba365] hover:bg-[#2d3748] rounded transition-all"
                    >
                        <Printer size={18} />
                    </button>
                )}
                {isLoaded && isMd && <div className="w-[1px] h-4 bg-gray-600 mx-1 md:mx-2"></div>}
                <button onClick={() => setSoundEnabled(!soundEnabled)} title={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"} className="p-1.5 md:p-2 hover:text-[#cba365] hover:bg-[#2d3748] rounded transition-all">
                    {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
                <button onClick={toggleFullscreen} title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"} className="p-1.5 md:p-2 hover:text-[#cba365] hover:bg-[#2d3748] rounded transition-all">
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
            </div>
        </div>
    );
});

export default Toolbar;