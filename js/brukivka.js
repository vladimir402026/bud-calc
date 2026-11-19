function formatBrukNum(num) {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function updateBrukPrice() {
    const type = document.getElementById('pavingType').value;
    const priceInput = document.getElementById('tilePrice');

    const defaultPrices = {
        'brick_40': 420,
        'brick_60': 510,
        'old_city_40': 440,
        'old_city_60': 530,
        'square_300': 460
    };

    priceInput.value = defaultPrices[type] || 450;
    calculatePaving();
}

function calculatePaving() {
    const area = parseFloat(document.getElementById('pavingArea').value) || 0;
    const borderLen = parseFloat(document.getElementById('borderLength').value) || 0;
    const baseType = document.getElementById('baseType').value;
    const priceM2 = parseFloat(document.getElementById('tilePrice').value) || 0;
    const reserve = parseFloat(document.getElementById('reserve').value) || 0;

    // Площа бруківки з урахуванням запасу на підрізку
    const totalArea = area * (1 + reserve / 100);

    // Поребрик / тротуарний бордюр (довжина 1 м або 0.5 м — рахуємо в метрах і штуках по 1 м + 5% запас)
    const totalBorderM = borderLen * 1.05;
    const borderPieces1m = Math.ceil(totalBorderM);
    const borderPieces05m = Math.ceil(totalBorderM / 0.5);

    // Підсипка та основа (залежить від навантаження: пішохідна зона чи авто)
    const gravelThicknessM = baseType === 'car' ? 0.15 : 0.10; // 15 см під авто або 10 см під доріжку
    const sandBeddingM = 0.05; // 5 см гарцівки (цементно-піщана суміш 1:5)

    // Щебінь (з коефіцієнтом ущільнення 1.25)
    const gravelM3 = area * gravelThicknessM * 1.25;
    const gravelTons = gravelM3 * 1.4;

    // Пісок + цемент для гарцівки (шар 5 см + установка бордюрів)
    const beddingM3 = area * sandBeddingM * 1.15;
    const sandTons = beddingM3 * 1.5;
    // На 1 м³ гарцівки (1:5) йде ~220 кг цементу М400 + ~15 кг на кожні 10 м бордюру
    const cementKg = (beddingM3 * 220) + (borderLen * 1.5);
    const cementBags25 = Math.ceil(cementKg / 25);

    // Кварцовий пісок для заповнення швів (~4 кг на 1 м²)
    const jointSandKg = Math.ceil(area * 4);

    // Вартість бруківки
    const tileCost = totalArea * priceM2;

    document.getElementById('resTotalArea').textContent = `${totalArea.toFixed(1)} м²`;
    document.getElementById('resSubInfo').textContent = `Чиста площа: ${area.toFixed(1)} м² | Запас: ${reserve}% (+${(totalArea - area).toFixed(1)} м²)`;
    document.getElementById('resBorders').textContent = `${borderPieces1m} шт. по 1 м (або ${borderPieces05m} шт. по 0.5 м)`;
    document.getElementById('resGravel').textContent = `${gravelTons.toFixed(2)} т (~${gravelM3.toFixed(2)} м³)`;
    document.getElementById('resSand').textContent = `${sandTons.toFixed(2)} т (~${beddingM3.toFixed(2)} м³) + ${jointSandKg} кг для швів`;
    document.getElementById('resCement').textContent = `${formatBrukNum(cementKg)} кг (${cementBags25} мішків по 25 кг)`;
    document.getElementById('resCost').textContent = `${formatBrukNum(tileCost)} грн`;
}

function copyResults() {
    const text = `Розрахунок тротуарної плитки / бруківки (БудКальк):\n` +
                 `• Площа бруківки (із запасом): ${document.getElementById('resTotalArea').textContent}\n` +
                 `• ${document.getElementById('resSubInfo').textContent}\n` +
                 `• Тротуарний бордюр (поребрик): ${document.getElementById('resBorders').textContent}\n` +
                 `• Щебінь для основи: ${document.getElementById('resGravel').textContent}\n` +
                 `• Пісок (гарцівка + шви): ${document.getElementById('resSand').textContent}\n` +
                 `• Цемент (М400): ${document.getElementById('resCement').textContent}\n` +
                 `• Орієнтовна вартість плитки: ${document.getElementById('resCost').textContent}`;

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        const orig = btn.textContent;
        btn.textContent = '✅ Скопійовано!';
        setTimeout(() => btn.textContent = orig, 2000);
    });
}

window.addEventListener('DOMContentLoaded', calculatePaving);
