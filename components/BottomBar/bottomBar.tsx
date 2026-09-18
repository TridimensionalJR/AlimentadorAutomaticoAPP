"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome } from "react-icons/fi";
import { GiDogHouse } from "react-icons/gi";
import gsap from "gsap";

const items = [
    {
        href: "/dashboard",
        label: "Início",
        icon: FiHome,
    },
    {
        href: "/conta",
        label: "Conta",
        icon: GiDogHouse,
    },
];

export default function BottomBar() {
    const pathname = usePathname();
    const indicatorRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    const activeIndex = Math.max(
        0,
        items.findIndex(
            (item) =>
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`)
        )
    );

    useEffect(() => {
        const indicator = indicatorRef.current;
        const activeItem = itemRefs.current[activeIndex];

        if (!indicator || !activeItem) return;

        const updatePosition = () => {
            const itemRect = activeItem.getBoundingClientRect();
            const parentRect =
                activeItem.parentElement?.getBoundingClientRect();

            if (!parentRect) return;

            const x =
                itemRect.left -
                parentRect.left +
                itemRect.width / 2 -
                24;

            gsap.to(indicator, {
                x,
                duration: 0.35,
                ease: "power2.out",
            });
        };

        updatePosition();

        window.addEventListener("resize", updatePosition);

        return () => {
            window.removeEventListener("resize", updatePosition);
        };
    }, [activeIndex]);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 w-full">
            <div className="relative w-full h-16 bg-white border-t border-gray-100">
                <div className="relative h-full flex items-center justify-around px-6">
                    <div
                        ref={indicatorRef}
                        className="absolute left-0 w-12 h-12 rounded-full bg-[#0d8ef0]"
                    />

                    {items.map((item, index) => {
                        const Icon = item.icon;
                        const active = index === activeIndex;

                        return (
                            <Link
                                key={item.href}
                                ref={(element) => {
                                    itemRefs.current[index] = element;
                                }}
                                href={item.href}
                                className={`relative z-10 w-12 h-12 flex items-center justify-center rounded-full cursor-pointer transition-colors duration-300 ${
                                    active
                                        ? "text-white"
                                        : "text-[#0d8ef0] hover:bg-[#0d8ef0] hover:text-white"
                                }`}
                                aria-label={item.label}
                            >
                                <Icon size={22} />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}