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
