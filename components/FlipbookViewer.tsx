'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { flushSync } from 'react-dom';
import HTMLFlipBook from "react-pageflip";
import Image from "next/image";
import Toolbar from "./Toolbar";
import { ChevronLeft, ChevronRight, Search, ZoomIn, ZoomOut, X, List, Menu } from "lucide-react";
import { flipbookStore, LazyPageContent } from "./LazyPageContent";

import { Cover } from "./book/Cover";
import { BackCover } from "./book/BackCover";
import { PdfPage } from "./book/PdfPage";
import { useScreenSize } from '../hooks/useScreenSize';

import ConferenceBackground from './ConferenceBackground';

interface MacroFolder {
    name: string;
    pages: string[];
}

export default function FlipbookViewer() {
    const [folders, setFolders] = useState<MacroFolder[]>([]);

    useEffect(() => {
        fetch('/api/book-pages')
            .then(res => res.json())
            .then(data => {
                if (data.macros) {
                    setFolders(data.macros);
                }
            })
            .catch(console.error);
    }, []);

    const bookRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const bookAreaRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const lastFlipTime = useRef<number>(0);

    const { isLg: isDesktop, isLoaded } = useScreenSize();

    const [currentPage, setCurrentPage] = useState(0);
    const [targetPage, setTargetPage] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [baseScale, setBaseScale] = useState(1);
    const [inputPage, setInputPage] = useState("1");
    const [isReady, setIsReady] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const updateScale = useCallback(() => {
        const targetWidth = isDesktop ? 1126 : 563;
        const targetHeight = 756;

        const horizontalMargin = isDesktop ? 120 : 40;
        const verticalMargin = isDesktop ? 220 : 160;

        const screenW = window.innerWidth - horizontalMargin;
        const screenH = window.innerHeight - 50 - verticalMargin;

        const scaleW = screenW / targetWidth;
        const scaleH = screenH / targetHeight;

        setBaseScale(Math.min(scaleW, scaleH));
    }, [isDesktop]);

    useEffect(() => {
        updateScale();
        const timeout = setTimeout(updateScale, 100);
        window.addEventListener("resize", updateScale);
        return () => {
            clearTimeout(timeout);
            window.removeEventListener("resize", updateScale);
        };
    }, [updateScale]);

    const { macroGroupsMenu, totalPages, bookPagesToRender } = useMemo(() => {
        const bookPagesToRender: React.ReactNode[] = [];
        const macroGroupsMenu: any[] = [];

        bookPagesToRender.push(
            <div key="front-cover" className="page-wrapper h-full">
                <Cover />
            </div>
        );

        let currentIndex = 1;

        folders.forEach((folder, folderIndex) => {
            // Đảm bảo "hình ảnh tổng thể" (trang đầu tiên của thư mục) luôn nằm ở mặt TRÁI (index lẻ)
            // và trang tiếp theo (trang nội dung) nằm ở mặt PHẢI (index chẵn)
            if (isDesktop && currentIndex % 2 === 0) {
                bookPagesToRender.push(
                    <div key={`blank-folder-pad-${currentIndex}`} className="page-light bg-white w-full h-full bg-gradient-to-l from-black/5 to-transparent"></div>
                );
                currentIndex++;
            }

            // Không hiển thị "0 MỤC LỤC DỰ ÁN" lên thẻ đánh dấu (Macro Tab)
            if (!folder.name.toUpperCase().includes("0 MỤC LỤC") && !folder.name.toUpperCase().includes("0 MUC LUC")) {
                macroGroupsMenu.push({
                    name: folder.name,
                    pageIndex: currentIndex
                });
            }

            folder.pages.forEach((pageUrl, pageIdx) => {
                const isPdf = pageUrl.toLowerCase().endsWith('.pdf');

                // Keep the book shadow styling for inner pages
                const isLeftPage = isDesktop && (currentIndex % 2 !== 0);

                bookPagesToRender.push(
                    <div key={`page-${currentIndex}`} className="page-wrapper h-full bg-white relative flex items-center justify-center overflow-hidden">

                        {/* Page Shadow Details */}
                        {isDesktop && (
                            <>
                                {isLeftPage ? (
                                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-30"></div>
                                ) : (
                                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-30"></div>
                                )}
                            </>
                        )}

                        <div className="w-full h-full relative z-10">
                            <LazyPageContent pageIndex={currentIndex}>
                                {isPdf ? (
                                    <PdfPage fileUrl={pageUrl} width={563} />
                                ) : (
                                    <Image
                                        src={pageUrl}
                                        alt={`Page ${currentIndex}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        quality={100}
                                        unoptimized={true}
                                        priority={currentIndex <= 4}
                                        className="object-contain"
                                    />
                                )}
                            </LazyPageContent>
                        </div>
                    </div>
                );
                currentIndex++;
            });
        });

        if (isDesktop) {
            // Đảm bảo tổng số trang TRƯỚC KHI chèn bìa sau là số lẻ
            // Để khi chèn bìa sau vào, tổng số trang là chẵn, bìa sau sẽ nằm ở mặt trái của tờ cuối cùng
            while (bookPagesToRender.length % 2 === 0) {
                bookPagesToRender.push(
                    <div key={`blank-${bookPagesToRender.length}`} className="page-light bg-white w-full h-full bg-gradient-to-l from-black/5 to-transparent"></div>
                );
            }
        }

        bookPagesToRender.push(
            <div key="back-cover" className="page-wrapper h-full">
                <BackCover />
            </div>
        );

        return { macroGroupsMenu, totalPages: bookPagesToRender.length, bookPagesToRender };
    }, [isDesktop, folders]);

    useEffect(() => {
        const scrollZone = bookAreaRef.current;
        if (!scrollZone) return;
        const handleNativeWheel = (e: WheelEvent) => {
            e.preventDefault();
            const now = Date.now();
            if (now - lastFlipTime.current < 700) return;
            const absX = Math.abs(e.deltaX);
            const absY = Math.abs(e.deltaY);
            if (absY > absX) {
                if (e.deltaY > 25) { bookRef.current?.pageFlip()?.flipNext(); lastFlipTime.current = now; }
                else if (e.deltaY < -25) { bookRef.current?.pageFlip()?.flipPrev(); lastFlipTime.current = now; }
            } else {
                if (e.deltaX > 25) { bookRef.current?.pageFlip()?.flipNext(); lastFlipTime.current = now; }
                else if (e.deltaX < -25) { bookRef.current?.pageFlip()?.flipPrev(); lastFlipTime.current = now; }
            }
        };
        scrollZone.addEventListener("wheel", handleNativeWheel, { passive: false });
        return () => scrollZone.removeEventListener("wheel", handleNativeWheel);
    }, [isReady]);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash.startsWith("#p=")) {
                const p = parseInt(hash.replace("#p=", ""), 10) - 1;
                if (!isNaN(p) && p >= 0 && p < totalPages && isReady) goToPage(p);
            }
        };
        if (isReady) handleHashChange();
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, [isReady, totalPages]);

    useEffect(() => {
        if (isReady) window.history.replaceState(null, "", `#p=${currentPage + 1}`);
        if (!isDesktop) {
            setInputPage((currentPage + 1).toString());
        } else {
            if (currentPage === 0) setInputPage("1");
            else if (currentPage === totalPages - 1) setInputPage(totalPages.toString());
            else {
                const leftPage = currentPage;
                const rightPage = currentPage + 1;
                setInputPage(rightPage >= totalPages ? `${leftPage}` : `${leftPage}-${rightPage}`);
            }
        }

        // Tối ưu hóa thuật toán O(1): Cập nhật store thay vì truyền qua Context
        flipbookStore.setState({ currentPage, targetPage, isDesktop });
    }, [currentPage, targetPage, isDesktop, totalPages, isReady]);

    const goToPage = useCallback((pageIndex: number) => {
        if (bookRef.current?.pageFlip()) {
            setTargetPage(pageIndex);

            // Đợi 100ms để React kịp render ảnh vào DOM thay cho thẻ "Đang tải...",
            // giúp hiệu ứng lật trang của react-pageflip không chụp nhầm khung hình loading
            setTimeout(() => {
                if (bookRef.current?.pageFlip()) {
                    bookRef.current.pageFlip().flip(pageIndex);
                }
            }, 100);
        }
    }, []);

    const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const p = parseInt(inputPage.split('-')[0], 10) - 1;
            if (!isNaN(p) && p >= 0 && p < totalPages) goToPage(p);
            else setInputPage(!isDesktop ? (currentPage + 1).toString() : (currentPage === 0 ? "1" : `${currentPage}-${currentPage + 1}`));
        }
    };

    const handleFlip = useCallback((e: any) => {
        setCurrentPage(e.data);
        if (soundEnabled && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => { });
        }
    }, [soundEnabled]);

    const flipbookComponent = useMemo(() => (
        // @ts-ignore
        <HTMLFlipBook
            key={isDesktop ? "desktop" : "mobile"}
            width={563} height={756} size="fixed" maxShadowOpacity={0.4}
            showCover={true} mobileScrollSupport={true} className="w-full h-full" ref={bookRef}
            onInit={() => { setIsReady(true); }}
            onFlip={handleFlip} usePortrait={!isDesktop} drawShadow={true} flippingTime={650}
            startPage={currentPage}
        >
            {bookPagesToRender}
        </HTMLFlipBook>
    ), [isDesktop, handleFlip, bookPagesToRender]);

    if (!isLoaded || folders.length === 0) {
        return (
            <div className="flex h-[100dvh] w-full items-center justify-center bg-gradient-to-br from-[#002b5e] via-[#0056b3] to-[#0099ff]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full border-4 border-white/30 border-t-white animate-spin mb-4 shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
                    <p className="text-white font-bold text-sm tracking-widest uppercase drop-shadow-md">Đang tải dữ liệu sách...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div ref={containerRef} className="flex flex-col h-[100dvh] w-full font-sans overflow-hidden select-none relative back print:block print:h-auto print:overflow-visible print:w-full">
                <div className="absolute inset-0 z-0 pointer-events-none print:hidden">
                    <ConferenceBackground />
                </div>

                {/* Floating Top-Left Menu Button */}
                {!isSidebarOpen && (
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-[80] p-2 sm:p-2.5 bg-[#0f172a]/70 backdrop-blur-md rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.3)] text-gray-300 hover:text-[#38bdf8] hover:bg-[#1e293b] border border-white/10 transition-all group print:hidden flex items-center gap-2"
                        title="Mục lục"
                    >
                        <Menu size={22} className="group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-semibold tracking-wide hidden sm:inline uppercase text-gray-300 group-hover:text-[#38bdf8] transition-colors">Mục lục</span>
                    </button>
                )}

                {/* TOC Sidebar Overlay */}
                <div className={`fixed inset-y-0 left-0 z-[100] w-80 bg-[#0f172a]/95 backdrop-blur-xl shadow-[5px_0_25px_rgba(0,0,0,0.5)] transform transition-transform duration-300 ease-in-out print:hidden flex flex-col border-r border-white/5 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#020617]/50">
                        <h2 className="text-[#38bdf8] font-bold text-lg uppercase tracking-wider">Mục lục</h2>
                        <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                        {macroGroupsMenu.map((menu, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    goToPage(menu.pageIndex);
                                    setIsSidebarOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 mb-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all rounded-lg border-l-2 border-transparent hover:border-[#38bdf8] group flex flex-col gap-1"
                            >
                                <div className="font-medium line-clamp-2 group-hover:translate-x-1 transition-transform">{menu.name}</div>
                                <div className="text-[10px] text-gray-500 group-hover:text-[#38bdf8] transition-colors">Trang {menu.pageIndex + 1}</div>
                            </button>
                        ))}
                        {(!macroGroupsMenu || macroGroupsMenu.length === 0) && (
                            <div className="px-4 py-3 text-sm text-gray-500 italic text-center mt-10">Mục lục trống</div>
                        )}
                    </div>
                </div>

                {/* TOC Backdrop */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] print:hidden transition-opacity duration-300"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <audio ref={audioRef} src="https://www.soundjay.com/misc/sounds/page-flip-01a.mp3" preload="auto" />

                <div ref={bookAreaRef} className={`flex-1 w-full flex items-center justify-center relative z-10 print:hidden ${zoom > 1 ? 'overflow-auto' : 'overflow-hidden'}`}>
                    {isDesktop && (
                        <>
                            <button onClick={() => bookRef.current?.pageFlip()?.flipPrev()} className="fixed left-3 top-1/2 -translate-y-1/2 z-50 p-3 bg-[rgba(0,0,0,0.4)] hover:bg-[rgba(0,0,0,0.7)] text-white rounded-full transition-opacity hidden sm:flex"><ChevronLeft size={28} /></button>
                            <button onClick={() => bookRef.current?.pageFlip()?.flipNext()} className="fixed right-3 top-1/2 -translate-y-1/2 z-50 p-3 bg-[rgba(0,0,0,0.4)] hover:bg-[rgba(0,0,0,0.7)] text-white rounded-full transition-opacity hidden sm:flex"><ChevronRight size={28} /></button>
                        </>
                    )}

                    <div
                        className={`transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${zoom > 1 ? 'flex-none' : 'flex items-center justify-center'}`}
                        style={zoom > 1 ? {
                            width: (isDesktop ? 1126 : 563) * zoom * baseScale,
                            height: 756 * zoom * baseScale
                        } : {}}
                    >
                        <div className="transform-gpu flex items-center justify-center" style={{ transform: `scale(${zoom * baseScale})`, transformOrigin: zoom > 1 ? 'top left' : 'center' }}>
                            <div className="relative flex items-center justify-center " style={{ width: isDesktop ? 1126 : 563, height: 756 }}>

                                <div className="absolute right-[calc(100%-1px)] top-8 flex-col gap-1.5 z-0 flex">
                                </div>

                                <div className={`relative w-full h-full z-10 ${zoom > 1 ? 'pointer-events-none' : ''}`}>
                                    {flipbookComponent}
                                </div>

                                <div className="absolute left-[calc(100%-1px)] top-8 flex-col gap-1.5 z-0 flex">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Toolbar
                    inputPage={inputPage}
                    totalPages={totalPages}
                    zoom={zoom}
                    soundEnabled={soundEnabled}
                    isFullscreen={isFullscreen}
                    setInputPage={setInputPage}
                    handlePageInput={handlePageInput}
                    goToPage={goToPage}
                    bookRef={bookRef}
                    setZoom={setZoom}
                    setSoundEnabled={setSoundEnabled}
                    toggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                    isDesktop={isDesktop}
                    macroGroupsMenu={macroGroupsMenu}
                />
            </div>
        </>
    );
}
