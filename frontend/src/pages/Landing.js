import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 md:space-x-3">
              <div className="h-8 w-8 md:h-10 md:w-10 bg-gray-800 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <span className="text-lg md:text-xl font-bold tracking-tight text-gray-800">WorkBee</span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 md:gap-3">
              <Link to="/login/jobseeker" className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors">Job Seeker</Link>
              <Link to="/login/employer" className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors">Employer</Link>
              <Link to="/register" className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-800 transition-colors">Sign Up</Link>
            </div>
            {/* Mobile Menu Button */}
            <div className="sm:hidden flex items-center gap-2">
              <Link to="/login/jobseeker" className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-800 transition-colors">Login</Link>
              <Link to="/register" className="px-3 py-1.5 text-xs font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-800 transition-colors">Sign Up</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-16 pb-12 md:pb-20 lg:pb-28 relative overflow-hidden">
          {/* Decorative background elements - Hidden on mobile */}
          <div className="hidden md:block absolute top-10 left-10 w-48 h-48 lg:w-72 lg:h-72 bg-gray-800/5 rounded-full blur-3xl"></div>
          <div className="hidden md:block absolute bottom-20 right-20 w-64 h-64 lg:w-96 lg:h-96 bg-gray-800/5 rounded-full blur-3xl"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center relative z-10">
            <div>
              <span className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-gray-100 text-gray-800 text-xs md:text-sm font-medium mb-4 md:mb-6 border border-gray-200">
                Built for Kochi's workforce
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6 text-gray-800">
                Find work. Hire fast.
                <br />
                <span className="text-gray-600">All in one place.</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-xl mb-6 md:mb-8 leading-relaxed">
                A modern job platform designed for entry-level roles. Discover opportunities, apply in minutes, and manage hiring with clarity.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Link to="/register?type=jobseeker" className="inline-flex items-center justify-center px-5 md:px-6 py-3 text-sm md:text-base font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-800 transition-colors group shadow-md">
                  <span className="inline-flex items-center gap-2">
                    I'm a Job Seeker
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </span>
                </Link>
                <Link to="/register?type=employer" className="inline-flex items-center justify-center px-5 md:px-6 py-3 text-sm md:text-base font-medium text-gray-800 bg-white border-2 border-gray-800 rounded-lg hover:bg-gray-50 transition-colors group">
                  <span className="inline-flex items-center gap-2">
                    I'm an Employer
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              </div>
              <p className="mt-4 md:mt-6 text-xs md:text-sm text-gray-500 max-w-lg">
                New here? Get started in less than 2 minutes. No complex forms, just the essentials.
              </p>
            </div>

            <div className="relative">
              <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-5 md:px-8 py-6 md:py-10 space-y-4 md:space-y-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Why WorkBee?</h2>
                    <p className="text-sm md:text-base text-gray-600">We focus on unskilled and entry-level roles, helping you match quickly and confidently.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5">
                    {[
                      { title: 'Verified employers', description: 'Trusted companies actively hiring.' },
                      { title: 'Smart matching', description: 'Filters for skill, availability, location.' },
                      { title: 'Simple applications', description: 'Resume upload and status tracking.' },
                      { title: 'Hiring tools', description: 'Dashboards to manage posts and applicants.' },
                    ].map((item) => (
                      <div key={item.title} className="p-3 md:p-4 rounded-xl bg-white border border-gray-200 transition-all duration-200 hover:shadow-md">
                        <h3 className="font-semibold text-sm md:text-base text-gray-800 mb-1">{item.title}</h3>
                        <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats band */}
        <section className="py-8 md:py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { label: 'Active jobs', value: '1,200+' },
                { label: 'Employers', value: '350+' },
                { label: 'Applications', value: '25k+' },
                { label: 'Avg. time to hire', value: '3 days' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4 md:p-6 text-center shadow-sm">
                  <div className="text-2xl md:text-3xl font-bold text-gray-800">{s.value}</div>
                  <div className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trusted by */}
        <section className="py-8 md:py-12 bg-white border-y border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-xs md:text-sm mb-4 md:mb-6">Trusted by employers across Kochi</p>
            
            {/* Mobile: Horizontal Scroll */}
            <div className="md:hidden">
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-32 h-12 snap-center rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 text-xs uppercase tracking-wider">
                    Brand {i + 1}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Desktop: Grid */}
            <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-6 gap-4 items-center">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 text-xs uppercase tracking-wider">
                  Brand {i + 1}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Audience cards */}
        <section className="py-12 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Mobile: Horizontal Scroll */}
            <div className="md:hidden">
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
                {[
                  {
                    title: 'Job Seekers',
                    description: 'Browse curated openings, apply with ease, and track your applications with status updates.',
                    cta: { label: 'Explore jobs', href: '/jobs' },
                  },
                  {
                    title: 'Employers',
                    description: 'Post roles, review applicants, and communicate updates with built-in tools built for speed.',
                    cta: { label: 'Employer portal', href: '/login/employer' },
                  },
                  {
                    title: 'Community',
                    description: 'Find local training programs, career workshops, and support events across Kochi.',
                    cta: { label: 'See sessions', href: '/register/jobseeker' },
                  },
                ].map((card) => (
                  <div key={card.title} className="flex-shrink-0 w-[80vw] snap-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{card.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{card.description}</p>
                      <Link to={card.cta.href} className="text-gray-800 text-sm font-semibold hover:text-gray-700 group inline-flex items-center">
                        <span>{card.cta.label}</span>
                        <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="w-2 h-2 rounded-full bg-gray-300"></div>
                ))}
              </div>
            </div>
            
            {/* Desktop: Grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Job Seekers',
                  description: 'Browse curated openings, apply with ease, and track your applications with status updates.',
                  cta: { label: 'Explore jobs', href: '/jobs' },
                },
                {
                  title: 'Employers',
                  description: 'Post roles, review applicants, and communicate updates with built-in tools built for speed.',
                  cta: { label: 'Employer portal', href: '/login/employer' },
                },
                {
                  title: 'Community',
                  description: 'Find local training programs, career workshops, and support events across Kochi.',
                  cta: { label: 'See sessions', href: '/register/jobseeker' },
                },
              ].map((card) => (
                <div key={card.title} className="rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300">
                  <div className="p-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{card.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{card.description}</p>
                    <Link to={card.cta.href} className="text-gray-800 font-semibold hover:text-gray-700 group inline-flex items-center">
                      <span>{card.cta.label}</span>
                      <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 md:py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm text-center px-5 sm:px-8 md:px-12 py-8 md:py-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-gray-800">Ready to get started?</h2>
              <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">Choose your path and we'll guide you through the rest.</p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <Link to="/register/jobseeker" className="inline-flex items-center justify-center px-5 md:px-6 py-3 text-sm md:text-base font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-800 transition-colors group shadow-md">
                  <span className="inline-flex items-center gap-2">
                    Create Job Seeker Account
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </span>
                </Link>
                <Link to="/register/employer" className="inline-flex items-center justify-center px-5 md:px-6 py-3 text-sm md:text-base font-medium text-gray-800 bg-white border-2 border-gray-800 rounded-lg hover:bg-gray-50 transition-colors group">
                  <span className="inline-flex items-center gap-2">
                    Create Employer Account
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8">
            {/* Company Info */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link to="/" className="flex items-center space-x-2 mb-3 md:mb-4">
                <div className="h-8 w-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-gray-800">WorkBee</span>
              </Link>
              <p className="text-sm text-gray-600 mb-3 md:mb-4 leading-relaxed">
                Connecting job seekers with opportunities in Kochi. Built for entry-level roles and unskilled positions.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 bg-gray-200 hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors group">
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-200 hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors group">
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-200 hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors group">
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-200 hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors group">
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* For Job Seekers */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3 md:mb-4 uppercase tracking-wider">For Job Seekers</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/jobs" className="text-gray-600 hover:text-gray-800 transition-colors">Browse Jobs</Link></li>
                <li><Link to="/register/jobseeker" className="text-gray-600 hover:text-gray-800 transition-colors">Create Account</Link></li>
                <li><Link to="/login/jobseeker" className="text-gray-600 hover:text-gray-800 transition-colors">Job Seeker Login</Link></li>
                <li><Link to="/profile" className="text-gray-600 hover:text-gray-800 transition-colors">My Profile</Link></li>
                <li><Link to="/applications" className="text-gray-600 hover:text-gray-800 transition-colors">My Applications</Link></li>
              </ul>
            </div>

            {/* For Employers */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3 md:mb-4 uppercase tracking-wider">For Employers</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register/employer" className="text-gray-600 hover:text-gray-800 transition-colors">Post a Job</Link></li>
                <li><Link to="/login/employer" className="text-gray-600 hover:text-gray-800 transition-colors">Employer Login</Link></li>
                <li><Link to="/register/employer" className="text-gray-600 hover:text-gray-800 transition-colors">Create Account</Link></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Pricing Plans</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Resources</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3 md:mb-4 uppercase tracking-wider">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">Help Center</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 md:pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs md:text-sm text-gray-500 text-center md:text-left">
                © {new Date().getFullYear()} WorkBee. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6 text-xs md:text-sm">
                <a href="#" className="text-gray-500 hover:text-gray-800 transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-500 hover:text-gray-800 transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-500 hover:text-gray-800 transition-colors">Cookie Policy</a>
                <a href="#" className="text-gray-500 hover:text-gray-800 transition-colors">Accessibility</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
