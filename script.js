document.addEventListener("DOMContentLoaded", function () {
  let data = [];

  // Загрузка данных из Excel
  fetch("data.xlsx")
    .then((response) => response.arrayBuffer())
    .then((buffer) => {
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      console.log("Данные загружены:", data);
    })
    .catch((error) => console.error("Ошибка при загрузке Excel:", error));

  // Функция поиска
  window.searchDiscount = function () {
    const input = document.getElementById("searchInput").value.trim().toLowerCase();
    const resultDiv = document.getElementById("result");

    if (!input) {
      resultDiv.innerHTML = "";
      return;
    }

    const match = data.find((row) => row[0].toLowerCase() === input);

    if (match) {
      resultDiv.innerHTML = `Фамилия: ${match[0]}<br>Скидка: ${match[1]}`;
    } else {
      resultDiv.innerHTML = "Фамилия не найдена.";
    }
  };
});
