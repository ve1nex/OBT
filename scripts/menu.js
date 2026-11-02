/* The data and rendering scripts are deliberately separate (lab 4). */
const categories = [
  ["soup", "Выберите суп"],
  ["main-course", "Выберите главное блюдо"],
  ["salad", "Выберите салат или стартер"],
  ["drink", "Выберите напиток"],
  ["dessert", "Выберите десерт"],
];
let selected = {};
const filters = {};
function make(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function dishId(dish) {
  return dish.id ?? dish.keyword;
}
function money(value) {
  return `${value} ₽`;
}
function renderCard(dish) {
  const card = make("div", undefined, "dish");
  card.dataset.dish = dish.keyword;
  card.classList.toggle("selected", selected[dish.category] === dishId(dish));
  const image = make("img");
  image.src = dish.image;
  image.alt = dish.name;
  image.width = 360;
  image.height = 360;
  const button = make("button", "Добавить");
  button.type = "button";
  button.setAttribute(
    "aria-pressed",
    String(selected[dish.category] === dishId(dish)),
  );
  button.addEventListener("click", () => {
    const item = window.dishes.find(
      (entry) => entry.keyword === card.dataset.dish,
    );
    selected[item.category] = dishId(item);
    renderMenu();
    renderSummary();
  });
  card.append(
    image,
    make("p", money(dish.price), "price"),
    make("p", dish.name, "dish-name"),
    make("p", dish.count, "weight"),
    button,
  );
  return card;
}
function renderMenu() {
  const root = document.querySelector("#menu");
  if (!root) return;
  root.replaceChildren();
  for (const [category, title] of categories) {
    const dishes = window.dishes.filter((dish) => dish.category === category);
    if (!dishes.length) continue;
    const section = make("section");
    section.append(make("h2", title));
    if (window.enableFilters) section.append(renderFilters(category));
    const grid = make("div", undefined, "dishes");
    dishes
      .filter((dish) => !filters[category] || dish.kind === filters[category])
      .sort((a, b) => a.name.localeCompare(b.name, "ru"))
      .forEach((dish) => grid.append(renderCard(dish)));
    section.append(grid);
    root.append(section);
  }
}
function chosen() {
  return window.dishes.filter(
    (dish) => selected[dish.category] === dishId(dish),
  );
}
function renderSummary() {
  const root = document.querySelector("#order-summary");
  if (!root) return;
  root.replaceChildren();
  const items = chosen();
  if (!items.length) {
    root.textContent = "Ничего не выбрано";
    return;
  }
  for (const [category, title] of categories) {
    if (!window.dishes.some((dish) => dish.category === category)) continue;
    const dish = items.find((item) => item.category === category);
    root.append(make("h3", title.replace("Выберите ", "")));
    root.append(
      make(
        "p",
        dish
          ? `${dish.name} — ${money(dish.price)}`
          : category === "drink"
            ? "Напиток не выбран"
            : "Блюдо не выбрано",
      ),
    );
    if (dish) {
      const hidden = make("input");
      hidden.type = "hidden";
      hidden.name = category;
      hidden.value = dish.keyword;
      root.append(hidden);
    }
  }
  root.append(
    make("h3", "Стоимость заказа"),
    make("p", money(items.reduce((sum, dish) => sum + dish.price, 0))),
  );
}
function setupForm() {
  const form = document.querySelector("#order-form");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    const error = comboError(chosen());
    if (error) {
      event.preventDefault();
      notify(error);
    }
  });
  form.addEventListener("reset", () => {
    selected = {};
    setTimeout(() => {
      form.querySelectorAll("input, textarea").forEach((input) => {
        if (input.type === "checkbox" || input.type === "radio")
          input.checked = false;
        else input.value = "";
      });
      renderMenu();
      renderSummary();
    }, 0);
  });
}
async function start() {
  renderCombos();
  setupForm();
  const root = document.querySelector("#menu");
  if (root) root.textContent = "Загружаем меню…";
  try {
    window.dishes = await loadDishes();
    renderMenu();
    renderSummary();
  } catch (error) {
    if (root) {
      root.replaceChildren(make("p", error.message));
      const retry = make("button", "Повторить загрузку");
      retry.type = "button";
      retry.addEventListener("click", start);
      root.append(retry);
    }
    notify(error.message);
  }
}
start();
