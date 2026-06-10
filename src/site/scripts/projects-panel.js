(function () {
  const DESKTOP_QUERY = "(min-width: 900px)";
  const mq = window.matchMedia(DESKTOP_QUERY);

  const panel = document.getElementById("projects-panel");
  const list = document.querySelector(".projects-list");
  if (!panel || !list) return;

  function setPanelHtml(html) {
    panel.innerHTML = html;
  }

  function showEmpty() {
    setPanelHtml('<p class="projects-panel-empty">Select a project from the list.</p>');
  }

  async function loadProject(url) {
    setPanelHtml('<p class="projects-panel-loading">Loading…</p>');
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("fetch failed");
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const content = doc.querySelector(".minimal-content");
      if (!content) throw new Error("no content");
      setPanelHtml(content.innerHTML);
      window.scrollTo(0, 0);
    } catch {
      window.location.href = url;
    }
  }

  function projectLinkFromEvent(event) {
    if (!mq.matches) return null;
    const link = event.target.closest("a.internal-link, a[href^='/objects/']");
    if (!link) return null;
    const url = link.getAttribute("href");
    if (!url || url.startsWith("http")) return null;
    return link;
  }

  list.addEventListener("click", (event) => {
    const link = projectLinkFromEvent(event);
    if (!link) return;
    event.preventDefault();
    const url = link.getAttribute("href");
    list.querySelectorAll("a.is-active").forEach((a) => a.classList.remove("is-active"));
    link.classList.add("is-active");
    loadProject(url);
    history.replaceState(null, "", url);
  });

  function syncFromLocation() {
    if (!mq.matches) {
      showEmpty();
      return;
    }
    const path = window.location.pathname;
    if (!path.startsWith("/objects/")) {
      showEmpty();
      return;
    }
    const link = list.querySelector(`a[href="${path}"], a[href="${path.replace(/\/$/, "")}/"]`);
    if (link) {
      list.querySelectorAll("a.is-active").forEach((a) => a.classList.remove("is-active"));
      link.classList.add("is-active");
      loadProject(path);
    }
  }

  mq.addEventListener("change", () => {
    if (!mq.matches) showEmpty();
    else syncFromLocation();
  });

  syncFromLocation();
})();
