window.dishes = [];
async function loadDishes() {
  const response = await fetch(
    "https://edu.std-900.ist.mospolytech.ru/labs/api/dishes",
  );
  if (!response.ok)
    throw new Error(`Не удалось загрузить меню (${response.status})`);
  const dishes = await response.json();
  if (!Array.isArray(dishes))
    throw new Error("Сервер вернул неверный формат меню");
  return dishes.map((dish) => ({
    ...dish,
    image: dish.image.replace(/^http:/, "https:"),
  }));
}
