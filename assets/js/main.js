function getSiteData() {
  return window.HOLISTA || { site: {}, articles: [] };
}

function sortArticlesNewestFirst(articles) {
  return [...articles].sort((left, right) => new Date(right.date) - new Date(left.date));
}

function formatDate(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function setBranding() {
  const { site } = getSiteData();
  const brandEls = document.querySelectorAll("[data-site-brand]");

  brandEls.forEach((element) => {
    element.textContent = site.name || "Holista";
  });
}

function setHomeCopy() {
  const { site } = getSiteData();
  const mappings = [
    ["hero-eyebrow", site.heroEyebrow],
    ["hero-title", site.heroTitle],
    ["hero-description", site.heroDescription],
    ["newsletter-title", site.newsletterTitle],
    ["newsletter-copy", site.newsletterCopy]
  ];

  mappings.forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element && value) {
      if (id === "hero-title") {
        element.innerHTML = value;
        return;
      }

      element.textContent = value;
    }
  });

  if (site.name) {
    document.title = site.name;
  }
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildStoryMedia(article) {
  const artClass = article.art ? `media--${article.art}` : "media--nutrition-bowl";
  const imageMarkup = article.image
    ? `<img class="story-card__image" src="${article.image}" alt="${escapeAttribute(`Editorial image for ${article.title}`)}" loading="lazy" />`
    : "";

  return `
    <div class="story-card__media ${artClass}${article.image ? " story-card__media--image" : ""}">
      ${imageMarkup}
      <span class="media__badge">${article.category}</span>
    </div>
  `;
}

function buildArticleVisual(article) {
  const imageMarkup = article.image
    ? `<img class="article-visual__image" src="${article.image}" alt="${escapeAttribute(`Editorial image for ${article.title}`)}" />`
    : "";

  return `
    <div class="article-visual media--${article.art}${article.image ? " article-visual--image" : ""}">
      ${imageMarkup}
      <span class="media__badge">${article.category}</span>
    </div>
  `;
}

function buildArticleCard(article, variant = "feature") {
  const cardClass =
    variant === "stacked" ? "story-card story-card--stacked" : "story-card story-card--feature";

  return `
    <article class="${cardClass}">
      ${buildStoryMedia(article)}
      <div class="story-card__body">
        <p class="story-card__category">${article.category}</p>
        <h3><a href="article.html?slug=${article.slug}">${article.title}</a></h3>
        <p class="story-card__excerpt">${article.excerpt}</p>
        <p class="meta">${formatDate(article.date)} <span aria-hidden="true">•</span> ${article.readTime}</p>
      </div>
    </article>
  `;
}

function buildTakeaways(takeaways) {
  if (!takeaways || !takeaways.length) {
    return "";
  }

  return `
    <section class="takeaways-card">
      <p class="eyebrow">Key Takeaways</p>
      <ul class="takeaways-list">
        ${takeaways.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </section>
  `;
}

function buildRelatedStories(currentSlug) {
  const { articles } = getSiteData();
  const related = sortArticlesNewestFirst(articles)
    .filter((article) => article.slug !== currentSlug)
    .slice(0, 3);

  return related
    .map(
      (article) => `
        <article>
          <a href="article.html?slug=${article.slug}">${article.title}</a>
          <p class="mini-meta">${article.category} • ${article.readTime}</p>
        </article>
      `
    )
    .join("");
}

function renderPopularArticles() {
  const { articles } = getSiteData();
  const popularEl = document.getElementById("popular-articles");

  if (!popularEl) {
    return;
  }

  popularEl.innerHTML = sortArticlesNewestFirst(articles)
    .slice(0, 3)
    .map((article) => buildArticleCard(article, "feature"))
    .join("");
}

function renderIssueRail() {
  const { articles } = getSiteData();
  const issueEl = document.getElementById("issue-rail");

  if (!issueEl) {
    return;
  }

  issueEl.innerHTML = sortArticlesNewestFirst(articles)
    .slice(0, 4)
    .map(
      (article, index) => `
        <a class="issue-card" href="article.html?slug=${article.slug}">
          <span class="issue-card__number">${String(index + 1).padStart(2, "0")}</span>
          <span class="issue-card__topic">${escapeHtml(article.category)}</span>
          <strong>${escapeHtml(article.title)}</strong>
          <small>${escapeHtml(article.readTime)}</small>
        </a>
      `
    )
    .join("");
}

