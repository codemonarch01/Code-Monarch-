import React from 'react'
import VideoPlayer3D from './3DVideoPlayer'

// Lightweight wrapper that shows a fallback when no 3D/video is provided
const LessonViewer = ({ topic }) => {
  const subject = topic?.subject || ''
  const providedUrl = topic?.content?.videoUrl || topic?.videoUrl
  // Subject-wise demo fallbacks (replace with your preferred videos if needed)
  const DEMO_VIDEOS = {
    Chemistry: 'https://www.youtube.com/embed/TMubSggUOVE',
    Physics: 'https://www.youtube.com/embed/OmxIcQ7gP2M',
    Mathematics: 'https://www.youtube.com/embed/I0m2wz2hG6k',
    'Computer Science': 'https://www.youtube.com/embed/Po3VwR2ZB0Y'
  }
  const videoUrl = providedUrl || DEMO_VIDEOS[subject] || null
  const has3D = !!videoUrl || !!subject

  if (!has3D) {
    return (
      <div className="bg-white border rounded-xl p-6">
        <div className="text-gray-700">No 3D/AR video available for this topic yet.</div>
      </div>
    )
  }

  return (
    <VideoPlayer3D topic={{ title: topic?.title, subject }} videoUrl={videoUrl} isVisible />
  )
}

export default LessonViewer


