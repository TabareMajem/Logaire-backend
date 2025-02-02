"use client";

import React from 'react';

export const CTASection: React.FC = () => {
  return (
    <section className="cta-section bg-blue-600 text-white py-16">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-lg mb-8">Join thousands of satisfied users and take your experience to the next level.</p>
        <div className="flex justify-center space-x-6">
          <a
            href="/signup"
            className="inline-block bg-yellow-500 text-black py-2 px-6 rounded-md hover:bg-yellow-600"
          >
            Sign Up Now
          </a>
          <a
            href="/contact"
            className="inline-block bg-transparent border-2 border-white text-white py-2 px-6 rounded-md hover:bg-white hover:text-black"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
};