function renderRecentArticles() {
  const { articles } = getSiteData();
  const recentEl = document.getElementById("recent-articles");

  if (!recentEl) {
    return;
  }

  recentEl.innerHTML = sortArticlesNewestFirst(articles)
    .slice(3, 6)
    .map((article) => buildArticleCard(article, "stacked"))
    .join("");
}

function renderAllArticles() {
  const { articles } = getSiteData();
  const articlesEl = document.getElementById("all-articles");

  if (!articlesEl) {
    return;
  }

  articlesEl.innerHTML = sortArticlesNewestFirst(articles)
    .map((article) => buildArticleCard(article, "stacked"))
    .join("");
}

function slugifyCategory(category) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function renderCategoryPage() {
  const { articles } = getSiteData();
  const buttonsEl = document.getElementById("category-buttons");
  const sectionsEl = document.getElementById("category-sections");

  if (!buttonsEl || !sectionsEl) {
    return;
  }

  const categories = [...new Set(articles.map((article) => article.category))].sort();

  buttonsEl.innerHTML = categories
    .map((category, index) => {
      const slug = slugifyCategory(category);
      const count = articles.filter((article) => article.category === category).length;
      return `
        <a class="category-button${index === 0 ? " is-active" : ""}" href="#${slug}" data-category-button="${slug}">
          <span>${escapeHtml(category)}</span>
          <small>${count} stories</small>
        </a>
      `;
    })
    .join("");

  sectionsEl.innerHTML = categories
    .map((category) => {
      const slug = slugifyCategory(category);
      const categoryArticles = sortArticlesNewestFirst(articles).filter((article) => article.category === category);
      return `
        <section class="category-section" id="${slug}" data-category-section="${slug}">
          <div class="category-section__head">
            <div>
              <p class="eyebrow">${escapeHtml(category)}</p>
              <h2>${escapeHtml(category)} articles</h2>
            </div>
            <span>${categoryArticles.length} stories</span>
          </div>
          <div class="story-grid story-grid--library">
            ${categoryArticles.map((article) => buildArticleCard(article, "stacked")).join("")}
          </div>
        </section>
      `;
    })
    .join("");

  const buttons = document.querySelectorAll("[data-category-button]");
  const sections = document.querySelectorAll("[data-category-section]");

  const setActive = () => {
    const current = [...sections]
      .filter((section) => section.getBoundingClientRect().top <= 180)
      .at(-1);
    const active = current?.dataset.categorySection || sections[0]?.dataset.categorySection;

    buttons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.categoryButton === active);
    });
  };

  setActive();
  window.addEventListener("scroll", setActive, { passive: true });
}

function renderSingleArticle() {
  const { articles, site } = getSiteData();
  const shell = document.getElementById("article-shell");

  if (!shell) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const article = articles.find((entry) => entry.slug === slug);

  if (!article) {
    shell.innerHTML = `
      <div class="article-layout">
        <article class="article-body">
          <p class="eyebrow">Not found</p>
          <h1>That article could not be found.</h1>
          <p class="body-copy">Try opening a story from the article library instead.</p>
          <p><a class="text-link" href="articles.html">Browse all articles</a></p>
        </article>
      </div>
    `;
    return;
  }

  document.title = `${article.title} | ${site.name || "Holista"}`;

  shell.innerHTML = `
    <div class="article-layout">
      <article class="article-body">
        <div class="article-head">
          <p class="article-kicker">${article.category}</p>
          <h1>${article.title}</h1>
          <p class="article-author">By ${article.author}</p>
          <p class="article-standfirst">${article.excerpt}</p>
        </div>
        ${buildArticleVisual(article)}
        <div class="article-meta-grid">
          <div class="article-meta-item">
            <span class="article-meta-item__label">Published</span>
            <span class="article-meta-item__value">${formatDate(article.date)}</span>
          </div>
          <div class="article-meta-item">
            <span class="article-meta-item__label">Updated</span>
            <span class="article-meta-item__value">${formatDate(article.updatedDate || article.date)}</span>
          </div>
          <div class="article-meta-item">
            <span class="article-meta-item__label">Reading Time</span>
            <span class="article-meta-item__value">${article.readTime}</span>
          </div>
        </div>
        ${buildTakeaways(article.takeaways)}
        ${article.content.map((paragraph) => `<p>${paragraph}</p>`).join("")}
      </article>
      <aside class="article-side-column">
        <section class="article-side-card">
          <p class="eyebrow">Why It Matters</p>
          <h3>Simple routines become sustainable when they fit everyday life.</h3>
          <p class="body-copy">
            Holista stories focus on habits that feel calming, realistic, and repeatable rather than rigid or dramatic.
          </p>
        </section>
        <section class="article-side-card">
          <p class="eyebrow">More to Read</p>
          <div class="related-links">
            ${buildRelatedStories(article.slug)}
          </div>
        </section>
      </aside>
    </div>
  `;
}

