import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useQuery } from 'react-query'

import HighlightText from '../components/core/HomePage/HighlightText'
import CTAButton from "../components/core/HomePage/Button"
import InstructorSection from '../components/core/HomePage/InstructorSection'
import Footer from '../components/common/Footer'
import ReviewSlider from '../components/common/ReviewSlider'
import ConfirmationModal from "../components/common/ConfirmationModal"

import { getCatalogPageData } from '../services/operations/pageAndComponentData'
import { fetchAllMockTests } from '../services/operations/mocktest'
import { buyItem } from '../services/operations/studentFeaturesAPI'
import { addToCart, removeFromCart } from '../slices/cartSlice'

import { MdOutlineRateReview } from 'react-icons/md'
import { FaArrowRight, FaBookOpen, FaShoppingCart } from "react-icons/fa"

import { fadeIn } from './../components/common/motionFrameVarients'
import { ACCOUNT_TYPE } from "../utils/constants"

import Marquee from '../components/magicui/marquee'
import CourseReviewModal from '../components/core/ViewCourse/CourseReviewModal'

const MockTestCard = React.memo(({ mockTest, handleAddToCart, handleRemoveFromCart, handleBuyNow, handleStartTest, setShowLoginModal, isLoggedIn, userId }) => {
  const { cart } = useSelector((state) => state.cart)
  const [isInCart, setIsInCart] = useState(false)

  useEffect(() => {
    setIsInCart(cart.some(item => item._id === mockTest._id))
  }, [cart, mockTest._id])

  const isEnrolled = mockTest.studentsEnrolled?.includes(userId)

  const handleButtonClick = (action) => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
    } else {
      action(mockTest)
    }
  }

  return (
    <Link to={`/mock-test/${mockTest._id}`} 
      className="bg-richblack-900 w-72 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col"
    >
      <div className="relative h-36 bg-gradient-to-br from-white to-pink-500">
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 p-3">
          <h3 className="text-lg font-bold text-white text-center">{mockTest.seriesName}</h3>
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <p className="text-sm text-richblack-100 mb-3 line-clamp-3">{mockTest.description}</p>
        <div className="flex justify-between items-center text-sm text-richblack-200 mb-3">
          <div className="flex items-center">
            <p className="font-medium">₹{mockTest.price}</p>
          </div>
          <div className="flex items-center">
            <FaBookOpen className="mr-1 text-richblack-50" />
            <p className="font-medium">{mockTest.mockTests?.length || 0} Tests</p>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          {isLoggedIn ? (
            isEnrolled ? (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleStartTest(mockTest._id)
                }}
                className="w-full py-2 px-3 bg-white text-richblack-900 font-semibold rounded-lg text-center transition-all duration-300 hover:bg-richblack-900 hover:text-white text-sm"
              >
                Start Test
              </button>
            ) : (
              <>
                {isInCart ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleButtonClick(handleRemoveFromCart)
                    }}
                    className="w-full py-2 px-3 bg-richblack-700 text-white font-semibold rounded-lg text-center transition-all duration-300 hover:bg-richblack-600 text-sm"
                  >
                    View Cart
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleButtonClick(handleAddToCart)
                    }}
                    className="w-full py-2 px-3 bg-richblack-700 text-white font-semibold rounded-lg text-center transition-all duration-300 hover:bg-richblack-600 text-sm"
                  >
                    <FaShoppingCart className="inline mr-1" />
                    Add to Cart
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    handleButtonClick(handleBuyNow)
                  }}
                  className="w-full py-2 px-3 bg-white text-richblack-900 font-semibold rounded-lg text-center transition-all duration-300 hover:bg-richblack-900 hover:text-white text-sm"
                >
                  Buy Now
                </button>
              </>
            )
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault()
                setShowLoginModal(true)
              }}
              className="w-full py-2 px-3 bg-white text-richblack-900 font-semibold rounded-lg text-center transition-all duration-300 hover:bg-richblack-900 hover:text-white text-sm"
            >
              Login to Purchase
            </button>
          )}
        </div>
      </div>
    </Link>
  )
})

