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
        const discount = row[1] || "Размер скидки не указан";
        return { cafe: cafeName, id, fullName, discount };
      } else if (cafeName === "Бочка") {
        // Формат: Наименование	Код	Процент скидки
        const fullName = row[0]?.trim();
        const id = row[1]?.trim();
        const discount = row[2] || "Размер скидки не указан";
        return { cafe: cafeName, id, fullName, discount };
      } else if (cafeName === "Буфет") {
        // Формат: 5.007.ЧУРАКОВА ОЛЬГА ЮРЬЕВНА	20%
        const rawName = row[0]?.trim();
        const id = rawName.split(".").pop()?.replace(/\D/g, ""); // Берём всё после последней точки
        const fullName = rawName.split(".").slice(1).join(".").trim(); // Извлекаем фамилию после первой точки
        const discount = row[1]?.replace(/%/g, "") || "Размер скидки не указан"; // Удаляем % из скидки
        return { cafe: cafeName, id, fullName, discount };
      }
    });
  } catch (error) {
    console.error(`Ошибка при загрузке ${fileUrl}:`, error);
    return [];
  }
}
