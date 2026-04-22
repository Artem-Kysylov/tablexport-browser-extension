# 🔄 Изменения в позиционировании кнопок экспорта

## Проблема
Кнопки экспорта таблиц обрезались и неправильно позиционировались на всех AI платформах из-за сложного абсолютного позиционирования и конфликтов с `overflow: hidden` контейнерами.

## ✅ Новое решение

### 🎯 Встроенные кнопки
- **Старый подход**: Абсолютное позиционирование вне таблицы
- **Новый подход**: Встраивание прямоугольных кнопок **внутри таблицы**

### 📐 Дизайн кнопки
- **Форма**: Прямоугольная (как в popup расширения)
- **Размер**: 32px высота, автоширина
- **Радиус**: `border-radius: 8px` (как в popup)
- **Текст**: "Export this table" + иконка
- **Hover**: Зелёная тень `rgba(27, 147, 88, 0.6)`

### 🔧 Техническое решение

#### Для таблиц с `<thead>`
```html
<thead>
  <tr>
    <th class="tablexport-bridge-button-cell">
      <button class="tablexport-bridge-btn">
        <svg>...</svg>
        <span>Export this table</span>
      </button>
    </th>
    <!-- остальные заголовки -->
  </tr>
</thead>
```

#### Для таблиц без `<thead>`
```html
<tr>
  <td>
    <div class="tablexport-bridge-button-wrapper">
      <button class="tablexport-bridge-btn">...</button>
      <div><!-- исходный контент ячейки --></div>
    </div>
  </td>
</tr>
```

### 🎨 Обновлённые стили
```css
.tablexport-bridge-btn {
  display: inline-flex !important;
  gap: 6px !important;
  height: 32px !important;
  padding: 0 12px !important;
  border-radius: 8px !important;
  font-size: 13px !important;
  font-weight: 600 !important;
}

.tablexport-bridge-global-batch-btn {
  border-radius: 8px !important; /* обновлено с 24px */
}
```

## 🧪 Тестирование
1. Соберите расширение: `npm run build`
2. Загрузите `.output/chrome-mv3/` в Chrome
3. Откройте `test-button-position.html`
4. Проверьте все 4 стиля AI чатов

## ✨ Преимущества нового подхода
- ✅ **Надёжность**: Кнопка всегда видна, не обрезается
- ✅ **Простота**: Нет сложного позиционирования
- ✅ **Консистентность**: Единый дизайн со всем расширением
- ✅ **Доступность**: Встроена в структуру таблицы
- ✅ **Кроссплатформенность**: Работает одинаково везде

## 🎯 Результат
Кнопки экспорта теперь надёжно встраиваются во все таблицы на ChatGPT, Claude, Gemini и DeepSeek без проблем с обрезанием или позиционированием.