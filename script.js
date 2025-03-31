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
          const rawName = row[0].trim(); // Исходная строка (например, "м0001.Еремин Михаил")
          const fullName = rawName.split(".")[1]?.trim(); // Извлекаем фамилию после точки
          const discount = row[1] ? row[1] : "Размер скидки не указан"; // Если скидка пустая, заменяем текстом
          const id = rawName.match(/\d+/)?.[0] || ""; // Извлекаем номер
          return { id, fullName, discount };
        });

      console.log("Обработанные данные:", data);
    })
    .catch((error) => console.error("Ошибка при загрузке Excel:", error));

  // Функция поиска
  window.searchDiscount = function () {
    const input = document.getElementById("searchInput").value.trim();
    const resultDiv = document.getElementById("result");

    if (!input) {
      resultDiv.innerHTML = "";
      return;
    }

    // Поиск по фамилии или номеру
    const matches = data.filter(item => 
      item.fullName?.toLowerCase().includes(input.toLowerCase()) || // Поиск по фамилии
      item.id === input                                            // Поиск по номеру
    );

    if (matches.length > 0) {
      // Отображаем все совпадения
      resultDiv.innerHTML = matches
        .map(match => `Фамилия: ${match.fullName}<br>Скидка: ${match.discount}<hr>`)
        .join("");
    } else {
      resultDiv.innerHTML = "Ничего не найдено.";
    }
  };
});
