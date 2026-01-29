// js/components/footer.js
(() => {
  function initFooter() {
    if (document.getElementById("site-footer")) return;

    /* =========================
       Inject CSS (clean, aligned, German)
       ========================= */
    const style = document.createElement("style");
    style.textContent = `
      .site-footer{
        background:#fff;
        border-top:1px solid #e9edf2;
        padding: 44px 0 22px;
        color:#4a4a4a;
      }

      .footer-container{
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 clamp(16px, 4vw, 40px);
      }

      /* 3-column top row: brand | company | legal */
      .footer-top{
        display:grid;
        grid-template-columns: 1.35fr 0.85fr 0.85fr;
        gap: 56px;
        align-items:start;
        min-height: 200px;   /* ✅ stabiler Block, Logo kann wachsen ohne alles zu verschieben */
}


      /* Brand block: logo at top, text directly below */
      .footer-brand{
        display:flex;
        flex-direction:column;
        align-items:flex-start;
      }

      .footer-logo{
        display:inline-flex;
        align-items:center;
        text-decoration:none;
        line-height:0; /* removes extra vertical space */
      }

      .footer-logo img{
        height: 152px;     /* adjust as you like */
        width:auto;
        display:block;
      }

      .footer-tagline{
        margin: 12px 0 0; /* controlled spacing under logo */
        font-size: 13px;
        line-height: 1.65;
        color: #6a6a6a;
        max-width: 420px;
      }

      /* Columns */
      .footer-col{
        padding-top: 6px; /* aligns visually with brand area */
      }

      .footer-col-title{
        margin: 0 0 14px; /* important: no top margin */
        font-size: 11px;
        letter-spacing: .18em;
        font-weight: 800;
        text-transform: uppercase;
        color:#1a1a1a;
      }

      .footer-links{
        list-style:none;
        margin:0;
        padding:0;
        display:grid;
        gap: 10px;
      }

      .footer-links a{
        color:#4a4a4a;
        text-decoration:none;
        font-size: 13px;
        font-weight: 600;
        transition: color .2s ease, opacity .2s ease;
      }

      .footer-links a:hover{
        color:#1a1a1a;
        opacity:.9;
      }

      .footer-divider{
        margin-top: 28px;
        padding-top: 18px;
        border-top: 1px solid #eef1f4;
      }

      /* Bottom row: socials left | copyright right */
      .footer-bottom{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap: 14px;
        flex-wrap:wrap;
        width:100%;
      }

      .footer-social{
        display:flex;
        align-items:center;
        gap: 10px;
      }

      .footer-social a{
        width: 34px;
        height: 34px;
        border-radius: 999px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        border:1px solid #e6ebf0;
        background:#f7f9fb;
        color:#1a1a1a;
        text-decoration:none;
        transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
      }

      .footer-social a:hover{
        transform: translateY(-2px);
        background:#fff;
        box-shadow: 0 10px 18px rgba(0,0,0,.08);
      }

      .footer-ico{
        width: 16px;
        height: 16px;
        display:block;
      }

      .footer-copy{
        margin:0;
        font-size: 12px;
        color:#7a7a7a;
        margin-left:auto; /* pushes to the right cleanly */
        text-align:right;
        white-space: nowrap;
      }

      /* Responsive */
      @media (max-width: 980px){
        .footer-top{
          grid-template-columns: 1fr 1fr;
          gap: 34px;
        }
        .footer-brand{
          grid-column: 1 / -1;
        }
        .footer-col{
          padding-top: 0;
        }
        .footer-copy{
          margin-left: 0;
          text-align:left;
          white-space: normal;
        }
      }

      @media (max-width: 640px){
        .site-footer{ padding: 34px 0 18px; }
        .footer-top{
          grid-template-columns: 1fr;
          gap: 22px;
        }
        .footer-divider{ margin-top: 22px; }
        .footer-bottom{
          justify-content:center;
          text-align:center;
        }
        .footer-copy{
          text-align:center;
        }
      }
    `;
    document.head.appendChild(style);

    /* =========================
       Inject HTML (German labels)
       ========================= */
    const footerHTML = `
      <footer class="site-footer" id="site-footer">
        <div class="footer-container">

          <div class="footer-top">
            <!-- Brand -->
            <div class="footer-brand">
              <a class="footer-logo" href="index.html" aria-label="CKP Germany">
                <img src="../images/logos/logo.png" alt="CKP Germany GmbH Logo">
              </a>
            </div>

            <!-- Unternehmen -->
            <div class="footer-col">
              <div class="footer-col-title">Unternehmen</div>
              <ul class="footer-links">
                <li><a href="#about">Über uns</a></li>
                <li><a href="#contact">Kontakt</a></li>
                <li><a href="#divisions">Bereiche</a></li>
              </ul>
            </div>

            <!-- Rechtliches -->
            <div class="footer-col">
              <div class="footer-col-title">Rechtliches</div>
              <ul class="footer-links">
                <li><a href="datenschutz.html">Datenschutz</a></li>
                <li><a href="impressum.html">Impressum</a></li>
                <li><a href="agb.html">AGB</a></li>
              </ul>
            </div>
          </div>

          <div class="footer-divider">
            <div class="footer-bottom">
              <div class="footer-social" aria-label="Social Media">
                <a href="#" aria-label="Facebook">
                  <svg class="footer-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.2-1.5 1.5-1.5H16.7V5.1c-.4-.1-1.6-.2-3-.2-3 0-5 1.8-5 5.1V11H6v3h2.7v8h4.8z"/>
                  </svg>
                </a>
                <a href="#" aria-label="X">
                  <svg class="footer-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.7 2H21l-5.9 6.7L22 22h-6.8l-4.6-6.1L5.2 22H3l6.4-7.3L2 2h6.9l4.2 5.6L18.7 2zm-1.2 18h1.3L7.7 4H6.3l11.2 16z"/>
                  </svg>
                </a>
                <a href="#" aria-label="Instagram">
                  <svg class="footer-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 4.5A5.5 5.5 0 1 1 6.5 14 5.5 5.5 0 0 1 12 8.5zm0 2A3.5 3.5 0 1 0 15.5 14 3.5 3.5 0 0 0 12 10.5zM18 6.8a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"/>
                  </svg>
                </a>
              </div>

              <p class="footer-copy">
                © <span id="footer-year"></span> CKP Germany GmbH. Alle Rechte vorbehalten.
              </p>
            </div>
          </div>

        </div>
      </footer>
    `;

    document.body.insertAdjacentHTML("beforeend", footerHTML);

    // Current year
    const yearEl = document.getElementById("footer-year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFooter);
  } else {
    initFooter();
  }
})();
