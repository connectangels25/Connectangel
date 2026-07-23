/**
 * dashboard.js — All interactive logic for the ConnectAngels Capacity Dashboard
 * ==============================================================================
 *
 * Execution order on page load
 * ----------------------------
 *  1. DOMContentLoaded fires → loadData(), setupFilters(), setupTabs()
 *  2. loadData()  → fetches /api/domains + /api/startups in parallel,
 *                   initialises stat cards, chart, table and startup card.
 *  3. setupFilters() → attaches Enter-key listeners to the four dropdowns.
 *  4. setupTabs()    → attaches click listeners to the Domain/State/District tabs.
 *
 * User interactions
 * -----------------
 *  - Search button / Enter key → applyFilters()
 *  - Chart bar click           → selectRow(index)
 *  - Table row click           → selectRow(index)
 *  - Table "+" button click    → openSubModal(domain)
 *  - "Generate Briefing" btn   → openBriefingModal(startup)
 */

// Prepend API_BASE to all relative /api/ fetches
// Check window itself, then window.parent (when inside iframe), fallback to localhost
function resolveApiBase() {
  let url = "";
  if (window.__POTENTIAL_API_URL) url = window.__POTENTIAL_API_URL;
  else {
    try {
      if (window.parent && window.parent.__POTENTIAL_API_URL) url = window.parent.__POTENTIAL_API_URL;
    } catch(e) {}
  }
  if (!url) url = "http://127.0.0.1:5000";
  return url.replace(/\/+$/, "");
}
let API_BASE = resolveApiBase();

const originalFetch = window.fetch.bind(window);
window.fetch = function(url, options) {
  if (typeof url === "string" && url.startsWith("/api/")) {
    // Re-resolve every time in case parent set the URL after iframe loaded
    API_BASE = resolveApiBase();
    url = API_BASE + url;
    
    // Inject header to bypass ngrok browser interstitial warning page
    options = options || {};
    options.headers = options.headers || {};
    if (options.headers instanceof Headers) {
      options.headers.set("ngrok-skip-browser-warning", "true");
    } else if (Array.isArray(options.headers)) {
      options.headers.push(["ngrok-skip-browser-warning", "true"]);
    } else {
      options.headers["ngrok-skip-browser-warning"] = "true";
    }
  }
  return originalFetch(url, options);
};


// ── State variables ────────────────────────────────────────────────────────────
// Single source of truth for the current dashboard state.

/** @type {Object[]} Full domain list loaded from /api/domains */
let allDomains = [];

/** @type {Object[]} Full startup list loaded from /api/startups */
let allStartups = [];

/** @type {Object[]} Domains currently displayed (after the last filter) */
let currentFilteredDomains = [];

/** @type {Object[]} Startups currently displayed (after the last filter) */
let currentFilteredStartups = [];

/** @type {number} Index of the currently highlighted table row */
let selectedRow = 0;

/** @type {Chart|null} Active Chart.js instance (destroyed on re-render) */
let activeChart = null;

/** @type {string} Active visualization type ('bar', 'line', 'doughnut', 'grid') */
let activeChartType = 'bar';

/** @type {Object|null} Mapped data configuration for universal chart rendering */
let currentChartDataConfig = null;

/** @type {number} Total country count — used for the stat card when no country filter is active */
const COUNTRY_COUNT = 54;

/**
 * Sub-domain potential percentages shown in the sub-domain modal.
 * Cycles through the array for each sub-domain (index % length).
 * @type {number[]}
 */
const SUB_PCTS = [70, 62, 81, 55, 73, 67, 88, 59];

/**
 * Currently selected sub-domain, or null if none selected.
 * @type {{ domain: string, sub: string } | null}
 */
let activeSubDomain = null;

/** Searchable select instances for the three geo filters */
let _ssCo = null, _ssSt = null, _ssDi = null;

/** Global tracking of backend status */
let isBackendOnline = null;


// ── Theme sync with parent page ────────────────────────────────────────────────

function resolveTheme() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("theme") === "light" || params.get("theme") === "dark") return params.get("theme");
  if (window.__POTENTIAL_THEME === "light" || window.__POTENTIAL_THEME === "dark") return window.__POTENTIAL_THEME;
  try {
    if (window.parent && (window.parent.__POTENTIAL_THEME === "light" || window.parent.__POTENTIAL_THEME === "dark"))
      return window.parent.__POTENTIAL_THEME;
  } catch(e) {}
  return "dark";
}

function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.classList.add("light");
  } else {
    document.documentElement.classList.remove("light");
  }
}

// Listen for theme changes from parent page
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "theme") {
    applyTheme(event.data.theme);
  }
});


// ── Entry point ────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(resolveTheme());
  loadData();
  setupFilters();
  setupTabs();
  setupVisSelector();
  checkBackendStatus();
  setInterval(checkBackendStatus, 10000);
});


// ── 1. Load initial data from the Flask API ────────────────────────────────────

/**
 * Fetch domain and startup data from the backend in parallel, then render
 * the chart, table, stat cards and startup detail card with the full dataset.
 */
// --- High-End Static Mock Data Fallbacks (Used when Backend is Offline) ---
const DUMMY_DOMAINS = [
  { name: "Technology & Innovation", short: "Tech", current: 850, total: 1200, subs: ["Software", "AI", "Cloud", "Biotech"] },
  { name: "Finance", short: "Finance", current: 620, total: 950, subs: ["Banking", "Fintech", "Insurance"] },
  { name: "Healthcare & Life Sciences", short: "Health", current: 580, total: 800, subs: ["Pharma", "Medical Devices", "Genomics"] },
  { name: "Agriculture & Food", short: "Agri", current: 420, total: 600, subs: ["Food Tech", "Aquaculture", "Horticulture"] },
  { name: "Education", short: "Edu", current: 310, total: 450, subs: ["EdTech", "K-12", "Higher Ed"] },
  { name: "Energy & Environment", short: "Energy", current: 280, total: 400, subs: ["Solar", "Wind", "Recycling"] },
  { name: "Logistics & Mobility", short: "Logistics", current: 250, total: 380, subs: ["Supply Chain", "Last-Mile", "Ride-Hailing"] },
  { name: "Retail & E-Commerce", short: "Retail", current: 220, total: 350, subs: ["D2C", "Q-Commerce", "Marketplaces"] },
  { name: "Real Estate & Construction", short: "RE", current: 190, total: 300, subs: ["PropTech", "Architecture", "Smart Home"] },
  { name: "Media & Entertainment", short: "Media", current: 170, total: 270, subs: ["Gaming", "Streaming", "VFX"] }
];

const DUMMY_STARTUPS = [
  { name: "Apex AI Labs", initials: "AA", focus: "Artificial Intelligence", country: "India", domain: "Technology & Innovation", email: "info@apexai.io", domains_count: 3 },
  { name: "BioHeal Solutions", initials: "BS", focus: "Biotechnology", country: "United Kingdom", domain: "Healthcare & Life Sciences", email: "contact@bioheal.co.uk", domains_count: 2 },
  { name: "PaySwift", initials: "PS", focus: "Fintech", country: "Saudi Arabia", domain: "Finance", email: "support@payswift.sa", domains_count: 1 },
  { name: "AgriGrow Solutions", initials: "AS", focus: "Food Tech", country: "UAE", domain: "Agriculture & Food", email: "grow@agrigrow.ae", domains_count: 2 },
  { name: "EdSphere", initials: "ES", focus: "EdTech", country: "Qatar", domain: "Education", email: "hello@edsphere.qa", domains_count: 1 }
];

/**
 * Fetch domain and startup data from the backend in parallel, then render
 * the chart, table, stat cards and startup detail card with the full dataset.
 */
async function loadData() {
  let loadedFromLive = false;
  try {
    const [domainsRes, startupsRes] = await Promise.all([
      fetch("/api/domains"),
      fetch("/api/startups"),
    ]);

    if (domainsRes.ok && startupsRes.ok) {
      const dType = domainsRes.headers.get("content-type") || "";
      const sType = startupsRes.headers.get("content-type") || "";
      if (!dType.includes("application/json") || !sType.includes("application/json")) {
        console.warn("[loadData] Unexpected Content-Type, attempting to parse anyway:", dType, sType);
      }
      let rawDomains = await domainsRes.json();
      let rawStartups = await startupsRes.json();

      // Normalize: if server wraps in an object (e.g. {"domains":[...]}), unwrap it
      if (!Array.isArray(rawDomains)) {
        rawDomains = rawDomains.domains || rawDomains.data || rawDomains.items || rawDomains.results || [];
      }
      if (!Array.isArray(rawStartups)) {
        rawStartups = rawStartups.startups || rawStartups.data || rawStartups.items || rawStartups.results || [];
      }

      // Normalize domain field names so the UI works regardless of server naming
      allDomains = (Array.isArray(rawDomains) ? rawDomains : []).map(d => ({
        name: d.name || d.domain || d.domain_name || d.label || "Unknown",
        short: d.short || d.short_name || (d.name ? d.name.slice(0, 4) : (d.domain ? d.domain.slice(0, 4) : "N/A")),
        current: d.current || d.count || d.current_startups || d.actual || 0,
        total: d.total || d.potential || d.total_potential || 0,
        subs: d.subs || d.subdomains || d.sub_domains || d.subDomains || []
      }));
      allStartups = (Array.isArray(rawStartups) ? rawStartups : []).map(s => ({
        name: s.name || s.startup_name || s.company || "Unknown",
        initials: s.initials || (s.name ? s.name.slice(0, 2).toUpperCase() : (s.startup_name ? s.startup_name.slice(0, 2).toUpperCase() : "??")),
        focus: s.focus || s.industry || s.sector || "",
        country: s.country || s.country_name || "",
        domain: s.domain || s.industry || s.sector || "",
        email: s.email || s.contact_email || "",
        domains_count: s.domains_count || s.sectors_count || s.count || 0
      }));
      loadedFromLive = true;
      console.log("[loadData] Successfully loaded live data from Flask API!");
    } else {
      throw new Error(`API error: ${domainsRes.status} / ${startupsRes.status}`);
    }
  } catch (error) {
    console.warn("[loadData] Backend offline, using high-end dummy fallback data.", error);
    allDomains = DUMMY_DOMAINS;
    allStartups = DUMMY_STARTUPS;
  }

  // ── Render UI Components (runs for both live and dummy data!) ──

  const countrySelect = document.getElementById("filter-country");
  if (countrySelect) {
    const countries = Array.from(new Set(allStartups.map(s => s.country))).filter(Boolean);
    if (!countries.includes("United States")) {
      countries.push("United States");
    }
    if (!countries.includes("United Kingdom")) {
      countries.push("United Kingdom");
    }
    countries.sort();
    countrySelect.innerHTML = '<option value="All">All Countries</option>';
    countries.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      countrySelect.appendChild(opt);
    });
  }

  const domainSelect = document.getElementById("filter-domain");
  if (domainSelect) {
    domainSelect.innerHTML = '<option value="All">All Domains</option>';
    allDomains.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d.name;
      opt.textContent = d.name;
      domainSelect.appendChild(opt);
    });
  }

  _initSearchableSelects();

  // Auto-search from URL param
  const params = new URLSearchParams(window.location.search);
  const countryParam = params.get("country");
  if (countryParam && countrySelect) {
    const matchCountry = (optionVal, searchParam) => {
      const v = optionVal.toLowerCase().trim();
      const p = searchParam.toLowerCase().trim();
      if (v === p) return true;
      const isUS_v = v === "usa" || v === "us" || v.includes("united states");
      const isUS_p = p === "usa" || p === "us" || p.includes("united states");
      if (isUS_v && isUS_p) return true;
      const isUK_v = v === "uk" || v.includes("united kingdom");
      const isUK_p = p === "uk" || p.includes("united kingdom");
      if (isUK_v && isUK_p) return true;
      const isUAE_v = v === "uae" || v.includes("united arab emirates");
      const isUAE_p = p === "uae" || p.includes("united arab emirates");
      if (isUAE_v && isUAE_p) return true;
      if (v.includes(p) || p.includes(v)) return true;
      return false;
    };

    let found = false;
    for (let i = 0; i < countrySelect.options.length; i++) {
      if (matchCountry(countrySelect.options[i].value, countryParam)) {
        countrySelect.value = countrySelect.options[i].value;
        found = true;
        break;
      }
    }
    if (found) {
      if (_ssCo) _ssCo.refresh();
      countrySelect.dispatchEvent(new Event("change"));
      applyFilters();
    }
  }

  currentFilteredDomains = allDomains;
  currentFilteredStartups = allStartups;

  const totalPotential = allDomains.reduce((sum, d) => sum + d.total, 0);
  const totalCurrent = allDomains.reduce((sum, d) => sum + d.current, 0);
  setStatCard("stat-domains", allDomains.length.toString());
  setStatCard("stat-countries", COUNTRY_COUNT.toString());
  setStatCard("stat-startups", allStartups.length.toLocaleString());
  setStatCard("stat-potential", totalPotential.toLocaleString());
  const uniqueCount = new Set(allStartups.map(s => s.name)).size;
  setStatCard("stat-unique", uniqueCount.toLocaleString());

  isBackendOnline = loadedFromLive;
  const statusBadge = document.getElementById("backend-status-badge");
  const statusText = statusBadge ? statusBadge.querySelector(".status-badge-text") : null;

  if (loadedFromLive) {
    showToast("🧩 Connected to live backend data!", "success");
    if (statusBadge) {
      statusBadge.className = "status-badge-inline online";
      if (statusText) statusText.textContent = "Online";
    }
  } else {
    showToast("⚠️ Backend offline. Displaying dummy sandbox data.", "info");
    if (statusBadge) {
      statusBadge.className = "status-badge-inline offline";
      if (statusText) statusText.textContent = "Offline (Sandbox)";
    }
  }

  renderChart(allDomains);
  renderTable(allDomains);
  buildCustomDomainDropdown();

  if (allStartups.length > 0) {
    renderStartupCard(allStartups[0]);
  }

}

// ── 1c. Backend Status & Polling Logic ────────────────────────────────────────

/**
 * Lightweight check of backend server online/offline status.
 * Only updates the badge and isBackendOnline flag — does NOT reload data or filters.
 */
async function checkBackendStatus() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  let online = false;
  try {
    const response = await fetch("/api/domains", { signal: controller.signal });
    online = response.ok;
  } catch (err) {
    online = false;
  } finally {
    clearTimeout(timeoutId);
  }

  isBackendOnline = online;

  const statusBadge = document.getElementById("backend-status-badge");
  if (!statusBadge) return;
  statusBadge.className = "status-badge-inline " + (online ? "online" : "offline");
  const statusText = statusBadge.querySelector(".status-badge-text");
  if (statusText) statusText.textContent = online ? "Online" : "Offline (Sandbox)";
}


// ── 1b. Build custom Domain dropdown with hover-flyout ─────────────────────────

/**
 * Replaces the native #filter-domain <select> with a custom dropdown.
 * Each domain option shows the sub-domain flyout on hover.
 * The hidden <select> is kept in sync so applyFilters() works unchanged.
 */
function buildCustomDomainDropdown() {
  const wrap = document.getElementById("cdd-wrap");
  const trigger = document.getElementById("cdd-trigger");
  const textEl = document.getElementById("cdd-selected-text");
  const listEl = document.getElementById("cdd-list");
  const hiddenSel = document.getElementById("filter-domain");

  if (!wrap || !listEl || !hiddenSel) return;

  // ── Build option rows ─────────────────────────────────────────────────
  const options = Array.from(hiddenSel.options);   // pulled from hidden <select>
  listEl.innerHTML = "";

  options.forEach(opt => {
    const item = document.createElement("div");
    item.className = "cdd-item";
    item.dataset.val = opt.value;
    item.textContent = opt.value;
    if (opt.value === hiddenSel.value) item.classList.add("cdd-active");

    // Click → select this domain, sync hidden select, close dropdown
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      hiddenSel.value = opt.value;
      textEl.textContent = opt.value;
      listEl.querySelectorAll(".cdd-item").forEach(i => i.classList.remove("cdd-active"));
      item.classList.add("cdd-active");
      wrap.classList.remove("cdd-open");
      hideSubFlyout();
    });

    // Hover → show sub-domain flyout (skip "All" — no sub-domains)
    item.addEventListener("mouseenter", () => {
      if (opt.value === "All") { hideSubFlyout(); return; }
      const domain = allDomains.find(d => d.name === opt.value);
      if (domain) showSubFlyout(item, domain);
    });
    item.addEventListener("mouseleave", hideSubFlyout);

    listEl.appendChild(item);
  });

  // ── Toggle open/close on trigger click ───────────────────────────────
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    wrap.classList.toggle("cdd-open");
    if (!wrap.classList.contains("cdd-open")) hideSubFlyout();
  });

  // ── Close on outside click ───────────────────────────────────────────
  document.addEventListener("click", () => {
    wrap.classList.remove("cdd-open");
  });
}


// ── 2. Build the bar chart & visual switcher ─────────────────────────────────────────────────────

/**
 * Binds click listeners to the visual switcher buttons and synchronizes with state.
 */
function setupVisSelector() {
  const btns = document.querySelectorAll(".vis-btn");
  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeChartType = btn.dataset.vis;

      // Redraw the current cached chart config immediately!
      if (currentChartDataConfig) {
        drawUniversalChart();
      }
    });
  });
}