const Home = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [reviewModal, setReviewModal] = useState(false)

  const categoryID = "6506c9dff191d7ffdb4a3fe2" // hard coded

  const { data: catalogPageData } = useQuery(
    ['catalogPageData', categoryID],
    () => getCatalogPageData(categoryID, dispatch),
    { staleTime: Infinity }
  )

  const { data: mockTests } = useQuery(
    ['mockTests', token],
    () => fetchAllMockTests(token),
    { 
      staleTime: Infinity,
      select: (data) => data.filter(test => test.status !== 'draft')
    }
  )

  const isLoggedIn = !!token

  const handleAddToCart = useCallback(async (mockTest) => {
    if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("Instructors can't add mock tests to cart.")
      return
    }

    dispatch(addToCart(mockTest))
    toast.success("Added to cart successfully!")
  }, [user, dispatch])

  const handleRemoveFromCart = useCallback(async (mockTest) => {
    dispatch(removeFromCart(mockTest))
    toast.success("Removed from cart successfully!")
  }, [dispatch])

  const handleBuyNow = useCallback(async (mockTest) => {
    if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("Instructors can't purchase mock tests.")
      return
    }

    try {
      await buyItem(token, [mockTest._id], ['MOCK_TEST'], user, navigate, dispatch)
    } catch (error) {
      console.error("Error purchasing mock test:", error)
      toast.error("Failed to purchase the mock test. Please try again.")
    }
  }, [token, user, navigate, dispatch])

  const handleStartTest = useCallback((mockTestId) => {
    navigate(`/view-mock/${mockTestId}`)
  }, [navigate])

  const MemoizedMockTestCard = useMemo(() => MockTestCard, [])

  return (
    <div className='overflow-hidden'>
      <div className='relative h-100vh mb-40 md:h-100vh justify-center mx-auto flex flex-col w-11/12 max-w-full items-center text-white '>
        <Link to={"/mocktest"}>
          <div className='z-0 group p-1 mx-auto rounded-full bg-transparent border border-richblack-25 mt-20 font-bold text-richblack-200
                          transition-all duration-200 hover:scale-95 w-fit'>
            <div className='flex flex-row items-center gap-2 rounded-full px-5 py-[3px]
                transition-all duration-200 group-hover:bg-richblack-900'>
              <p>Mock Tests</p>
              <FaArrowRight />
            </div>
          </div>
        </Link>
        <Marquee/>

        <motion.div
          id='heading-hero'
          variants={fadeIn('left', 0.1)}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: false, amount: 0.1 }}
          className='text-center text-gray-200 text-4xl font-semibold w-80 lg:w-full lg:text-6xl  '
        >
          We Only Teach <br /> What we are <i>really</i> really <i>Good </i>At <br /> 
          <HighlightText text={"Awakening Classes"} />
        </motion.div>

        <motion.div
          variants={fadeIn('right', 0.1)}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: false, amount: 0.1 }}
          className='mt-2 w-[90%] text-center text-base lg:text-lg font-bold text-richblack-300'
        >
          With our online courses, you can learn at your own pace, from anywhere in the world, and get access to a wealth of resources, quizzes, and personalized feedback from instructors.
        </motion.div>

        <div className='flex flex-row gap-7 mt-8'>
          <CTAButton active={false} linkto={"/login"}>
            Explore The Knowledge
          </CTAButton>
        </div>
      </div>

      <div className='relative mx-auto flex flex-col w-11/12 max-w-full mt-10 items-center text-white justify-between'>
        <div className='text-5xl lg:text-3xl font-semibold'>
          Courses That Make an
          <HighlightText text={"Impact "} />
        </div>
        <p className='mt-2 w-[90%] text-center text-base lg:text-lg font-bold text-richblack-300'>
          Our courses are designed and taught by experts who have years of experience and are passionate about sharing their knowledge with you.
        </p>
       
        <h2 className="text-3xl mt-20 font-bold text-richblack-5 mb-6">Popular Mock Tests</h2>
        <div className="flex justify-center align-center w-full max-w-full">
          <div className="overflow-x-auto pb-4">
            <div className="flex space-x-4" style={{ width: `${mockTests?.length * 300}px` }}>
              {mockTests?.map((mockTest) => (
                <MemoizedMockTestCard 
                  key={mockTest._id} 
                  mockTest={mockTest} 
                  handleAddToCart={handleAddToCart}
                  handleRemoveFromCart={handleRemoveFromCart}
                  handleBuyNow={handleBuyNow}
                  handleStartTest={handleStartTest}
                  setShowLoginModal={setShowLoginModal}
                  isLoggedIn={isLoggedIn}
                  userId={user?._id}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='mt-14 w-11/12 mx-auto max-w-full flex-col items-center justify-between gap-8 first-letter bg-black text-white'>
        <InstructorSection />

        <h1 className="text-center text-3xl lg:text-4xl font-semibold mt-8 flex justify-center items-center gap-x-3">
          Reviews from other learners
           <MdOutlineRateReview onClick={()=>setReviewModal(true)} className='text-white' />
        </h1>
        
        <ReviewSlider />
      </div>

      <Footer />
      { token && reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
      {showLoginModal && (
        <ConfirmationModal
          modalData={{
            title: "You are not logged in",
            text1: "Please log in to continue.",
            btn1Text: "Login",
            btn2Text: "Cancel",
            btn1Handler: () => navigate("/login"),
            btn2Handler: () => setShowLoginModal(false),
          }}
        />
      )}
    </div>
  )
}

export default React.memo(Home)