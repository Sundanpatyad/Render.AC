import React, { useState, useEffect, useRef } from 'react'
import { Link, matchPath, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { NavbarLinks } from "../../../data/navbar-links"
import { fetchCourseCategories } from './../../services/operations/courseDetailsAPI'
import ProfileDropDown from '../core/Auth/ProfileDropDown'
import MobileProfileDropDown from '../core/Auth/MobileProfileDropDown'
import { AiOutlineShoppingCart, AiOutlineUser } from "react-icons/ai"
import { HiBars2 } from "react-icons/hi2";
import { MdKeyboardArrowDown } from "react-icons/md"
import { motion, AnimatePresence } from 'framer-motion'
import rzpLogo from "../../assets/Logo/rzp_logo.png";
import useOnClickOutside from '../../hooks/useOnClickOutside' // Ensure this hook is available

const Navbar = () => {
    const { token } = useSelector((state) => state.auth)
    const { user } = useSelector((state) => state.profile)
    const { totalItems } = useSelector((state) => state.cart)
    const location = useLocation()

    const [subLinks, setSubLinks] = useState([])
    const [loading, setLoading] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const drawerRef = useRef(null)

    useOnClickOutside(drawerRef, () => setIsDrawerOpen(false))

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const fetchSublinks = async () => {
        try {
            setLoading(true)
            const res = await fetchCourseCategories()
            setSubLinks(res)
        } catch (error) {
            console.log("Could not fetch the category list = ", error)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchSublinks()
    }, [])

    const matchRoute = (route) => {
        return matchPath({ path: route }, location.pathname)
    }

    const drawerVariants = {
        hidden: { y: "100%" },
        visible: { y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
        exit: { y: "100%", transition: { duration: 0.3 } }
    };

    return (
        <>
            <motion.nav 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    isScrolled ? 'bg-richblack-900 bg-opacity-90 backdrop-blur-md shadow-lg' : 'bg-transparent'
                }`}
            >
                <div className='flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto'>
                    <Link to="/" className='flex items-center space-x-2'>
                        <img src={rzpLogo} alt="Logo" className='w-8 h-8 rounded-full' />
                        <h1 className='font-semibold text-sm md:text-xl text-white'>Awakening Classes</h1>
                    </Link>

                    {/* ... (rest of the navbar code remains the same) ... */}

                    <div className='flex items-center space-x-2 sm:space-x-4'>
                        {user && user?.accountType !== "Instructor" && (
                            <Link to="/dashboard/cart" className="relative text-white hover:text-blue-200 transition-colors duration-200">
                                <AiOutlineShoppingCart className="text-xl sm:text-2xl" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-white text-richblack-900 rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center text-[10px] sm:text-xs font-bold">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                        )}
                        {token === null ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                                    className="flex items-center space-x-1 text-white hover:text-blue-200 transition-colors duration-200"
                                >
                                    <HiBars2 className={`transition-transform duration-200 ${isDrawerOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {isDrawerOpen && (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 0.5 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 bg-black z-40"
                                                onClick={() => setIsDrawerOpen(false)}
                                            />
                                            <motion.div
                                                ref={drawerRef}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                variants={drawerVariants}
                                                className="fixed bottom-0 left-0 right-0 z-50 bg-black rounded-t-3xl shadow-lg"
                                            >
                                                <div className="p-4">
                                                    <div className="w-12 h-1 bg-gray-500 rounded-full mx-auto mb-4" />
                                                    <Link
                                                        to="/login"
                                                        className="block px-4 py-3 text-base text-white hover:bg-slate-700 rounded-lg transition-colors duration-200"
                                                        onClick={() => setIsDrawerOpen(false)}
                                                    >
                                                        Log in
                                                    </Link>
                                                    <Link
                                                        to="/signup"
                                                        className="block px-4 py-3 text-base text-white hover:bg-slate-700 rounded-lg transition-colors duration-200 mt-2"
                                                        onClick={() => setIsDrawerOpen(false)}
                                                    >
                                                        Sign Up
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <>
                                <div className='hidden sm:block'>
                                    <ProfileDropDown />
                                </div>
                                <div className='sm:hidden'>
                                    <MobileProfileDropDown />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.nav>
            {/* This div acts as a spacer to prevent content from being hidden behind the navbar */}
            <div className="h-[64px] md:h-[72px]"></div>
        </>
    )
}

export default Navbar