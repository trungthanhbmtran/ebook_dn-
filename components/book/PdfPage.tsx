'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Image from 'next/image';

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Global cache to store rendered PDF images (Base64)
const imageCache = new Map<string, string>();

interface PdfPageProps {
    fileUrl: string;
    width: number;
}

export const PdfPage: React.FC<PdfPageProps> = ({ fileUrl, width }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [error, setError] = useState<Error | null>(null);
    const [cachedImage, setCachedImage] = useState<string | null>(imageCache.get(fileUrl) || null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (imageCache.has(fileUrl)) {
            setCachedImage(imageCache.get(fileUrl) || null);
        }
    }, [fileUrl]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    const onRenderSuccess = () => {
        // Tăng timeout lên 500ms để đảm bảo PDF đã được vẽ hoàn toàn lên Canvas
        setTimeout(() => {
            if (!wrapperRef.current) return;
            const canvas = wrapperRef.current.querySelector('canvas');
            if (canvas) {
                try {
                    // Capture canvas as JPEG to avoid transparency issues and reduce size
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    
                    // Chỉ lưu nếu canvas không trống (dataUrl đủ lớn)
                    if (dataUrl.length > 1000) {
                        imageCache.set(fileUrl, dataUrl);
                        setCachedImage(dataUrl);
                    }
                } catch (e) {
                    console.error("Failed to cache canvas", e);
                }
            }
        }, 800);
    };

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-red-500">
                Lỗi tải trang: {error.message}
            </div>
        );
    }

    if (cachedImage) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-white overflow-hidden pointer-events-none">
                <img 
                    src={cachedImage} 
                    alt="PDF Page Cached" 
                    className="w-full h-full object-fill" 
                />
            </div>
        );
    }

    return (
        <div ref={wrapperRef} className="w-full h-full flex flex-col items-center justify-center bg-white overflow-hidden pointer-events-none">
            <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={setError}
                className="w-full h-full flex items-center justify-center"
                loading={
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
                    </div>
                }
            >
                <Page
                    pageNumber={pageNumber}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    onRenderSuccess={onRenderSuccess}
                    className="w-full h-full flex items-center justify-center [&>canvas]:!w-full [&>canvas]:!h-full [&>canvas]:!object-fill"
                />
            </Document>
        </div>
    );
};
