import React, { useState, useCallback, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { useQuery } from 'react-query'
import Footer from "../components/common/Footer"
import Loading from './../components/common/Loading'
import ConfirmationModal from "../components/common/ConfirmationModal"
import { getCatalogPageData } from '../services/operations/pageAndComponentData'
import { fetchCourseCategories } from './../services/operations/courseDetailsAPI'
import { addToCart } from '../slices/cartSlice'
import { buyItem } from '../services/operations/studentFeaturesAPI'
import toast from 'react-hot-toast'
import { FaBookOpen, FaShoppingCart } from 'react-icons/fa'
import { ACCOUNT_TYPE } from "../utils/constants"

const CourseCard = React.memo(({ course, handleAddToCart, handleBuyNow, isLoggedIn }) => {
    const [isEnrolled, setIsEnrolled] = useState(false)
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.profile)

    React.useEffect(() => {
        setIsEnrolled(course.studentsEnrolled?.includes(user?._id))
    }, [course.studentsEnrolled, user?._id])

    return (
        <div 
            className="bg-richblack-900 w-full rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col"
            onClick={() => navigate(`/courses/${course._id}`)}
        >
            <div className="relative h-28 sm:h-32 md:h-40">
                <img 
                    src={course.thumbnail} 
                    alt={course.courseName}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white text-center p-2">{course.courseName}</h3>
                </div>
            </div>
            <div className="p-3 sm:p-4 md:p-6 flex-grow flex flex-col justify-between">
                <p className="text-xs sm:text-sm md:text-base text-richblack-100 mb-2 sm:mb-4 line-clamp-2">{course.courseDescription}</p>
                <div className="flex justify-between items-center text-xs sm:text-sm text-richblack-200 mb-2 sm:mb-4 md:mb-6">
                    <div className="flex items-center">
                        <p className="font-medium">₹{course.price}</p>
                    </div>
                    <div className="flex items-center">
                        <FaBookOpen className="mr-1 text-richblack-50" />
                        <p className="font-medium">{course.courseDuration}</p>
                    </div>
                </div>
                <div className="flex flex-col space-y-2">
                    {isEnrolled ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/view-course/${course._id}/section/${course.courseContent?._id}/sub-section/${course.courseContent?.subSection?._id}`)
                            }}
                            className="w-full py-2 px-3 bg-white text-richblack-900 font-semibold rounded-lg text-center transition-all duration-300 hover:bg-richblack-900 hover:text-white text-xs sm:text-sm"
                        >
                            Go to Course
                        </button>
                    ) : isLoggedIn ? (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleAddToCart(course)
                                }}
                                className="w-full py-2 px-3 bg-richblack-700 text-white font-semibold rounded-lg text-center transition-all duration-300 hover:bg-richblack-600 text-xs sm:text-sm"
                            >
                                <FaShoppingCart className="inline mr-1" />
                                Add to Cart
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleBuyNow(course)
                                }}
                                className="w-full py-2 px-3 bg-white text-richblack-900 font-semibold rounded-lg text-center transition-all duration-300 hover:bg-richblack-900 hover:text-white text-xs sm:text-sm"
                            >
                                Buy Now
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                navigate("/login")
                            }}
                            className="w-full py-2 px-3 bg-white text-richblack-900 font-semibold rounded-lg text-center transition-all duration-300 hover:bg-richblack-900 hover:text-white text-xs sm:text-sm"
                        >
                            Login to Purchase
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
})

function Catalog() {
    const { catalogName } = useParams()
    const [active, setActive] = useState(1)
    const [confirmationModal, setConfirmationModal] = useState(null)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { token } = useSelector((state) => state.auth)
    const { user } = useSelector((state) => state.profile)

    const isLoggedIn = !!token

    // Fetch categories
    const { data: categories = [] } = useQuery('categories', fetchCourseCategories, {
        staleTime: Infinity,
        cacheTime: Infinity,
    })

    const categoryId = useMemo(() => {
        return categories.find(
            (ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName
        )?._id
    }, [categories, catalogName])

    // Fetch catalog page data
    const { data: currentCatalogData, isLoading } = useQuery(
        ['catalogPageData', categoryId],
        () => getCatalogPageData(categoryId),
        {
            enabled: !!categoryId,
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
        }
    )

    const handleAddToCart = useCallback(async (course) => {
        if (!isLoggedIn) {
            navigate("/login")
            return
        }

        if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
            toast.error("Instructors can't add courses to cart.")
            return
        }

        dispatch(addToCart(course))
    }, [isLoggedIn, user, navigate, dispatch])

    const handleBuyNow = useCallback(async (course) => {
        if (!isLoggedIn) {
            navigate("/login")
            return
        }

        if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
            toast.error("Instructors can't purchase courses.")
            return
        }

        try {
            await buyItem(token, [course._id], ['course'], user, navigate, dispatch)
            // Note: We're not updating the local state here as React Query will handle refetching
        } catch (error) {
            console.error("Error purchasing course:", error)
            toast.error("Failed to purchase course")
        }
    }, [isLoggedIn, user, navigate, dispatch, token])

    const CourseCardSkeleton = () => (
        <div className="bg-richblack-900 w-full rounded-xl overflow-hidden shadow-lg animate-pulse">
            <div className="h-40 bg-richblack-700"></div>
            <div className="p-6">
                <div className="h-4 bg-richblack-700 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-richblack-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-richblack-700 rounded w-1/4 mb-4"></div>
                <div className="h-8 bg-richblack-700 rounded mb-2"></div>
                <div className="h-8 bg-richblack-700 rounded"></div>
            </div>
        </div>
    )

    const renderCourseCards = (courses) => {
        if (isLoading) {
            return Array(6).fill().map((_, index) => (
                <CourseCardSkeleton key={index} />
            ))
        }
        return courses?.map((course) => (
            <CourseCard
                key={course._id}
                course={course}
                handleAddToCart={handleAddToCart}
                handleBuyNow={handleBuyNow}
                isLoggedIn={isLoggedIn}
            />
        ))
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Hero Section */}
            {/* <div className="bg-richblack-800 px-4 py-8 sm:py-12">
                <div className="mx-auto flex min-h-[180px] sm:min-h-[220px] max-w-maxContentTab flex-col justify-center gap-4 lg:max-w-maxContent">
                    <p className="text-xs sm:text-sm text-richblack-300">
                        {`Home / Catalog / `}
                        <span className="text-white">
                            {currentCatalogData?.selectedCategory?.name}
                        </span>
                    </p>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl text-richblack-5 font-bold">
                        {currentCatalogData?.selectedCategory?.name}
                    </h1>
                    <p className="max-w-[870px] text-sm sm:text-base text-richblack-200">
                        {currentCatalogData?.selectedCategory?.description}
                    </p>
                </div>
            </div> */}

            {/* Courses Section */}
            <div className="flex-grow mx-auto w-full max-w-maxContent px-4 py-8 sm:py-12">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-richblack-5 mb-4">Courses to get you started</h2>
                <div className="my-4 flex border-b border-b-richblack-600 text-xs sm:text-sm">
                    <p
                        className={`px-2 sm:px-4 py-2 ${active === 1
                            ? "border-b border-b-white text-white"
                            : "text-richblack-50"
                            } cursor-pointer`}
                        onClick={() => setActive(1)}
                    >
                        Most Popular
                    </p>
                    <p
                        className={`px-2 sm:px-4 py-2 ${active === 2
                            ? "border-b border-b-white text-white"
                            : "text-richblack-50"
                            } cursor-pointer`}
                        onClick={() => setActive(2)}
                    >
                        New
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8">
                    {renderCourseCards(currentCatalogData?.selectedCategory?.courses)}
                </div>
            </div>

            {/* Top Courses Section */}
            <div className="mx-auto w-full max-w-maxContent px-4 py-8 sm:py-12">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-richblack-5 mb-4">
                    Top Courses in {currentCatalogData?.differentCategory?.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8">
                    {renderCourseCards(currentCatalogData?.differentCategory?.courses)}
                </div>
            </div>

            {/* Frequently Bought Section */}
            <div className="mx-auto w-full max-w-maxContent px-4 py-8 sm:py-12">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-richblack-5 mb-4">Frequently Bought</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8">
                    {renderCourseCards(currentCatalogData?.mostSellingCourses?.slice(0, 4))}
                </div>
            </div>

            <Footer />
            {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
        </div>
    )
}

export default Catalog