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
    <footer className="w-full bg-white">
      {/* Newsletter Section */}
      <div className="w-full py-8 px-6 bg-[#90C67C]">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-[#E1EEBC]">NEWSLETTER</h3>
            <p className="text-[#E1EEBC]">Stay Up to Date</p>
          </div>
          <form onSubmit={handleSubmit} className="relative w-full md:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email..."
              className="w-full md:w-96 px-6 py-4 pr-16 rounded-full bg-white text-[#67AE6E] placeholder-[#67AE6E] focus:outline-none focus:ring-2 focus:ring-[#67AE6E]"
            />
            <button
              type="submit"
              className="absolute hover:cursor-pointer right-2 top-1/2 -translate-y-1/2 p-3 bg-[#67AE6E] hover:bg-[#328E6E] text-white rounded-full transition-colors"
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
              {/* <img src="/logo.png" alt="logo" className="w-12 h-12" /> */}
              <p className="text-[#67AE6E] text-sm mb-6 leading-relaxed">
                We connect travelers with carefully selected homestays to ensure
                safe, comfortable, and reliable accommodations.
              </p>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-xl font-bold text-[#67AE6E] mb-6">COMPANY</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-[#67AE6E] hover:text-[#328E6E] transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[#67AE6E] hover:text-[#328E6E] transition-colors"
                  >
                    Legal Information
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[#67AE6E] hover:text-[#328E6E] transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[#67AE6E] hover:text-[#328E6E] transition-colors"
                  >
                    Blogs
                  </a>
                </li>
              </ul>
            </div>

            {/* Help Center Links */}
            <div>
              <h3 className="text-xl font-bold text-[#67AE6E] mb-6">
                HELP CENTER
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-[#67AE6E] hover:text-[#328E6E] transition-colors"
                  >
                    Find a Property
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[#67AE6E] hover:text-[#328E6E] transition-colors"
                  >
                    How To Host?
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[#67AE6E] hover:text-[#328E6E] transition-colors"
                  >
                    Why Us?
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[#67AE6E] hover:text-[#328E6E] transition-colors"
                  >
                    FAQs
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[#67AE6E] hover:text-[#328E6E] transition-colors"
                  >
                    Rental Guides
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-bold text-[#67AE6E] mb-6">
                CONTACT INFO
              </h3>
              <ul className="space-y-3 mb-6">
                <li className="text-[#67AE6E]">
                  <span className="font-medium">Phone:</span> 1234567890
                </li>
                <li className="text-[#67AE6E]">
                  <span className="font-medium">Email:</span> company@email.com
                </li>
                <li className="text-[#67AE6E]">
                  <span className="font-medium">Location:</span> 100 Smart
                  Street, LA, USA
                </li>
              </ul>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-[#67AE6E] hover:text-[#328E6E] transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={24} />
                </a>
                <a
                  href="#"
                  className="text-[#67AE6E] hover:text-[#328E6E] transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter size={24} />
                </a>
                <a
                  href="#"
                  className="text-[#67AE6E] hover:text-[#328E6E] transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={24} />
                </a>
                <a
                  href="#"
                  className="text-[#67AE6E] hover:text-[#328E6E] transition-colors"
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
