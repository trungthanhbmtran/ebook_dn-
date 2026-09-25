import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

let cachedData: any = null;

function buildBookData(folders: any[], isDesktop: boolean) {
    const pages = [];
    const macroGroupsMenu = [];

    pages.push({ type: 'cover' });

    let currentIndex = 1;

    folders.forEach((folder) => {
        if (isDesktop && currentIndex % 2 === 0) {
            pages.push({ type: 'blank' });
            currentIndex++;
        }

        if (!folder.name.toUpperCase().includes("0 MUC LUC") && !folder.name.toUpperCase().includes("0 MťC LụC")) {
            macroGroupsMenu.push({
                name: folder.name,
                pageIndex: currentIndex
            });
        }

        folder.pages.forEach((pageUrl: string) => {
            const isLeftPage = isDesktop && (currentIndex % 2 !== 0);
            pages.push({
                type: 'image',
                src: pageUrl,
                isLeftPage
            });
            currentIndex++;
        });
    });

    if (isDesktop) {
        while (pages.length % 2 === 0) {
            pages.push({ type: 'blank' });
        }
    }

    pages.push({ type: 'back-cover' });

    return {
        pages,
        macroGroupsMenu,
        totalPages: pages.length
    };
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const isDesktop = searchParams.get('isDesktop') !== 'false';
        
        if (cachedData) {
            return NextResponse.json(isDesktop ? cachedData.desktop : cachedData.mobile);
        }

        const publicDir = path.join(process.cwd(), 'public');
        const pagesDir = path.join(publicDir, 'book-pages');

        if (!fs.existsSync(pagesDir)) {
            return NextResponse.json({ pages: [], macroGroupsMenu: [], totalPages: 0 });
        }

        const macros: any[] = [];
        
        const folders = fs.readdirSync(pagesDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        for (const folder of folders) {
            const folderPath = path.join(pagesDir, folder);
            
            const files = fs.readdirSync(folderPath)
                .filter(file => !file.startsWith('.') && /\.(webp|jpg|jpeg|png|avif)$/i.test(file))
                .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

            macros.push({
                name: folder,
                pages: files.map(file => `/book-pages/${folder}/${file}`)
            });
        }

        const desktopData = buildBookData(macros, true);
        const mobileData = buildBookData(macros, false);

        cachedData = {
            desktop: desktopData,
            mobile: mobileData
        };

        return NextResponse.json(isDesktop ? desktopData : mobileData);
    } catch (error) {
        console.error('Error reading book pages:', error);
        return NextResponse.json({ error: 'Failed to read pages' }, { status: 500 });
    }
}
