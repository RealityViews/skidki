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

      // Фильтрация и обработка данных
      data = data
        .filter(row => row[0]) // Убираем строки без фамилии
        .map(row => {
          const fullName = row[0].split(".")[1]?.trim(); // Извлекаем фамилию после точки
          const discount = row[1] ? row[1] : "Размер скидки не указан"; // Если скидка пустая, заменяем текстом
          return [fullName, discount];
        });

      console.log("Обработанные данные:", data);
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

    // Поиск по частичному совпадению
    const matches = data.filter(row => row[0]?.toLowerCase().includes(input));

    if (matches.length > 0) {
      // Отображаем все совпадения
      resultDiv.innerHTML = matches
        .map(match => `Фамилия: ${match[0]}<br>Скидка: ${match[1]}<hr>`)
        .join("");
    } else {
      resultDiv.innerHTML = "Фамилия не найдена.";
    }
  };
});
