'use client';

import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfPageProps {
    fileUrl: string;
    width: number;
}

export const PdfPage: React.FC<PdfPageProps> = ({ fileUrl, width }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [error, setError] = useState<Error | null>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-red-500">
                Lỗi tải trang: {error.message}
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-white overflow-hidden pointer-events-none">
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
                    className="w-full h-full flex items-center justify-center [&>canvas]:!w-full [&>canvas]:!h-full [&>canvas]:!object-fill"
                />
            </Document>
        </div>
    );
};
