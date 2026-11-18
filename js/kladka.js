function formatNum(num) {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function updateMaterialDefaults() {
    const mat = document.getElementById('blockType').value;
    const jointInput = document.getElementById('jointThickness');
    const priceInput = document.getElementById('blockPrice');
    const priceLabel = document.getElementById('priceLabel');

    if (mat.startsWith('gas')) {
        jointInput.value = 3;
        priceInput.value = 3400;
        priceLabel.textContent = 'Ціна за 1 м³ газоблоку (грн)';
    } else if (mat === 'slag') {
        jointInput.value = 10;
        priceInput.value = 45;
        priceLabel.textContent = 'Ціна за 1 шлакоблок (грн)';
    } else {
        jointInput.value = 10;
        priceInput.value = 9.5;
        priceLabel.textContent = 'Ціна за 1 цеглину (грн)';
    }
    calculateMasonry();
}

function calculateMasonry() {
    const mat = document.getElementById('blockType').value;
    const perimeter = parseFloat(document.getElementById('wallPerimeter').value) || 0;
    const height = parseFloat(document.getElementById('wallHeight').value) || 0;
    const openingsArea = parseFloat(document.getElementById('openingsArea').value) || 0;
    const jointMm = parseFloat(document.getElementById('jointThickness').value) || 0;
    const price = parseFloat(document.getElementById('blockPrice').value) || 0;
    const reserve = parseFloat(document.getElementById('reserve').value) || 0;

    // Розміри блоку в метрах: [довжина, товщина стіни, висота]
    const dimensions = {
        'gas_300': [0.60, 0.30, 0.20],
        'gas_375': [0.60, 0.375, 0.20],
        'gas_100': [0.60, 0.10, 0.20],
        'slag':    [0.39, 0.19, 0.188],
        'brick_1': [0.25, 0.12, 0.065],
        'brick_15':[0.25, 0.12, 0.088]
    };

    const [bLen, bThick, bHeight] = dimensions[mat] || [0.60, 0.30, 0.20];
    const jointM = jointMm / 1000;

    // Чиста площа стін за вирахуванням вікон і дверей
    const grossArea = perimeter * height;
    const netArea = Math.max(0, grossArea - openingsArea);

    // Об'єм кладки в м³
    const netVolume = netArea * bThick;
    const totalVolume = netVolume * (1 + reserve / 100);

    // Кількість блоків з урахуванням шва на площі стіни
    const blockFaceAreaWithJoint = (bLen + jointM) * (bHeight + jointM);
    const netBlocks = blockFaceAreaWithJoint > 0 ? (netArea / blockFaceAreaWithJoint) : 0;
    const totalBlocks = Math.ceil(netBlocks * (1 + reserve / 100));

    // Клей (для газоблоку ~25 кг на 1 м³) або розчин (для цегли/шлакоблоку ~0.22 м³ на 1 м³ кладки)
    let mortarText = '';
    if (mat.startsWith('gas')) {
        const glueKg = netVolume * 25;
        const glueBags = Math.ceil(glueKg / 25);
        mortarText = `${glueBags} мішків по 25 кг (~${Math.round(glueKg)} кг)`;
    } else {
        const mortarM3 = netVolume * 0.22;
        const cementBags = Math.ceil((mortarM3 * 300) / 25);
        mortarText = `${mortarM3.toFixed(2)} м³ розчину (~${cementBags} міш. цементу 25 кг)`;
    }

    // Орієнтовна вартість матеріалу
    let totalCost = 0;
    if (mat.startsWith('gas')) {
        totalCost = totalVolume * price;
    } else {
        totalCost = totalBlocks * price;
    }

    // Піддони (орієнтовно 1.8 м³ газоблоку або 400 цеглин на піддон)
    const pallets = mat.startsWith('gas')
        ? Math.ceil(totalVolume / 1.8)
        : Math.ceil(totalBlocks / 400);

    document.getElementById('resBlocks').textContent = `${formatNum(totalBlocks)} шт.`;
    document.getElementById('resSubInfo').textContent = `Чиста площа стін: ${netArea.toFixed(1)} м² | Об'єм: ${totalVolume.toFixed(2)} м³`;
    document.getElementById('resVolume').textContent = `${totalVolume.toFixed(2)} м³ (чистий: ${netVolume.toFixed(2)} м³)`;
    document.getElementById('resMortar').textContent = mortarText;
    document.getElementById('resPallets').textContent = `~${pallets} піддонів`;
    document.getElementById('resCost').textContent = `${formatNum(totalCost)} грн`;
}

function copyResults() {
    const text = `Розрахунок кладки стін (БудКальк):\n` +
                 `• Кількість блоків/цегли (із запасом): ${document.getElementById('resBlocks').textContent}\n` +
                 `• ${document.getElementById('resSubInfo').textContent}\n` +
                 `• Загальний об'єм кладки: ${document.getElementById('resVolume').textContent}\n` +
                 `• Клей / розчин: ${document.getElementById('resMortar').textContent}\n` +
                 `• Орієнтовна кількість піддонів: ${document.getElementById('resPallets').textContent}\n` +
                 `• Орієнтовна вартість матеріалу: ${document.getElementById('resCost').textContent}`;

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        const orig = btn.textContent;
        btn.textContent = '✅ Скопійовано!';
        setTimeout(() => btn.textContent = orig, 2000);
    });
}

window.addEventListener('DOMContentLoaded', calculateMasonry);
