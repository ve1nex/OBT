let orders = [];
function orderDishes(order) {
  return ["soup_id", "main_course_id", "salad_id", "drink_id", "dessert_id"]
    .map((key) => window.dishes.find((dish) => dish.id === order[key]))
    .filter(Boolean);
}
function orderTotal(order) {
  return orderDishes(order).reduce((sum, dish) => sum + dish.price, 0);
}
function deliveryText(order) {
  return order.delivery_type === "by_time"
    ? order.delivery_time.slice(0, 5)
    : "Как можно скорее (с 7:00 до 23:00)";
}
async function loadOrders() {
  const root = document.querySelector("#orders");
  root.textContent = "Загружаем заказы…";
  try {
    orders = await api("/orders");
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    renderOrders();
  } catch (error) {
    root.textContent = error.message;
  }
}
function renderOrders() {
  const root = document.querySelector("#orders");
  root.replaceChildren();
  if (!orders.length) {
    root.append(make("p", "У вас пока нет заказов"));
    return;
  }
  const table = make("table");
  const head = make("thead");
  const heading = make("tr");
  [
    "№",
    "Дата оформления",
    "Состав",
    "Стоимость",
    "Время доставки",
    "Действия",
  ].forEach((title) => {
    const th = make("th", title);
    th.scope = "col";
    heading.append(th);
  });
  head.append(heading);
  table.append(head);
  const body = make("tbody");
  orders.forEach((order, index) => {
    const row = make("tr");
    [
      index + 1,
      new Date(order.created_at).toLocaleString("ru-RU"),
      orderDishes(order)
        .map((dish) => dish.name)
        .join(", "),
      money(orderTotal(order)),
      deliveryText(order),
    ].forEach((value) => row.append(make("td", value)));
    const actions = make("td");
    for (const [mode, label] of [
      ["view", "Подробнее"],
      ["edit", "Редактирование"],
      ["delete", "Удаление"],
    ]) {
      const button = make("button", label);
      button.type = "button";
      button.addEventListener("click", () => openOrder(order, mode));
      actions.append(button);
    }
    row.append(actions);
    body.append(row);
  });
  table.append(body);
  root.append(table);
}
function openOrder(order, mode) {
  const dialog = make("dialog");
  dialog.className = "order-dialog";
  const title = make(
    "h2",
    mode === "view"
      ? "Просмотр заказа"
      : mode === "edit"
        ? "Редактирование заказа"
        : "Удаление заказа",
  );
  title.id = "dialog-title";
  dialog.setAttribute("aria-labelledby", title.id);
  const close = make("button", "×", "dialog-close");
  close.type = "button";
  close.setAttribute("aria-label", "Закрыть");
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => dialog.remove());
  dialog.append(close, title);
  const controls = make("div", undefined, "actions");
  const cancel = make("button", mode === "view" ? "Ок" : "Отмена");
  cancel.type = "button";
  cancel.addEventListener("click", () => dialog.close());
  if (mode === "view") {
    const labels = {
      full_name: "Имя",
      email: "Email",
      phone: "Телефон",
      delivery_address: "Адрес",
      comment: "Комментарий",
    };
    dialog.append(
      make(
        "p",
        `Заказ №${order.id} · ${new Date(order.created_at).toLocaleString("ru-RU")}`,
      ),
    );
    for (const [key, label] of Object.entries(labels))
      dialog.append(make("p", `${label}: ${order[key] || "—"}`));
    dialog.append(make("p", `Время доставки: ${deliveryText(order)}`));
    orderDishes(order).forEach((dish) =>
      dialog.append(make("p", `${dish.name} — ${money(dish.price)}`)),
    );
    dialog.append(make("p", `Стоимость: ${money(orderTotal(order))}`));
  } else if (mode === "delete") {
    dialog.append(make("p", "Вы уверены, что хотите удалить заказ?"));
    const yes = make("button", "Да");
    yes.type = "button";
    yes.addEventListener("click", async () => {
      yes.disabled = true;
      try {
        await api(`/orders/${order.id}`, "DELETE");
        orders = orders.filter((item) => item.id !== order.id);
        renderOrders();
        dialog.close();
        notify("Заказ успешно удалён");
      } catch (error) {
        notify(error.message);
        yes.disabled = false;
      }
    });
    controls.append(yes);
  } else {
    const form = make("form");
    form.id = "edit-order";
    for (const [key, label, type] of [
      ["full_name", "Имя", "text"],
      ["email", "Email", "email"],
      ["phone", "Телефон", "tel"],
      ["delivery_address", "Адрес доставки", "text"],
      ["delivery_type", "Тип доставки", "select"],
      ["delivery_time", "Время доставки", "time"],
      ["comment", "Комментарий", "textarea"],
    ]) {
      const labelNode = make("label", label);
      labelNode.htmlFor = `edit-${key}`;
      const input = make(
        type === "textarea"
          ? "textarea"
          : type === "select"
            ? "select"
            : "input",
      );
      if (type !== "textarea" && type !== "select") input.type = type;
      if (type === "select")
        for (const [value, text] of [
          ["now", "Как можно скорее"],
          ["by_time", "К указанному времени"],
        ]) {
          const option = make("option", text);
          option.value = value;
          input.append(option);
        }
      input.id = `edit-${key}`;
      input.name = key;
      input.value = order[key] || "";
      input.required = !["comment", "delivery_time"].includes(key);
      if (type === "time") {
        input.min = "07:00";
        input.max = "23:00";
        input.step = "300";
      }
      form.append(labelNode, input);
    }
    const save = make("button", "Сохранить");
    save.type = "submit";
    controls.append(save);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const error = deliveryError(form);
      if (error) {
        notify(error);
        return;
      }
      if (!form.reportValidity()) return;
      const payload = Object.fromEntries(new FormData(form));
      if (payload.delivery_type === "now") payload.delivery_time = null;
      save.disabled = true;
      try {
        const updated = await api(`/orders/${order.id}`, "PUT", payload);
        orders = orders.map((item) => (item.id === order.id ? updated : item));
        renderOrders();
        dialog.close();
        notify("Заказ успешно изменён");
      } catch (error) {
        notify(error.message);
        save.disabled = false;
      }
    });
    controls.append(cancel);
    form.append(controls);
    dialog.append(form);
  }
  if (mode !== "edit") {
    controls.append(cancel);
    dialog.append(controls);
  }
  document.body.append(dialog);
  dialog.showModal();
}
async function startOrders() {
  setupKey();
  try {
    window.dishes = await loadDishes();
    await loadOrders();
  } catch (error) {
    document.querySelector("#orders").textContent = error.message;
  }
}
startOrders();
