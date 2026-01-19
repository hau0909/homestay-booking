"use client";

import { Send, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <footer className="w-full bg-gray-100">
      {/* Newsletter Section */}
      <div className="w-full py-8 px-6 bg-gray-200">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">NEWSLETTER</h3>
            <p className="text-gray-600">Stay Upto Date</p>
          </div>
          <form onSubmit={handleSubmit} className="relative w-full md:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email..."
              className="w-full md:w-96 px-6 py-4 pr-16 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <button
              type="submit"
              className="absolute hover:cursor-pointer right-2 top-1/2 -translate-y-1/2 p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="w-full py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Logo & Description */}
            <div>
              <h2 className="text-4xl font-bold text-gray-700 mb-4">LOGO</h2>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.9 10.9c-.1-.3-.3-.6-.6-.8-.3-.2-.6-.3-1-.3v-.1c.3-.1.6-.2.8-.5.2-.2.3-.5.3-.9 0-.6-.2-1-.7-1.3-.4-.3-1-.4-1.7-.4H12v6h3.2c.7 0 1.3-.2 1.7-.5.4-.3.6-.7.6-1.2 0-.3-.1-.7-.6-1zm-3.4-2h1.1c.3 0 .5.1.6.2.1.1.2.3.2.5s-.1.4-.2.5c-.1.1-.3.2-.6.2h-1.1v-1.4zm1.5 3.5c-.1.1-.3.2-.6.2h-1.4v-1.5h1.4c.3 0 .5.1.6.2.1.1.2.3.2.5 0 .3-.1.5-.2.6z" />
                  </svg>
                  <span className="text-sm font-medium">PlayStore</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <span className="text-sm font-medium">AppleStore</span>
                </button>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">COMPANY</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Legal Information
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Blogs
                  </a>
                </li>
              </ul>
            </div>

            {/* Help Center Links */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                HELP CENTER
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Find a Property
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    How To Host?
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Why Us?
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    FAQs
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Rental Guides
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                CONTACT INFO
              </h3>
              <ul className="space-y-3 mb-6">
                <li className="text-gray-600">
                  <span className="font-medium">Phone:</span> 1234567890
                </li>
                <li className="text-gray-600">
                  <span className="font-medium">Email:</span> company@email.com
                </li>
                <li className="text-gray-600">
                  <span className="font-medium">Location:</span> 100 Smart
                  Street, LA, USA
                </li>
              </ul>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={24} />
                </a>
                <a
                  href="#"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter size={24} />
                </a>
                <a
                  href="#"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={24} />
                </a>
                <a
                  href="#"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={24} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="w-full py-6 px-6 border-t border-gray-300">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">
            © 2022 thecreation.design | All rights reserved
          </p>
          <p className="text-gray-600 text-sm">
            Created with love by{" "}
            <span className="font-medium">thecreation.design</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
