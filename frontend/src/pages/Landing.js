import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900 relative overflow-hidden">
      {/* Subtle background grid and orbs */}
      <div className="pointer-events-none absolute inset-0 grid-overlay"></div>
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary-200/40 blur-3xl animate-fade-in"></div>
      <div className="pointer-events-none absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-accent-200/40 blur-3xl animate-fade-in"></div>

      {/* Header */}
      <header className="sticky top-0 z-20">
        <div className="h-0.5 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-700" />
        <div className="bg-white/70 backdrop-blur-md border-b border-gray-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <span className="text-xl font-extrabold tracking-tight text-gray-900">WorkBee</span>
              </Link>
              <div className="hidden sm:flex items-center gap-3">
                <Link to="/login/jobseeker" className="nav-link">Job Seeker Login</Link>
                <Link to="/login/employer" className="nav-link">Employer Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Create Account</Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-slide-up">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-semibold mb-6 shadow-soft">
                Built for Kochi’s workforce
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Find work. Hire fast.
                <br />
                <span className="text-gradient">All in one place.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-xl mb-8">
                A modern job platform designed for entry-level roles. Discover opportunities, apply in minutes, and manage hiring with clarity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login/jobseeker" className="btn btn-primary btn-lg shadow-glow group">
                  <span className="inline-flex items-center gap-2">
                    I'm a Job Seeker
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </span>
                </Link>
                <Link to="/login/employer" className="btn btn-outline btn-lg group">
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

            <div className="relative animate-fade-in">
              <div className="absolute -inset-6 bg-white/40 rounded-3xl blur-2xl"></div>
              <div className="relative glass rounded-3xl overflow-hidden">
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
                      <div key={item.title} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-glow">
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
        <section className="py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Active jobs', value: '1,200+' },
                { label: 'Employers', value: '350+' },
                { label: 'Applications', value: '25k+' },
                { label: 'Avg. time to hire', value: '3 days' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-5 text-center">
                  <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
                  <div className="text-sm text-gray-600 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trusted by */}
        <section className="py-8 bg-white/70 backdrop-blur-sm border-y border-gray-200/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm mb-5">Trusted by employers across Kochi</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 items-center">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs uppercase tracking-wider select-none">
                  Brand {i + 1}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Audience cards */}
        <section className="py-14 bg-white/70 backdrop-blur-sm border-y border-gray-200/70">
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
                  cta: { label: 'See sessions', href: '/register?type=jobseeker' },
                },
              ].map((card) => (
                <div key={card.title} className="rounded-2xl card transition-transform duration-200 hover:-translate-y-1 hover:shadow-glow">
                  <div className="p-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{card.title}</h3>
                    <p className="text-gray-600 mb-6">{card.description}</p>
                    <Link to={card.cta.href} className="text-primary-600 font-semibold hover:text-primary-700 group inline-flex items-center">
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
        <section className="py-16 lg:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-white/80 to-gray-100 border border-gray-200/70 shadow-soft text-center px-6 sm:px-12 py-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-lg text-gray-600 mb-8">Choose your path and we’ll guide you through the rest.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register?type=jobseeker" className="btn btn-primary btn-lg shadow-glow group">
                  <span className="inline-flex items-center gap-2">
                    Create Job Seeker Account
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </span>
                </Link>
                <Link to="/register?type=employer" className="btn btn-outline btn-lg group">
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

      <footer className="py-6 text-center text-sm text-gray-500 border-t border-gray-200 bg-white/60 backdrop-blur">
        © {new Date().getFullYear()} WorkBee. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
