const projects = [
  {
    title: "Financial Modeler",
    category: "Excel",
    description:
      "Built a forecasting model for revenue, expenses, and profitability with scenario analysis.",
    tags: ["financial-modeling", "forecasting", "excel"],
    tech: "Excel",
    color: "#3fb950",
    image: "assets/financial-modeler.svg",
  },
  {
    title: "Marketing ROI Tracker",
    category: "Dashboard",
    description:
      "Tracked campaign spend, conversions, and ROI across channels with clear KPI summaries.",
    tags: ["marketing", "dashboard", "roi"],
    tech: "Power BI",
    color: "#d29922",
    image: "assets/marketing-roi.svg",
  },
  {
    title: "Global Health Trends",
    category: "SQL",
    description:
      "Analyzed health indicators across countries using SQL queries and trend comparisons.",
    tags: ["sql", "public-data", "analytics"],
    tech: "SQL",
    color: "#58a6ff",
    image: "assets/global-health.svg",
  },
  {
    title: "Sales Dashboard",
    category: "Dashboard",
    description:
      "Designed an executive dashboard for regional sales, targets, and product performance.",
    tags: ["sales", "dashboard", "tableau"],
    tech: "Tableau",
    color: "#db61a2",
    image: "assets/sales-dashboard.svg",
  },
  {
    title: "Web Scraper (Python)",
    category: "Python",
    description:
      "Automated data collection, cleaning, and export workflows for repeatable analysis.",
    tags: ["python", "automation", "pandas"],
    tech: "Python",
    color: "#f78166",
    image: "assets/web-scraper.svg",
  },
];

const projectsGrid = document.querySelector("#projectsGrid");
const searchInput = document.querySelector("#projectSearch");
const filterTabs = document.querySelectorAll(".filter-tab");
const emptyState = document.querySelector("#emptyState");

let activeFilter = "All";

// Create one GitHub-style project card from a project object.
function createProjectCard(project, index) {
  const tagMarkup = project.tags
    .map((tag) => `<span>${tag}</span>`)
    .join("");

  return `
    <article class="project-card" style="animation-delay: ${index * 70}ms">
      <img class="project-banner" src="${project.image}" alt="${project.title} banner" />
      <div class="project-body">
        <div class="project-title-row">
          <h3>${project.title}</h3>
          <span class="public-badge">Public</span>
        </div>
        <p class="project-description">${project.description}</p>
        <div class="project-tags" aria-label="${project.title} tags">
          ${tagMarkup}
        </div>
        <span class="tech-label">
          <span class="tech-dot" style="background: ${project.color}"></span>
          ${project.tech}
        </span>
      </div>
    </article>
  `;
}

// Filter projects by selected category and search text.
function getVisibleProjects() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  return projects.filter((project) => {
    const matchesFilter =
      activeFilter === "All" || project.category === activeFilter || project.tech === activeFilter;
    const matchesSearch = project.title.toLowerCase().includes(searchTerm);

    return matchesFilter && matchesSearch;
  });
}

// Render all cards from the filtered project list.
function renderProjects() {
  const visibleProjects = getVisibleProjects();

  projectsGrid.innerHTML = visibleProjects
    .map((project, index) => createProjectCard(project, index))
    .join("");

  emptyState.hidden = visibleProjects.length > 0;
}

filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeFilter = tab.dataset.filter;

    filterTabs.forEach((button) => button.classList.remove("active"));
    tab.classList.add("active");

    renderProjects();
  });
});

searchInput.addEventListener("input", renderProjects);

renderProjects();
