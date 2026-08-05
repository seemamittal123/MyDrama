import React, { useState } from "react";

const LINK_COLUMNS = [
  {
    id: "col-1",
    links: ["FAQ", "Help Centre", "Account", "Media Centre"],
  },
  {
    id: "col-2",
    links: ["Investor Relations", "Jobs", "Ways to Watch", "Terms of Use"],
  },
  {
    id: "col-3",
    links: ["Privacy", "Cookie Preferences", "Corporate Information", "Contact Us"],
  },
  {
    id: "col-4",
    links: ["Genres", "Gift Cards", "Speed Test", "Legal Notices"],
  },
];

const BOTTOM_LINKS = ["Privacy", "Terms", "Cookie Preferences", "Do Not Sell My Info"];

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 2.1.26 2.6.46.6.24 1.1.55 1.6 1.04.5.5.8 1 1 1.6.2.5.4 1.4.5 2.6.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 2.1-.5 2.6-.2.6-.5 1.1-1 1.6-.5.5-1 .8-1.6 1-.5.2-1.4.4-2.6.5-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-2.1-.3-2.6-.5-.6-.2-1.1-.5-1.6-1-.5-.5-.8-1-1-1.6-.2-.5-.4-1.4-.5-2.6C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-2.1.5-2.6.2-.6.5-1.1 1-1.6.5-.5 1-.8 1.6-1 .5-.2 1.4-.4 2.6-.5C9.4 2.2 9.8 2.2 12 2.2z" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17.8" cy="6.2" r="1.1" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7.1l-5.6-6.9L4.2 22H1l8.1-9.3L0.7 2h7.2l5.1 6.3L18.9 2zm-1.2 18h1.9L7.4 4H5.3l12.4 16z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M22.5 6.5s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.3-1C16.6 3 12 3 12 3h0s-4.6 0-7.3.2c-.4.1-1.4.1-2.3 1C1.7 4.9 1.5 6.5 1.5 6.5S1.3 8.3 1.3 10.1v1.8c0 1.8.2 3.6.2 3.6s.2 1.6.9 2.3c.9.9 2.1.9 2.6 1 1.9.2 8 .2 8 .2s4.6 0 7.3-.2c.4-.1 1.4-.1 2.3-1 .7-.7.9-2.3.9-2.3s.2-1.8.2-3.6v-1.8c0-1.8-.2-3.6-.2-3.6zM9.7 14.5V8.3l6 3.1-6 3.1z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm6.9 6H15.6a15.7 15.7 0 00-1.3-4.1A8 8 0 0118.9 8zM12 4c.8 1 1.6 2.6 2 4H10c.4-1.4 1.2-3 2-4zM4.3 14A8.1 8.1 0 014 12c0-.7.1-1.4.3-2h3.4a17 17 0 000 4H4.3zm.8 2h3.3c.3 1.5.8 2.9 1.3 4.1A8 8 0 015.1 16zm3.3-8H5.1a8 8 0 014.1-4.1c-.5 1.2-1 2.6-1.3 4.1zM12 20c-.8-1-1.6-2.6-2-4h4c-.4 1.4-1.2 3-2 4zm2.4-6H9.6a13.3 13.3 0 010-4h4.8a13.3 13.3 0 010 4zm.2 5.9c.5-1.2 1-2.6 1.3-4.1h3.3a8 8 0 01-4.6 4.1zM16.1 14a17 17 0 000-4h3.4c.2.6.3 1.3.3 2s-.1 1.4-.3 2h-3.4z" />
    </svg>
  );
}

export default function Footer() {
  const [lang, setLang] = useState("English");
  const year = new Date().getFullYear();

  return (
    <footer className="md-footer">
      <div className="md-footer__inner">
        <div className="md-footer__top">
          <div className="md-footer__brand">
            my<span>Drama</span>
          </div>

          <div className="md-footer__social">
            <a href="#" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="#" aria-label="X / Twitter">
              <XIcon />
            </a>
            <a href="#" aria-label="YouTube">
              <YoutubeIcon />
            </a>
          </div>
        </div>

        <p className="md-footer__question">Questions? Call us at 1-800-my-drama</p>

        <nav className="md-footer__cols">
          {LINK_COLUMNS.map((col) => (
            <div key={col.id}>
              {col.links.map((label) => (
                <a href="#" key={label}>
                  {label}
                </a>
              ))}
            </div>
          ))}
        </nav>

        <button
          className="md-footer__lang"
          type="button"
          onClick={() => setLang((prev) => (prev === "English" ? "हिन्दी" : "English"))}
        >
          <GlobeIcon />
          {lang}
        </button>

        <div className="md-footer__bottom">
          <span>© {year} myDrama. All rights reserved.</span>
          <div className="md-footer__bottom-links">
            {BOTTOM_LINKS.map((label) => (
              <a href="#" key={label}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}