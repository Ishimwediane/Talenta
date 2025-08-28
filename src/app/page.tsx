
import Link from "next/link"
import Image from "next/image";
import FeaturedBooks from "@/components/FeaturedBooks";
import FeaturedAudio from "@/components/FeaturedAudio";

export default function Home() {
  return (
  
<>

      {/* Hero Section - Sophisticated Design with Classical Bust */}
      <section className="relative text-black py-20 overflow-hidden bg-white">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="z-10 pl-8 lg:pl-16">
              <h1 className="text-4xl lg:text-5xl font-bold text-black mb-8">
                TALENTA<br />
                BOOKS & AUDIO
              </h1>
              <p className="text-lg text-black leading-relaxed mb-8">
                A creative home for readers and listeners. Discover books, audiobooks, and voices that connect our culture and imagination.
              </p>
              
              {/* Flowing Lines Container */}
              <div className="relative h-32 mb-8">
                <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="transparent" />
                      <stop offset="50%" stopColor="#F54A00" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  {/* First flowing line */}
                  <path 
                    d="M50,60 Q100,40 150,60 Q200,80 250,60 Q300,40 350,60" 
                    stroke="url(#lineGradient)" 
                    strokeWidth="3" 
                    fill="none"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(245, 74, 0, 0.5))' }}
                  />
                  {/* Second flowing line */}
                  <path 
                    d="M80,80 Q130,60 180,80 Q230,100 280,80 Q330,60 380,80" 
                    stroke="url(#lineGradient)" 
                    strokeWidth="2" 
                    fill="none"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(245, 74, 0, 0.4))' }}
                  />
                  {/* Decorative dots */}
                  <circle cx="150" cy="60" r="3" fill="#F54A00" />
                  <circle cx="250" cy="60" r="3" fill="#F54A00" />
                  <circle cx="180" cy="80" r="2" fill="#F54A00" />
                  <circle cx="280" cy="80" r="2" fill="#F54A00" />
                </svg>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6">
                <Link
                  href="/books"
                  className="text-black px-8 py-4 rounded-none font-bold text-lg hover:opacity-80 transition-colors text-center border border-black hover:bg-black hover:text-white"
                >
                  Explore Books
                </Link>
                <Link
                  href="/creators"
                  className="text-white px-8 py-4 rounded-none font-bold text-lg hover:opacity-80 transition-colors text-center"
                  style={{ backgroundColor: '#F54A00' }}
                >
                  Join Creators
                </Link>
              </div>
            </div>

            {/* Right Visual Element - Image */}
            <div className="relative">
              {/* Image Container */}
              <div className="relative w-full h-96 overflow-hidden" 
                   style={{ 
                     boxShadow: '0 0 30px rgba(245, 74, 0, 0.2)',
                     backgroundColor: 'white'
                   }}>
                <Image
                  src="/image/bk.png"
                  alt="Cultural Heritage"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-contain"
                />
              </div>
              
              {/* Additional flowing lines around the image */}
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path 
                    d="M10,20 Q30,10 50,20 Q70,30 90,20" 
                    stroke="#F54A00" 
                    strokeWidth="1" 
                    fill="none"
                    opacity="0.6"
                  />
                  <path 
                    d="M10,80 Q30,70 50,80 Q70,90 90,80" 
                    stroke="#F54A00" 
                    strokeWidth="1" 
                    fill="none"
                    opacity="0.6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Talenta */}
   <section className="relative overflow-hidden bg-[#101828] py-20">
      {/* Top white curve */}
    {/* Top white curve (horizontal left-to-right) */}
<div className="absolute top-0 left-0 right-0 h-[100px] overflow-hidden z-0">
  <svg
    className="w-full h-full"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
  >
    <path d="M0,0 C25,20 75,80 100,100 L100,0 L0,0 Z" fill="#ffffff" />
  </svg>
</div>


{/* Bottom white wave */}
<div className="absolute bottom-0 left-0 right-0 h-[150px] overflow-hidden z-0">
  <svg
    className="w-full h-full"
    viewBox="0 0 1440 320"
    preserveAspectRatio="none"
  >
    <path
      fill="#ffffff"
      d="M0,160 C120,200 240,120 360,160 C480,200 600,120 720,160 C840,200 960,120 1080,160 C1200,200 1320,120 1440,160 L1440,320 L0,320 Z"
    />
  </svg>
</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Visuals */}
          <div className="relative">
            {/* Main Circular Portrait */}
            <div className="relative w-96 h-96 mx-auto">
              <div className="w-96 h-96 rounded-full overflow-hidden" style={{ backgroundColor: "#F54A00" }}>
              <Image
  src="/image/book1.webp"
  alt="Marius Dojo founder portrait"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  style={{
    objectFit: "cover",
    borderRadius: "50%", // makes it circular
  }}
