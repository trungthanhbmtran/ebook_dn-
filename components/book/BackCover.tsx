import React from 'react';
import Image from 'next/image';

export function BackCover() {
    return (
        <div className="w-full h-full relative overflow-hidden bg-white">
            <Image
                src="/backcover.jfif"
                alt="Back Cover"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={100}
                unoptimized={true}
                className="absolute w-[106%] h-[106%] max-w-none left-[-2%] top-[-2%] object-fill"
            />
        </div>
    );
}