/**
 * Universal chart/grid rendering driver based on activeChartType and currentChartDataConfig.
 */
function drawUniversalChart() {
  if (!currentChartDataConfig) return;

  const canvas = document.getElementById("domainChart");
  const gridWrap = document.getElementById("domainGridWrap");

  if (!canvas || !gridWrap) return;

  if (activeChartType === "grid") {
    // Hide canvas, show grid
    canvas.classList.add("hidden");
    gridWrap.classList.remove("hidden");

    // Clear previous grid content
    gridWrap.innerHTML = "";

    const { labels, fullNames, existing, gaps, fillRates, clickCallback } = currentChartDataConfig;

    labels.forEach((label, index) => {
      const existVal = existing[index] || 0;
      const gapVal = gaps[index] || 0;
      const fillVal = fillRates ? (fillRates[index] || 0) : 0;
      const fullName = fullNames ? (fullNames[index] || label) : label;

      const card = document.createElement("div");
      card.className = "grid-card";
      if (index === selectedRow && clickCallback) {
        card.classList.add("selected");
      }

      card.innerHTML = `
        <div class="grid-card-title" title="${fullName}">${fullName}</div>
        <div class="grid-card-stats">
          <span class="grid-stat-label">Existing:</span>
          <span class="grid-stat-val teal">${existVal.toLocaleString()}</span>
        </div>
        <div class="grid-card-stats">
          <span class="grid-stat-label">Gap:</span>
          <span class="grid-stat-val rust">${gapVal.toLocaleString()}</span>
        </div>
        <div class="grid-progress-wrap">
          <div class="grid-progress-bar-container">
            <div class="grid-progress-bar-fill" style="width: ${fillVal}%"></div>
          </div>
          <div class="grid-progress-label">
            <span>Fill Rate</span>
            <span>${fillVal}%</span>
          </div>
        </div>
      `;

      if (clickCallback) {
        card.addEventListener("click", () => {
          clickCallback(index);
          document.querySelectorAll(".grid-card").forEach(c => c.classList.remove("selected"));
          card.classList.add("selected");
        });
      }

      gridWrap.appendChild(card);
    });

  } else {
    // Show canvas, hide grid
    canvas.classList.remove("hidden");
    gridWrap.classList.add("hidden");

    const ctx = canvas.getContext("2d");

    // Destroy existing chart instance
    if (activeChart) {
      activeChart.destroy();
      activeChart = null;
    }

    const { labels, fullNames, existing, gaps, fillRates, shares, clickCallback } = currentChartDataConfig;

    let datasets = [];
    let options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#26212f",
          titleColor: "#e4dff0",
          bodyColor: "#9b92ad",
          footerColor: "#34c4a4",
          borderColor: "rgba(140,60,221,0.3)",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          titleFont: { family: 'Space Grotesk', weight: '700', size: 12 },
          bodyFont: { family: 'Inter', size: 12 },
          callbacks: {
            title: (items) => {
              const idx = items[0].dataIndex;
              return fullNames ? (fullNames[idx] || labels[idx]) : labels[idx];
            },
            label: (item) => `${item.dataset.label}: ${item.raw.toLocaleString()}`,
            footer: (items) => {
              const idx = items[0].dataIndex;
              const parts = [];
              if (fillRates && fillRates[idx] !== undefined) {
                parts.push(`Fill rate: ${fillRates[idx]}%`);
              }
              if (shares && shares[idx] !== undefined) {
                parts.push(`Share: ${shares[idx]}%`);
              }
              return parts.join("  |  ");
            }
          }
        }
      }
    };

    if (activeChartType === "bar") {
      datasets = [
        {
          label: "Existing Startups",
          data: existing,
          backgroundColor: "#34c4a4",
          borderRadius: 4,
          borderSkipped: false,
          stack: "a"
        },
        {
          label: "Startup Potential",
          data: gaps,
          backgroundColor: "#e05c45",
          borderRadius: 4,
          borderSkipped: false,
          stack: "a"
        }
      ];

      options.scales = {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { color: "#6b6278", font: { size: 10, family: 'Inter' } },
          border: { display: false }
        },
        y: {
          stacked: true,
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: {
            color: "#6b6278",
            font: { size: 10, family: 'Inter' },
            callback: (value) => value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value
          },
          border: { display: false }
        }
      };

      if (clickCallback) {
        options.onClick = (_event, elements) => {
          if (elements.length > 0) {
            clickCallback(elements[0].index);
          }
        };
      }

    } else if (activeChartType === "line") {
      datasets = [
        {
          label: "Existing Startups",
          data: existing,
          borderColor: "#34c4a4",
          backgroundColor: "rgba(52, 196, 164, 0.12)",
          fill: true,
          tension: 0.38,
          pointBackgroundColor: "#34c4a4",
          pointBorderColor: "#26212f",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7
        },
        {
          label: "Startup Potential",
          data: gaps,
          borderColor: "#e05c45",
          backgroundColor: "rgba(224, 92, 69, 0.12)",
          fill: true,
          tension: 0.38,
          pointBackgroundColor: "#e05c45",
          pointBorderColor: "#26212f",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7
        }
      ];

      options.scales = {
        x: {
          grid: { display: false },
          ticks: { color: "#6b6278", font: { size: 10, family: 'Inter' } },
          border: { display: false }
        },
        y: {
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: {
            color: "#6b6278",
            font: { size: 10, family: 'Inter' },
            callback: (value) => value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value
          },
          border: { display: false }
        }
      };

      if (clickCallback) {
        options.onClick = (_event, elements) => {
          if (elements.length > 0) {
            clickCallback(elements[0].index);
          }
        };
      }

    } else if (activeChartType === "doughnut") {
      const makeColors = (hue, count) => {
        return Array.from({ length: count }, (_, i) => {
          const l = 40 + Math.round((i * 30) / Math.max(1, count - 1));
          return `hsla(${hue}, 60%, ${l}%, 0.85)`;
        });
      };

      datasets = [
        {
          label: "Startup Potential",
          data: gaps,
          backgroundColor: makeColors(9, gaps.length),
          borderColor: "#26212f",
          borderWidth: 2,
          weight: 1
        },
        {
          label: "Existing Startups",
          data: existing,
          backgroundColor: makeColors(167, existing.length),
          borderColor: "#26212f",
          borderWidth: 2,
          weight: 0.8
        }
      ];

      options.scales = undefined;
      options.cutout = "40%";

      if (clickCallback) {
        options.onClick = (_event, elements) => {
          if (elements.length > 0) {
            clickCallback(elements[0].index);
          }
        };
      }
    }

    activeChart = new Chart(ctx, {
      type: activeChartType,
      data: {
        labels: labels,
        datasets: datasets
      },
      options: options
    });
  }
}

/**
 * Render (or re-render) the stacked bar chart using Chart.js.
 *
 * @param {Object[]} domains - Array of domain objects (`{ short, current, total, name }`).
 */
function renderChart(domains) {
  currentChartDataConfig = {
    labels: domains.map(d => d.short),
    fullNames: domains.map(d => d.name),
    existing: domains.map(d => d.current),
    gaps: domains.map(d => d.total - d.current),
    fillRates: domains.map(d => d.total > 0 ? Math.round((d.current / d.total) * 100) : 0),
    clickCallback: (index) => selectRow(index)
  };

  drawUniversalChart();
}


// ── 3. Build the domain table ──────────────────────────────────────────────────

/**
 * Render the domain overview table rows.
 *
 * @param {Object[]} domains - Array of domain objects to display.
 */
function renderTable(domains) {
  const tbody = document.getElementById("domain-tbody");
  tbody.innerHTML = "";   // Clear previous rows

  domains.forEach((domain, index) => {
    // Guard against division by zero when total is 0
    const pct = domain.total > 0
      ? Math.round((domain.current / domain.total) * 100)
      : 0;

    const tr = document.createElement("tr");
    if (index === selectedRow) tr.classList.add("selected");

    tr.innerHTML = `
      <td>${domain.name}</td>
      <td>${domain.current.toLocaleString()}</td>
      <td>
        ${domain.total.toLocaleString()}
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${pct}%"></div>
        </div>
      </td>
      <td>
        <button class="btn-subdomain" title="View sub-domains of ${domain.name}">
          📋 Sub-Domains
        </button>
      </td>
    `;

    // Row click → highlight row and show a matching startup
    tr.addEventListener("click", () => selectRow(index));

    // Sub-Domains button → open modal (without triggering row select)
    tr.querySelector(".btn-subdomain").addEventListener("click", (e) => {
      e.stopPropagation();
      openSubModal(domain);
    });

    // ── Hover → instant sub-domain flyout ─────────────────────────────────
    tr.addEventListener("mouseenter", () => showSubFlyout(tr, domain));
    tr.addEventListener("mouseleave", hideSubFlyout);

    tbody.appendChild(tr);
  });
}


// ── Sub-domain hover flyout helpers ────────────────────────────────────────────
// NOTE: element lookups are deferred so the DOM is guaranteed to be ready.

let _flyout = null;
let _sdfTitle = null;
let _sdfList = null;
let _flyoutTimer = null;
let _flyoutDomain = null;  // tracks which domain is currently shown in the flyout

function _initFlyout() {
  _flyout = document.getElementById("subdomain-flyout");
  _sdfTitle = document.getElementById("sdf-title");
  _sdfList = document.getElementById("sdf-list");

  // Keep flyout open while cursor is ON the flyout (cancel any pending hide)
  _flyout.addEventListener("mouseenter", () => {
    if (_flyoutTimer) { clearTimeout(_flyoutTimer); _flyoutTimer = null; }
  });
  _flyout.addEventListener("mouseleave", hideSubFlyout);

  // Click delegation — any <li data-sub> click triggers selectSubDomain
  _sdfList.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-sub]");
    if (li && _flyoutDomain) {
      selectSubDomain(_flyoutDomain, li.dataset.sub);
      hideSubFlyout();
    }
  });
}

/**
 * Show the sub-domain flyout panel next to the hovered table row.
 *
 * CSS keeps the flyout display:block + visibility:hidden at all times so
 * offsetWidth / offsetHeight are always accurate. We just toggle .sdf-visible
 * (which flips visibility + opacity) and set left/top via inline styles.
 */
function showSubFlyout(row, domain) {
  if (!_flyout) _initFlyout();
  if (!_flyout) return;

  // Cancel any pending hide so flyout stays open while cursor is on a row
  if (_flyoutTimer) { clearTimeout(_flyoutTimer); _flyoutTimer = null; }

  // ── Fill content ───────────────────────────────────────────────────
  _sdfTitle.textContent = domain.name || "";
  _flyoutDomain = domain;   // remember for click handler
  const subs = domain.subs || [];
  _sdfList.innerHTML = subs.length
    ? subs.map((s, i) => `<li data-n="${i + 1}" data-sub="${s.replace(/"/g, '&quot;')}">${s}</li>`).join("")
    : `<li data-n="\u2013" style="color:#888;font-style:italic">No sub-domains</li>`;

  // ── Measure (visibility:hidden but display:block → real dimensions) ──
  // Temporarily remove sdf-visible so opacity is 0 during measurement
  _flyout.classList.remove("sdf-visible");

  const flyW = _flyout.offsetWidth || 290;
  const flyH = _flyout.offsetHeight || 200;

  // ── Position ───────────────────────────────────────────────────
  const rect = row.getBoundingClientRect();

  let left = rect.right + 16;                       // try right side first
  if (left + flyW > window.innerWidth - 8) {
    left = rect.left - flyW - 16;                   // flip to left
  }

  let top = rect.top + rect.height / 2 - flyH / 2; // centre vertically
  top = Math.max(8, Math.min(top, window.innerHeight - flyH - 8));

  _flyout.style.left = `${Math.round(left)}px`;
  _flyout.style.top = `${Math.round(top)}px`;

  // Force a reflow so the browser sees the new position before the transition
  void _flyout.offsetWidth;

  // ── Animate in ────────────────────────────────────────────────────
  _flyout.classList.add("sdf-visible");
  _flyout.setAttribute("aria-hidden", "false");
}

/**
 * Hide the flyout after a short grace period.
 * 160 ms matches the CSS transition so .sdf-visible is removed after the fade.
 */
function hideSubFlyout() {
  _flyoutTimer = setTimeout(() => {
    if (_flyout) {
      _flyout.classList.remove("sdf-visible");
      _flyout.setAttribute("aria-hidden", "true");
    }
    _flyoutTimer = null;
  }, 160);
}




// ── 4. Render the Startup Details card ────────────────────────────────────────

// Store last selected startup globally
let _pfActiveStartup = null;
let _pfIsGenerating = false;

// Update remaining search count dynamically every second in real-time
setInterval(() => {
  const badge = document.querySelector('#startup-body .pf-sidebar-badge');
  if (badge) {
    const limitState = _pfGetLimitState();
    const searchesRemainingText = limitState.plan === 'admin' 
      ? 'Admin Access (Unlimited)' 
      : `${limitState.remaining} search${limitState.remaining === 1 ? ' remains' : 's remain'} today`;
    
    // Update text span
    const textSpan = badge.querySelector('span:nth-child(2)');
    if (textSpan && textSpan.textContent !== searchesRemainingText) {
      textSpan.textContent = searchesRemainingText;
    }

    // Update classes and dot based on limit exhaustion
    const isExhausted = (limitState.plan !== 'admin' && limitState.remaining <= 0);
    const dot = badge.querySelector('span:nth-child(1)');
    if (isExhausted) {
      if (!badge.classList.contains('pf-badge-danger')) {
        badge.className = 'pf-sidebar-badge pf-badge-danger';
        if (dot) dot.className = 'pf-static-dot';
      }
    } else {
      if (!badge.classList.contains('pf-badge-success')) {
        badge.className = 'pf-sidebar-badge pf-badge-success';
        if (dot) dot.className = 'pf-pulse-dot';
      }
    }
  }
}, 1000);

function renderStartupCard(startup) {
  _pfActiveStartup = startup;
  const body = document.getElementById("startup-body");

  const limitState = _pfGetLimitState();
  const searchesRemainingText = limitState.plan === 'admin' 
    ? 'Admin Access (Unlimited)' 
    : `${limitState.remaining} search${limitState.remaining === 1 ? ' remains' : 's remain'} today`;

  const isExhausted = (limitState.plan !== 'admin' && limitState.remaining <= 0);
  const badgeClass = isExhausted ? 'pf-badge-danger' : 'pf-badge-success';
  const dotClass = isExhausted ? 'pf-static-dot' : 'pf-pulse-dot';

  body.innerHTML = `
    <div class="pf-sidebar-widget">
      <div class="pf-sidebar-title">Multimillion Opportunities</div>
      <p class="pf-sidebar-desc">Identify regional multimillion-dollar startup ideas and detailed 7-phase business plans tailored to your filters.</p>
      
      <button class="pf-sidebar-btn" id="prob-stmt-btn" onclick="openPotentialFinder()">
        🚀 Potential
      </button>
      
      <div class="pf-sidebar-badge ${badgeClass}">
        <span class="${dotClass}"></span>
        <span>${searchesRemainingText}</span>
      </div>
    </div>
  `;
}


// ── 5. Filter logic ───────────────────────────────────────────────────────────

/**
 * Attach Enter-key listeners to the four filter dropdowns and wire up the
 * cascading country → state → district behaviour.
 *
 * Country change  → fetch /api/states  → repopulate #filter-state, reset district
 * State change    → fetch /api/districts → repopulate #filter-district
 */
function setupFilters() {
  // ── Enter-key shortcuts ──────────────────────────────────────────────────
  ["filter-country", "filter-state", "filter-district", "filter-domain"].forEach((id) => {
    document.getElementById(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyFilters();
    });
  });

  // ── Country → States cascade ─────────────────────────────────────────────
  document.getElementById("filter-country").addEventListener("change", async () => {
    const country = document.getElementById("filter-country").value;
    const stateSel = document.getElementById("filter-state");
    const distSel = document.getElementById("filter-district");

    // Reset both dependent dropdowns while loading
    setSelectLoading(stateSel, "Loading states…");
    resetSelect(distSel, "— Select State First —");

    if (country === "All") {
      resetSelect(stateSel, "— Select Country First —");
      return;
    }

    try {
      const res = await fetch(`/api/states?country=${encodeURIComponent(country)}`);
      const states = await res.json();
      populateSelect(stateSel, states, "All States");
    } catch (err) {
      console.error("[cascade] Failed to load states:", err);
      resetSelect(stateSel, "— Error loading states —");
    }
  });

  // ── State → Districts cascade ────────────────────────────────────────────
  document.getElementById("filter-state").addEventListener("change", async () => {
    const country = document.getElementById("filter-country").value;
    const state = document.getElementById("filter-state").value;
    const distSel = document.getElementById("filter-district");

    setSelectLoading(distSel, "Loading districts…");

    if (state === "All") {
      resetSelect(distSel, "— Select State First —");
      return;
    }

    try {
      const res = await fetch(`/api/districts?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}`);
      const districts = await res.json();
      populateSelect(distSel, districts, "All Districts");
    } catch (err) {
      console.error("[cascade] Failed to load districts:", err);
      resetSelect(distSel, "— Error loading districts —");
    }
  });
}

