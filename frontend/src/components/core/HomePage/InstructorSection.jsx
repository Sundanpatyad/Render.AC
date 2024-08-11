import React from 'react'
import Instructor from '../../../assets/Images/teacher2.png'
import HighlightText from './HighlightText'
import CTAButton from "../HomePage/Button"
import { FaArrowRight } from 'react-icons/fa'
import Img from './../../common/Img';


import { motion } from 'framer-motion'
import { scaleUp } from './../../common/motionFrameVarients';


const InstructorSection = () => {
  return (
    <div>
      <div className='flex flex-col-reverse lg:flex-row gap-10 lg:gap-20 items-center'>

        <motion.div
         
          className='lg:w-[50%] '>
          <Img
            src={Instructor}
            alt="Instructor"
            className='shadow-white rounded-3xl'
          />
        </motion.div>

        <div className='lg:w-[50%] flex flex-col'>
          <div className='text-3xl text-center lg:text-4xl font-semobold mb-2'>
            Enroll Now <br /> <strong>Mock Test</strong>
              {/* <HighlightText text={"Mock Test"} /> */}
          </div>

          <p className='font-medium text-[16px] text-center text-richblack-300 mb-12'>
            With our Mock Tests Imporve your skills and make an impact in your journey.
          </p>

          {/* <div className='w-fit'>
            <CTAButton active={true} linkto={"/signup"}>
              <div className='flex flex-row gap-2 items-center'>
                Start Learning Today
                <FaArrowRight />
              </div>
            </CTAButton>
          </div> */}
        </div>

      </div>
    </div>
  )
}

export default InstructorSection
