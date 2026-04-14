'use client'
import React, { useState } from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthModal from './AuthModal'

const NAV_Items = [
    "Home",
    "Bookings",
    "About Us",
    "Contact"
]

function Navbar() {
    const pathName = usePathname()
    const [authOpen, setAuthOpen] = useState(false)
    return (
        <>
            <motion.div
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`fixed top-3 left-1/2 -translate-x-1/2 w-[94%] md:w-[86%] z-50 rounded-full bg-[#0B0B0B] text-white shadow-[0_15px_50px_rgba(0,0,0,0.7)] py-3`}
            >
                {/* Navbar left side logo */}
                <div className='max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between'>
                    {/* Navbar logo Image */}
                    <Image src={'/logo.jpeg'} alt='logo' width={44} height={44} priority />

                    {/* Navbar Center Links */}
                    <div className='hidden md:flex items-center gap-10'>
                        {NAV_Items.map((i, index) => {
                            let href;
                            if (i === "Home") {
                                href = "/"
                            } else {
                                href = `/${i.toLowerCase()}`
                            }
                            const active = href === pathName
                            return <Link key={index} href={href} className={`text-sm font-medium transition ${active ? "text-white" : "text-gray-400 hover:text-white"}`} > {i}</Link>
                        })}
                    </div>

                    <button className='px-4 py-1.5 rounded-full bg-white text-black text-sm cursor-pointer' onClick={() => setAuthOpen(true)}>
                        Login
                    </button>
                </div>

            </motion.div >
            <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
        </>
    )
}

export default Navbar