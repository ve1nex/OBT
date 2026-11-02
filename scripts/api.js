const API_BASE = "https://edu.std-900.ist.mospolytech.ru/labs/api";
function readSelected() {
  try {
    const data = JSON.parse(localStorage.getItem("obt-order") || "{}");
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}
function saveSelected(value) {
  localStorage.setItem("obt-order", JSON.stringify(value));
}
async function api(path, method = "GET", data) {
  const key = sessionStorage.getItem("obt-api-key");
  if (!key) throw new Error("Введите персональный API-ключ из СДО");
  const url = new URL(API_BASE + path);
  url.searchParams.set("api_key", key);
  const options = { method };
  if (data) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(data);
  }
  const response = await fetch(url, options);
  const result = await response.json();
  if (!response.ok || result.error)
    throw new Error(result.error || `Ошибка сервера (${response.status})`);
  return result;
}
function setupKey() {
  const form = document.querySelector("#api-settings");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    sessionStorage.setItem("obt-api-key", form.elements.api_key.value.trim());
    form.reset();
    notify("API-ключ сохранён для текущей сессии браузера");
    if (typeof loadOrders === "function") loadOrders();
  });
}
