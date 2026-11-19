function calculateStairs() {
    const H = parseFloat(document.getElementById('openingHeight').value) || 0; // висота підйому в см
    const L = parseFloat(document.getElementById('openingLength').value) || 0; // довжина прорізу в см
    const stepsCount = parseInt(document.getElementById('stepsCount').value) || 1;
    const nosing = parseFloat(document.getElementById('stepNosing').value) || 0; // виступ (звіс) сходинки в см
    const widthCm = parseFloat(document.getElementById('stairWidth').value) || 90;

    if (H <= 0 || L <= 0 || stepsCount <= 0) return;

    // Висота однієї сходинки (підсходинка h)
    const stepHeight = H / stepsCount;

    // Кількість проступей (на 1 менше, якщо верхня сходинка врівень з підлогою 2-го поверху)
    const treadsCount = Math.max(1, stepsCount - 1);

    // Робоча глибина сходинки (без урахування звісу)
    const stepRun = L / treadsCount;

    // Повна глибина сходинки (з урахуванням виступу/звісу)
    const totalTreadDepth = stepRun + nosing;

    // Кут нахилу сходів у градусах
    const angleRad = Math.atan(H / L);
    const angleDeg = angleRad * (180 / Math.PI);

    // Довжина тятиви / косоура (гіпотенуза) в метрах
    const stringerLengthM = Math.sqrt(H * H + L * L) / 100;

    // Площа всіх сходинок (для закупівлі дерева або плитки) в м²
    const stepsAreaM2 = (treadsCount * (totalTreadDepth / 100) * (widthCm / 100));

    // Оцінка зручності за формулою Блонделя: 2*h + b має бути в межах 60–64 см
    const blondel = 2 * stepHeight + stepRun;
    let comfortText = '';
    if (angleDeg >= 28 && angleDeg <= 38 && stepHeight >= 15 && stepHeight <= 19 && stepRun >= 25 && stepRun <= 32) {
        comfortText = `✅ Ідеально зручні сходи (формула кроку: ${blondel.toFixed(1)} см при нормі 60–64 см)`;
    } else if (angleDeg > 42 || stepHeight > 21 || stepRun < 22) {
        comfortText = `⚠️ Круті сходи: бажано збільшити довжину прорізу або змінити кількість сходинок`;
    } else {
        comfortText = `👌 Прийнятний варіант (формула кроку: ${blondel.toFixed(1)} см)`;
    }

    document.getElementById('resStepSize').textContent = `${stepHeight.toFixed(1)} × ${totalTreadDepth.toFixed(1)} см`;
    document.getElementById('resSubInfo').textContent = `Висота підсходинки: ${stepHeight.toFixed(1)} см | Робоча проступ: ${stepRun.toFixed(1)} см (+${nosing} см виступ)`;
    document.getElementById('resAngle').textContent = `${angleDeg.toFixed(1)}° (рекомендовано 30°–38°)`;
    document.getElementById('resStringer').textContent = `${stringerLengthM.toFixed(2)} м (${Math.round(stringerLengthM * 100)} см)`;
    document.getElementById('resTreadsCount').textContent = `${treadsCount} сходинок + вихід на перекриття`;
    document.getElementById('resArea').textContent = `${stepsAreaM2.toFixed(2)} м² (при ширині ${widthCm} см)`;
    document.getElementById('resComfort').textContent = comfortText;
}

function copyResults() {
    const text = `Розрахунок сходів (БудКальк):\n` +
                 `• Розмір сходинки (висота × глибина): ${document.getElementById('resStepSize').textContent}\n` +
                 `• ${document.getElementById('resSubInfo').textContent}\n` +
                 `• Кут нахилу сходів: ${document.getElementById('resAngle').textContent}\n` +
                 `• Довжина косоура / тятиви: ${document.getElementById('resStringer').textContent}\n` +
                 `• Кількість сходинок: ${document.getElementById('resTreadsCount').textContent}\n` +
                 `• Площа матеріалу сходинок: ${document.getElementById('resArea').textContent}\n` +
                 `• Оцінка зручності: ${document.getElementById('resComfort').textContent}`;

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        const orig = btn.textContent;
        btn.textContent = '✅ Скопійовано!';
        setTimeout(() => btn.textContent = orig, 2000);
    });
}

window.addEventListener('DOMContentLoaded', calculateStairs);
