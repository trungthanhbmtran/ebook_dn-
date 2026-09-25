import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

let cachedMacros: any = null;
let lastCacheTime = 0;

export async function GET() {
    try {
        const now = Date.now();
        // Cache trong 10 giây (giúp dev mode không bị spam đọc file, production chạy siêu nhanh)
        if (cachedMacros && now - lastCacheTime < 10000) {
            return NextResponse.json({ macros: cachedMacros });
        }

        const publicDir = path.join(process.cwd(), 'public');
        const pagesDir = path.join(publicDir, 'book-pages');

        if (!fs.existsSync(pagesDir)) {
            return NextResponse.json({ macros: [] });
        }

        const macros: any[] = [];
        
        // Read directories inside book-pages and sort them naturally
        const folders = fs.readdirSync(pagesDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        for (const folder of folders) {
            const folderPath = path.join(pagesDir, folder);
            
            // Chỉ đọc các file ảnh (webp, jpg, png, etc.) để hiển thị trên sách, bỏ qua file .txt
            const files = fs.readdirSync(folderPath)
                .filter(file => !file.startsWith('.') && /\.(webp|jpg|jpeg|png|avif)$/i.test(file))
                // Sort naturally so e.g. page_2.jpg comes before page_10.jpg
                .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

            macros.push({
                name: folder,
                pages: files.map(file => `/book-pages/${folder}/${file}`)
            });
        }

        cachedMacros = macros;
        lastCacheTime = now;
        return NextResponse.json({ macros });
    } catch (error) {
        console.error('Error reading book pages:', error);
        return NextResponse.json({ error: 'Failed to read pages' }, { status: 500 });
    }
}
