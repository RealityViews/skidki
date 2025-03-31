document.addEventListener("DOMContentLoaded", function () {
  let allData = [];

  // Функция для загрузки и обработки одного файла Excel
  async function loadAndProcessExcel(fileUrl, cafeName) {
    try {
      const response = await fetch(fileUrl);
      const buffer = await response.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Обработка данных в зависимости от формата файла
      return data.map(row => {
        if (cafeName === "Мельница") {
          // Формат: м0001.Еремин Михаил	20
          const rawName = row[0]?.trim();
          const id = rawName.split(".")[0]?.replace(/\D/g, ""); // Извлекаем номер
          const fullName = rawName.split(".")[1]?.trim(); // Извлекаем фамилию
          const discount = typeof row[1] === "string" ? row[1].trim() : row[1]?.toString() || "Размер скидки не указан";
          return { cafe: cafeName, id, fullName, discount };
        } else if (cafeName === "Бочка") {
          // Формат: Наименование	Код	Процент скидки
          const fullName = row[0]?.trim();
          const id = row[1]?.toString().trim(); // Преобразуем в строку, если это число

          // Проверяем, является ли значение строки string перед вызовом .trim
          const discount = typeof row[2] === "string" ? row[2].trim() : row[2]?.toString() || "Размер скидки не указан";

          return { cafe: cafeName, id, fullName, discount };
        } else if (cafeName === "Буфет") {
          // Формат: 5.007.ЧУРАКОВА ОЛЬГА ЮРЬЕВНА	20%
          const rawName = row[0]?.trim();
          const id = rawName.split(".").pop()?.replace(/\D/g, ""); // Берём всё после последней точки
          const fullName = rawName.split(".").slice(1).join(".").trim(); // Извлекаем фамилию после первой точки

          // Преобразуем значение в строку, если это число, и удаляем знак %
          const discount = typeof row[1] === "string" ? row[1].replace(/%/g, "") : row[1]?.toString() || "Размер скидки не указан";

          return { cafe: cafeName, id, fullName, discount };
        }
      });
    } catch (error) {
      console.error(`Ошибка при загрузке ${fileUrl}:`, error);
      return [];
    }
  }

  // Загрузка данных из всех файлов
  Promise.all([
    loadAndProcessExcel("dataMelnitsa.xlsx", "Мельница"),
    loadAndProcessExcel("dataBochka.xlsx", "Бочка"),
    loadAndProcessExcel("dataBufet.xlsx", "Буфет")
  ])
    .then(results => {
      allData = [].concat(...results); // Объединяем все данные
      console.log("Обработанные данные:", allData);

      // Функция поиска
      window.searchDiscount = function () {
        const input = document.getElementById("searchInput").value.trim().toLowerCase();
        const resultDiv = document.getElementById("result");

        if (!input) {
          resultDiv.innerHTML = "";
          return;
        }

        // Поиск по номеру или фамилии
        const matches = allData.filter(item =>
          item.id?.includes(input) || // Поиск по номеру
          item.fullName?.toLowerCase().includes(input) // Поиск по фамилии
        );

        if (matches.length > 0) {
          // Группируем результаты по кафе
          const groupedResults = {};
          matches.forEach(match => {
            if (!groupedResults[match.cafe]) {
              groupedResults[match.cafe] = [];
            }
            groupedResults[match.cafe].push(match);
          });

          // Отображаем результаты с группировкой по кафе
          let outputHtml = "";
          for (const cafe in groupedResults) {
            outputHtml += `
              <h3>Найдено в кафе "${cafe}":</h3>
              <ul>
                ${groupedResults[cafe]
                  .map(match => `
                    <li>
                      <strong>Фамилия:</strong> ${match.fullName}<br>
                      <strong>Скидка:</strong> ${match.discount}<br>
                      <strong>Номер:</strong> ${match.id}
                    </li>
                  `)
                  .join("")}
              </ul>
            `;
          }

          resultDiv.innerHTML = outputHtml;
        } else {
          resultDiv.innerHTML = "Ничего не найдено.";
        }
      };
    })
    .catch(error => console.error("Ошибка при загрузке данных:", error));
});