function setFooterYear() {
  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

function initHeaderBehavior() {
  const header = document.querySelector(".site-header");

  if (!header) {
    return;
  }

  const setScrolled = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  setScrolled();
  window.addEventListener("scroll", setScrolled, { passive: true });
}

function createSearchOverlay() {
  const { articles } = getSiteData();
  const overlay = document.createElement("div");
  overlay.className = "search-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "search-title");
  overlay.setAttribute("hidden", "");

  overlay.innerHTML = `
    <div class="search-overlay__backdrop" data-search-close></div>
    <div class="search-panel">
      <div class="search-panel__head">
        <div>
          <p class="eyebrow">Search Holista</p>
          <h2 id="search-title">Find a ritual, topic, or wellness story.</h2>
        </div>
        <button class="search-close" type="button" aria-label="Close search" data-search-close></button>
      </div>
      <label class="sr-only" for="site-search-input">Search articles</label>
      <input id="site-search-input" class="search-input" type="search" placeholder="Try sleep, skin care, smoothie..." autocomplete="off" />
      <div class="search-results" id="site-search-results"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  const input = overlay.querySelector("#site-search-input");
  const results = overlay.querySelector("#site-search-results");
  const closeButtons = overlay.querySelectorAll("[data-search-close]");

  const renderResults = (query = "") => {
    const normalized = query.trim().toLowerCase();
    const matches = articles
      .filter((article) => {
        const haystack = `${article.title} ${article.category} ${article.excerpt}`.toLowerCase();
        return !normalized || haystack.includes(normalized);
      })
      .slice(0, 5);

    results.innerHTML = matches.length
      ? matches
          .map(
            (article) => `
          <a class="search-result" href="article.html?slug=${article.slug}">
            <span>${escapeHtml(article.category)} · ${escapeHtml(article.readTime)}</span>
            <strong>${escapeHtml(article.title)}</strong>
            <small>${escapeHtml(article.excerpt)}</small>
          </a>
        `
          )
          .join("")
      : `<p class="search-empty">No rituals found. Try "sleep", "skin", "phone", or "cardio".</p>`;
  };

  const openSearch = () => {
    overlay.removeAttribute("hidden");
    document.body.classList.add("has-search-open");
    renderResults(input.value);
    window.setTimeout(() => input.focus(), 40);
  };

  const closeSearch = () => {
    overlay.setAttribute("hidden", "");
    document.body.classList.remove("has-search-open");
  };

  document.querySelectorAll(".search-button").forEach((button) => {
    button.addEventListener("click", openSearch);
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeSearch);
  });

  input.addEventListener("input", () => renderResults(input.value));
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSearch();
    }
  });

  renderResults();
}

function initScrollReveal() {
  const targets = document.querySelectorAll(
    ".hero-shell, .page-hero, .section-heading, .story-card, .feature-card, .cta-band, .contact-card, .info-card, .about-value, .article-body, .article-side-card, .category-section"
  );

  targets.forEach((element) => element.classList.add("reveal"));

  if (!("IntersectionObserver" in window)) {
    targets.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach((element) => observer.observe(element));
}

function init() {
  const page = document.body.dataset.page;

  initHeaderBehavior();
  setBranding();
  setFooterYear();
  createSearchOverlay();

  if (page === "home") {
    setHomeCopy();
    renderIssueRail();
    renderPopularArticles();
    renderRecentArticles();
  }

  if (page === "articles") {
    renderAllArticles();
  }

  if (page === "categories") {
    renderCategoryPage();
  }

  if (page === "article") {
    renderSingleArticle();
  }

  initScrollReveal();
}

init();