/>

               
              </div>
            </div>

            {/* Smaller Action Image */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-white relative">
            <Image
                  src="/image/audio.jpeg"
                  alt="Martial arts action shot"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Text Content */}
          <div className="pl-8 lg:pl-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
              ABOUT
              <br />
              <span style={{ color: "#F54A00" }}>TALENTA</span>
            </h2>
            <p className="text-lg text-white mb-6 leading-relaxed">
              Talenta is a platform where stories live in two forms: written and spoken. We celebrate Rwandan and global creativity through books and audio that educate, inspire, and connect.
            </p>
            <p className="text-lg text-white mb-6 leading-relaxed">
              Whether you prefer turning pages or pressing play, Talenta brings authors and voices together—so you can read deeply, listen freely, and share meaningfully.
            </p>
            <p className="text-lg text-white mb-8 leading-relaxed">
              Explore curated shelves, trending listens, and community favorites. Create with us, or discover new works every day.
            </p>
          </div>
        </div>
      </div>
    </section>
      {/* Books & Audio Highlight */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Top subtle branding */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-6xl font-bold opacity-10" style={{ color: '#F54A00' }}>
          TALENTA
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Visual */}
            <div className="relative">
              <div className="relative w-full h-96 overflow-hidden rounded-lg">
          <Image
                  src="/image/pod.png"
                  alt="Podcast Host"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
                
                {/* Flowing Lines on Image */}
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="podcastLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="#F54A00" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    {/* First flowing line */}
                    <path 
                      d="M20,30 Q40,20 60,30 Q80,40 90,30" 
                      stroke="url(#podcastLineGradient)" 
                      strokeWidth="2" 
                      fill="none"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(245, 74, 0, 0.5))' }}
                    />
                    {/* Second flowing line */}
                    <path 
                      d="M10,70 Q30,60 50,70 Q70,80 80,70" 
                      stroke="url(#podcastLineGradient)" 
                      strokeWidth="1.5" 
                      fill="none"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(245, 74, 0, 0.4))' }}
                    />
                    {/* Decorative dots */}
                    <circle cx="40" cy="30" r="2" fill="#F54A00" />
                    <circle cx="70" cy="30" r="2" fill="#F54A00" />
                    <circle cx="30" cy="70" r="1.5" fill="#F54A00" />
                    <circle cx="60" cy="70" r="1.5" fill="#F54A00" />
                  </svg>
                </div>
                
                {/* Microphone overlay */}
                <div className="absolute top-8 right-8 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8" fill="#F54A00" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </div>
              </div>
              
              {/* Moving Line Below Image */}
              <div className="relative mt-4 h-2 overflow-hidden">
                <div className="absolute inset-0">
                  <svg className="w-full h-full" viewBox="0 0 200 20" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="movingLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="20%" stopColor="#F54A00" />
                        <stop offset="80%" stopColor="#F54A00" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M0,10 Q50,5 100,10 Q150,15 200,10" 
                      stroke="url(#movingLineGradient)" 
                      strokeWidth="3" 
                      fill="none"
                      className="animate-pulse"
                      style={{ filter: 'drop-shadow(0 0 10px rgba(245, 74, 0, 0.6))' }}
                    />
                  </svg>
                </div>
                
                {/* Animated moving dot */}
                <div className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: '#F54A00', animationDelay: '0.5s' }}></div>
              </div>
            </div>

            {/* Right Column - Text Content */}
            <div className="pl-8 lg:pl-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-black mb-8">
                Read. Listen. Connect.
              </h2>
              
              <p className="text-lg text-black mb-8 leading-relaxed">
                Discover stories, ideas, and voices that shape our world. Explore books and audio—from cultural storytelling to contemporary thought—crafted by creators you can follow and support.
              </p>

              <div className="flex flex-col sm:flex-row gap-6">
                <Link
                  href="/audio"
                  className="text-black px-8 py-4 rounded-lg font-bold text-lg hover:opacity-80 transition-colors text-center flex items-center justify-center gap-3"
                  style={{ backgroundColor: '#F54A00' }}
                >
                  Start Listening
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </Link>
                <Link
                  href="/books"
                  className="text-black px-8 py-4 rounded-lg font-bold text-lg hover:opacity-80 transition-colors text-center flex items-center justify-center gap-3 border border-black"
                >
                  Browse Books
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturedBooks />
      <FeaturedAudio />

      {/* Community & Join Us Section */}
      

      {/* Final CTA Section */}
      <section className="py-20 relative overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Smart Words & Get Started */}
            <div className="text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold text-black mb-8 leading-tight">
                Ready to <span style={{ color: '#F54A00' }}>Transform</span><br />
                Your Journey?
              </h2>
              <p className="text-lg text-black mb-8 leading-relaxed">
                Join creators preserving Rwanda&apos;s rich heritage.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <Link
                  href="/signup"
                  className="text-white px-10 py-4 rounded-none font-bold text-lg hover:opacity-80 transition-colors text-center"
                  style={{ backgroundColor: '#F54A00' }}
                >
                  GET STARTED
                </Link>
              </div>
            </div>

            {/* Right - Hand Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-106 h-96">
          <Image
                  src="/image/ha.png"
                  alt="Cultural Heritage"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
                
                {/* Floating sphere above image */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full animate-pulse" style={{ backgroundColor: '#F54A00', boxShadow: '0 0 20px rgba(245, 74, 0, 0.6)' }}></div>
                
                {/* Connection line from sphere */}
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-px h-8" style={{ background: 'linear-gradient(to top, transparent, rgba(245, 74, 0, 0.3))' }}></div>
              </div>
            </div>
          </div>
    </div>
      </section>

  

     
 </>
  )
}
