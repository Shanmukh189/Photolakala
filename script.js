
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const statusMessage = document.querySelector("#status");
const resultsContainer = document.querySelector("#results");

const API_URL = "https://commons.wikimedia.org/w/api.php";

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = searchInput.value.trim();

  if (!query) {
    statusMessage.textContent = "Please enter a search term.";
    return;
  }

  // Show loading state immediately
  statusMessage.textContent = "Finding photos...";
  resultsContainer.innerHTML = "";

  try {
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: query,
      gsrnamespace: "6",
      gsrlimit: "12",
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: "400",
      format: "json",
      origin: "*"
    });

    const response = await fetch(`${API_URL}?${params}`);

    if (!response.ok) {
      throw new Error("The image service is unavailable.");
    }

    const data = await response.json();
    const pages = Object.values(data.query?.pages || {});

    if (pages.length === 0) {
      statusMessage.textContent = `No photos found for "${query}". Try another word.`;
      return;
    }

    // Create image cards
    const fragment = document.createDocumentFragment();

    pages.forEach((page) => {
      const imageInfo = page.imageinfo?.[0];
      const imageUrl = imageInfo?.thumburl || imageInfo?.url;

      if (!imageUrl) return;

      const card = document.createElement("article");
      card.className = "result-card";

      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = page.title.replace(/^File:/, "");
      img.loading = "lazy";
      img.decoding = "async";

      const caption = document.createElement("p");
      caption.textContent = page.title.replace(/^File:/, "");

      card.append(img, caption);
      fragment.appendChild(card);
    });

    resultsContainer.appendChild(fragment);

    statusMessage.textContent =
      `Showing ${resultsContainer.children.length} results for "${query}".`;

    if (resultsContainer.children.length === 0) {
      statusMessage.textContent = "No usable images found. Try another search.";
    }
  } catch (error) {
    console.error("PhotoLakala error:", error);
    statusMessage.textContent =
      "Could not load photos. Check your internet connection and try again.";
  }
});
