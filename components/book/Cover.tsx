import React from 'react';
import Image from 'next/image';

export function Cover() {
    return (
        <div className="w-full h-full relative overflow-hidden bg-white">
            <Image 
                src="/frontcover.jpg" 
                alt="Front Cover" 
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={100}
                unoptimized={true}
                priority
                className="absolute w-[106%] h-[106%] max-w-none left-[-2%] top-[-2%] object-fill" 
            />
        </div>
    );
};
