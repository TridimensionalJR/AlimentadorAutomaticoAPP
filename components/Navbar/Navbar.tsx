
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiLogOut, FiUser } from "react-icons/fi";

export default function Navbar() {
    const router = useRouter();

    function handleLogout() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        router.replace("/login");
    }

    return (
        <nav className="w-full h-16 bg-white border-b border-gray-100">
            <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center cursor-pointer">
                    <Image
                        src="/assets/logo.png"
                        alt="Logo da Tridimensional Jr"
                        width={150}
                        height={48}
                        className="w-auto h-10 object-contain"
                        priority
                    />
                </Link>

                <div className="flex items-center gap-3">
                    <Link
                        href="/conta"
                        className="w-10 h-10 flex items-center justify-center bg-white text-[#0d8ef0] rounded-full cursor-pointer"
                        aria-label="Conta"
                    >
                        <FiUser size={21} />
                    </Link>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-10 h-10 flex items-center justify-center bg-white text-[#0d8ef0] rounded-full cursor-pointer"
                        aria-label="Sair"
                    >
                        <FiLogOut size={21} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
