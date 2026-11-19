function formatFacadeNum(num) {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function updateFacadeDefaults() {
    const type = document.getElementById('insulationType').value;
    const thickInput = document.getElementById('thicknessMm');
    const priceInput = document.getElementById('insulationPrice');

    if (type === 'eps') {
        thickInput.value = 100;
        priceInput.value = 1850; // ціна за 1 м³ пінопласту ПСБ-С-25
    } else if (type === 'xps') {
        thickInput.value = 50;
        priceInput.value = 3900; // ціна за 1 м³ екструдованого пінополістиролу
    } else {
        thickInput.value = 100;
        priceInput.value = 3200; // ціна за 1 м³ фасадної мінвати
    }
    calculateFacade();
}

function calculateFacade() {
    const type = document.getElementById('insulationType').value;
    const perimeter = parseFloat(document.getElementById('wallPerimeter').value) || 0;
    const height = parseFloat(document.getElementById('wallHeight').value) || 0;
    const openings = parseFloat(document.getElementById('openingsArea').value) || 0;
    const thickMm = parseFloat(document.getElementById('thicknessMm').value) || 100;
    const priceM3 = parseFloat(document.getElementById('insulationPrice').value) || 0;
    const reserve = parseFloat(document.getElementById('reserve').value) || 0;

    // Чиста площа фасаду
    const grossArea = perimeter * height;
    const netArea = Math.max(0, grossArea - openings);
    const totalArea = netArea * (1 + reserve / 100);

    // Об'єм утеплювача в м³
    const thickM = thickMm / 1000;
    const totalVolumeM3 = totalArea * thickM;

    // Кількість листів (пінопласт 1000x500 мм = 0.5 м², мінвата 1000x600 мм = 0.6 м², ЕППС 1200x600 мм = 0.72 м²)
    let sheetArea = 0.5;
    if (type === 'wool') sheetArea = 0.6;
    if (type === 'xps') sheetArea = 0.72;

    const sheetsCount = Math.ceil(totalArea / sheetArea);

    // Клей для приклеювання (~5 кг/м²) + клей для армування (~4.5 кг/м²). Для мінвати +15%
    const glueRate = type === 'wool' ? 11.0 : 9.5;
    const glueKg = netArea * glueRate;
    const glueBags25 = Math.ceil(glueKg / 25);

    // Фасадна лугостійка сітка (рулон 50 м², з урахуванням нахлесту 10 см йде ~1.15 м² на 1 м² стіни)
    const meshM2 = netArea * 1.15;
    const meshRolls = Math.ceil(meshM2 / 50);

    // Дюбелі-«парасольки» (~6 шт на 1 м²)
    const dowelsCount = Math.ceil(netArea * 6);

    // Декоративна штукатурка «короїд» / «баранчик» (~2.8 кг на 1 м², відро 25 кг)
    const plasterKg = netArea * 2.8;
    const plasterBuckets = Math.ceil(plasterKg / 25);

    // Стартовий цокольний профіль (планка 2.5 м)
    const startProfiles = Math.ceil(perimeter / 2.5);

    // Вартість самого утеплювача
    const insulationCost = totalVolumeM3 * priceM3;

    document.getElementById('resSheets').textContent = `${formatFacadeNum(sheetsCount)} листів (${totalArea.toFixed(1)} м²)`;
    document.getElementById('resSubInfo').textContent = `Чиста площа фасаду: ${netArea.toFixed(1)} м² | Об'єм: ${totalVolumeM3.toFixed(2)} м³`;
    document.getElementById('resGlue').textContent = `${glueBags25} мішків по 25 кг (~${formatFacadeNum(glueKg)} кг)`;
    document.getElementById('resMesh').textContent = `${Math.ceil(meshM2)} м² (${meshRolls} рул. по 50 м²)`;
    document.getElementById('resDowels').textContent = `${formatFacadeNum(dowelsCount)} шт. (довжина ${thickMm + 60}–${thickMm + 80} мм)`;
    document.getElementById('resPlaster').textContent = `${plasterBuckets} відер по 25 кг (~${formatFacadeNum(plasterKg)} кг)`;
    document.getElementById('resProfile').textContent = `${startProfiles} планок по 2.5 м (${perimeter.toFixed(1)} пог. м)`;
    document.getElementById('resCost').textContent = `${formatFacadeNum(insulationCost)} грн`;
}

function copyResults() {
    const text = `Розрахунок утеплення фасаду (БудКальк):\n` +
                 `• Утеплювач (із запасом): ${document.getElementById('resSheets').textContent}\n` +
                 `• ${document.getElementById('resSubInfo').textContent}\n` +
                 `• Клей (приклеювання + армування): ${document.getElementById('resGlue').textContent}\n` +
                 `• Фасадна армуюча сітка: ${document.getElementById('resMesh').textContent}\n` +
                 `• Дюбелі-«парасольки»: ${document.getElementById('resDowels').textContent}\n` +
                 `• Декоративна штукатурка (25 кг): ${document.getElementById('resPlaster').textContent}\n` +
                 `• Цокольний стартовий профіль: ${document.getElementById('resProfile').textContent}\n` +
                 `• Орієнтовна вартість утеплювача: ${document.getElementById('resCost').textContent}`;

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        const orig = btn.textContent;
        btn.textContent = '✅ Скопійовано!';
        setTimeout(() => btn.textContent = orig, 2000);
    });
}

window.addEventListener('DOMContentLoaded', calculateFacade);