/**
 * Populate a <select> element with an array of string options.
 */
function populateSelect(sel, options, allLabel = "All") {
  sel.innerHTML = "";
  sel.disabled = false;
  options.forEach((val, i) => {
    const opt = document.createElement("option");
    opt.value = val;
    opt.textContent = (i === 0) ? allLabel : val;
    sel.appendChild(opt);
  });
  const ss = _getSSFor(sel);
  if (ss) { ss.setDisabled(false); ss.refresh(); }
}

function resetSelect(sel, label) {
  sel.innerHTML = `<option value="All">${label}</option>`;
  sel.disabled = true;
  _getSSFor(sel)?.setDisabled(true, label);
}

function setSelectLoading(sel, label) {
  sel.innerHTML = `<option value="All">${label}</option>`;
  sel.disabled = true;
  _getSSFor(sel)?.setDisabled(true, label);
}

function showGlobalLoader() {
  const loader = document.getElementById("global-loader");
  if (loader) loader.classList.remove("hidden");
}

function hideGlobalLoader() {
  const loader = document.getElementById("global-loader");
  if (loader) loader.classList.add("hidden");
}

/**
 * Read filter values, fetch data, update stat cards, chart, table.
 * For India: uses real CSV data (207,135 records) from /api/potential.
 */
async function applyFilters() {
  const country = document.getElementById("filter-country").value;
  const state = document.getElementById("filter-state").value;
  const district = document.getElementById("filter-district").value;
  const domain = document.getElementById("filter-domain").value;

  try {
    showGlobalLoader();
    showToast("⏳ Fetching filtered data…", "success");

    // ── Fetch domain stats + startup list in parallel ──────────────────────
    const [domainsRes, startupsRes] = await Promise.all([
      fetch(`/api/domain-stats-by-country?country=${encodeURIComponent(country)}&domain=${encodeURIComponent(domain)}`),
      fetch(`/api/startups-by-filter?country=${encodeURIComponent(country)}&domain=${encodeURIComponent(domain)}`),
    ]);

    if (!domainsRes.ok || !startupsRes.ok) {
      throw new Error(`Server error: ${domainsRes.status} / ${startupsRes.status}`);
    }

    const filteredDomains = await domainsRes.json();
    const filteredStartups = await startupsRes.json();

    // Countries with dedicated API endpoints don't use Excel data — skip early return for them
    const _DEDICATED_COUNTRIES = ["Saudi Arabia", "United Arab Emirates", "Oman", "Qatar"];
    if (!Array.isArray(filteredDomains) || filteredDomains.length === 0) {
      if (!_DEDICATED_COUNTRIES.includes(country)) {
        showToast("⚠️ No domain data found for this filter.", "warn");
        return;
      }
      // For dedicated countries: continue so their specific handler runs below
    }

    currentFilteredDomains = filteredDomains;
    currentFilteredStartups = filteredStartups;

    const totalPotential = filteredDomains.reduce((sum, d) => sum + d.total, 0);
    const totalCurrent = filteredDomains.reduce((sum, d) => sum + d.current, 0);
    const uniqueStartups = new Set(filteredStartups.map(s => s.name)).size;

    const stats = {
      domains: filteredDomains.length,
      countries: country === "All" ? COUNTRY_COUNT : 1,
      total_startups: filteredStartups.length,
      total_potential: totalPotential,
      unique_startups: uniqueStartups,
    };

    // ── Update stat cards ─────────────────────────────────────────────────
    setStatCard("stat-domains", stats.domains.toString());
    setStatCard("stat-countries", stats.countries.toString());
    setStatCard("stat-startups", totalCurrent.toLocaleString());
    setStatCard("stat-potential", stats.total_potential.toLocaleString());
    setStatCard("stat-unique", stats.unique_startups.toString());

    // Re-render chart and table with domain data
    selectedRow = 0;
    renderChart(filteredDomains);
    renderTable(filteredDomains);

    if (filteredStartups.length > 0) {
      renderStartupCard(filteredStartups[0]);
    } else {
      renderStartupCard(null);
    }

    // ── INDIA: Use real CSV data for both industry chart + state table ────
    if (country === "India") {
      try {
        // Fetch industry stats AND state stats in parallel (passing filters)
        const [indRes, stateRes] = await Promise.all([
          fetch(`/api/india-industry-stats?limit=20&state=${encodeURIComponent(state)}&domain=${encodeURIComponent(domain)}&district=${encodeURIComponent(district)}`),
          fetch(`/api/india-state-stats?domain=${encodeURIComponent(domain)}&state=${encodeURIComponent(state)}`),
        ]);
        const indData = await indRes.json();
        const stateData = await stateRes.json();

        if (!indData.error && indData.industries && indData.industries.length) {
          const industries = indData.industries;
          const states = stateData.states || [];

          // ── 1. Stat cards with real numbers ──────────────────────────
          const realTotal = indData.grand_total;
          const realPotential = industries.reduce((s, r) => s + r.total, 0);
          const realGap = industries.reduce((s, r) => s + r.gap, 0);

          setStatCard("stat-startups", realTotal.toLocaleString());
          setStatCard("stat-potential", realPotential.toLocaleString());
          setStatCard("stat-unique", realGap.toLocaleString());
          setStatCard("stat-domains", industries.length + " industries");

          _setStatLabel("stat-startups", "Actual (DPIIT 2024)");
          _setStatLabel("stat-potential", "Total Potential");
          _setStatLabel("stat-unique", "Opportunity Gap");
          _setStatLabel("stat-domains", "TOTAL INDUSTRIES");

          // ── 2. Domain tab → Industry chart ───────────────────────────
          // Render industry data in the domain chart (Domain tab stays active)
          _activateTab("Domain");
          _renderIndiaIndustryChart(industries);
          _renderIndiaIndustryTable(industries, indData.source);

          // ── 3. Populate State tab data (ready when user clicks State) ─
          // Cache the state data so State tab renders instantly
          _cachedIndiaStates = states;
          _cachedIndiaSource = stateData.source;

          // ── 4. District selected → overwrite stat cards with district data ─
          if (district && district !== "All") {
            try {
              const distRes  = await fetch(`/api/india-district-stats?state=${encodeURIComponent(state)}&domain=${encodeURIComponent(domain)}&district=${encodeURIComponent(district)}`);
              const distData = await distRes.json();
              const allDists = distData.districts || [];

              // 3-tier match: exact → partial → proportional fallback
              const dLow = district.toLowerCase();

              // Tier 1: exact match
              let distRow = allDists.find(d => d.district.toLowerCase() === dLow);

              // Tier 2: partial / contains match (handles "Bengaluru" → "Bengaluru Urban")
              if (!distRow) {
                distRow = allDists.find(d =>
                  d.district.toLowerCase().includes(dLow) ||
                  dLow.includes(d.district.toLowerCase())
                );
              }

              // Tier 3: proportional estimate (small town not in our list → use state share)
              if (!distRow && allDists.length > 0) {
                // Use the smallest district as a proportional proxy for unknown small towns
                const smallest = [...allDists].sort((a, b) => a.actual - b.actual)[0];
                const stateActual = allDists.reduce((s, d) => s + d.actual, 0);
                // Assume unknown district is ~0.5% of state
                const est_actual    = Math.max(5, Math.round(stateActual * 0.005));
                const est_potential = Math.round(est_actual * 1.5);
                const est_gap       = est_potential - est_actual;
                distRow = { district, actual: est_actual, potential: est_potential, gap: est_gap, fill_pct: Math.round(est_actual/est_potential*100), _estimated: true };
              }

              if (distRow) {
                setStatCard("stat-startups",  distRow.actual.toLocaleString());
                setStatCard("stat-potential", distRow.potential.toLocaleString());
                setStatCard("stat-unique",    distRow.gap.toLocaleString());
                setStatCard("stat-domains",   industries.length + " industries");
                _setStatLabel("stat-startups",  `Actual (${district.toUpperCase()})`);
                _setStatLabel("stat-potential", "Total Potential");
                _setStatLabel("stat-unique",    "Opportunity Gap");

                const estNote = distRow._estimated ? " (est.)" : "";
                showToast(
                  `✅ ${district}, ${state}: ${distRow.actual.toLocaleString()}${estNote} startups · fill ${distRow.fill_pct}%`,
                  "success"
                );
                saveSearch(
                  { country, state, district, domain, subdomain: activeSubDomain ? activeSubDomain.sub : "" },
                  { domains: industries.length, countries: 1, total_startups: distRow.actual, total_potential: distRow.potential, unique_startups: distRow.gap }
                );
                return;
              }
            } catch (distErr) {
              console.warn("[applyFilters] District data fetch failed:", distErr);
              // fall through — show state-level data

            }
          }

          showToast(
            `✅ India: ${realTotal.toLocaleString()} startups · ${industries.length} industries · ${states.length} states`,
            "success"
          );
          saveSearch(
            { country, state, district, domain, subdomain: activeSubDomain ? activeSubDomain.sub : "" },
            { domains: industries.length, countries: 1, total_startups: realTotal, total_potential: realPotential, unique_startups: realGap }
          );
          return;

        }
      } catch (indiaErr) {
        console.warn("[applyFilters] India CSV data fetch failed:", indiaErr);
        // fall through to normal toast
      }
    }

    // ── UNITED KINGDOM: Use Companies House Live API ───────────────────────
    if (country === "United Kingdom") {
      try {
        const [ukIndRes, ukStateRes] = await Promise.allSettled([
          fetch(`/api/uk-industry-stats?domain=${encodeURIComponent(domain)}&state=${encodeURIComponent(state)}`),
          fetch(`/api/uk-state-stats?domain=${encodeURIComponent(domain)}&state=${encodeURIComponent(state)}`)
        ]);

        const ukIndData = ukIndRes.status === "fulfilled" && ukIndRes.value.ok ? await ukIndRes.value.json() : { industries: [], grand_total: 0 };
        const ukStateData = ukStateRes.status === "fulfilled" && ukStateRes.value.ok ? await ukStateRes.value.json() : { states: [], source: "Error" };

        if (ukIndData.error) throw new Error(ukIndData.error);

        const industries = ukIndData.industries || [];
        const realTotal = ukIndData.grand_total || 0;
        const states = ukStateData.states || [];

        // Aggregate for stats
        const realPotential = industries.reduce((sum, d) => sum + d.total, 0);
        const realGap = industries.reduce((sum, d) => sum + d.gap, 0);

        setStatCard("stat-startups", realTotal.toLocaleString());
        setStatCard("stat-potential", realPotential.toLocaleString());
        setStatCard("stat-unique", realGap.toLocaleString());
        setStatCard("stat-domains", domain === "All" ? industries.length.toString() : "1");

        _setStatLabel("stat-startups",  "Actual (UK)");
        _setStatLabel("stat-potential", "Total Potential");
        _setStatLabel("stat-unique",    "Opportunity Gap");

        // Cache for the "State" tab
        _cachedIndiaStates = states;
        _cachedIndiaSource = ukStateData.source || "ONS 2023 | Companies House";

        // Update Chart and Table
        _renderIndiaIndustryChart(industries);
        _renderIndiaIndustryTable(industries, ukIndData.source);
        renderStartupCard(null);

        // ── City lookup priority: district > state > national ──────────
        // Pick the most specific location selected by the user
        const cityTarget = (district && district !== "All") ? district
                         : (state    && state    !== "All") ? state
                         : null;

        if (cityTarget) {
          try {
            const cityRes  = await fetch(`/api/uk-city-stats?city=${encodeURIComponent(cityTarget)}&domain=${encodeURIComponent(domain)}`);
            const cityData = await cityRes.json();
            if (cityData && !cityData.error) {
              setStatCard("stat-startups",  cityData.actual.toLocaleString());
              setStatCard("stat-potential", cityData.potential.toLocaleString());
              setStatCard("stat-unique",    cityData.gap.toLocaleString());
              setStatCard("stat-domains",   domain === "All" ? industries.length.toString() : "1");
              _setStatLabel("stat-startups",  `Actual (${cityTarget.toUpperCase()})`);
              _setStatLabel("stat-potential", "Total Potential");
              _setStatLabel("stat-unique",    "Opportunity Gap");
              const estNote = cityData.estimated ? " (est.)" : "";
              showToast(
                `✅ ${cityTarget}, UK: ${cityData.actual.toLocaleString()}${estNote} startups · fill ${cityData.fill_pct}%`,
                "success"
              );
              saveSearch(
                { country, state, district, domain, subdomain: activeSubDomain ? activeSubDomain.sub : "" },
                { domains: industries.length, countries: 1, total_startups: cityData.actual, total_potential: cityData.potential, unique_startups: cityData.gap }
              );
              return;
            }
          } catch (cityErr) {
            console.warn("[UK] City data fetch failed:", cityErr);
          }
        }

        showToast(`✅ UK (${state || "All"}): ${realTotal.toLocaleString()} startups found`, "success");
        saveSearch(
          { country, state, district, domain, subdomain: activeSubDomain ? activeSubDomain.sub : "" },
          { domains: industries.length, countries: 1, total_startups: realTotal, total_potential: realPotential, unique_startups: realGap }
        );
        return;

      } catch (err) {
        console.error("UK API Error:", err);
      }
    }

    // ── UNITED STATES: Use Census API Logic ────────────────────────────────
    if (country === "United States") {
      try {
        const [usaIndRes, usaStateRes] = await Promise.allSettled([
          fetch(`/api/usa-industry-stats?domain=${encodeURIComponent(domain)}&state=${encodeURIComponent(state)}`),
          fetch(`/api/usa-state-stats?domain=${encodeURIComponent(domain)}&state=${encodeURIComponent(state)}`)
        ]);

        const usaIndData = usaIndRes.status === "fulfilled" && usaIndRes.value.ok ? await usaIndRes.value.json() : { industries: [], grand_total: 0 };
        const usaStateData = usaStateRes.status === "fulfilled" && usaStateRes.value.ok ? await usaStateRes.value.json() : { states: [], source: "Error" };

        if (usaIndData.error) throw new Error(usaIndData.error);

        const industries = usaIndData.industries || [];
        const realTotal = usaIndData.grand_total || 0;
        const states = usaStateData.states || [];

        // Aggregate for stats
        const realPotential = industries.reduce((sum, d) => sum + d.total, 0);
        const realGap = industries.reduce((sum, d) => sum + d.gap, 0);

        setStatCard("stat-startups", realTotal.toLocaleString());
        setStatCard("stat-potential", realPotential.toLocaleString());
        setStatCard("stat-unique", realGap.toLocaleString());
        setStatCard("stat-domains", domain === "All" ? industries.length.toString() : "1");

        // Cache for the "State" tab
        _cachedIndiaStates = states;
        _cachedIndiaSource = usaStateData.source || "US Census Bureau Data API";

        // Update Chart and Table (Detailed India Style)
        _renderIndiaIndustryChart(industries);
        _renderIndiaIndustryTable(industries, usaIndData.source);
        renderStartupCard(null);

        showToast(`✅ USA (${state}): ${realTotal.toLocaleString()} startups found`, "success");
        saveSearch(
          { country, state, district, domain, subdomain: activeSubDomain ? activeSubDomain.sub : "" },
          { domains: industries.length, countries: 1, total_startups: realTotal, total_potential: realPotential, unique_startups: realGap }
        );
        return;
      } catch (usaErr) {
        console.warn("[applyFilters] USA API data fetch failed:", usaErr);
      }
    }

    // ── SAUDI ARABIA: MONSHA'AT Q4 2024 Official Data ─────────────────────────
    if (country === "Saudi Arabia") {
      try {
        const [saIndRes, saStateRes] = await Promise.allSettled([
          fetch(`/api/saudi-industry-stats?domain=${encodeURIComponent(domain)}&state=${encodeURIComponent(state)}`),
          fetch(`/api/saudi-state-stats?domain=${encodeURIComponent(domain)}&state=${encodeURIComponent(state)}`)
        ]);

        const saIndData   = saIndRes.status   === "fulfilled" && saIndRes.value.ok   ? await saIndRes.value.json()   : { industries: [], grand_total: 0 };
        const saStateData = saStateRes.status === "fulfilled" && saStateRes.value.ok ? await saStateRes.value.json() : { states: [], source: "" };

        const industries  = saIndData.industries || [];
        const realTotal   = saIndData.grand_total || 0;
        const saudiStates = saStateData.states || [];
        const realPotential = industries.reduce((sum, d) => sum + d.total, 0);
        const realGap       = industries.reduce((sum, d) => sum + d.gap,   0);

        setStatCard("stat-startups",  realTotal.toLocaleString());
        setStatCard("stat-potential", realPotential.toLocaleString());
        setStatCard("stat-unique",    realGap.toLocaleString());
        setStatCard("stat-domains",   domain === "All" ? industries.length.toString() : "1");

        _setStatLabel("stat-startups",  "Actual (MONSHA'AT 2024)");
        _setStatLabel("stat-potential", "Total Potential");
        _setStatLabel("stat-unique",    "Opportunity Gap");
        _setStatLabel("stat-domains",   "TOTAL SECTORS");

        _cachedIndiaStates = saudiStates;
        _cachedIndiaSource = saStateData.source || "MONSHA'AT SME Monitor Q4 2024";

        _renderIndiaIndustryChart(industries);
        _renderIndiaIndustryTable(industries, saIndData.source);
        renderStartupCard(null);

        showToast(`✅ Saudi Arabia (${state === "All" ? "All Regions" : state}): ${realTotal.toLocaleString()} startups`, "success");
        saveSearch(
          { country, state, district, domain, subdomain: activeSubDomain ? activeSubDomain.sub : "" },
          { domains: industries.length, countries: 1, total_startups: realTotal, total_potential: realPotential, unique_startups: realGap }
        );
        return;
      } catch (saErr) {
        console.warn("[applyFilters] Saudi Arabia data fetch failed:", saErr);
      }
    }

    // ── UAE: Dubai DET + Hub71 + Bayanat.ae 2024 ─────────────────────────────
    if (country === "United Arab Emirates") {
      try {
        const [uaeIndRes, uaeStateRes] = await Promise.allSettled([
          fetch(`/api/uae-industry-stats?domain=${encodeURIComponent(domain)}&state=${encodeURIComponent(state)}`),
          fetch(`/api/uae-state-stats?domain=${encodeURIComponent(domain)}&state=${encodeURIComponent(state)}`)
        ]);

        const uaeIndData   = uaeIndRes.status   === "fulfilled" && uaeIndRes.value.ok   ? await uaeIndRes.value.json()   : { industries: [], grand_total: 0 };
        const uaeStateData = uaeStateRes.status === "fulfilled" && uaeStateRes.value.ok ? await uaeStateRes.value.json() : { states: [], source: "" };

        const industries = uaeIndData.industries || [];
        const realTotal  = uaeIndData.grand_total || 0;
        const emirates   = uaeStateData.states || [];
        const realPotential = industries.reduce((sum, d) => sum + d.total, 0);
        const realGap       = industries.reduce((sum, d) => sum + d.gap,   0);

        setStatCard("stat-startups",  realTotal.toLocaleString());
        setStatCard("stat-potential", realPotential.toLocaleString());
        setStatCard("stat-unique",    realGap.toLocaleString());
        setStatCard("stat-domains",   domain === "All" ? industries.length.toString() : "1");

        _setStatLabel("stat-startups",  "Actual (Dubai DET 2024)");
        _setStatLabel("stat-potential", "Total Potential");
        _setStatLabel("stat-unique",    "Opportunity Gap");
        _setStatLabel("stat-domains",   "TOTAL SECTORS");

        _cachedIndiaStates = emirates;
        _cachedIndiaSource = uaeStateData.source || "Dubai DET 2024 | Hub71 | Bayanat.ae";

        _renderIndiaIndustryChart(industries);
        _renderIndiaIndustryTable(industries, uaeIndData.source);
        renderStartupCard(null);

        showToast(`✅ UAE (${state === "All" ? "All Emirates" : state}): ${realTotal.toLocaleString()} startups`, "success");
        saveSearch(
          { country, state, district, domain, subdomain: activeSubDomain ? activeSubDomain.sub : "" },
          { domains: industries.length, countries: 1, total_startups: realTotal, total_potential: realPotential, unique_startups: realGap }
        );
        return;
      } catch (uaeErr) {
        console.warn("[applyFilters] UAE data fetch failed:", uaeErr);
      }
    }

    // ── OMAN: NCSI + MTCIT + Oman Startup Hub 2024 ───────────────────────────
    if (country === "Oman") {
      try {
        const [omIndRes, omStateRes] = await Promise.allSettled([
          fetch(`/api/oman-industry-stats?domain=${encodeURIComponent(domain)}&state=${encodeURIComponent(state)}`),
          fetch(`/api/oman-state-stats?domain=${encodeURIComponent(domain)}&state=${encodeURIComponent(state)}`)
        ]);
        const omIndData   = omIndRes.status   === "fulfilled" && omIndRes.value.ok   ? await omIndRes.value.json()   : { industries: [], grand_total: 0 };
        const omStateData = omStateRes.status === "fulfilled" && omStateRes.value.ok ? await omStateRes.value.json() : { states: [], source: "" };

        const industries    = omIndData.industries || [];
        const realTotal     = omIndData.grand_total || 0;
        const realPotential = industries.reduce((sum, d) => sum + d.total, 0);
        const realGap       = industries.reduce((sum, d) => sum + d.gap,   0);

        setStatCard("stat-startups",  realTotal.toLocaleString());
        setStatCard("stat-potential", realPotential.toLocaleString());
        setStatCard("stat-unique",    realGap.toLocaleString());
        setStatCard("stat-domains",   domain === "All" ? industries.length.toString() : "1");
        _setStatLabel("stat-startups",  "Actual (MTCIT 2024)");
        _setStatLabel("stat-potential", "Total Potential");
        _setStatLabel("stat-unique",    "Opportunity Gap");
        _setStatLabel("stat-domains",   "TOTAL SECTORS");

        _cachedIndiaStates = omStateData.states || [];
        _cachedIndiaSource = omStateData.source || "NCSI + Oman Startup Hub 2024";

        _renderIndiaIndustryChart(industries);
        _renderIndiaIndustryTable(industries, omIndData.source);
        renderStartupCard(null);

        showToast(`✅ Oman (${state === "All" ? "All Governorates" : state}): ${realTotal.toLocaleString()} startups`, "success");
        saveSearch(
          { country, state, district, domain, subdomain: activeSubDomain ? activeSubDomain.sub : "" },
          { domains: industries.length, countries: 1, total_startups: realTotal, total_potential: realPotential, unique_startups: realGap }
        );
        return;
      } catch (omErr) {
        console.warn("[applyFilters] Oman data fetch failed:", omErr);
      }
    }

    // ── QATAR: QFC + QDB + Startup Qatar 2024 ────────────────────────────────
    if (country === "Qatar") {
      try {
        const [qaIndRes, qaStateRes] = await Promise.allSettled([
          fetch(`/api/qatar-industry-stats?domain=${encodeURIComponent(domain)}&state=${encodeURIComponent(state)}`),
          fetch(`/api/qatar-state-stats?domain=${encodeURIComponent(domain)}&state=${encodeURIComponent(state)}`)
        ]);
        const qaIndData   = qaIndRes.status   === "fulfilled" && qaIndRes.value.ok   ? await qaIndRes.value.json()   : { industries: [], grand_total: 0 };
        const qaStateData = qaStateRes.status === "fulfilled" && qaStateRes.value.ok ? await qaStateRes.value.json() : { states: [], source: "" };

        const industries    = qaIndData.industries || [];
        const realTotal     = qaIndData.grand_total || 0;
        const realPotential = industries.reduce((sum, d) => sum + d.total, 0);
        const realGap       = industries.reduce((sum, d) => sum + d.gap,   0);

        setStatCard("stat-startups",  realTotal.toLocaleString());
        setStatCard("stat-potential", realPotential.toLocaleString());
        setStatCard("stat-unique",    realGap.toLocaleString());
        setStatCard("stat-domains",   domain === "All" ? industries.length.toString() : "1");
        _setStatLabel("stat-startups",  "Actual (QFC 2024)");
        _setStatLabel("stat-potential", "Total Potential");
        _setStatLabel("stat-unique",    "Opportunity Gap");
        _setStatLabel("stat-domains",   "TOTAL SECTORS");

        _cachedIndiaStates = qaStateData.states || [];
        _cachedIndiaSource = qaStateData.source || "QFC Annual Report 2024 | QDB";

        _renderIndiaIndustryChart(industries);
        _renderIndiaIndustryTable(industries, qaIndData.source);
        renderStartupCard(null);

        showToast(`✅ Qatar (${state === "All" ? "All Governorates" : state}): ${realTotal.toLocaleString()} startups`, "success");
        saveSearch(
          { country, state, district, domain, subdomain: activeSubDomain ? activeSubDomain.sub : "" },
          { domains: industries.length, countries: 1, total_startups: realTotal, total_potential: realPotential, unique_startups: realGap }
        );
        return;
      } catch (qaErr) {
        console.warn("[applyFilters] Qatar data fetch failed:", qaErr);
      }
    }

    // ── Normal toast for other countries ─────────────────────────────────────
    if (filteredStartups.length > 0) {
      showToast(`✅ Found ${filteredStartups.length} startup(s) for the selected filter.`, "success");
    } else {
      showToast("ℹ️ No startups found for this filter.", "warn");
    }

    saveSearch({
      country, state, district, domain,
      subdomain: activeSubDomain ? activeSubDomain.sub : ""
    }, stats);


  } catch (error) {
    console.error("[applyFilters] Error:", error);
    showToast("❌ Error filtering data. Please try again.", "error");
  } finally {
    hideGlobalLoader();
  }
}

