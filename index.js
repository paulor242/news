
const API_KEY = "Wfnmj85wAfSOAytM3HkZGgySFpGnxV8VYHbVHfBm";
const BASE_URL = "https://api.thenewsapi.com/v1";


async function cargarNoticias() {
    
    // --- 1. OBTENER VALORES DEL FORMULARIO ---
    const endpoint = document.getElementById("endpoint").value;
    const query = document.getElementById("query").value.trim();
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;
    const errorDiv = document.getElementById("error");
    const resultsDiv = document.getElementById("results");


    // --- 2. VALIDACIONES INICIALES ---
    
    // Verificar que el usuario haya seleccionado un tipo de consulta
    if (!endpoint) {
        errorDiv.textContent = "Selecciona un tipo de consulta.";
        errorDiv.style.display = "block";
        return; // Detener ejecución si no hay endpoint
    }

    // Ocultar mensaje de error previo y mostrar indicador de carga
    errorDiv.style.display = "none";
    resultsDiv.innerHTML = "<p>Cargando noticias de salud en España...</p>";

    // Verificar conexión a internet del navegador
    if (!navigator.onLine) {
        errorDiv.textContent = "No tienes conexión a internet.";
        errorDiv.style.display = "block";
        return;
    }


    // --- 3. CONSTRUCCIÓN DE LA PETICIÓN ---
    
    try {
        const params = new URLSearchParams({
            api_token: API_KEY,      
            categories: "health",       
            countries: "es",          
            language: "es",            
        });

        // Añadir parámetros opcionales solo si el usuario los proporcionó
        if (query) params.append("search", query);           
        if (fromDate) params.append("published_after", fromDate);  
        if (toDate) params.append("published_before", toDate);       

        
        // --- 4. SELECCIÓN DEL ENDPOINT ---
        
        let url = ""; 

        // Estructura switch para determinar qué endpoint de la API usar
        switch (endpoint) {
            
            case "headlines":
                url = `${BASE_URL}/news/top?${params.toString()}`;
                break;

            case "all":
                url = `${BASE_URL}/news/all?${params.toString()}`;
                break;

            case "latest":
                url = `${BASE_URL}/news/latest?${params.toString()}`;
                break;

            case "search":
                if (!query) {
                    throw new Error("Debes escribir algo en búsqueda.");
                }
                url = `${BASE_URL}/news/all?${params.toString()}`;
                break;

            case "world":
                url = `${BASE_URL}/news/top?${params.toString()}`;
                break;

            case "live":
                // Noticias en tiempo real (requiere palabra clave)
                if (!query) {
                    throw new Error("Debes escribir una palabra clave.");
                }
                url = `${BASE_URL}/news/live?${params.toString()}`;
                break;

            default:
                // Manejar caso de endpoint no reconocido
                throw new Error("Endpoint no válido.");
        }


        // --- 5. PETICIÓN A LA API ---
        
        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `Error HTTP ${response.status}`);
        }

        // Convertir la respuesta JSON a objeto JavaScript
        const data = await response.json();

        // Verificar que existan resultados
        if (!data.data || data.data.length === 0) {
            throw new Error("No se encontraron noticias.");
        }


        // --- 6. GENERACIÓN DEL HTML DE RESULTADOS ---
        
        let html = ""; 

        data.data.forEach(article => {
            
            // Imagen por defecto si la noticia no tiene imagen o falla al cargar
            const fallbackImg = "https://via.placeholder.com/300x200?text=Salud+España";

            const img = article.image_url
                ? `<img src="${article.image_url}" onerror="this.src='${fallbackImg}'">`
                : `<div class="no-img">Sin imagen</div>`;

            // Construir la tarjeta (card) de la noticia
            html += `
                <div class="card">
                    ${img}
                    <div class="card-content">
                        <!-- Título de la noticia o mensaje por defecto -->
                        <h3>${article.title || "Sin título"}</h3>
                        
                        <!-- Descripción truncada a 120 caracteres -->
                        <p>${(article.description || "Sin descripción").substring(0, 120)}...</p>
                        
                        <!-- Metadatos: fuente y fecha de publicación -->
                        <small>
                            ${article.source || "Fuente desconocida"} | 
                            ${new Date(article.published_at).toLocaleDateString()}
                        </small>
                        <br>
                        
                        <!-- Enlace para leer la noticia completa (abre en nueva pestaña) -->
                        <a href="${article.url}" target="_blank">Leer más</a>
                    </div>
                </div>
            `;
        });

        // Insertar el HTML generado en el contenedor de resultados
        resultsDiv.innerHTML = html;


    // --- 7. MANEJO DE ERRORES ---
    
    } catch (error) {

        console.error(error);

        errorDiv.textContent = error.message;
        errorDiv.style.display = "block";

        resultsDiv.innerHTML = "";
    }
}