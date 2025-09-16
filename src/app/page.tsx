'use client'

import { useEffect, useState } from 'react'
import IssueCard from '@/components/IssueCard'
import AnimateOnScroll from '@/components/AnimateOnScroll'
import ParallaxSection from '@/components/ParallaxSection'
import InteractiveNav from '@/components/InteractiveNav'

export default function Home() {
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null)

  // Auto-locate user when page loads
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
          console.log('User location obtained:', position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          console.log('Could not get user location:', error.message)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    }
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-br from-civic-gray-bg via-civic-cream to-civic-sand relative overflow-hidden anim-gradient-shift">
      {/* Interactive Sticky Navigation Bar */}
      <InteractiveNav />
      {/* Hero Section - Part 1: Report Local Issues */}
      <ParallaxSection speed={0.3}>
        <section id="home" className="relative px-4 pt-32 pb-20 sm:px-6 lg:px-8 z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <AnimateOnScroll animation="anim-text-reveal">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-civic-slate leading-tight mb-8 bg-gradient-to-r from-civic-primary to-civic-accent-purple bg-clip-text text-transparent">
                  See an Issue? Report It.
                </h1>
              </AnimateOnScroll>
              <AnimateOnScroll animation="anim-slide-up" delay={300}>
                <p className="text-2xl text-civic-gray max-w-4xl mx-auto leading-relaxed">
                  Upload a photo, automatically capture location, and help your city address 
                  civic issues quickly and efficiently.
                </p>
              </AnimateOnScroll>
              <AnimateOnScroll animation="anim-bounce-in" delay={600}>
                <div className="mt-10">
                  <a 
                    href="#report" 
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-civic-primary to-civic-primary-dark hover:from-civic-primary-dark hover:to-civic-primary text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-civic-primary/25 anim-card-float"
                  >
                    <span>Start Reporting</span>
                    <div className="w-5 h-5 anim-icon-spin">🚀</div>
                  </a>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>
      </ParallaxSection>

      {/* Hero Section - Part 2: Make Your Community Better */}
      <ParallaxSection speed={0.2}>
        <section className="relative px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-r from-civic-accent/10 via-civic-primary/5 to-civic-accent-purple/10 backdrop-blur-sm z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <AnimateOnScroll animation="anim-slide-left">
                <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-8">
                  <span className="bg-gradient-to-r from-civic-slate to-civic-accent bg-clip-text text-transparent">Make Your Community Better</span>
                </h2>
              </AnimateOnScroll>
              <AnimateOnScroll animation="anim-slide-right" delay={400}>
                <p className="text-xl text-civic-gray max-w-3xl mx-auto leading-relaxed">
                  Every report you submit helps build a safer, cleaner, and more livable community 
                  for everyone. Your voice matters.
                </p>
              </AnimateOnScroll>
            </div>
          </div>
        </section>
      </ParallaxSection>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gradient-to-r from-civic-slate to-civic-slate-light relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="anim-scale-in">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                How It Works
              </h2>
              <p className="text-xl text-civic-gray-lighter max-w-3xl mx-auto">
                Reporting civic issues has never been easier. Follow these simple steps to make a difference.
              </p>
            </div>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <AnimateOnScroll animation="anim-bounce-in" delay={200}>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-civic-primary to-civic-accent text-white rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-civic-primary/30 transform group-hover:rotate-12 group-hover:scale-125 transition-all duration-500 ease-out shadow-lg hover:shadow-civic-primary/50">
                  <span className="text-3xl font-bold group-hover:animate-pulse">1</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-civic-primary-light transition-colors duration-300">Take a Photo</h3>
                <p className="text-lg text-civic-gray-lighter leading-relaxed group-hover:text-white transition-colors duration-300">
                  Capture the civic issue with your smartphone camera. The app automatically extracts location data from your photo.
                </p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="anim-bounce-in" delay={400}>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-civic-accent to-civic-accent-orange text-white rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-civic-accent/30 transform group-hover:-rotate-12 group-hover:scale-125 transition-all duration-500 ease-out shadow-lg hover:shadow-civic-accent/50">
                  <span className="text-3xl font-bold group-hover:animate-pulse">2</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-civic-accent-light transition-colors duration-300">Auto-Location</h3>
                <p className="text-lg text-civic-gray-lighter leading-relaxed group-hover:text-white transition-colors duration-300">
                  Your device's GPS and photo metadata automatically pinpoint the exact location of the issue for precise reporting.
                </p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="anim-bounce-in" delay={600}>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-civic-accent-purple to-civic-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-civic-accent-purple/30 transform group-hover:rotate-12 group-hover:scale-125 transition-all duration-500 ease-out shadow-lg hover:shadow-civic-accent-purple/50">
                  <span className="text-3xl font-bold group-hover:animate-pulse">3</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-civic-accent-purple transition-colors duration-300">Track Progress</h3>
                <p className="text-lg text-civic-gray-lighter leading-relaxed group-hover:text-white transition-colors duration-300">
                  Monitor your report's status and see how your contribution helps improve the community on our interactive map.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Issue Categories Grid */}
      <section id="report" className="h-screen w-full">
        <div className="w-full h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full w-full">
            <AnimateOnScroll animation="anim-slide-left" delay={200}>
              <IssueCard
                title="Garbage Dumps"
                description="Report illegal dumping, overflowing bins, and litter that affects community cleanliness and health."
                category="garbage"
                backgroundImage="https://img.freepik.com/premium-photo/garbage-container-garbage-can-rubbish-is-scattered-around-trash-can-street_314149-4012.jpg"
                href="/report/garbage"
              />
            </AnimateOnScroll>
            
            <AnimateOnScroll animation="anim-scale-in" delay={400}>
              <IssueCard
                title="Potholes"
                description="Document road damage, potholes, and surface issues that impact vehicle safety and traffic flow."
                category="pothole"
                backgroundImage="https://cdn.cosmos.so/dfc208a1-1de0-4f88-9571-a16bc2e800d0?format=jpeg"
                href="/report/pothole"
              />
            </AnimateOnScroll>
            
            <AnimateOnScroll animation="anim-slide-right" delay={600}>
              <IssueCard
                title="Other Issues"
                description="Report street lights, graffiti, vandalism, and other civic concerns that need attention."
                category="other"
                backgroundImage="https://cdn.cosmos.so/422d4c21-5992-4ce3-a1f0-0f2de96603fd?format=jpeg"
                href="/report/other"
              />
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-civic-slate relative overflow-hidden">
        {/* Background animation overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-civic-slate/90 to-civic-slate-light/90 opacity-50"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <AnimateOnScroll animation="anim-scale-in">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Make a Difference?
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="anim-slide-up" delay={300}>
            <p className="text-xl text-civic-gray-lighter mb-10 leading-relaxed">
              Join thousands of citizens who are actively improving their communities through civic reporting.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll animation="anim-slide-up" delay={600}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#report" 
                className="group bg-gradient-to-r from-civic-accent to-civic-primary hover:from-civic-primary hover:to-civic-accent text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-civic-accent focus:ring-offset-2 focus:ring-offset-civic-slate transform hover:scale-105 hover:shadow-2xl hover:shadow-civic-primary/25 anim-card-float"
              >
                <span className="relative z-10">Start Reporting Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-civic-primary to-civic-accent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              <a 
                href="#how-it-works" 
                className="group border-2 border-white text-white hover:bg-white hover:text-civic-slate px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-civic-slate transform hover:scale-105 hover:shadow-2xl hover:shadow-white/25"
              >
                <span className="relative z-10">Learn More</span>
              </a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-8 bg-gradient-to-br from-civic-gray-bg via-civic-cream to-civic-sand border-t border-civic-gray-lighter/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-civic-gray text-sm">
              © 2025 Civic Eye. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}