/** Safely update the label text of a stat card. */
function _setStatLabel(id, label) {
  const card = document.getElementById(id);
  if (!card) return;
  const lbl = card.closest(".stat-card")?.querySelector(".stat-label");
  if (lbl) lbl.textContent = label;
}

// Cache for India state data (populated when India is searched, used when State tab clicked)
let _cachedIndiaStates = null;
let _cachedIndiaSource = "";

/** Programmatically activate a named tab without clicking it. */
function _activateTab(tabName) {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(t => {
    t.classList.toggle("active", t.dataset.tab === tabName);
  });
  // Reset table header for state view
  const thead = document.querySelector(".domain-table thead tr");
  if (thead && tabName === "State") {
    thead.innerHTML = `
      <th>State / UT</th>
      <th>Actual Startups</th>
      <th>Potential</th>
      <th>Gap</th>
      <th>Fill Rate</th>
    `;
  } else if (thead && tabName === "Domain") {
    thead.innerHTML = `
      <th>Industry / Domain</th>
      <th>Actual Startups</th>
      <th>Potential</th>
      <th>Sub-Domains</th>
    `;
  }
}

/**
 * Render bar chart using India industry data from /api/india-industry-stats
 * @param {Object[]} industries - Array of industry objects
 */
function _renderIndiaIndustryChart(industries) {
  currentChartDataConfig = {
    labels: industries.map(d => d.short),
    fullNames: industries.map(d => d.name),
    existing: industries.map(d => d.current),
    gaps: industries.map(d => d.gap),
    fillRates: industries.map(d => d.fill_pct),
    shares: industries.map(d => d.share_pct)
  };

  drawUniversalChart();
  _updateChartHint("industry");
}

/**
 * Render the table with India industry-wise data
 * @param {Object[]} industries
 * @param {string}   source
 */
function _renderIndiaIndustryTable(industries, source) {
  const thead = document.querySelector(".domain-table thead tr");
  if (thead) {
    thead.innerHTML = `
      <th>Industry</th>
      <th>Actual Startups</th>
      <th>Potential</th>
      <th>Fill Rate</th>
    `;
  }

  const tbody = document.getElementById("domain-tbody");
  tbody.innerHTML = "";

  industries.forEach(d => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${d.name}</strong></td>
      <td style="color:var(--teal)">${d.current.toLocaleString()}</td>
      <td>
        ${d.total.toLocaleString()}
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${d.fill_pct}%"></div>
        </div>
      </td>
      <td style="font-weight:700;color:${d.fill_pct > 70 ? 'var(--teal)' : d.fill_pct > 40 ? 'var(--gold)' : 'var(--rust)'}">
        ${d.fill_pct}%
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (source) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td colspan="4" style="text-align:center;padding:10px;font-size:.7rem;color:var(--text3);border-top:1px solid var(--card-border)">
        📊 ${source}
      </td>
    `;
    tbody.appendChild(tr);
  }
}


// ── 6. Save search record ────────────────────────────────────────────────────

/**
 * POST the current filter selection and computed stats to the backend so they
 * are appended to search_history.json. Runs silently — no success toast is
 * shown to avoid interfering with the main filter result toast.
 *
 * @param {{ country: string, state: string, district: string, domain: string }} filters
 * @param {Object} stats - Computed stat object from applyFilters().
 */
async function saveSearch(filters, stats) {
  try {
    const res = await fetch("/api/save-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...filters, stats }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    if (data?.status === "ok") {
      // Silent success — log to console only so the main filter toast stays visible
      console.info(`[saveSearch] Record #${data.total_saved} saved.`);
      // Show the "Generate Problem Statement" button after each successful search
      _showProbStmtBtn();
    } else {
      console.warn("[saveSearch] Unexpected response:", data);
    }
  } catch (err) {
    console.error("[saveSearch] Failed to save search record:", err);
    showToast("⚠️ Search could not be saved.", "warn");
  }
}


// ── 7. Utility helpers ────────────────────────────────────────────────────────

/**
 * Safely set the text content of a stat card element by its ID.
 *
 * @param {string} id    - Element ID.
 * @param {string} value - Text value to display.
 */
