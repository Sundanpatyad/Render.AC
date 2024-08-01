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

    const drawerVariants = {
        hidden: { y: "100%" },
        visible: { y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
        exit: { y: "100%", transition: { duration: 0.3 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="sm:hidden">
            <button 
                className="flex items-center gap-x-1 bg-black p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300"
                onClick={() => setOpen(true)}
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
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black z-40"
                            onClick={() => setOpen(false)}
                        />
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={drawerVariants}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-black rounded-t-3xl shadow-lg"
                            ref={ref}
                        >
                            <div className="p-4 overflow-y-auto max-h-[80vh]">
                                <div className="w-12 h-1 bg-gray-500 rounded-full mx-auto mb-4" />
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
                                            <div className="flex items-center gap-x-4 py-4 px-2 text-base text-richblack-100 hover:bg-richblack-700 transition-colors duration-300 rounded-lg">
                                                <item.icon className="text-2xl text-white" />
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
                                        className="flex items-center gap-x-4 py-4 px-2 text-base text-richblack-100 hover:bg-richblack-700 transition-colors duration-300 rounded-lg cursor-pointer"
                                    >
                                        <VscSignOut className="text-2xl text-white" />
                                        Logout
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}