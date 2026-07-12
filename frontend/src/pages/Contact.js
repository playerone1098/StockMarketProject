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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Contact Us | Get in Touch with StockVista Support</title>
        <meta name="description" content="Reach out to StockVista regarding trading ideas, corporate inquiries, advertising opportunities, or research feedback." />
        <meta property="og:title" content="Contact StockVista — Get in Touch" />
        <meta property="og:description" content="Reach out to StockVista regarding trading ideas, corporate inquiries, advertising opportunities, or research feedback." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.origin + window.location.pathname} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact StockVista — Get in Touch" />
        <meta name="twitter:description" content="Reach out to StockVista regarding trading ideas, corporate inquiries, or research feedback." />
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
      </Helmet>

      {/* Page Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-navy-950 mb-4 tracking-tight">
          Get In Touch
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl mx-auto font-medium">
          Have an inquiry about partnership opportunities or feedback on our research? We are here to listen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4">
            <span className="text-2xl mt-1">📧</span>
            <div>
              <h3 className="font-extrabold text-navy-950 text-base mb-1">Email Us</h3>
              <p className="text-brand-600 text-sm font-semibold mb-2">
                contact@stockvista.com
              </p>
              <p className="text-gray-500 text-xs leading-relaxed">
                We respond to all research feedback within 24 business hours.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4">
            <span className="text-2xl mt-1">📞</span>
            <div>
              <h3 className="font-extrabold text-navy-950 text-base mb-1">Call Research Desk</h3>
              <p className="text-brand-600 text-sm font-semibold mb-2">
                +91 (800) 555-VISTA
              </p>
              <p className="text-gray-500 text-xs leading-relaxed">
                Mon - Fri, 9:00 AM - 5:30 PM IST.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4">
            <span className="text-2xl mt-1">📍</span>
            <div>
              <h3 className="font-extrabold text-navy-950 text-base mb-1">Corporate HQ</h3>
              <p className="text-gray-700 text-sm font-semibold mb-2">
                Finance District, Gachibowli
              </p>
              <p className="text-gray-500 text-xs leading-relaxed">
                Hyderabad, TS 500032
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          {submitted ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-black text-navy-950 mb-2">Message Sent Successfully!</h2>
              <p className="text-gray-500 text-xs mb-6">
                Thank you for contacting us. One of our support representatives will email you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="bg-brand-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-600 transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-250 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-250 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-xs font-semibold text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-250 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-semibold text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-250 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                ></textarea>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/10 hover:bg-brand-600 transition flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <span>Send Message</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
