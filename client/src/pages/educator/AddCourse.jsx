import React, { useRef, useState, useEffect } from 'react'
import uniqid from 'uniqid'
import Quill from 'quill'
import { assets } from '../../assets/assets';

const AddCourse = () => {

  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const [courseTitle, setCourseTitle] = useState('')
  const [coursePrice, setCoursePrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [image, setImage] = useState(null)
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);

  const [lectureDetails, setLectureDetails] = useState(
    {
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    }
  )

  useEffect(() => {
    // Initialize Quill only once
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow'
      });
    }
  }, []);

  return (
    <div className='h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <form className='flex flex-col gap-4 w-full max-w-md text-gray-500'>
        <div className='flex flex-col gap-1'>
          <p>Course Title</p>
          <input onChange={(e) => setCourseTitle(e.target.value)}
            type="text" 
            value={courseTitle} placeholder='Type here...' className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500' required/>
        </div>
        <div className='flex flex-col gap-1'>
          <p>Course Description</p>
          <div ref={editorRef}>
          </div>

          <div className='flex items-center justify-between flex-wrap'>
            <div className='flex flex-col gap-1'>
              <p>Course Price</p>
              <input onChange={(e) => setCoursePrice(e.target.value)}
                type="number"
                value={coursePrice}
                placeholder='0'
                className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500'
                required />
            </div>

            <div className='flex md:flex-row flex-col items-center gap-3'>
              <p>Course Thumbnail</p>
              <label htmlFor="thumbnailImage" className='flex items-center gap-3'>
                <img src={assets.file_upload_icon} alt="" className='p-3 bg-blue-500 rounded'/>
                <input type="file" id="thumbnailImage" onChange={e => setImage(e.target.files[0])} accept='image/*' hidden/>
                {image && <img className='max-h-10' src={URL.createObjectURL(image)} alt="" />}
              </label>
            </div>
          </div>

          <div className='flex flex-col gap-1'>
            <p>Discount %</p>
            <input onChange={(e) => setDiscount(e.target.value)}
              type="number"
              value={discount}
              placeholder='0' min={0} max={100}
              className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500'
              required />
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddCourse