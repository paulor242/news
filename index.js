// PWA Offline support
function checkOnlineStatus() {
  const errorDiv = document.getElementById("error");
  if (!navigator.onLine) {
    errorDiv.textContent = "Modo offline activado. Usando caché donde posible.";
    errorDiv.style.display = "block";
    return false;
  }
  return true;
}

window.addEventListener("online", () => location.reload());
window.addEventListener("offline", () => {
  checkOnlineStatus();
});

const API_KEY = "Wfnmj85wAfSOAytM3HkZGgySFpGnxV8VYHbVHfBm";
const BASE_URL = "https://api.thenewsapi.com/v1";

async function cargarNoticias() {
  if (!checkOnlineStatus()) return;

  const endpoint = document.getElementById("endpoint").value;
  const query = document.getElementById("query").value.trim();
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;
  const errorDiv = document.getElementById("error");
  const resultsDiv = document.getElementById("results");
  errorDiv.style.display = "none";
  resultsDiv.innerHTML = "<p>Cargando...</p>";
  try {
    let url = `${BASE_URL}${getEndpointPath(endpoint)}`;
    const params = new URLSearchParams({
      api_token: API_KEY,
      category: "health",
      country: "es",
      language: "es",
    });
    if (query) params.append("search", query);
    if (fromDate) params.append("from_date", fromDate);
    if (toDate) params.append("to_date", toDate);
    url += `?${params.toString()}`;
    // Petición Fetch con headers
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(
        `Error HTTP: ${response.status} - ${response.statusText}`,
      );
    }
    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      throw new Error("No se encontraron noticias. Intenta otros parámetros.");
    }

    let html = "";
    data.data.slice(0, 12).forEach((article) => {
      const img = article.image_url
        ? `<img src="${article.image_url}" alt="${article.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Imagen'">`
        : '<div style="height:200px;background:#eee;display:flex;align-items:center;justify-content:center;color:#999;">Sin imagen</div>';
      html += `
              <div class="card">
                  ${img}
                  <div class="card-content">
                      <h3>${article.title || "Sin título"}</h3>
                      <p>${(article.description || "").substring(0, 150)}...</p>
                      <p><strong>Fuente:</strong> ${article.source || "N/A"} | ${new Date(article.published_at).toLocaleDateString("es-ES")}</p>
                      <a href="${article.link || "#"}" target="_blank">Leer más</a>
                  </div>
              </div>
          `;
    });
    resultsDiv.innerHTML = html;
  } catch (error) {
    console.error("Error:", error);
    errorDiv.textContent = `Error: ${error.message}. Verifica conexión/API key/params.`;
    errorDiv.style.display = "block";
    resultsDiv.innerHTML = "";
  }
}

function getEndpointPath(endpoint) {
  const paths = {
    top: "/news/Health/top",
    all: "/news/all",
    latest: "/news/latest",
    search: "/news/search",
    world: "/top/world",
    live: "/keyword/health/news/live",
  };
  return paths[endpoint] || "/news/top";
}
