window.enableFilters = true;
function renderFilters(category) {
  const kinds =
    category === "drink"
      ? [
          ["cold", "холодный"],
          ["hot", "горячий"],
        ]
      : category === "dessert"
        ? [
            ["small", "маленькая порция"],
            ["medium", "средняя порция"],
            ["large", "большая порция"],
          ]
        : category === "main-course"
          ? [
              ["fish", "рыбное"],
              ["meat", "мясное"],
              ["veg", "вегетарианское"],
            ]
          : [
              ["fish", "рыбный"],
              ["meat", "мясной"],
              ["veg", "вегетарианский"],
            ];
  const root = make("div", undefined, "filters");
  for (const [kind, label] of kinds) {
    const button = make("button", label);
    button.type = "button";
    button.dataset.kind = kind;
    button.classList.toggle("active", filters[category] === kind);
    button.setAttribute("aria-pressed", String(filters[category] === kind));
    button.addEventListener("click", () => {
      filters[category] =
        filters[category] === button.dataset.kind ? null : button.dataset.kind;
      renderMenu();
    });
    root.append(button);
  }
  return root;
}
