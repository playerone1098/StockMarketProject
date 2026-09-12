import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-navy-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Helmet>
          <title>Contact Us | Get in Touch with JodhpurTraders Support</title>
          <meta name="description" content="Reach out to JodhpurTraders regarding trading ideas, corporate inquiries, advertising opportunities, or research feedback." />
          <meta property="og:title" content="Contact JodhpurTraders — Get in Touch" />
          <meta property="og:description" content="Reach out to JodhpurTraders regarding trading ideas, corporate inquiries, advertising opportunities, or research feedback." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={window.location.origin + window.location.pathname} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Contact JodhpurTraders — Get in Touch" />
          <meta name="twitter:description" content="Reach out to JodhpurTraders regarding trading ideas, corporate inquiries, or research feedback." />
          <link rel="canonical" href={window.location.origin + window.location.pathname} />
        </Helmet>

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-navy-950 dark:text-white mb-4 tracking-tight">
            Get In Touch
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Have an inquiry about partnership opportunities or feedback on our research? We are here to listen.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-navy-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-navy-800 flex items-start space-x-4">
              <span className="w-10 h-10 rounded-xl border border-gray-200 dark:border-navy-700 flex items-center justify-center font-bold text-xs text-brand-600 dark:text-brand-400 shrink-0">
                EM
              </span>
              <div>
                <h3 className="font-extrabold text-navy-950 dark:text-white text-base mb-1">Email Us</h3>
                <p className="text-brand-600 dark:text-brand-400 text-sm font-semibold mb-2">
                  contact@jodhpurtraders.com
                </p>
                <p className="text-gray-500 dark:text-slate-400 text-xs leading-relaxed">
                  We respond to all research feedback within 24 business hours.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-navy-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-navy-800 flex items-start space-x-4">
              <span className="w-10 h-10 rounded-xl border border-gray-200 dark:border-navy-700 flex items-center justify-center font-bold text-xs text-brand-600 dark:text-brand-400 shrink-0">
                PH
              </span>
              <div>
                <h3 className="font-extrabold text-navy-950 dark:text-white text-base mb-1">Call Research Desk</h3>
                <p className="text-brand-600 dark:text-brand-400 text-sm font-semibold mb-2">
                  +91 (800) 555-VISTA
                </p>
                <p className="text-gray-500 dark:text-slate-400 text-xs leading-relaxed">
                  Mon - Fri, 9:00 AM - 5:30 PM IST.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-navy-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-navy-800 flex items-start space-x-4">
              <span className="w-10 h-10 rounded-xl border border-gray-200 dark:border-navy-700 flex items-center justify-center font-bold text-xs text-brand-600 dark:text-brand-400 shrink-0">
                HQ
              </span>
              <div>
                <h3 className="font-extrabold text-navy-950 dark:text-white text-base mb-1">Corporate HQ</h3>
                <p className="text-gray-700 dark:text-slate-300 text-sm font-semibold mb-2">
                  Finance District, Gachibowli
                </p>
                <p className="text-gray-500 dark:text-slate-400 text-xs leading-relaxed">
                  Hyderabad, TS 500032
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white dark:bg-navy-900 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-navy-800">
            {submitted ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-black text-navy-950 dark:text-white mb-2">Message Sent Successfully!</h2>
                <p className="text-gray-500 dark:text-slate-400 text-xs mb-6">
                  Thank you for contacting us. One of our support representatives will email you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-transparent border border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 px-6 py-2.5 rounded-xl font-bold hover:border-brand-700 dark:hover:border-brand-300 transition"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-800 text-navy-950 dark:text-white rounded-xl text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-800 text-navy-950 dark:text-white rounded-xl text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Subject of your message"
                    className="w-full px-4 py-3 bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-800 text-navy-950 dark:text-white rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Message Details
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Describe your inquiry..."
                    className="w-full px-4 py-3 bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-800 text-navy-950 dark:text-white rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  ></textarea>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-transparent border border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 rounded-xl font-bold hover:border-brand-700 dark:hover:border-brand-300 transition text-center"
                  >
                    {submitting ? 'Sending Message...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
