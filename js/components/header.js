// js/header.js
(() => {
  function initHeader() {
    // Prevent double injection
    if (document.getElementById("nav")) return;

    /* =========================
       CONFIG (easy to tweak)
       ========================= */
    const NAV_H = 92;          // normal header height
    const NAV_H_SCROLLED = 72; // smaller on scroll
    const LOGO_H = 200;         // normal logo height (bigger)
    const LOGO_H_SCROLLED = 180;// smaller logo on scroll
    const SCROLL_TRIGGER = 50; // px

    // Inject CSS
    const style = document.createElement("style");
    style.textContent = `
      .nav{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: ${NAV_H}px; /* ✅ fixed height so hero/layout won't change */
        background: rgba(255,255,255,.98);
        z-index: 1000;
        transition: height .3s ease, box-shadow .3s ease, background .3s ease;
      }

      /* When scrolled: only slightly smaller */
      .nav.scrolled{
        height: ${NAV_H_SCROLLED}px;
        box-shadow: 0 2px 8px rgba(0,0,0,.06);
      }

      .nav-container{
        max-width: 1400px;
        margin: 0 auto;
        height: 100%;
        padding: 0 3rem;
        display:flex;
        justify-content:space-between;
        align-items:center;
      }

      .nav-logo{
        display:flex;
        align-items:center;
        text-decoration:none;
        transition: opacity .3s ease;
      }
      .nav-logo:hover{ opacity:.8; }

      .nav-logo-img{
        height: ${LOGO_H}px;       /* ✅ bigger in normal state */
        width: auto;
        display:block;
        transition: height .3s ease;
      }

      .nav.scrolled .nav-logo-img{
        height: ${LOGO_H_SCROLLED}px; /* ✅ smaller on scroll */
      }

      .nav-links{
        display:flex;
        align-items:center;
        gap:2.5rem;
      }
      .nav-links a{
        color:#4a4a4a;
        text-decoration:none;
        font-size:.85rem;
        font-weight:500;
        letter-spacing:.05em;
        transition: color .3s ease;
      }
      .nav-links a:hover{ color:#1a1a1a; }

      .nav-lang{
        display:flex;
        align-items:center;
        gap:.5rem;
        padding-left:1.5rem;
        border-left:1px solid #e0e0e0;
      }
      .nav-lang a{ font-size:.8rem; font-weight:600; }
      .nav-lang a.active{ color:#ff6600; }
      .nav-lang span{ color:#d0d0d0; }

      @media (max-width:768px){
        .nav-container{ padding: 0 1.5rem; }
        .nav-links{ gap: 1.2rem; }
        .nav{ height: 80px; }
        .nav.scrolled{ height: 64px; }
        .nav-logo-img{ height: 48px; }
        .nav.scrolled .nav-logo-img{ height: 38px; }
      }
    `;
    document.head.appendChild(style);

    // Inject HTML
    const headerHTML = `
      <nav class="nav" id="nav">
        <div class="nav-container">
          <a href="index.html" class="nav-logo" aria-label="CKP Germany">
            <img src="../images/logos/logo.png" alt="CKP Germany GmbH Logo" class="nav-logo-img">
          </a>

          <div class="nav-links">
            <a href="index.html">HOME</a>
            <a href="#about">ABOUT US</a>
            <a href="#contact">CONTACT</a>
            <div class="nav-lang">
              <a href="index.html" class="active">DE</a>
              <span>|</span>
              <a href="../en/index.html">EN</a>
            </div>
          </div>
        </div>
      </nav>
    `;
    document.body.insertAdjacentHTML("afterbegin", headerHTML);

    // Scroll behavior (adds class when > trigger, removes when back up)
    const nav = document.getElementById("nav");

    const update = () => {
      if (window.scrollY > SCROLL_TRIGGER) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };

    window.addEventListener("scroll", update, { passive: true });
    update(); // ✅ correct state on first load / refresh
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeader);
  } else {
    initHeader();
  }
})();
