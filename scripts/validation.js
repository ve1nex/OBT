function comboError(items) {
  const has = (category) => items.some((dish) => dish.category === category);
  if (!items.length) return "Ничего не выбрано. Выберите блюда для заказа";
  if (has("soup") && !has("main-course") && !has("salad"))
    return "Выберите главное блюдо/салат/стартер";
  if (has("salad") && !has("soup") && !has("main-course"))
    return "Выберите суп или главное блюдо";
  if (!has("soup") && !has("main-course") && !has("salad"))
    return "Выберите главное блюдо";
  if (!has("drink")) return "Выберите напиток";
  return "";
}
function notify(message) {
  const dialog = document.createElement("dialog");
  const text = document.createElement("p");
  text.textContent = message;
  const button = document.createElement("button");
  button.textContent = "Окей";
  button.type = "button";
  dialog.setAttribute("aria-label", "Уведомление");
  button.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => dialog.remove());
  dialog.append(text, button);
  document.body.append(dialog);
  dialog.showModal();
}
function renderCombos() {
  const root = document.querySelector("#combos");
  if (!root) return;
  root.replaceChildren();
  const names = {
    soup: "Суп",
    main: "Главное блюдо",
    salad: "Салат",
    drink: "Напиток",
    desert: "Десерт",
  };
  const grid = make("div", undefined, "combos");
  for (const combo of [
    ["soup", "main", "salad", "drink"],
    ["soup", "main", "drink"],
    ["soup", "salad", "drink"],
    ["main", "salad", "drink"],
    ["main", "drink"],
  ]) {
    const variant = make("div", undefined, "combo");
    for (const category of combo) {
      const item = make("div", undefined, "combo-item");
      const image = make("img");
      image.src = `assets/icons/${category}.png`;
      image.alt = "";
      image.width = 60;
      image.height = 60;
      item.append(image, make("span", names[category]));
      variant.append(item);
    }
    grid.append(variant);
  }
  const dessert = make("div", undefined, "combo-item dessert-info");
  const image = make("img");
  image.src = "assets/icons/desert.png";
  image.alt = "";
  image.width = 60;
  image.height = 60;
  dessert.append(
    image,
    make("span", "Десерт"),
    make("small", "Можно добавить к любому ланчу"),
  );
  root.append(make("h2", "Доступные для заказа варианты ланча"), grid, dessert);
}
