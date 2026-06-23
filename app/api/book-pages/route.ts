import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const publicDir = path.join(process.cwd(), 'public');
        const pagesDir = path.join(publicDir, 'book-pages');

        if (!fs.existsSync(pagesDir)) {
            return NextResponse.json({ macros: [] });
        }

        const macros: any[] = [];
        
        // Read directories inside book-pages
        const folders = fs.readdirSync(pagesDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const folder of folders) {
            const folderPath = path.join(pagesDir, folder);
            
            // Read all files in this folder (e.g. .pdf, .jpg, .png)
            const files = fs.readdirSync(folderPath)
                .filter(file => !file.startsWith('.'))
                // Sort naturally so page_1.pdf comes before page_10.pdf
                .sort((a, b) => {
                    const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
                    const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
                    return numA - numB;
                });

            macros.push({
                name: folder,
                pages: files.map(file => `/book-pages/${folder}/${file}`)
            });
        }

        return NextResponse.json({ macros });
    } catch (error) {
        console.error('Error reading book pages:', error);
        return NextResponse.json({ error: 'Failed to read pages' }, { status: 500 });
    }
}
