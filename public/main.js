console.log("running ...");

document.querySelectorAll("[data-input-update]").forEach((element) => {
  element.addEventListener("click", (e) => {
    const clicked = e.target;
    const updateId = clicked.getAttribute("data-input-update");
    const updateElement = document.getElementById(updateId);
    if (!updateElement.value.includes(clicked.innerText)) {
      updateElement.value = `${updateElement.value} ${clicked.innerText}`;
    }
  });
});

document.querySelectorAll("[data-input-replace]").forEach((element) => {
  element.addEventListener("click", (e) => {
    const clicked = e.target;
    const updateId = clicked.getAttribute("data-input-replace");
    const updateElement = document.getElementById(updateId);
    updateElement.value = clicked.innerText;
  });
});