function setStatCard(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/**
 * Display a transient toast notification at the bottom of the screen.
 * Any previously visible toast is removed before the new one is added.
 *
 * @param {string} message          - Text to display inside the toast.
 * @param {"success"|"warn"|"error"} [type="success"] - Visual style variant.
 */
function showToast(message, type = "success") {
  const existing = document.getElementById("dashboard-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "dashboard-toast";
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger CSS enter animation on next frame
  requestAnimationFrame(() => toast.classList.add("toast-show"));

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    toast.classList.remove("toast-show");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 3000);
}


// ── 8. Row selection ──────────────────────────────────────────────────────────

/**
 * Highlight a table row and display the best matching startup in the detail
 * card. The startup is selected by matching the clicked domain name — falling
 * back to the first startup in the list if no exact match exists.
 *
 * @param {number} index - Zero-based index of the clicked row.
 */
function selectRow(index) {
  const domainsList = currentFilteredDomains.length > 0 ? currentFilteredDomains : allDomains;
  const startupsList = currentFilteredStartups.length > 0 ? currentFilteredStartups : allStartups;

  if (startupsList.length === 0) return;

  selectedRow = index;

  // Update visual highlight on all rows
  document.querySelectorAll("#domain-tbody tr").forEach((tr, i) => {
    tr.classList.toggle("selected", i === index);
  });

  // Find a startup whose domain matches the clicked row's domain name
  const clickedDomainName = domainsList[index] ? domainsList[index].name : null;
  const match = clickedDomainName
    ? (startupsList.find(s => s.domain === clickedDomainName) || startupsList[0])
    : startupsList[0];

  renderStartupCard(match);
}


// ── 9. Tab buttons (Domain / State / District) ────────────────────────────────

/**
 * Attach click listeners to the chart view tabs.
 *  - Domain   → restore original domain chart
 *  - State    → fetch /api/potential?level=state&country=India → render state chart + table
 *  - District → prompt user to select a state first
 */
function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const tabName = tab.dataset.tab;

      if (tabName === "Domain") {
        const country = document.getElementById("filter-country").value;
        const state   = document.getElementById("filter-state").value;
        const district = document.getElementById("filter-district")?.value || "All";
        const domain  = document.getElementById("filter-domain").value;

        if (country === "India" && _cachedIndiaStates !== null) {
          showGlobalLoader();
          fetch(`/api/india-industry-stats?limit=20&state=${encodeURIComponent(state)}&domain=${encodeURIComponent(domain)}&district=${encodeURIComponent(district)}`)
            .then(r => r.json())
            .then(d => {
              if (d.industries) {
                _renderIndiaIndustryChart(d.industries);
                _renderIndiaIndustryTable(d.industries, d.source);
              }
            })
            .finally(() => hideGlobalLoader());
        } else if (country === "United Kingdom" && _cachedIndiaStates !== null) {
          showGlobalLoader();
          fetch(`/api/uk-industry-stats?domain=${encodeURIComponent(domain)}&state=${encodeURIComponent(state)}`)
            .then(r => r.json())
            .then(d => {
              if (d.industries) {
                _renderIndiaIndustryChart(d.industries);
                _renderIndiaIndustryTable(d.industries, d.source);
              }
            })
            .finally(() => hideGlobalLoader());
        } else if (country === "United States" && _cachedIndiaStates !== null) {
          showGlobalLoader();
          fetch(`/api/usa-industry-stats?domain=${encodeURIComponent(domain)}&state=${encodeURIComponent(state)}`)
            .then(r => r.json())
            .then(d => { if (d.industries) { _renderIndiaIndustryChart(d.industries); _renderIndiaIndustryTable(d.industries, d.source); } })
            .finally(() => hideGlobalLoader());
        } else if (country === "Saudi Arabia" && _cachedIndiaStates !== null) {
          showGlobalLoader();
          fetch(`/api/saudi-industry-stats?domain=${encodeURIComponent(domain)}&state=${encodeURIComponent(state)}`)
            .then(r => r.json())
            .then(d => { if (d.industries) { _renderIndiaIndustryChart(d.industries); _renderIndiaIndustryTable(d.industries, d.source); } })
            .finally(() => hideGlobalLoader());
        } else if (country === "United Arab Emirates" && _cachedIndiaStates !== null) {
          showGlobalLoader();
          fetch(`/api/uae-industry-stats?domain=${encodeURIComponent(domain)}&state=${encodeURIComponent(state)}`)
            .then(r => r.json())
            .then(d => { if (d.industries) { _renderIndiaIndustryChart(d.industries); _renderIndiaIndustryTable(d.industries, d.source); } })
            .finally(() => hideGlobalLoader());
        } else if (country === "Oman" && _cachedIndiaStates !== null) {
          showGlobalLoader();
          fetch(`/api/oman-industry-stats?domain=${encodeURIComponent(domain)}&state=${encodeURIComponent(state)}`)
            .then(r => r.json())
            .then(d => { if (d.industries) { _renderIndiaIndustryChart(d.industries); _renderIndiaIndustryTable(d.industries, d.source); } })
            .finally(() => hideGlobalLoader());
        } else if (country === "Qatar" && _cachedIndiaStates !== null) {
          showGlobalLoader();
          fetch(`/api/qatar-industry-stats?domain=${encodeURIComponent(domain)}&state=${encodeURIComponent(state)}`)
            .then(r => r.json())
            .then(d => { if (d.industries) { _renderIndiaIndustryChart(d.industries); _renderIndiaIndustryTable(d.industries, d.source); } })
            .finally(() => hideGlobalLoader());
        } else {
          // Non-India: restore standard domain chart
          const thead = document.querySelector(".domain-table thead tr");
          if (thead) {
            thead.innerHTML = `
              <th>Domain</th>
              <th>Current Potential</th>
              <th>Total Potential</th>
              <th>Sub-Domains</th>
            `;
          }
          renderChart(currentFilteredDomains.length ? currentFilteredDomains : allDomains);
          renderTable(currentFilteredDomains.length ? currentFilteredDomains : allDomains);
          document.querySelector(".chart-legend").style.display = "";
          _updateChartHint("domain");
        }

      } else if (tabName === "State") {
        const country = document.getElementById("filter-country").value;
        if ((country === "India" || country === "United Kingdom" || country === "United States" || country === "Saudi Arabia" || country === "United Arab Emirates" || country === "Oman" || country === "Qatar") && _cachedIndiaStates && _cachedIndiaStates.length) {
          // Use pre-fetched state/region data — instant render, no extra API call
          _activateTab("State");
          _renderStateTable(_cachedIndiaStates, country, _cachedIndiaSource);
          // Also render the state bar chart
          const top = _cachedIndiaStates;
          currentChartDataConfig = {
            labels: top.map(s => s.state.length > 14 ? s.state.slice(0, 13) + "\u2026" : s.state),
            fullNames: top.map(s => s.state),
            existing: top.map(s => s.actual),
            gaps: top.map(s => s.gap),
            fillRates: top.map(s => s.fill_pct)
          };
          drawUniversalChart();
          _updateChartHint("state");
          showToast(`\u2705 ${country}: ${_cachedIndiaStates.length} locations loaded`, "success");
        } else {
          _loadStatePotential();
        }

      } else if (tabName === "District") {
        const country = document.getElementById("filter-country").value;
        const state   = document.getElementById("filter-state").value;
        const district = document.getElementById("filter-district")?.value || "All";
        const domain  = document.getElementById("filter-domain").value;

        if (country === "India" && state && state !== "All") {
          // ── India: fetch real district data ────────────────────────────
          showGlobalLoader();
          fetch(`/api/india-district-stats?state=${encodeURIComponent(state)}&domain=${encodeURIComponent(domain)}&district=${encodeURIComponent(district)}`)
            .then(r => r.json())
            .then(data => {
              const districts = data.districts || [];
              if (!districts.length) {
                showToast(`⚠️ No district data for ${state}.`, "warn");
                return;
              }
              _activateTab("District");
              // ── Render chart ──────────────────────────────────────
              const top = districts;
              currentChartDataConfig = {
                labels: top.map(d => d.district.length > 16 ? d.district.slice(0, 15) + "…" : d.district),
                fullNames: top.map(d => d.district),
                existing: top.map(d => d.actual),
                gaps: top.map(d => d.gap),
                fillRates: top.map(d => d.fill_pct)
              };
              drawUniversalChart();
              // ── Render table ──────────────────────────────────────────
              _renderDistrictTable(districts, data.source, state);

              // ── Update stat cards with district-level totals ──────────
              const distTotal     = districts.reduce((s, d) => s + d.actual,    0);
              const distPotential = districts.reduce((s, d) => s + d.potential, 0);
              const distGap       = districts.reduce((s, d) => s + d.gap,       0);

              setStatCard("stat-startups",  distTotal.toLocaleString());
              setStatCard("stat-potential", distPotential.toLocaleString());
              setStatCard("stat-unique",    distGap.toLocaleString());
              setStatCard("stat-domains",   districts.length.toString());
              setStatCard("stat-countries", "1");

              // Update stat card labels to reflect district context
              const actualLabel    = document.querySelector("#stat-startups")?.closest(".stat-card-body")?.querySelector(".stat-label");
              const potLabel       = document.querySelector("#stat-potential")?.closest(".stat-card-body")?.querySelector(".stat-label");
              const gapLabel       = document.querySelector("#stat-unique")?.closest(".stat-card-body")?.querySelector(".stat-label");
              const domainLabel    = document.querySelector("#stat-domains")?.closest(".stat-card-body")?.querySelector(".stat-label");
              if (actualLabel) actualLabel.textContent  = `Actual (${state.toUpperCase()})`;
              if (potLabel)    potLabel.textContent     = "Total Potential";
              if (gapLabel)    gapLabel.textContent     = "Opportunity Gap";
              if (domainLabel) domainLabel.textContent  = "Total Districts";

              showToast(`✅ ${state}: ${districts.length} districts | ${distTotal.toLocaleString()} startups`, "success");

            })
            .catch(() => showToast("❌ Failed to load district data.", "error"))
            .finally(() => hideGlobalLoader());

        } else if (country === "India" && (!state || state === "All")) {
          showToast("ℹ️ Please select a State first to see district data.", "warn");
        } else {
          showToast("ℹ️ District breakdown is available for India only.", "warn");
        }
      }

    });
  });
}

/**
 * Fetch India state-wise real startup data from /api/potential and render
 * the chart as a horizontal-friendly grouped bar + table below.
 */
async function _loadStatePotential() {
  const country = document.getElementById("filter-country").value || "India";
  const targetCountry = (country === "All") ? "India" : country;
  const state = document.getElementById("filter-state")?.value || "All";

  showToast("⏳ Loading state-wise data…", "success");

  try {
    const res = await fetch(`/api/potential?level=state&country=${encodeURIComponent(targetCountry)}&state=${encodeURIComponent(state)}`);
    const data = await res.json();

    if (!res.ok || data.error) {
      showToast(`⚠️ ${data.error || "Could not load state data."}`, "warn");
      return;
    }

    const states = data.states || [];
    if (!states.length) {
      showToast("⚠️ No state data available.", "warn");
      return;
    }

    // Show all states in the chart
    const top = states;

    currentChartDataConfig = {
      labels: top.map(s => s.state.length > 14 ? s.state.slice(0, 13) + "…" : s.state),
      fullNames: top.map(s => s.state),
      existing: top.map(s => s.actual),
      gaps: top.map(s => s.gap),
      fillRates: top.map(s => s.fill_pct)
    };

    drawUniversalChart();

    _cachedIndiaSource = data.data_source || data.source || "";
    _cachedIndiaStates = states;

    // ── Re-render table with state data ─────────────────────────────────
    _renderStateTable(states, targetCountry, _cachedIndiaSource);

    document.querySelector(".chart-legend").style.display = "";
    _updateChartHint("state");
    showToast(`✅ ${states.length} states loaded for ${targetCountry}`, "success");

  } catch (err) {
    console.error("[_loadStatePotential]", err);
    showToast("❌ Failed to load state data.", "error");
  }
}

/**
 * Render the domain table area with state-wise data rows.
 * @param {Object[]} states - Array of state objects from /api/potential
 * @param {string}   country
 * @param {string}   source - Data source label
 */
function _renderStateTable(states, country, source) {
  const tbody = document.getElementById("domain-tbody");
  tbody.innerHTML = "";

  // Update table header
  const thead = document.querySelector(".domain-table thead tr");
  if (thead) {
    thead.innerHTML = `
      <th>State / UT</th>
      <th>Actual Startups</th>
      <th>Potential</th>
      <th>Gap</th>
      <th>Fill Rate</th>
    `;
  }

  states.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${s.state}</strong></td>
      <td style="color:var(--teal)">${s.actual.toLocaleString()}</td>
      <td>
        ${s.potential.toLocaleString()}
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${s.fill_pct}%"></div>
        </div>
      </td>
      <td style="color:var(--rust)">${s.gap.toLocaleString()}</td>
      <td style="font-weight:700;color:${s.fill_pct > 70 ? 'var(--teal)' : s.fill_pct > 40 ? 'var(--gold)' : 'var(--rust)'}">
        ${s.fill_pct}%
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Add source badge at the bottom
  if (source) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td colspan="5" style="text-align:center;padding:10px;font-size:.7rem;color:var(--text3);border-top:1px solid var(--card-border)">
        📊 Data Source: ${source}
      </td>
    `;
    tbody.appendChild(tr);
  }
}

/** Render district-wise startup data table (India). */
function _renderDistrictTable(districts, source, state) {
  const tbody = document.getElementById("domain-tbody");
  tbody.innerHTML = "";

  const thead = document.querySelector(".domain-table thead tr");
  if (thead) {
    thead.innerHTML = `
      <th>District — ${state}</th>
      <th>Actual Startups</th>
      <th>Potential</th>
      <th>Gap</th>
      <th>Fill Rate</th>
    `;
  }

  districts.forEach(d => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${d.district}</strong></td>
      <td style="color:var(--teal)">${d.actual.toLocaleString()}</td>
      <td>
        ${d.potential.toLocaleString()}
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${d.fill_pct}%"></div>
        </div>
      </td>
      <td style="color:var(--rust)">${d.gap.toLocaleString()}</td>
      <td style="font-weight:700;color:${d.fill_pct > 70 ? 'var(--teal)' : d.fill_pct > 40 ? 'var(--gold)' : 'var(--rust)'}">
        ${d.fill_pct}%
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (source) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td colspan="5" style="text-align:center;padding:10px;font-size:.7rem;color:var(--text3);border-top:1px solid var(--card-border)">
        📊 Data Source: ${source}
      </td>
    `;
    tbody.appendChild(tr);
  }
}

/** Update the chart hint text based on active tab. */
function _updateChartHint(tab) {
  const hint = document.querySelector(".chart-hint");
  if (!hint) return;

  const country = document.getElementById("filter-country")?.value || "India";
  const source = _cachedIndiaSource || "DPIIT 2024";

  let locTerm = "states";
  if (country === "United Kingdom") locTerm = "nations/regions";
  else if (country === "United Arab Emirates") locTerm = "emirates";
  else if (country === "Oman") locTerm = "governorates";
  else if (country === "Qatar") locTerm = "governorates";
  else if (country === "Saudi Arabia") locTerm = "regions";

  if (tab === "state") {
    hint.innerHTML = `📊 Top 15 ${locTerm} &nbsp;|&nbsp; <strong style="color:var(--teal)">Teal</strong> = actual &nbsp;|&nbsp; <strong style="color:var(--rust)">Red</strong> = potential gap &nbsp;|&nbsp; Source: ${source}`;
  } else if (tab === "industry") {
    hint.innerHTML = `🏭 ${country} industry breakdown &nbsp;|&nbsp; <strong style="color:var(--teal)">Teal</strong> = existing startups &nbsp;|&nbsp; <strong style="color:var(--rust)">Red</strong> = untapped potential &nbsp;|&nbsp; Source: ${source}`;
  } else {
    hint.innerHTML = `Click <strong style="color:#34c4a4;">green</strong> to see startups &nbsp;|&nbsp; <strong style="color:#e05c45;">red</strong> to see gaps &nbsp;|&nbsp; Click <strong>+</strong> on table rows to explore sub-domains`;
  }
}




// ── 10. Sub-domain modal ──────────────────────────────────────────────────────

/**
 * Open the sub-domain modal for a given domain, populating it with the
 * domain's sub-sector list and their potential percentages.
 *
 * @param {Object} domain - Domain object with a `name` and `subs` array.
 */
function openSubModal(domain) {
  document.getElementById("sub-modal-title").textContent = domain.name;

  const body = document.getElementById("sub-modal-body");
  body.innerHTML = "";

  domain.subs.forEach((sub, i) => {
    const pct = SUB_PCTS[i % SUB_PCTS.length];
    const item = document.createElement("div");
    item.className = "subdomain-item";

    // Restore selected state if this sub is already active
    const isActive = activeSubDomain &&
      activeSubDomain.domain === domain.name &&
      activeSubDomain.sub === sub;
    if (isActive) item.classList.add("sdi-selected");

    item.innerHTML = `
      <div class="subdomain-left">
        <div class="subdomain-icon">${sub.slice(0, 2).toUpperCase()}</div>
        <span class="subdomain-name">${sub}</span>
      </div>
      <div class="subdomain-right">
        <div class="subdomain-right-label">Total Potential</div>
        <div class="subdomain-right-value">${pct}%</div>
      </div>
    `;

    // Click → select this sub-domain and apply the parent domain filter
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      selectSubDomain(domain, sub);
    });

    body.appendChild(item);
  });

  document.getElementById("sub-modal-overlay").classList.remove("hidden");
}

/**
 * Called when the user clicks a sub-domain item in the modal.
 * Sets the domain filter to the parent domain, applies it, shows a badge.
 *
 * @param {Object} domain - The parent domain object (has .name, .subs).
 * @param {string} sub    - The selected sub-domain string.
 */
function selectSubDomain(domain, sub) {
  // If user clicks the already-active sub, treat it as a deselect
  if (activeSubDomain && activeSubDomain.domain === domain.name && activeSubDomain.sub === sub) {
    clearSubDomain();
    return;
  }

  activeSubDomain = { domain: domain.name, sub };

  // Sync the hidden <select> and the custom dropdown display text
  const hiddenSel = document.getElementById("filter-domain");
  const textEl = document.getElementById("cdd-selected-text");
  if (hiddenSel) hiddenSel.value = domain.name;
  if (textEl) textEl.textContent = domain.name;

  // Update cdd-item active class
  document.querySelectorAll(".cdd-item").forEach(itm => {
    itm.classList.toggle("cdd-active", itm.dataset.val === domain.name);
  });

  // Close modal
  closeSubModal();

  // Show the active badge below the filters
  _showActiveSubBadge(domain.name, sub);

  // Apply the domain filter
  applyFilters();
}

/**
 * Clear the active sub-domain, reset the domain filter to "All", re-apply.
 * Called by the badge × button.
 */
function clearSubDomain() {
  activeSubDomain = null;
  _clearActiveSubBadge();

  const hiddenSel = document.getElementById("filter-domain");
  const textEl = document.getElementById("cdd-selected-text");
  if (hiddenSel) hiddenSel.value = "All";
  if (textEl) textEl.textContent = "All";

  document.querySelectorAll(".cdd-item").forEach(itm => {
    itm.classList.toggle("cdd-active", itm.dataset.val === "All");
  });

  applyFilters();
}

/** @private Show the subdomain badge chip below the filter bar. */
function _showActiveSubBadge(domain, sub) {
  const wrap = document.getElementById("active-sub-wrap");
  const text = document.getElementById("active-sub-text");
  if (!wrap || !text) return;
  text.textContent = `${domain}  ›  ${sub}`;
  wrap.style.display = "flex";
}

/** @private Hide and reset the subdomain badge chip. */
function _clearActiveSubBadge() {
  const wrap = document.getElementById("active-sub-wrap");
  if (wrap) wrap.style.display = "none";
}

/** Close the sub-domain modal. */
function closeSubModal() {
  document.getElementById("sub-modal-overlay").classList.add("hidden");
}


// ── 11. Strategic Briefing modal ──────────────────────────────────────────────

/**
 * Open the Strategic Briefing modal for a given startup, generating an
 * inline market analysis using the startup's domain data.
 *
 * @param {Object} startup - Startup object from the STARTUPS dataset.
 */
function openBriefingModal(startup) {
  // Find the matching domain entry for market numbers
  const domainData = allDomains.find(d => d.name === startup.domain);
  const gap = domainData
    ? (domainData.total - domainData.current).toLocaleString()
    : "N/A";

  // Subtitle
  document.getElementById("briefing-subtitle").textContent =
    `${startup.name} · ${startup.domain}`;

  // Build briefing content
  document.getElementById("briefing-body").innerHTML = `
    <div style="padding:0 26px;display:flex;flex-direction:column;gap:18px;">

      <div class="briefing-row">
        <div class="briefing-icon" style="background:rgba(124,77,255,.18);color:var(--accent2);">📈</div>
        <div>
          <p class="briefing-content-title">Company Overview</p>
          <p>
            <strong style="color:var(--white)">${startup.name}</strong>
            is a <strong style="color:var(--text)">${startup.focus}</strong> company
            based in <strong style="color:var(--accent2)">${startup.country}</strong>,
            operating in the <strong style="color:var(--text)">${startup.domain}</strong> domain
            across <strong style="color:var(--green)">${startup.domains_count}</strong> of 19 sectors.
          </p>
        </div>
      </div>

      <div class="briefing-row">
        <div class="briefing-icon" style="background:rgba(34,212,122,.15);color:var(--green);">🎯</div>
        <div>
          <p class="briefing-content-title">Market Opportunity</p>
          <p>
            The ${startup.domain} domain has
            <strong style="color:var(--text)">${domainData ? domainData.total.toLocaleString() : "N/A"}</strong>
            total opportunities globally. Currently
            <strong style="color:var(--green)">${domainData ? domainData.current.toLocaleString() : "N/A"}</strong>
            captured — a gap of
            <strong style="color:var(--red)">${gap}</strong> opportunities.
          </p>
        </div>
      </div>

      <div class="briefing-row">
        <div class="briefing-icon" style="background:rgba(245,195,58,.15);color:var(--gold);">💡</div>
        <div>
          <p class="briefing-content-title">Recommendation</p>
          <p>
            Engage <strong style="color:var(--white)">${startup.name}</strong>
            for co-investment or incubation partnerships.
            Strong untapped potential with favourable macro tailwinds.
          </p>
        </div>
      </div>

      <div>
        <p class="briefing-content-title" style="margin-bottom:8px;">Strategic Tags</p>
        <div class="tag-wrap">
          ${["High Growth", "Funding Ready", "Market Gap", startup.domain, startup.country, "Cross-Sector"]
      .map(tag => `<span class="tag">${tag}</span>`)
      .join("")}
        </div>
      </div>

    </div>
  `;

  document.getElementById("briefing-modal-overlay").classList.remove("hidden");
}

