		

$( document ).ready(function() {
		document.querySelectorAll(".custom-select").forEach(function (select) {
		  const selected = select.querySelector(".select-selected");
		  const items = select.querySelector(".select-items");

		  selected.addEventListener("click", function () {
		    items.classList.toggle("select-hide");
		  });

		  items.querySelectorAll("div").forEach(function (item) {
		    item.addEventListener("click", function () {
		      selected.textContent = this.textContent;
		      items.classList.add("select-hide");
		    });
		  });

		  // Закрытие при клике вне селекта
		  document.addEventListener("click", function (e) {
		    if (!select.contains(e.target)) {
		      items.classList.add("select-hide");
		    }
		  });
		});
});