const GITHUB_USERNAME = "anshika292005";
const GITHUB_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

const projectsGrid = document.querySelector("#projectsGrid");
const searchInput = document.querySelector("#projectSearch");
const filterTabs = document.querySelector("#filterTabs");
const emptyState = document.querySelector("#emptyState");
const statusMessage = document.querySelector("#statusMessage");

const profileImage = document.querySelector("#profileImage");
const profileName = document.querySelector("#profileName");
const profileUsername = document.querySelector("#profileUsername");
const profileBio = document.querySelector("#profileBio");
const profileLocation = document.querySelector("#profileLocation");
const profileWebsite = document.querySelector("#profileWebsite");
const connectButton = document.querySelector("#connectButton");
const githubLink = document.querySelector("#githubLink");
const repoCount = document.querySelector("#repoCount");
const followersCount = document.querySelector("#followersCount");
const followingCount = document.querySelector("#followingCount");
const updatedDate = document.querySelector("#updatedDate");
const publicRepoBadge = document.querySelector("#publicRepoBadge");
const languageBadge = document.querySelector("#languageBadge");
const skillsList = document.querySelector("#skillsList");
const skillsCaption = document.querySelector("#skillsCaption");

let repositories = [];
let activeFilter = "All";
let availableFilters = ["All"];

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function formatDate(dateString) {
  if (!dateString) {
    return "--";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function sanitizeWebsite(url) {
  if (!url) {
    return "";
  }

  return url.startsWith("http") ? url : `https://${url}`;
}

function getLanguageColor(language) {
  const colors = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572a5",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Jupyter: "#da5b0b",
    Java: "#b07219",
    C: "#555555",
    "C++": "#f34b7d",
    Shell: "#89e051",
  };

  return colors[language] || "#58a6ff";
}

function inferTags(repo) {
  const tags = [];

  if (repo.language) {
    tags.push(repo.language.toLowerCase());
  }

  if (repo.topics && repo.topics.length) {
    tags.push(...repo.topics.slice(0, 3));
  }

  if (repo.fork) {
    tags.push("fork");
  }

  if (repo.archived) {
    tags.push("archived");
  }

  if (repo.stargazers_count > 0) {
    tags.push(`${repo.stargazers_count}-star`);
  }

  return [...new Set(tags)].slice(0, 4);
}

function createRepoBanner(repo) {
  const languageColor = getLanguageColor(repo.language);
  const starsWidth = `${Math.max(22, Math.min(100, repo.stargazers_count * 14 || 22))}%`;
  const forksWidth = `${Math.max(20, Math.min(100, repo.forks_count * 18 || 20))}%`;
  const issuesWidth = `${Math.max(18, Math.min(100, repo.open_issues_count * 20 || 18))}%`;

  return `
    <div class="repo-visual">
      <div class="repo-visual-grid"></div>
      <div class="metric metric-primary" style="--metric-width: ${starsWidth}; --metric-color: ${languageColor};"></div>
      <div class="metric metric-secondary" style="--metric-width: ${forksWidth}; --metric-color: #d29922;"></div>
      <div class="metric metric-tertiary" style="--metric-width: ${issuesWidth}; --metric-color: #3fb950;"></div>
      <div class="repo-visual-dot dot-one" style="background: ${languageColor};"></div>
      <div class="repo-visual-dot dot-two"></div>
      <div class="repo-visual-dot dot-three"></div>
    </div>
  `;
}

function createProjectCard(repo, index) {
  const repoTags = inferTags(repo);
  const tagMarkup = repoTags.map((tag) => `<span>${tag}</span>`).join("");
  const description = repo.description || "No description added yet.";
  const badgeText = repo.private ? "Private" : "Public";
  const languageLabel = repo.language || "Repository";
  const updatedLabel = formatDate(repo.updated_at);

  return `
    <article class="project-card" style="animation-delay: ${index * 60}ms">
      <a class="project-link" href="${repo.html_url}" target="_blank" rel="noreferrer">
        ${createRepoBanner(repo)}
        <div class="project-body">
          <div class="project-title-row">
            <h3>${repo.name}</h3>
            <span class="public-badge">${badgeText}</span>
          </div>
          <p class="project-description">${description}</p>
          <div class="project-meta">
            <span>Updated ${updatedLabel}</span>
            <span>${formatNumber(repo.stargazers_count)} stars</span>
            <span>${formatNumber(repo.forks_count)} forks</span>
          </div>
          <div class="project-tags" aria-label="${repo.name} tags">
            ${tagMarkup || "<span>github-repo</span>"}
          </div>
          <div class="project-footer">
            <span class="tech-label">
              <span class="tech-dot" style="background: ${getLanguageColor(repo.language)}"></span>
              ${languageLabel}
            </span>
            <span class="repo-open-label">Open Repository</span>
          </div>
        </div>
      </a>
    </article>
  `;
}

function buildFilters() {
  const languageCounts = repositories.reduce((counts, repo) => {
    if (repo.language) {
      counts[repo.language] = (counts[repo.language] || 0) + 1;
    }

    return counts;
  }, {});

  const topLanguages = Object.entries(languageCounts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([language]) => language);

  availableFilters = ["All", ...topLanguages];

  filterTabs.innerHTML = availableFilters
    .map(
      (filter) => `
        <button
          class="filter-tab${filter === activeFilter ? " active" : ""}"
          type="button"
          data-filter="${filter}"
        >
          ${filter}
        </button>
      `
    )
    .join("");

  filterTabs.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      activeFilter = tab.dataset.filter;
      buildFilters();
      renderProjects();
    });
  });
}

