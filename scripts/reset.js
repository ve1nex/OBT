document.querySelector("#order-form").addEventListener("reset", () => {
  setTimeout(() => {
    document.querySelectorAll("#order-form input, #order-form select, #order-form textarea").forEach((field) => {
      if (field.type === "checkbox" || field.type === "radio") field.checked = false;
      else field.value = "";
    });
  }, 0);
});
