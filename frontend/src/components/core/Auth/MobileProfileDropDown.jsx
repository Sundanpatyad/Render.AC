import { useRef, useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import useOnClickOutside from "../../../hooks/useOnClickOutside"
import Img from './../../common/Img';
import { logout } from "../../../services/operations/authAPI"
import { VscDashboard, VscSignOut } from "react-icons/vsc"
import { AiOutlineCaretDown, AiOutlineHome } from "react-icons/ai"
import { MdOutlineContactPhone } from "react-icons/md"
import { TbMessage2Plus } from "react-icons/tb"
import { PiNotebook } from "react-icons/pi"
import { fetchCourseCategories } from './../../../services/operations/courseDetailsAPI';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileProfileDropDown() {
    const { user } = useSelector((state) => state.profile)
    if (!user) return null

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const ref = useRef(null)

    useOnClickOutside(ref, () => setOpen(false))

    const [open, setOpen] = useState(false)
    const [subLinks, setSubLinks] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSublinks = async () => {
        try {
            setLoading(true)
            const res = await fetchCourseCategories();
            setSubLinks(res);
        }
        catch (error) {
            console.log("Could not fetch the category list = ", error);
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchSublinks();
    }, [])

    const dropdownVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="relative sm:hidden">
            <button 
                className="flex items-center gap-x-1 bg-black p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300"
                onClick={() => setOpen(!open)}
            >
                <Img
                    src={user?.image}
                    alt={`profile-${user?.firstName}`}
                    className='aspect-square w-[30px] rounded-full object-cover'
                />
                <AiOutlineCaretDown className={`text-sm text-white transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={dropdownVariants}
                        className="absolute min-w-[200px] top-[118%] right-0 z-[1000] overflow-hidden rounded-lg border-[1px] border-richblack-700 bg-black shadow-lg"
                        ref={ref}
                    >
                        {[
                            { to: "/dashboard/my-profile", icon: VscDashboard, label: "Dashboard" },
                            { to: "/", icon: AiOutlineHome, label: "Home" },
                            { to: "/catalog/mock-tests", icon: PiNotebook, label: "Courses" },
                            { to: "/mocktest", icon: PiNotebook, label: "Mock Tests" },
                            { to: "/about", icon: TbMessage2Plus, label: "About Us" },
                            { to: "/contact", icon: MdOutlineContactPhone, label: "Contact Us" },
                        ].map((item, index) => (
                            <motion.div key={index} variants={itemVariants} transition={{ delay: index * 0.1 }}>
                                <Link to={item.to} onClick={() => setOpen(false)}>
                                    <div className="flex w-full items-center gap-x-2 py-3 px-4 text-sm text-richblack-100 hover:bg-richblack-700 transition-colors duration-300">
                                        <item.icon className="text-lg text-white" />
                                        {item.label}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                        <motion.div variants={itemVariants} transition={{ delay: 0.6 }}>
                            <div
                                onClick={() => {
                                    dispatch(logout(navigate))
                                    setOpen(false)
                                }}
                                className="flex w-full items-center gap-x-2 py-3 px-4 text-sm text-richblack-100 hover:bg-richblack-700 transition-colors duration-300 cursor-pointer"
                            >
                                <VscSignOut className="text-lg text-white" />
                                Logout
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}