/** Close the Strategic Briefing modal. */
function closeBriefingModal() {
  document.getElementById("briefing-modal-overlay").classList.add("hidden");
}


// ── Searchable Select (Combobox) ────────────────────────────────────────────────────

/**
 * Wraps a hidden <select> with a searchable combobox.
 * - Type to filter options instantly
 * - "Starts-with" matches ranked above "contains" matches
 * - Matching text is highlighted in blue
 * - Works with dynamically updated option lists (call .refresh())
 * - Syncs selections back to the original <select> and fires 'change'
 */
class SearchableSelect {
  constructor(select, placeholder = 'Search…') {
    this.select = select;
    this.placeholder = placeholder;
    this._opts = [];   // [{value, label}]
    this._open = false;
    this._wrap = this._inp = this._list = null;
    this._build();
    this.select.style.display = 'none';   // hide original <select>
    this._readOpts();
    this._renderList(this._opts);
    // Set input text from pre-selected option
    const cur = this.select.options[this.select.selectedIndex];
    if (cur && cur.value !== 'All') this._inp.value = cur.textContent.trim();
    this._bindOutside();
  }

  // ── Build DOM ────────────────────────────────────────────────────────────
  _build() {
    const wrap = document.createElement('div');
    wrap.className = 'ss-wrap';
    wrap.innerHTML = `
      <div class="ss-row">
        <svg class="ss-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input class="ss-inp" type="text" autocomplete="off" spellcheck="false"
               placeholder="${this.placeholder}" />
        <span class="ss-caret">
          <svg viewBox="0 0 11 7"><path d="M1 1l4.5 4.5L10 1" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>
        </span>
      </div>
      <div class="ss-list"></div>
    `;
    this.select.insertAdjacentElement('afterend', wrap);
    this._wrap = wrap;
    this._inp = wrap.querySelector('.ss-inp');
    this._list = wrap.querySelector('.ss-list');

    // Click on row (not input) → toggle
    wrap.querySelector('.ss-row').addEventListener('click', (e) => {
      if (this.select.disabled) return;
      if (e.target === this._inp) return;
      this._open ? this._close() : this._inp.focus();
    });
    // Type → filter
    this._inp.addEventListener('focus', () => { if (!this.select.disabled) this._open_(); });
    this._inp.addEventListener('input', () => this._filter(this._inp.value));
    this._inp.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { this._close(); this._inp.blur(); }
      if (e.key === 'Enter') {
        const first = this._list.querySelector('.ss-opt:not(.ss-empty)');
        if (first) first.click();
      }
    });
  }

  // ── Data ──────────────────────────────────────────────────────────────────
  _readOpts() {
    this._opts = Array.from(this.select.options).map(o => ({
      value: o.value,
      label: o.textContent.trim(),
    }));
  }

  _filter(q) {
    if (!this._open) this._open_();
    const lq = q.trim().toLowerCase();
    if (!lq) { this._renderList(this._opts); return; }
    
    const matchesOpt = (opt) => {
      const label = opt.label.toLowerCase().trim();
      if (label.startsWith(lq) || label.includes(lq)) return true;
      if (lq.startsWith(label) || lq.includes(label)) return true;
      
      const isUK_opt = label === "uk" || label.includes("united kingdom");
      const isUK_query = lq === "uk" || lq.includes("united kingdom");
      if (isUK_opt && isUK_query) return true;

      const isUS_opt = label === "usa" || label === "us" || label.includes("united states");
      const isUS_query = lq === "usa" || lq === "us" || lq.includes("united states");
      if (isUS_opt && isUS_query) return true;

      const isUAE_opt = label === "uae" || label.includes("united arab emirates");
      const isUAE_query = lq === "uae" || lq.includes("united arab emirates");
      if (isUAE_opt && isUAE_query) return true;

      return false;
    };

    const results = this._opts.filter(o => o.value !== 'All' && matchesOpt(o));
    // Sort results: startsWith first to keep it nice and ranked
    results.sort((a, b) => {
      const aStarts = a.label.toLowerCase().startsWith(lq) ? 1 : 0;
      const bStarts = b.label.toLowerCase().startsWith(lq) ? 1 : 0;
      return bStarts - aStarts;
    });

    this._renderList(results, lq);
  }

  _renderList(opts, hl = '') {
    this._list.innerHTML = '';
    if (!opts.length) {
      this._list.innerHTML = '<div class="ss-opt ss-empty">No results</div>';
      return;
    }
    opts.forEach(opt => {
      const d = document.createElement('div');
      d.className = 'ss-opt';
      if (opt.value === this.select.value) d.classList.add('ss-cur');
      if (opt.value === 'All') d.classList.add('ss-all');
      if (hl && opt.value !== 'All') {
        const lo = opt.label.toLowerCase();
        const idx = lo.indexOf(hl);
        d.innerHTML = idx >= 0
          ? this._e(opt.label.slice(0, idx)) +
          `<b>${this._e(opt.label.slice(idx, idx + hl.length))}</b>` +
          this._e(opt.label.slice(idx + hl.length))
          : this._e(opt.label);
      } else {
        d.textContent = opt.label;
      }
      d.addEventListener('click', (e) => { e.stopPropagation(); this._pick(opt); });
      this._list.appendChild(d);
    });
  }

  _e(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  _pick(opt) {
    this.select.value = opt.value;
    this._inp.value = opt.value === 'All' ? '' : opt.label;
    this._renderList(this._opts);
    this._close();
    this.select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // ── Open / Close ──────────────────────────────────────────────────────────
  _open_() {
    if (this.select.disabled) return;
    this._open = true;
    this._wrap.classList.add('ss-open');
    this._filter(this._inp.value);
  }

  _close() {
    this._open = false;
    this._wrap.classList.remove('ss-open');
  }

  _bindOutside() {
    document.addEventListener('click', (e) => {
      if (!this._wrap.contains(e.target)) this._close();
    });
  }

  // ── Public API ───────────────────────────────────────────────────────
  /** Re-read options from the underlying <select> (call after populateSelect). */
  refresh() {
    this._readOpts();
    const cur = this.select.options[this.select.selectedIndex];
    if (cur && cur.value !== 'All') {
      this._inp.value = cur.textContent.trim();
    } else {
      this._inp.value = '';
      this._inp.placeholder = this.placeholder;
    }
    if (this._open) this._filter(this._inp.value);
    else this._renderList(this._opts);
  }

  /** Enable or disable the combobox; optionally update placeholder text. */
  setDisabled(disabled, label) {
    this.select.disabled = disabled;
    this._wrap.classList.toggle('ss-disabled', disabled);
    if (label) {
      this._inp.placeholder = disabled ? label : this.placeholder;
      this._inp.value = '';
    }
    if (disabled) this._close();
  }
}


// ── SearchableSelect helpers ───────────────────────────────────────────────────

/** Initialise searchable comboboxes for the three geo filter selects. */
function _initSearchableSelects() {
  if (_ssCo && _ssSt && _ssDi) {
    _ssCo.refresh();
    
    // Reset state and district selects to original initial state
    const stateSel = document.getElementById('filter-state');
    const distSel = document.getElementById('filter-district');
    
    if (stateSel) {
      stateSel.innerHTML = '<option value="All">— Select Country First —</option>';
      stateSel.disabled = true;
    }
    _ssSt.refresh();
    _ssSt.setDisabled(true, '— Select Country First —');
    
    if (distSel) {
      distSel.innerHTML = '<option value="All">— Select State First —</option>';
      distSel.disabled = true;
    }
    _ssDi.refresh();
    _ssDi.setDisabled(true, '— Select State First —');
    return;
  }

  _ssCo = new SearchableSelect(
    document.getElementById('filter-country'), 'Search country…');
  _ssSt = new SearchableSelect(
    document.getElementById('filter-state'), 'Search state…');
  _ssDi = new SearchableSelect(
    document.getElementById('filter-district'), 'Search district…');

  // State and district start disabled
  _ssSt.setDisabled(true, '— Select Country First —');
  _ssDi.setDisabled(true, '— Select State First —');
}

/** Return the SearchableSelect instance for a given <select> element, or null. */
function _getSSFor(sel) {
  if (!sel) return null;
  if (sel.id === 'filter-country') return _ssCo;
  if (sel.id === 'filter-state') return _ssSt;
  if (sel.id === 'filter-district') return _ssDi;
  return null;
}


/* ═══════════════════════════════════════════════════════════════════════════
   POTENTIAL FINDER  (formerly Problem Statement Generator)
   Phase 1 → filter form  (img1 interface)
   Phase 2 → AI-style problem cards  (img2 interface)
═══════════════════════════════════════════════════════════════════════════ */

// --- Standalone constants for Potential Finder fallbacks ---
const _PF_DOMAINS = {
  'Agriculture & Food': [
    'Agronomy (Crop Science)', 'Horticulture (Fruits, Vegetables)', 
    'Floriculture (Flower Farming)', 'Animal Husbandry (Livestock)', 
    'Aquaculture (Fish Farming)', 'Sericulture (Silk Farming)', 
    'Forestry & Agroforestry', 'Soil Science & Agricultural Chemistry', 
    'Food Processing & Technology', 'Agricultural Economics & Agribusiness'
  ],
  'Technology & Innovation': [
    'Computer Science & Software Engineering', 'Artificial Intelligence & Machine Learning', 
    'Data Science & Analytics', 'Cybersecurity & Information Security', 
    'Network Engineering & Communications', 'Semiconductor & Electronics Engineering', 
    'Robotics & Automation', 'Cloud Computing & Infrastructure', 
    'Biotechnology', 'Nanotechnology'
  ],
  'Finance': [
    'Retail & Commercial Banking', 'Investment Banking', 
    'Asset & Wealth Management', 'Insurance (Life, General, Reinsurance)', 
    'Accounting & Auditing', 'Capital Markets (Stocks, Bonds)', 
    'Corporate Finance', 'Financial Planning & Analysis (FP&A)', 
    'Risk Management & Compliance', 'Financial Technology (FinTech)'
  ],
  'Healthcare & Life Sciences': [
    'Pharmaceuticals', 'Biotechnology', 'Medical Devices', 
    'Clinical Care (Hospitals, Clinics)', 'Diagnostics & Laboratories', 
    'Medical Research & Clinical Trials', 'Public Health', 
    'Genomics & Personalized Medicine', 'Healthcare Administration & Management', 
    'Mental & Behavioral Health'
  ],
  'Education': [
    'Early Childhood Education (Pre-K)', 'K-12 Education (Primary & Secondary)', 
    'Higher Education (Colleges, Universities)', 'Vocational & Technical Training', 
    'Adult Education & Lifelong Learning', 'Special Education', 
    'Curriculum & Instruction Development', 'Educational Administration & Policy', 
    'Educational Psychology', 'Educational Technology (EdTech)'
  ],
  'Energy & Environment': [
    'Oil & Gas (Exploration & Production)', 'Renewable Energy (Solar, Wind, Hydro)', 
    'Nuclear Energy', 'Power Generation & Utilities', 
    'Energy Trading & Marketing', 'Energy Efficiency & Conservation', 
    'Environmental Science', 'Waste Management & Recycling', 
    'Water Resource Management', 'Environmental Policy & Regulation'
  ],
  'Logistics & Mobility': [
    'Supply Chain Management (SCM)', 'Freight & Road Haulage', 
    'Maritime Shipping & Ports', 'Aviation Logistics & Air Cargo', 
    'Rail Transport', 'Warehousing & Inventory Management', 
    'Urban Mobility (Public Transit, Ride-Hailing)', 'Last-Mile Delivery', 
    'Customs & Freight Forwarding', 'Automotive & Vehicle Manufacturing'
  ],
  'Retail & E-Commerce': [
    'Grocery & Supermarkets', 'Fashion & Apparel', 
    'Consumer Electronics', 'Home Goods & Furniture', 
    'Health & Beauty', 'E-Commerce Platforms & Marketplaces', 
    'Brick-and-Mortar Store Operations', 'Merchandising & Category Management', 
    'Direct-to-Consumer (D2C)', 'Quick Commerce (Q-Commerce)'
  ],
  'Real Estate & Construction': [
    'Residential Real Estate', 'Commercial Real Estate', 
    'Industrial Real Estate', 'Property Management', 
    'Architecture & Design', 'Civil Engineering', 
    'General Contracting & Construction Management', 'Urban Planning', 
    'Real Estate Finance & Investment', 'Building Materials & Supply'
  ],
  'Media & Entertainment': [
    'Film & Television Production', 'Broadcasting (TV & Radio)', 
    'Publishing (Books, Magazines, Newspapers)', 'Music Industry', 
    'Gaming & Interactive Entertainment', 'Social Media', 
    'Advertising & Public Relations', 'Animation & Visual Effects (VFX)', 
    'Podcasting & Digital Audio', 'Live Events & Performing Arts'
  ],
  'Travel & Hospitality': [
    'Airlines & Aviation', 'Hotels & Lodging', 
    'Food & Beverage Services (Restaurants, Catering)', 'Tour Operators & Travel Agencies', 
    'Cruise Lines', 'Online Travel Agencies (OTAs)', 
    'Corporate Travel Management', 'Events & MICE (Meetings, Incentives, Conferences, Exhibitions)', 
    'Tourism Boards & Destination Marketing', 'Ground Transportation (Rental Cars, Coaches)'
  ],
  'Manufacturing & Industry': [
    'Automotive Manufacturing', 'Aerospace Manufacturing', 
    'Chemical Manufacturing', 'Electronics & Semiconductor Manufacturing', 
    'Pharmaceutical Manufacturing', 'Textile & Garment Manufacturing', 
    'Heavy Machinery & Industrial Equipment', 'Steel & Metals Production', 
    'FMCG (Fast-Moving Consumer Goods) Manufacturing', 'Industrial Design & Prototyping'
  ],
  'Human Resources & Workforce': [
    'Talent Acquisition & Recruitment', 'Compensation & Benefits', 
    'Training & Development', 'Employee Relations & Labor Law', 
    'Organizational Development', 'HR Operations & Information Systems (HRIS)', 
    'Performance Management', 'Diversity, Equity & Inclusion (DEI)', 
    'Workforce Planning & Analytics', 'Occupational Health & Safety'
  ],
  'Legal & Governance': [
    'Corporate & Commercial Law', 'Litigation & Dispute Resolution', 
    'Intellectual Property (IP) Law', 'Criminal Law', 
    'Family Law', 'Public Policy & Administration', 
    'Government Affairs & Lobbying', 'Regulatory Compliance', 
    'Tax Law', 'International Law & Diplomacy'
  ],
  'Space & Aerospace': [
    'Aeronautics (Aircraft Design)', 'Astronautics (Spacecraft & Launch Systems)', 
    'Satellite Communications', 'Earth Observation & Remote Sensing', 
    'Space Exploration & Astronomy', 'Avionics & Control Systems', 
    'Aerospace Manufacturing & Maintenance', 'Space Policy & Law', 
    'Propulsion Systems', 'Ground Operations & Mission Control'
  ],
  'Defense & Security': [
    'Military Operations (Army, Navy, Air Force)', 'Homeland Security', 
    'Intelligence & Counter-Intelligence', 'Cyberdefense', 
    'Defense Contracting & Procurement', 'Ordnance & Armaments', 
    'Military Logistics & Support', 'Border Control & Immigration', 
    'Physical Security & Private Security Services', 'Counter-Terrorism'
  ],
  'Fashion & Lifestyle': [
    'Apparel & Garment Design', 'Textile Science & Production', 
    'Fashion Merchandising & Buying', 'Fashion Marketing & Branding', 
    'Luxury Goods', 'Cosmetics & Beauty Products', 
    'Fragrances', 'Jewelry & Accessories', 
    'Footwear', 'Wellness & Fitness (Spas, Gyms)'
  ],
  'Social Impact & Development': [
    'Non-Profit & NGO Management', 'International Development', 
    'Humanitarian Aid & Disaster Relief', 'Poverty Alleviation & Economic Empowerment', 
    'Human Rights Advocacy', 'Community Development', 
    'Microfinance', 'Corporate Social Responsibility (CSR)', 
    'Impact Investing', 'Philanthropy & Grantmaking'
  ],
  'Climate & Sustainability': [
    'Climate Science & Modeling', 'Environmental Policy & Law', 
    'Conservation Biology', 'Sustainable Business Practices (ESG)', 
    'Circular Economy', 'Carbon Management & Offsetting', 
    'Sustainable Urban Planning', 'Biodiversity & Ecosystem Management', 
    'Green Finance & Investment', 'Sustainability Reporting & Auditing'
  ]
};

const _PF_LOCATIONS = {
  'India': {
    'Maharashtra': {
      districts: ['Mumbai','Pune','Nashik','Nagpur','Aurangabad','Thane'],
      regions: ['Urban','Semi-Urban','Rural']
    },
    'Karnataka': {
      districts: ['Bengaluru','Mysuru','Hubli','Mangaluru'],
      regions: ['Urban','Semi-Urban','Rural']
    }
  },
  'United States': {
    'California': {
      districts: ['Los Angeles','San Francisco','San Diego','San Jose'],
      regions: ['Urban','Suburban','Rural']
    }
  }
};

// --- Clicks and Limits Helper Functions ---
let _pfCountdownInterval = null;

function _pfGetLimitState() {
  const parentWin = window.parent;
  if (!parentWin || !parentWin.__POTENTIAL_USER_STATE) {
    return { plan: 'free', clicksUsed: 0, limit: 1, remaining: 1, daysRemaining: 26, isTrialExpired: false };
  }
  const state = parentWin.__POTENTIAL_USER_STATE;
  const plan = state.plan || 'free';
  const clicksToday = state.clicksToday || 0;
  const lastClickDate = state.lastClickDate || '';
  const daysRemaining = state.daysRemaining !== undefined ? state.daysRemaining : 26;
  const isTrialExpired = !!state.isTrialExpired;

  const todayStr = new Date().toLocaleDateString('en-CA');
  const isToday = (lastClickDate === todayStr);

  let limit = 1;
  if (plan === 'pro') {
    limit = 5;
  } else if (plan === 'admin') {
    limit = Infinity;
  }

  const clicksUsed = isToday ? clicksToday : 0;
  const remaining = plan === 'admin' ? Infinity : Math.max(0, limit - clicksUsed);

  return { plan, clicksUsed, limit, remaining, daysRemaining, isTrialExpired };
}

function _pfStartMidnightCountdown(elementId) {
  if (_pfCountdownInterval) clearInterval(_pfCountdownInterval);

  function update() {
    const el = document.getElementById(elementId);
    if (!el) {
      clearInterval(_pfCountdownInterval);
      return;
    }
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const diffMs = tomorrow.getTime() - now.getTime();

    if (diffMs <= 0) {
      el.textContent = "00:00:00";
      clearInterval(_pfCountdownInterval);
      setTimeout(() => {
        openPotentialFinder();
      }, 1000);
      return;
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

    const pad = (num) => String(num).padStart(2, '0');
    el.textContent = `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  }

  update();
  _pfCountdownInterval = setInterval(update, 1000);
}

/** Open the Potential Finder modal and directly generate problems. */
function openPotentialFinder() {
  const overlay = document.getElementById('pf-overlay');
  if (!overlay) return;

  overlay.classList.remove('hidden');

  const limitState = _pfGetLimitState();

  // 1. Check if trial is expired
  if (limitState.isTrialExpired) {
    const body = document.getElementById('pf-body');
    if (body) {
      body.innerHTML = `
        <div style="text-align:center;padding:40px 20px;">
          <div style="font-size:3rem;margin-bottom:16px;">🔒</div>
          <h2 style="font-family:'Space Grotesk',sans-serif;color:#e05c45;font-size:1.4rem;margin-bottom:12px;">Trial Plan Expired</h2>
          <p style="color:#aaa;font-size:0.88rem;max-width:360px;margin:0 auto 24px;line-height:1.6;">
            Your 26-day free trial has ended. Upgrade to Pro to unlock unlimited potential matching and advanced features.
          </p>
          <button class="pf-gen-btn" onclick="window.parent.postMessage({ type: 'navigate', url: '/pricing' }, '*')" style="max-width:240px;margin:0 auto;background:linear-gradient(135deg,#e53e3e 0%,#b83280 100%);border:none;box-shadow:0 4px 15px rgba(229,62,62,0.4);">
            Upgrade to Pro
          </button>
        </div>
      `;
    }
    return;
  }

  // 2. Check if daily searches are exhausted
  if (limitState.remaining <= 0) {
    const body = document.getElementById('pf-body');
    if (body) {
      const isFree = limitState.plan === 'free';
      body.innerHTML = `
        <div style="text-align:center;padding:40px 20px;">
          <div style="font-size:3rem;margin-bottom:16px;">⏳</div>
          <h2 style="font-family:'Space Grotesk',sans-serif;color:#fff;font-size:1.4rem;margin-bottom:12px;">Daily Limit Reached</h2>
          <p style="color:#aaa;font-size:0.88rem;max-width:400px;margin:0 auto 20px;line-height:1.6;">
            You have used your ${isFree ? '1 daily search' : '5 daily searches'} limit for today.
          </p>
          
          <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;max-width:280px;margin:0 auto 24px;">
            <div style="font-size:0.75rem;color:#777;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Next Reset In</div>
            <div id="pf-reset-timer" style="font-family:'Space Grotesk',sans-serif;font-size:1.8rem;font-weight:700;color:#f5a623;">00:00:00</div>
          </div>

          ${isFree ? `
            <button class="pf-gen-btn" onclick="window.parent.postMessage({ type: 'navigate', url: '/pricing' }, '*')" style="max-width:240px;margin:0 auto;background:linear-gradient(135deg,#319795 0%,#3182ce 100%);border:none;box-shadow:0 4px 15px rgba(49,151,149,0.4);">
              Upgrade to Pro (5 searches/day)
            </button>
          ` : `
            <button class="pf-gen-btn" onclick="closePotentialFinder()" style="max-width:200px;margin:0 auto;background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2);">
              Close
            </button>
          `}
        </div>
      `;
      _pfStartMidnightCountdown('pf-reset-timer');
    }
    return;
  }

  // Read current dashboard search filters
  const rawCountry  = document.getElementById('filter-country')?.value  || '';
  const rawState    = document.getElementById('filter-state')?.value    || '';
  const rawDistrict = document.getElementById('filter-district')?.value || '';
  const rawDomain   = document.getElementById('filter-domain')?.value   || '';

  // Smart defaults and fallbacks so the user always sees a beautiful, working output
  let country = rawCountry;
  if (!country || country === 'All') {
    country = 'India';
  }

  let state = rawState;
  if (!state || state === 'All' || state.includes('Select Country') || state.includes('Loading') || state.includes('Search state')) {
    state = 'All';
  }

  let district = rawDistrict;
  if (!district || district === 'All' || district.includes('Select State') || district.includes('Loading') || district.includes('Search district')) {
    district = 'All';
  }

  let domain = rawDomain;
  if (!domain || domain === 'All') {
    domain = activeSubDomain ? activeSubDomain.domain : 'Technology & Innovation';
  }

  let subDomain = activeSubDomain ? activeSubDomain.sub : '';
  if (!subDomain && _PF_DOMAINS[domain]) {
    subDomain = _PF_DOMAINS[domain][0];
  }

  let region = 'Urban';
  if (country && state && state !== 'All' && _PF_LOCATIONS[country]?.[state]) {
    const loc = _PF_LOCATIONS[country][state];
    if (loc.regions && loc.regions.length > 0) {
      region = loc.regions[0];
    }
  }

  const ctx = { country, state, district, region, domain, subDomain };
  _pfGenerateProblemsDirectly(ctx);
}

const _PF_LOADING_MSGS = [
  'Analyzing geographic context…',
  'Researching local challenges…',
  'Identifying domain-specific problems…',
  'Evaluating startup opportunities…',
  'Structuring problem statements…',
];

/** Directly fetch problems from backend without a Phase 1 form. */
async function _pfGenerateProblemsDirectly(ctx) {
  const body = document.getElementById('pf-body');
  if (!body) return;

  const limitState = _pfGetLimitState();
  const searchesRemainingText = limitState.plan === 'admin' 
    ? 'Unlimited admin searches remaining' 
    : `${limitState.remaining} search${limitState.remaining === 1 ? '' : 'es'} remaining today`;

  let msgIdx = 0;
  body.innerHTML = `
    <div class="pf-loading">
      <div class="pf-spinner"></div>
      <div id="pf-loading-msg" class="pf-loading-msg" style="margin-bottom:8px;">${_PF_LOADING_MSGS[0]}</div>
      <div style="font-size:0.75rem;color:#777;font-weight:500;">${searchesRemainingText}</div>
    </div>`;

  _pfIsGenerating = true;
  const closeBtn = document.querySelector('#pf-overlay .btn-close');
  if (closeBtn) closeBtn.style.display = 'none';

  const interval = setInterval(() => {
    msgIdx = (msgIdx + 1) % _PF_LOADING_MSGS.length;
    const el = document.getElementById('pf-loading-msg');
    if (el) el.textContent = _PF_LOADING_MSGS[msgIdx];
  }, 2000);

  try {
    const parentWin = window.parent;
    const userPlan = (parentWin && parentWin.__POTENTIAL_USER_STATE && parentWin.__POTENTIAL_USER_STATE.plan) || 'free';
    const res = await fetch('/api/generate-problems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        country: ctx.country, 
        state: ctx.state, 
        district: ctx.district, 
        region: ctx.region, 
        domain: ctx.domain, 
        subDomain: ctx.subDomain,
        plan: userPlan
      }),
    });
    const data = await res.json();
    clearInterval(interval);
    if (!res.ok) throw new Error(data.error || 'Generation failed');

    // ONLY increment clicks count on successful search!
    if (window.parent && window.parent.__RECORD_POTENTIAL_SEARCH_SUCCESS && limitState.plan !== 'admin') {
      await window.parent.__RECORD_POTENTIAL_SEARCH_SUCCESS();
      // Re-render the sidebar card to show updated remaining search count
      if (typeof renderStartupCard === 'function') {
        renderStartupCard(_pfActiveStartup);
      }
    }

    _pfRenderPhase2(data.problems, ctx);
  } catch (e) {
    _pfIsGenerating = false;
    const closeBtn = document.querySelector('#pf-overlay .btn-close');
    if (closeBtn) closeBtn.style.display = 'block';

    clearInterval(interval);
    body.innerHTML = `
      <div style="text-align:center;padding:40px">
        <div style="color:#e05c45;font-size:1rem;margin-bottom:16px">❌ ${e.message}</div>
        <button class="pf-gen-btn" onclick="openPotentialFinder()" style="max-width: 200px; margin: 0 auto;">← Try Again</button>
      </div>`;
  }
}

function _pfRenderPhase2(problems, ctx) {
  _pfIsGenerating = false;
  const closeBtn = document.querySelector('#pf-overlay .btn-close');
  if (closeBtn) closeBtn.style.display = 'block';

  _pfCurrentProblems = problems;
  _pfCurrentCtx = ctx;

  const body = document.getElementById('pf-body');
  if (!body) return;

  const sevColor = { High: '#e05c45', Medium: '#f5a623', Low: '#34c4a4' };
  
  const locParts = [ctx.district, ctx.state, ctx.country].filter(p => p && p.trim() && p.toLowerCase() !== 'all');
  const locStr = locParts.join(', ') || ctx.country;

  // Determine if current user is free (no pro-only badge)
  const _currentUserPlan = _pfGetLimitState().plan;
  const _isFreeUser = (_currentUserPlan !== 'pro' && _currentUserPlan !== 'admin');

  body.innerHTML = `
    <div class="pf-phase2">
      <div class="pf-phase2-header">
        <div>
          <h2 class="pf-title" style="font-size:1.1rem">Problem Statements</h2>
          <p class="pf-subtitle" style="margin:0">📍 ${locStr} · ${ctx.subDomain}</p>
        </div>
        <button class="pf-back-btn" onclick="openPotentialFinder()">
          🔄 Regenerate
        </button>
      </div>
      <p style="font-size:0.78rem;color:#555;margin:-8px 0 16px;text-align:center;">💡 Click any card to see more details</p>
      <div class="pf-problems">
        ${problems.map((p, i) => `
          <div class="pf-problem-card pf-problem-card--clickable" onclick="openProblemDetail(${i})" role="button" tabindex="0">
            <div class="pf-problem-top">
              <h3 class="pf-problem-title">${p.title}</h3>
              <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                <span class="pf-severity" style="color:${sevColor[p.severity]||'#fff'};border-color:${sevColor[p.severity]||'#fff'}30;background:${sevColor[p.severity]||'#fff'}15">
                  ${p.severity}
                </span>
                <span class="pf-card-arrow">›</span>
              </div>
            </div>
            ${!_isFreeUser && p.millionDollarReason ? `
              <div class="pf-million-dollar-badge" style="margin: 12px 0; padding: 12px 14px; background: linear-gradient(135deg, rgba(0, 245, 160, 0.08) 0%, rgba(0, 245, 160, 0.02) 100%); border: 1px dashed rgba(0, 245, 160, 0.3); border-radius: 6px; display: flex; align-items: center; gap: 10px; box-shadow: 0 0 15px rgba(0, 245, 160, 0.03); transition: all 0.2s ease;">
                <span style="font-size: 1.2rem; filter: drop-shadow(0 0 4px rgba(0, 245, 160, 0.5));">💎</span>
                <div style="display: flex; flex-direction: column; gap: 2px;">
                  <span style="font-family: 'Space Grotesk', sans-serif; font-size: 0.8rem; font-weight: 700; color: #00F5A0; text-transform: uppercase; letter-spacing: 0.06em; line-height: 1.2;">Million-Dollar Idea</span>
                  <span style="font-size: 0.72rem; color: #a0aec0; font-weight: 500;">Click to unlock full description &amp; business plan</span>
                </div>
              </div>
            ` : `
              <p class="pf-problem-reason" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-overflow:ellipsis;">${p.reason}</p>
            `}
            ${!_isFreeUser ? `
            <div class="pf-problem-meta">
              <span><b style="color:#999">Target:</b> ${p.affectedGroup || ''}</span>
              ${p.impact ? (function() {
                const dist = p.impact.districtImpact || {};
                const stateImp = p.impact.stateImpact || {};
                const glob = p.impact.globalImpact || {};
                const parts = [];
                if (dist.count !== undefined) parts.push(`${dist.count} Districts`);
                if (stateImp.count !== undefined) parts.push(`${stateImp.count} States`);
                if (glob.count !== undefined) parts.push(`${glob.count} Countries`);
                return `<span class="pf-impact-hint">📊 ${parts.length > 0 ? parts.join(' · ') + ' affected' : 'Impact data available'}</span>`;
              })() : ''}
            </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
      <div style="margin-top:20px;text-align:center;font-size:0.75rem;color:#555;">
        ℹ️ Auto-generated based on active dashboard search filters.
      </div>
    </div>
  `;
}


/** Close the Potential Finder modal. */
function closePotentialFinder() {
  if (_pfIsGenerating) return;
  document.getElementById('pf-overlay')?.classList.add('hidden');
}

/** Legacy alias – kept so any old onclick="generateProblemStatement()" calls still work. */
function generateProblemStatement() { openPotentialFinder(); }

/** Open the problem detail modal for a specific problem card */
function openProblemDetail(idx) {
  const p = _pfCurrentProblems[idx];
  if (!p) return;

  const ctx = _pfCurrentCtx;
  const sevColor = { High: '#e05c45', Medium: '#f5a623', Low: '#34c4a4' };
  const sev = sevColor[p.severity] || '#ccc';

  const imp = p.impact || {};
  const dist = imp.districtImpact || {};
  const stateImp = imp.stateImpact || {};
  const nat = imp.nationalImpact || {};
  const glob = imp.globalImpact || {};

  const locParts = [ctx.district, ctx.state, ctx.country].filter(x => x && x.toLowerCase() !== 'all');
  const locStr = locParts.join(', ') || ctx.country || 'India';

  let overlay = document.getElementById('pd-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'pd-overlay';
    overlay.className = 'pd-overlay hidden';
    overlay.innerHTML = '<div class="pd-modal" id="pd-modal"></div>';
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeProblemDetail(); });
    document.body.appendChild(overlay);
  }

  const modal = document.getElementById('pd-modal');

  const hasImpact = dist.count !== undefined || stateImp.count !== undefined || nat.affectedPercent !== undefined || glob.count !== undefined;

  // Helper deterministic seeded shuffle so lists are unique per card index but stable
  function deterministicShuffle(array, seedString) {
    let seed = 0;
    for (let i = 0; i < seedString.length; i++) {
      seed += seedString.charCodeAt(i);
    }
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const x = Math.sin(seed + i) * 10000;
      const j = Math.floor((x - Math.floor(x)) * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  // 1. District Level chips (with sandbox fallback)
  let distNames = dist.names || [];
  if (distNames.length === 0 && dist.count > 0) {
    const mockDists = {
      "Maharashtra": ["Thane", "Pune", "Nashik", "Aurangabad", "Kolhapur", "Nagpur", "Solapur", "Sangli", "Jalgaon", "Akola", "Amravati", "Nanded", "Satara", "Raigad", "Ratnagiri", "Latur", "Ahmednagar", "Yavatmal"],
      "Karnataka": ["Bengaluru Urban", "Mysuru", "Dharwad", "Belagavi", "Mangaluru", "Kalaburagi", "Shivamogga", "Ballari", "Tumakuru", "Vijayapura", "Hassan", "Davangere", "Udupi", "Chitradurga", "Raichur"],
      "Uttar Pradesh": ["Lucknow", "Noida", "Agra", "Kanpur", "Varanasi", "Ghaziabad", "Prayagraj", "Meerut", "Bareilly", "Aligarh", "Moradabad", "Gorakhpur", "Muzaffarnagar", "Mathura", "Firozabad", "Saharanpur"],
      "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar", "Jamnagar", "Anand", "Mehsana", "Navsari", "Bharuch", "Morbi", "Junagadh"],
      "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur", "Vellore", "Erode", "Thoothukudi", "Dindigul", "Kanchipuram", "Thanjavur"]
    };
    const list = mockDists[ctx.state] || mockDists["Maharashtra"];
    const shuffled = deterministicShuffle(list, p.title + idx);
    if (ctx.district && ctx.district !== 'All') {
      distNames = [ctx.district, ...shuffled.filter(d => d.toLowerCase() !== ctx.district.toLowerCase())].slice(0, dist.count);
    } else {
      distNames = shuffled.slice(0, dist.count);
    }
  }

  // 2. State Level chips (with sandbox fallback)
  let stateNames = stateImp.names || [];
  if (stateNames.length === 0 && stateImp.count > 0) {
    const mockStates = ["Maharashtra", "Karnataka", "Uttar Pradesh", "Delhi", "Gujarat", "Tamil Nadu", "Telangana", "Haryana", "Kerala", "Rajasthan", "Madhya Pradesh", "Bihar", "Andhra Pradesh", "West Bengal", "Punjab", "Odisha", "Assam", "Jharkhand", "Chhattisgarh", "Uttarakhand"];
    const shuffled = deterministicShuffle(mockStates, p.title + idx + "_state");
    if (ctx.state && ctx.state !== 'All') {
      stateNames = [ctx.state, ...shuffled.filter(s => s.toLowerCase() !== ctx.state.toLowerCase())].slice(0, stateImp.count);
    } else {
      stateNames = shuffled.slice(0, stateImp.count);
    }
  }

  // 3. National Level chips (with sandbox fallback)
  let cityNames = nat.names || [];
  if (cityNames.length === 0 && nat.affectedPercent > 0) {
    const mockCities = ["Mumbai", "Delhi NCR", "Bengaluru", "Chennai", "Kolkata", "Hyderabad", "Ahmedabad", "Pune", "Jaipur", "Lucknow", "Surat", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad"];
    const shuffled = deterministicShuffle(mockCities, p.title + idx + "_city");
    const representativeCount = Math.min(12, Math.max(6, Math.floor(nat.affectedPercent / 4)));
    cityNames = shuffled.slice(0, representativeCount);
  }

  // 4. Global Level chips (with sandbox fallback)
  let countryNames = glob.names || [];
  if (countryNames.length === 0 && glob.count > 0) {
    const mockCountries = ["Bangladesh", "Nigeria", "Brazil", "Kenya", "Indonesia", "Pakistan", "Egypt", "Vietnam", "South Africa", "Mexico", "Philippines", "Turkey", "Colombia", "Thailand", "Malaysia", "Ghana", "Ethiopia", "Nepal", "Sri Lanka", "Peru"];
    const shuffled = deterministicShuffle(mockCountries, p.title + idx + "_country");
    const representativeCount = Math.min(12, glob.count);
    countryNames = shuffled.slice(0, representativeCount);
  }

  const impactHTML = hasImpact ? `
    <div class="pd-impact-section">
      <h4 class="pd-section-title">📊 Geographic Impact Analysis</h4>
      <p class="pd-section-sub">💡 Click any card below to expand and view the list of affected regions</p>
      <div class="pd-impact-grid">

        ${dist.count !== undefined ? `
        <div class="pd-impact-card pd-impact-district pd-impact-card--clickable" onclick="toggleImpactNames(this)">
          <div class="pd-impact-header">
            <div class="pd-impact-icon">🏘️</div>
            <div class="pd-impact-chevron">▼</div>
          </div>
          <div class="pd-impact-level">District Level</div>
          <div class="pd-impact-number">${dist.count}<span class="pd-impact-unit"> districts</span></div>
          <div class="pd-impact-scope">in ${ctx.state && ctx.state !== 'All' ? ctx.state : 'same state'}</div>
          <p class="pd-impact-desc">${dist.description || 'Multiple districts face the same challenge.'}</p>
          <div class="pd-impact-names-container">
            <div class="pd-impact-names-title">Affected Districts (${dist.count}):</div>
            <div class="pd-impact-names-list">
              ${distNames.map(name => `<span class="pd-name-chip">${name}</span>`).join('')}
              ${dist.count > distNames.length ? `<span class="pd-name-chip pd-name-chip--more">+ ${dist.count - distNames.length} more</span>` : ''}
            </div>
          </div>
        </div>` : ''}

        ${stateImp.count !== undefined ? `
        <div class="pd-impact-card pd-impact-state pd-impact-card--clickable" onclick="toggleImpactNames(this)">
          <div class="pd-impact-header">
            <div class="pd-impact-icon">🗺️</div>
            <div class="pd-impact-chevron">▼</div>
          </div>
          <div class="pd-impact-level">State Level</div>
          <div class="pd-impact-number">${stateImp.count}<span class="pd-impact-unit"> states</span></div>
          <div class="pd-impact-scope">across India</div>
          <p class="pd-impact-desc">${stateImp.description || 'Multiple Indian states are affected.'}</p>
          <div class="pd-impact-names-container">
            <div class="pd-impact-names-title">Affected States (${stateImp.count}):</div>
            <div class="pd-impact-names-list">
              ${stateNames.map(name => `<span class="pd-name-chip">${name}</span>`).join('')}
              ${stateImp.count > stateNames.length ? `<span class="pd-name-chip pd-name-chip--more">+ ${stateImp.count - stateNames.length} more</span>` : ''}
            </div>
          </div>
        </div>` : ''}

        ${nat.affectedPercent !== undefined ? `
        <div class="pd-impact-card pd-impact-national pd-impact-card--clickable" onclick="toggleImpactNames(this)">
          <div class="pd-impact-header">
            <div class="pd-impact-icon"><span style="font-size:0.9rem;font-weight:800;color:#b47ef5;letter-spacing:1px;background:rgba(140,60,221,0.15);padding:2px 6px;border-radius:4px;">IND</span></div>
            <div class="pd-impact-chevron">▼</div>
          </div>
          <div class="pd-impact-level">National Level</div>
          <div class="pd-impact-number">${nat.affectedPercent}<span class="pd-impact-unit">%</span></div>
          <div class="pd-impact-scope">population affected</div>
          <p class="pd-impact-desc">${nat.description || 'A significant portion of India is affected.'}</p>
          <div class="pd-impact-names-container">
            <div class="pd-impact-names-title">Affected Cities & Regions:</div>
            <div class="pd-impact-names-list">
              ${cityNames.map(name => `<span class="pd-name-chip">${name}</span>`).join('')}
              <span class="pd-name-chip pd-name-chip--more">+ national segments</span>
            </div>
          </div>
        </div>` : ''}

        ${glob.count !== undefined ? `
        <div class="pd-impact-card pd-impact-global pd-impact-card--clickable" onclick="toggleImpactNames(this)">
          <div class="pd-impact-header">
            <div class="pd-impact-icon">🌍</div>
            <div class="pd-impact-chevron">▼</div>
          </div>
          <div class="pd-impact-level">Global Level</div>
          <div class="pd-impact-number">${glob.count}<span class="pd-impact-unit"> countries</span></div>
          <div class="pd-impact-scope">worldwide</div>
          <p class="pd-impact-desc">${glob.description || 'This is a global challenge.'}</p>
          <div class="pd-impact-names-container">
            <div class="pd-impact-names-title">Affected Countries (${glob.count}):</div>
            <div class="pd-impact-names-list">
              ${countryNames.map(name => `<span class="pd-name-chip">${name}</span>`).join('')}
              ${glob.count > countryNames.length ? `<span class="pd-name-chip pd-name-chip--more">+ ${glob.count - countryNames.length} more</span>` : ''}
            </div>
          </div>
        </div>` : ''}

      </div>
    </div>
  ` : `
    <div class="pd-impact-section" style="text-align:center;padding:24px 0;">
      <p style="color:#555;font-size:0.85rem;">📡 Impact data not available. Regenerate for full geographic analysis.</p>
    </div>
  `;

  const _detailUserPlan = _pfGetLimitState().plan;
  const _detailIsFreeUser = (_detailUserPlan !== 'pro' && _detailUserPlan !== 'admin');

  modal.innerHTML = `
    <div class="pd-header">
      <button class="pd-close-btn" onclick="closeProblemDetail()">✕</button>
      <div class="pd-header-top">
        <span class="pf-severity" style="color:${sev};border-color:${sev}30;background:${sev}15;font-size:0.72rem;">${p.severity} SEVERITY</span>
        <span class="pd-location-tag">📍 ${locStr}</span>
      </div>
      <h2 class="pd-title">${p.title}</h2>
      <p class="pd-domain-tag">${ctx.domain} › ${ctx.subDomain}</p>
      
      <div class="pd-nav-bar">
        ${!_detailIsFreeUser && hasImpact ? `<button id="btn-nav-impact" class="pd-nav-item active" onclick="scrollToSection('pd-sec-impact')">Geographic Impact</button>` : ''}
        <button id="btn-nav-desc" class="pd-nav-item ${_detailIsFreeUser || !hasImpact ? 'active' : ''}" onclick="scrollToSection('pd-sec-desc')">Description</button>
        ${!_detailIsFreeUser ? `<button id="btn-nav-affected" class="pd-nav-item" onclick="scrollToSection('pd-sec-affected')">Who is Affected</button>` : ''}
        ${!_detailIsFreeUser && p.millionDollarReason ? `<button id="btn-nav-million" class="pd-nav-item" onclick="scrollToSection('pd-sec-million')">Million-Dollar Idea</button>` : ''}
        ${!_detailIsFreeUser && p.startupOpportunity ? `<button id="btn-nav-opportunity" class="pd-nav-item" onclick="scrollToSection('pd-sec-opportunity')">Opportunity</button>` : ''}
        ${!_detailIsFreeUser && p.monetization ? `<button id="btn-nav-monetization" class="pd-nav-item" onclick="scrollToSection('pd-sec-monetization')">Monetization</button>` : ''}
        ${!_detailIsFreeUser && p.subIdeas && p.subIdeas.length > 0 ? `<button id="btn-nav-subideas" class="pd-nav-item" onclick="scrollToSection('pd-sec-subideas')">Execution</button>` : ''}
      </div>
    </div>

    <div class="pd-body">
      ${!_detailIsFreeUser ? `<div id="pd-sec-impact">${impactHTML}</div>` : ''}

      <div id="pd-sec-desc" class="pd-section">
        <h4 class="pd-section-title">📝 Problem Description</h4>
        <p class="pd-text">${p.reason}</p>
      </div>

      ${!_detailIsFreeUser ? `
      <div id="pd-sec-affected" class="pd-section">
        <h4 class="pd-section-title">👥 Who Is Affected?</h4>
        <p class="pd-text">${p.affectedGroup}</p>
      </div>

      ${p.millionDollarReason ? `
      <div id="pd-sec-million" class="pd-section" style="background: rgba(0, 245, 160, 0.04); border-radius: 8px; padding: 16px; margin: 8px 0; border: 1px solid rgba(0, 245, 160, 0.1) !important;">
        <h4 class="pd-section-title" style="color: #00F5A0; margin-bottom: 8px;">💎 Why It's a Million-Dollar Idea</h4>
        <p class="pd-text" style="color: #E8EDF5; font-weight: 500;">${p.millionDollarReason}</p>
      </div>` : ''}

      ${p.startupOpportunity ? `
      <div id="pd-sec-opportunity" class="pd-section pd-opportunity">
        <h4 class="pd-section-title">🚀 Startup Opportunity</h4>
        <p class="pd-text" style="white-space: pre-line; line-height: 1.8;">${p.startupOpportunity}</p>
      </div>` : ''}

      ${p.monetization ? `
      <div id="pd-sec-monetization" class="pd-section">
        <h4 class="pd-section-title">💰 Monetization Strategy</h4>
        <p class="pd-text">${p.monetization}</p>
      </div>` : ''}

      ${p.subIdeas && p.subIdeas.length > 0 ? `
      <div id="pd-sec-subideas" class="pd-section">
        <h4 class="pd-section-title">💡 Execution Sub-Ideas (${p.subIdeas.length} Steps)</h4>
        <p class="pd-section-sub" style="margin-bottom: 12px;">Click on any step to view implementation details</p>
        <div class="pd-subideas-list" style="display: flex; flex-direction: column; gap: 10px; margin-top: 12px;">
          ${p.subIdeas.map((sub, sIdx) => `
            <div class="pd-subidea-item" style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 6px; overflow: hidden; transition: all 0.2s;">
              <button onclick="toggleSubIdea(${sIdx})" style="width: 100%; text-align: left; padding: 12px 16px; background: transparent; border: none; color: #00F5A0; font-family: 'Space Grotesk', sans-serif; font-size: 0.88rem; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                <span>${sIdx + 1}. ${sub.title}</span>
                <span id="sub-chevron-${sIdx}" style="font-size: 0.75rem; transition: transform 0.2s;">▼</span>
              </button>
              <div id="sub-details-${sIdx}" style="display: none; padding: 0 16px 14px 16px; font-size: 0.82rem; color: #9BA5B4; line-height: 1.6; border-top: 1px solid rgba(255, 255, 255, 0.03);">
                ${sub.details}
              </div>
            </div>
          `).join('')}
        </div>
      </div>` : ''}
      ` : ''}
    </div>
  `;

  window.toggleSubIdea = function(sIdx) {
    const el = document.getElementById(`sub-details-${sIdx}`);
    const chev = document.getElementById(`sub-chevron-${sIdx}`);
    if (el && chev) {
      if (el.style.display === 'none') {
        el.style.display = 'block';
        chev.style.transform = 'rotate(180deg)';
      } else {
        el.style.display = 'none';
        chev.style.transform = 'rotate(0deg)';
      }
    }
  };

  window.scrollToSection = function(id) {
    const el = document.getElementById(id);
    const modal = document.getElementById('pd-modal');
    if (el && modal) {
      const header = document.querySelector('.pd-header');
      const headerHeight = header ? header.offsetHeight : 150;
      
      const modalRect = modal.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const relativeTop = elRect.top - modalRect.top + modal.scrollTop;
      
      modal.scrollTo({
        top: relativeTop - headerHeight - 10,
        behavior: 'smooth'
      });
    }
  };

  const modalScrollContainer = document.getElementById('pd-modal');
  if (modalScrollContainer) {
    const updateActiveNav = () => {
      const sections = [
        { id: 'pd-sec-impact', btnId: 'btn-nav-impact' },
        { id: 'pd-sec-desc', btnId: 'btn-nav-desc' },
        { id: 'pd-sec-affected', btnId: 'btn-nav-affected' },
        { id: 'pd-sec-million', btnId: 'btn-nav-million' },
        { id: 'pd-sec-opportunity', btnId: 'btn-nav-opportunity' },
        { id: 'pd-sec-monetization', btnId: 'btn-nav-monetization' },
        { id: 'pd-sec-subideas', btnId: 'btn-nav-subideas' }
      ];
      
      let activeId = null;
      const header = document.querySelector('.pd-header');
      const headerHeight = header ? header.offsetHeight : 150;
      const modalRect = modalScrollContainer.getBoundingClientRect();
      
      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const elRect = el.getBoundingClientRect();
          if (elRect.top - modalRect.top <= headerHeight + 30) {
            activeId = sec.btnId;
          }
        }
      }
      
      sections.forEach(sec => {
        const btn = document.getElementById(sec.btnId);
        if (btn) {
          if (sec.btnId === activeId || (!activeId && sec.btnId === (hasImpact ? 'btn-nav-impact' : 'btn-nav-desc'))) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        }
      });
    };

    modalScrollContainer.onscroll = updateActiveNav;
    // Set initial active state
    setTimeout(updateActiveNav, 100);
  }

  overlay.classList.remove('hidden');
  requestAnimationFrame(() => overlay.classList.add('pd-visible'));
}

/** Toggles the expanded accordion state on geographic impact cards. */
function toggleImpactNames(cardEl) {
  cardEl.classList.toggle('expanded');
}

function closeProblemDetail() {
  const overlay = document.getElementById('pd-overlay');
  if (overlay) {
    overlay.classList.remove('pd-visible');
    setTimeout(() => overlay.classList.add('hidden'), 280);
  }
  const modal = document.getElementById('pd-modal');
  if (modal) {
    modal.onscroll = null;
  }
}

/** Close the problem statement modal. */
function closeProbStmt() {
  document.getElementById('prob-stmt-overlay').classList.add('hidden');
}

/** Copy the plain-text version of the problem statement. */
function copyProbStatement() {
  const body = document.getElementById('prob-stmt-body');
  const text = body ? body.innerText : '';
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('prob-copy-btn');
    if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000); }
  }).catch(() => showToast('❌ Copy failed — please copy manually.', 'error'));
}
