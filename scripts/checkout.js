function renderCheckout() {
  const root = document.querySelector("#checkout-dishes");
  if (!root) return;
  root.replaceChildren();
  if (!chosen().length) {
    const text = make(
      "p",
      "Ничего не выбрано. Чтобы добавить блюда в заказ, перейдите на страницу ",
    );
    const link = make("a", "Собрать ланч");
    link.href = "lunch.html";
    text.append(link, ".");
    root.append(text);
    return;
  }
  const grid = make("div", undefined, "dishes");
  chosen().forEach((dish) => {
    const card = renderCard(dish);
    const old = card.querySelector("button");
    const button = make("button", "Удалить");
    button.type = "button";
    button.addEventListener("click", () => {
      delete selected[dish.category];
      saveSelected(selected);
      renderCheckout();
      renderSummary();
    });
    old.replaceWith(button);
    grid.append(card);
  });
  root.append(grid);
}
function renderPanel() {
  const panel = document.querySelector("#checkout-panel");
  if (!panel) return;
  panel.hidden = chosen().length === 0;
  document.querySelector("#panel-total").textContent = money(
    chosen().reduce((sum, dish) => sum + dish.price, 0),
  );
  const link = panel.querySelector("a");
  const disabled = Boolean(comboError(chosen()));
  link.setAttribute("aria-disabled", String(disabled));
  if (disabled) link.removeAttribute("href");
  else link.href = "checkout.html";
}
function deliveryError(form) {
  const time = form.elements.delivery_time;
  time.required = form.elements.delivery_type.value === "by_time";
  time.setCustomValidity("");
  if (!time.required) return "";
  const now = new Date();
  if (!time.value) return "Укажите время доставки";
  const [hours, minutes] = time.value.split(":").map(Number);
  if (hours * 60 + minutes <= now.getHours() * 60 + now.getMinutes())
    return "Время доставки должно быть позже текущего";
  return "";
}
async function submitOrder(form) {
  const error = comboError(chosen()) || deliveryError(form);
  if (error) {
    notify(error);
    return;
  }
  if (!form.reportValidity()) return;
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  const fields = new FormData(form);
  const payload = Object.fromEntries(
    [
      "full_name",
      "email",
      "phone",
      "delivery_address",
      "delivery_type",
      "comment",
    ].map((key) => [key, fields.get(key)]),
  );
  payload.subscribe = fields.has("subscribe") ? 1 : 0;
  if (payload.delivery_type === "by_time")
    payload.delivery_time = fields.get("delivery_time");
  const names = {
    soup: "soup_id",
    "main-course": "main_course_id",
    salad: "salad_id",
    drink: "drink_id",
    dessert: "dessert_id",
  };
  chosen().forEach((dish) => {
    payload[names[dish.category]] = dish.id;
  });
  try {
    await api("/orders", "POST", payload);
    localStorage.removeItem("obt-order");
    selected = {};
    form.reset();
    renderCheckout();
    renderSummary();
    notify("Заказ успешно оформлен");
  } catch (error) {
    notify(error.message);
  } finally {
    button.disabled = false;
  }
}
