import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">WorkBee</span>
            </Link>
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login/jobseeker" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Job Seeker Login</Link>
              <Link to="/login/employer" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Employer Login</Link>
              <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">Create Account</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-800 text-sm font-medium mb-6 border border-gray-200">
                Built for Kochi's workforce
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900">
                Find work. Hire fast.
                <br />
                <span className="text-gray-600">All in one place.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-xl mb-8 leading-relaxed">
                A modern job platform designed for entry-level roles. Discover opportunities, apply in minutes, and manage hiring with clarity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register?type=jobseeker" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors group">
                  <span className="inline-flex items-center gap-2">
                    I'm a Job Seeker
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </span>
                </Link>
                <Link to="/register?type=employer" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-gray-900 bg-white border-2 border-gray-900 rounded-lg hover:bg-gray-50 transition-colors group">
                  <span className="inline-flex items-center gap-2">
                    I'm an Employer
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              </div>
              <p className="mt-6 text-sm text-gray-500 max-w-lg">
                New here? Get started in less than 2 minutes. No complex forms, just the essentials.
              </p>
            </div>

            <div className="relative">
              <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-8 py-10 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Why WorkBee?</h2>
                    <p className="text-gray-600">We focus on unskilled and entry-level roles, helping you match quickly and confidently.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { title: 'Verified employers', description: 'Trusted companies actively hiring.' },
                      { title: 'Smart matching', description: 'Filters for skill, availability, location.' },
                      { title: 'Simple applications', description: 'Resume upload and status tracking.' },
                      { title: 'Hiring tools', description: 'Dashboards to manage posts and applicants.' },
                    ].map((item) => (
                      <div key={item.title} className="p-4 rounded-xl bg-white border border-gray-200 transition-all duration-200 hover:shadow-md">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats band */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Active jobs', value: '1,200+' },
                { label: 'Employers', value: '350+' },
                { label: 'Applications', value: '25k+' },
                { label: 'Avg. time to hire', value: '3 days' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
                  <div className="text-3xl font-bold text-gray-900">{s.value}</div>
                  <div className="text-sm text-gray-600 mt-2">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trusted by */}
        <section className="py-12 bg-white border-y border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm mb-6">Trusted by employers across Kochi</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 items-center">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 text-xs uppercase tracking-wider">
                  Brand {i + 1}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Audience cards */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{card.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{card.description}</p>
                    <Link to={card.cta.href} className="text-gray-900 font-semibold hover:text-gray-700 group inline-flex items-center">
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
        <section className="py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm text-center px-6 sm:px-12 py-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">Ready to get started?</h2>
              <p className="text-lg text-gray-600 mb-8">Choose your path and we'll guide you through the rest.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register/jobseeker" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors group">
                  <span className="inline-flex items-center gap-2">
                    Create Job Seeker Account
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </span>
                </Link>
                <Link to="/register/employer" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-gray-900 bg-white border-2 border-gray-900 rounded-lg hover:bg-gray-50 transition-colors group">
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

      <footer className="py-8 text-center text-sm text-gray-500 border-t border-gray-200 bg-white">
        © {new Date().getFullYear()} WorkBee. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