function getVisibleProjects() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  return repositories.filter((repo) => {
    const haystack = [
      repo.name,
      repo.description,
      repo.language,
      ...(repo.topics || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = haystack.includes(searchTerm);
    const matchesFilter =
      activeFilter === "All" || (repo.language || "Repository") === activeFilter;

    return matchesSearch && matchesFilter;
  });
}

function renderProjects() {
  const visibleProjects = getVisibleProjects();

  projectsGrid.innerHTML = visibleProjects
    .map((repo, index) => createProjectCard(repo, index))
    .join("");

  emptyState.hidden = visibleProjects.length > 0;
  statusMessage.hidden = repositories.length > 0;
}

function updateProfile(profile) {
  profileImage.src = profile.avatar_url || "assets/profile.svg";
  profileName.textContent = profile.name || "Anshika";
  profileUsername.textContent = `@${profile.login}`;
  profileBio.textContent =
    profile.bio || "GitHub profile loaded successfully. Explore repositories on the right.";
  profileLocation.textContent = profile.location || "Location not listed";
  githubLink.href = profile.html_url;
  githubLink.textContent = profile.html_url.replace("https://", "");
  connectButton.href = profile.html_url;
  repoCount.textContent = formatNumber(profile.public_repos);
  followersCount.textContent = formatNumber(profile.followers);
  followingCount.textContent = formatNumber(profile.following);
  updatedDate.textContent = formatDate(profile.updated_at);

  const website = sanitizeWebsite(profile.blog);
  if (website) {
    profileWebsite.href = website;
    profileWebsite.textContent = profile.blog;
  } else {
    profileWebsite.href = profile.html_url;
    profileWebsite.textContent = "GitHub";
  }
}

function updateLanguageSummary() {
  const counts = repositories.reduce((result, repo) => {
    if (repo.language) {
      result[repo.language] = (result[repo.language] || 0) + 1;
    }

    return result;
  }, {});

  const sortedLanguages = Object.entries(counts).sort((left, right) => right[1] - left[1]);

  publicRepoBadge.textContent = `${formatNumber(repositories.length)} Public`;
  languageBadge.textContent = `${formatNumber(sortedLanguages.length)} Languages`;

  if (!sortedLanguages.length) {
    skillsList.innerHTML = "<span>No languages detected yet</span>";
    skillsCaption.textContent = "No language data";
    return;
  }

  skillsList.innerHTML = sortedLanguages
    .slice(0, 6)
    .map(([language, count]) => `<span>${language} (${count})</span>`)
    .join("");

  skillsCaption.textContent = "From public repositories";
}

async function fetchAllRepositories() {
  const allRepos = [];
  let page = 1;
  let shouldContinue = true;

  while (shouldContinue) {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&page=${page}&sort=updated`,
      {
        headers: GITHUB_HEADERS,
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub repos request failed with ${response.status}`);
    }

    const batch = await response.json();
    allRepos.push(...batch);
    shouldContinue = batch.length === 100;
    page += 1;
  }

  return allRepos
    .filter((repo) => !repo.fork)
    .sort((left, right) => new Date(right.updated_at) - new Date(left.updated_at));
}

async function fetchLocalGitHubData() {
  const response = await fetch("./github-data.json", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Local GitHub data request failed with ${response.status}`);
  }

  return response.json();
}

async function loadGitHubData() {
  try {
    const localData = await fetchLocalGitHubData();
    const profile = localData.profile;
    repositories = (localData.repositories || [])
      .filter((repo) => !repo.fork)
      .sort((left, right) => new Date(right.updated_at) - new Date(left.updated_at));

    updateProfile(profile);
    updateLanguageSummary();
    buildFilters();
    renderProjects();
  } catch (error) {
    console.error("Local GitHub data failed, trying public API.", error);

    try {
      const [profileResponse, repoData] = await Promise.all([
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
          headers: GITHUB_HEADERS,
        }),
        fetchAllRepositories(),
      ]);

      if (!profileResponse.ok) {
        throw new Error(`GitHub profile request failed with ${profileResponse.status}`);
      }

      const profile = await profileResponse.json();
      repositories = repoData;

      updateProfile(profile);
      updateLanguageSummary();
      buildFilters();
      renderProjects();
    } catch (fallbackError) {
      statusMessage.hidden = false;
      statusMessage.textContent =
        "GitHub data could not be loaded right now. Open the GitHub profile to browse repositories directly.";

      emptyState.hidden = true;
      connectButton.textContent = "Open GitHub";
      connectButton.href = `https://github.com/${GITHUB_USERNAME}?tab=repositories`;
      githubLink.href = `https://github.com/${GITHUB_USERNAME}?tab=repositories`;
      githubLink.textContent = `github.com/${GITHUB_USERNAME}?tab=repositories`;
      console.error(fallbackError);
    }
  }
}

searchInput.addEventListener("input", renderProjects);

buildFilters();
loadGitHubData();
