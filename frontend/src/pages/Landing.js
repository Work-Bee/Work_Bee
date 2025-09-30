import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_60%)]"></div>
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="h-11 w-11 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <svg className="h-7 w-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight">JobPortal</span>
            </Link>
            <div className="hidden sm:flex items-center space-x-4">
              <Link to="/login/jobseeker" className="text-sm font-semibold text-white/80 hover:text-white transition">Job Seeker Login</Link>
              <Link to="/login/employer" className="text-sm font-semibold text-white/80 hover:text-white transition">Employer Login</Link>
              <Link to="/register" className="inline-flex items-center px-4 py-2 rounded-full bg-white text-primary-600 font-semibold shadow-lg hover:shadow-xl transition">Create Account</Link>
            </div>
          </div>
        </header>

        <main className="relative z-10">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/15 text-white text-sm font-semibold mb-6">
                  Empowering unskilled talent in Kochi
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                  Your next opportunity begins here.
                </h1>
                <p className="text-lg sm:text-xl text-white/80 max-w-xl mb-8">
                  Whether you are seeking your first job or hiring dependable talent, our platform brings job seekers and employers together with tools built for success.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/login/jobseeker" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-primary-600 font-semibold shadow-md hover:shadow-xl transition">
                    I'm a Job Seeker
                  </Link>
                  <Link to="/login/employer" className="inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 border-white/60 text-white font-semibold hover:border-white hover:bg-white/10 transition">
                    I'm an Employer
                  </Link>
                </div>
                <p className="mt-6 text-sm text-white/70 max-w-lg">
                  Not sure where to start? Explore our resources below or talk to our support team to find the best path forward.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -inset-10 bg-white/10 rounded-3xl blur-3xl"></div>
                <div className="relative bg-white text-gray-900 rounded-3xl shadow-2xl overflow-hidden">
                  <div className="px-8 py-10 space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-primary-600 mb-2">Why JobPortal?</h2>
                      <p className="text-gray-600">We specialize in entry-level and unskilled roles around Kochi, making it easy to discover dependable opportunities fast.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {[
                        {
                          title: 'Verified employers',
                          description: 'Work with trusted companies actively hiring across the city.',
                        },
                        {
                          title: 'Smart matching',
                          description: 'Filters tuned to your skill level, availability, and location.',
                        },
                        {
                          title: 'Simple applications',
                          description: 'Apply in minutes from your phone with resume uploads and tracking.',
                        },
                        {
                          title: 'Hiring tools',
                          description: 'Employers get dashboards to manage job posts and review applicants.',
                        },
                      ].map((item) => (
                        <div key={item.title} className="p-4 rounded-2xl bg-primary-50 border border-primary-100 shadow-sm">
                          <h3 className="font-semibold text-primary-700 mb-1">{item.title}</h3>
                          <p className="text-sm text-primary-600 leading-relaxed">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white text-gray-900 py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  {
                    title: 'Job Seekers',
                    description: 'Browse curated openings, apply with ease, and track your applications with status updates.',
                    cta: {
                      label: 'Start exploring jobs',
                      href: '/jobs',
                    },
                  },
                  {
                    title: 'Employers',
                    description: 'Post roles, review applicants, and communicate updates with built-in tools built for speed.',
                    cta: {
                      label: 'Access employer portal',
                      href: '/login/employer',
                    },
                  },
                  {
                    title: 'Community',
                    description: 'Access local training programs, career workshops, and support events across Kochi.',
                    cta: {
                      label: 'See upcoming sessions',
                      href: '/register?type=jobseeker',
                    },
                  },
                ].map((card) => (
                  <div key={card.title} className="rounded-3xl bg-gray-50 p-8 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{card.title}</h3>
                    <p className="text-gray-600 mb-6">{card.description}</p>
                    <Link to={card.cta.href} className="text-primary-600 font-semibold hover:text-primary-700">
                      {card.cta.label} →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 lg:py-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-lg text-white/80 mb-8">
                Choose how you want to use the platform and we will guide you through the rest of the journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register?type=jobseeker" className="btn btn-secondary btn-lg bg-white text-primary-600 hover:bg-gray-100">
                  Create Job Seeker Account
                </Link>
                <Link to="/register?type=employer" className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-primary-600">
                  Create Employer Account
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-black/20 py-6 text-center text-sm text-white/70">
          © {new Date().getFullYear()} JobPortal. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Landing;
