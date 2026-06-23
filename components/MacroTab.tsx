import React from "react";

interface MacroTabProps {
    menu: any;
    mIdx: number;
    currentPage: number;
    side: "left" | "right";
    onTabClick: (pageIndex: number) => void;
    onTabHover?: (pageIndex: number) => void;
}

const MACRO_COLORS = [
    { bg: "bg-[#2A2416]", hoverBg: "hover:bg-[#3D321D]", border: "border-[#CBA365]", text: "text-[#CBA365]" }, // Gold
    { bg: "bg-[#1C2826]", hoverBg: "hover:bg-[#263835]", border: "border-[#4FD1C5]", text: "text-[#4FD1C5]" }, // Teal
    { bg: "bg-[#2A1F20]", hoverBg: "hover:bg-[#3D2C2D]", border: "border-[#FC8181]", text: "text-[#FC8181]" }, // Rose
    { bg: "bg-[#1E2532]", hoverBg: "hover:bg-[#2A3446]", border: "border-[#90CDF4]", text: "text-[#90CDF4]" }, // Blue
    { bg: "bg-[#291C2C]", hoverBg: "hover:bg-[#3B283F]", border: "border-[#B794F4]", text: "text-[#B794F4]" }, // Purple
    { bg: "bg-[#1E2D24]", hoverBg: "hover:bg-[#2A4032]", border: "border-[#68D391]", text: "text-[#68D391]" }, // Green
];

export default function MacroTab({ menu, mIdx, currentPage, side, onTabClick, onTabHover }: MacroTabProps) {
    const isLeftTab = side === "left";
    const shouldRender = isLeftTab ? currentPage >= menu.pageIndex : currentPage < menu.pageIndex;
    const color = MACRO_COLORS[mIdx % MACRO_COLORS.length];

    if (!shouldRender) {
        return <div className="h-[90px] sm:h-[110px]"></div>;
    }

    return (
        <button
            onClick={() => onTabClick(menu.pageIndex)}
            onMouseEnter={() => onTabHover && onTabHover(menu.pageIndex)}
            className={`
                group h-[90px] sm:h-[110px] w-[35px] sm:w-[42px]
                flex items-center justify-center p-1.5
                transition-all duration-300 cursor-pointer overflow-hidden
                ${color.bg} border ${color.border}/60
                ${color.hoverBg} hover:border-opacity-100 hover:w-[42px] sm:hover:w-[50px]
                ${isLeftTab
                    ? "border-r-0 rounded-l-lg shadow-[-3px_3px_10px_rgba(0,0,0,0.35)]"
                    : "border-l-0 rounded-r-lg shadow-[3px_3px_10px_rgba(0,0,0,0.35)]"
                }
            `}
            title={menu.name}
        >
            <span
                className={`
                    [writing-mode:vertical-rl] text-[9px] sm:text-[10px] text-center
                    font-bold uppercase tracking-widest
                    whitespace-normal leading-tight break-words
                    ${color.text} group-hover:text-white transition-colors duration-200
                    ${isLeftTab ? "rotate-180" : ""}
                `}
            >
                {menu.name}
            </span>
        </button>
    );
}