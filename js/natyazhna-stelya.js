function formatCeilNum(num) {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function updateCeilingPrice() {
    const type = document.getElementById('ceilingType').value;
    const priceInput = document.getElementById('priceM2');

    const defaultPrices = {
        'pvc_mat': 280,     // ПВХ мат / сатин стандарт
        'pvc_gloss': 310,   // ПВХ глянець
        'pvc_premium': 390, // Преміум MSD Evolution / безщілинна
        'fabric': 750       // Тканинна стеля (Descor / Clipso)
    };

    priceInput.value = defaultPrices[type] || 280;
    calculateCeiling();
}

function calculateCeiling() {
    const len = parseFloat(document.getElementById('roomLength').value) || 0;
    const width = parseFloat(document.getElementById('roomWidth').value) || 0;
    const corners = parseInt(document.getElementById('cornersCount').value) || 4;
    const spots = parseInt(document.getElementById('spotsCount').value) || 0;
    const chandeliers = parseInt(document.getElementById('chandelierCount').value) || 0;
    const pipes = parseInt(document.getElementById('pipesCount').value) || 0;
    const priceM2 = parseFloat(document.getElementById('priceM2').value) || 0;
    const includeInsert = document.getElementById('includeInsert').value === 'yes';

    // Площа та периметр кімнати
    const area = len * width;
    const perimeter = (len + width) * 2;

    // 1. Вартість полотна з базовим монтажем
    const canvasCost = area * priceM2;

    // 2. Стіновий профіль (багет) з монтажем (~95 грн/пог.м) + декоративна вставка (~45 грн/пог.м)
    const profileRate = includeInsert ? 140 : 95;
    const perimeterCost = perimeter * profileRate;

    // 3. Додаткові кути (перші 4 кути зазвичай входять у базу, кожен наступний ~80 грн)
    const extraCorners = Math.max(0, corners - 4);
    const cornersCost = extraCorners * 80;

    // 4. Освітлення та обхід труб (точковий світильник ~180 грн, люстра ~250 грн, обхід труби ~150 грн)
    const spotsCost = spots * 180;
    const chandelierCost = chandeliers * 250;
    const pipesCost = pipes * 150;

    // Загальна сума під ключ
    const totalCost = canvasCost + perimeterCost + cornersCost + spotsCost + chandelierCost + pipesCost;

    // Кількість планок багету (по 2.5 м) та дюбелів (крок 15-20 см)
    const profileBars = Math.ceil(perimeter / 2.5);
    const dowelsCount = Math.ceil(perimeter / 0.18);

    document.getElementById('resTotalCost').textContent = `${formatCeilNum(totalCost)} грн`;
    document.getElementById('resSubInfo').textContent = `Площа стелі: ${area.toFixed(1)} м² | Периметр: ${perimeter.toFixed(1)} пог. м`;
    document.getElementById('resCanvasCost').textContent = `${formatCeilNum(canvasCost)} грн (${area.toFixed(1)} м² × ${priceM2} грн)`;
    document.getElementById('resProfile').textContent = `${perimeter.toFixed(1)} пог. м (~${profileBars} планок по 2.5 м, ~${dowelsCount} дюбелів)`;
    document.getElementById('resPerimeterCost').textContent = `${formatCeilNum(perimeterCost)} грн (${includeInsert ? 'багет + вставка' : 'тільки багет'})`;
    document.getElementById('resExtrasCost').textContent = `${formatCeilNum(cornersCost + spotsCost + chandelierCost + pipesCost)} грн (світло, труби, кути)`;
}

function copyResults() {
    const text = `Розрахунок натяжної стелі (БудКальк):\n` +
                 `• Орієнтовна вартість під ключ: ${document.getElementById('resTotalCost').textContent}\n` +
                 `• ${document.getElementById('resSubInfo').textContent}\n` +
                 `• Полотно з монтажем: ${document.getElementById('resCanvasCost').textContent}\n` +
                 `• Стіновий профіль (багет): ${document.getElementById('resProfile').textContent}\n` +
                 `• Вартість профілю та вставки: ${document.getElementById('resPerimeterCost').textContent}\n` +
                 `• Додаткові роботи (світильники, труби, кути): ${document.getElementById('resExtrasCost').textContent}`;

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        const orig = btn.textContent;
        btn.textContent = '✅ Скопійовано!';
        setTimeout(() => btn.textContent = orig, 2000);
    });
}

window.addEventListener('DOMContentLoaded', calculateCeiling);
