import { Outlet } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ChatWidget from '@/components/common/ChatWidget'
import BackgroundEffects from '@/components/common/BackgroundEffects'

export default function LandingLayout() {
  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <BackgroundEffects />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* Floating AI Security Assistant Chatbot */}
      <ChatWidget />
    </div>
  )
}
