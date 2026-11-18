function formatBetonNum(num) {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function toggleFoundationType() {
    const type = document.getElementById('foundationType').value;
    document.getElementById('stripBlock').style.display = type === 'strip' ? 'block' : 'none';
    document.getElementById('slabBlock').style.display = type === 'slab' ? 'block' : 'none';
    document.getElementById('pilesBlock').style.display = type === 'piles' ? 'block' : 'none';
    calculateConcrete();
}

function calculateConcrete() {
    const type = document.getElementById('foundationType').value;
    const grade = document.getElementById('concreteGrade').value;
    const priceM3 = parseFloat(document.getElementById('priceM3').value) || 0;
    const reserve = parseFloat(document.getElementById('reserve').value) || 0;

    let netVolume = 0;

    if (type === 'strip') {
        const len = parseFloat(document.getElementById('stripLength').value) || 0;
        const widthCm = parseFloat(document.getElementById('stripWidth').value) || 0;
        const heightCm = parseFloat(document.getElementById('stripHeight').value) || 0;
        netVolume = len * (widthCm / 100) * (heightCm / 100);
    } else if (type === 'slab') {
        const len = parseFloat(document.getElementById('slabLength').value) || 0;
        const width = parseFloat(document.getElementById('slabWidth').value) || 0;
        const thickCm = parseFloat(document.getElementById('slabThickness').value) || 0;
        netVolume = len * width * (thickCm / 100);
    } else if (type === 'piles') {
        const count = parseFloat(document.getElementById('pilesCount').value) || 0;
        const diamCm = parseFloat(document.getElementById('pileDiameter').value) || 0;
        const depth = parseFloat(document.getElementById('pileDepth').value) || 0;
        const radiusM = (diamCm / 100) / 2;
        netVolume = count * Math.PI * (radiusM * radiusM) * depth;
    }

    const totalVolume = netVolume * (1 + reserve / 100);

    // Склад на 1 м³ бетону (цемент ПЦ-400 у кг, пісок у кг, щебінь у кг, вода у л)
    const recipes = {
        'M150': { cement: 230, sand: 860, gravel: 1120, water: 175, ratio: '1 : 3.7 : 4.9' },
        'M200': { cement: 280, sand: 810, gravel: 1100, water: 180, ratio: '1 : 2.9 : 3.9' },
        'M250': { cement: 330, sand: 760, gravel: 1080, water: 185, ratio: '1 : 2.3 : 3.3' },
        'M300': { cement: 380, sand: 710, gravel: 1060, water: 190, ratio: '1 : 1.9 : 2.8' }
    };

    const rec = recipes[grade] || recipes['M200'];

    const cementKg = totalVolume * rec.cement;
    const cementBags25 = Math.ceil(cementKg / 25);
    const cementBags50 = Math.ceil(cementKg / 50);

    const sandTons = (totalVolume * rec.sand) / 1000;
    const gravelTons = (totalVolume * rec.gravel) / 1000;
    const waterLiters = Math.round(totalVolume * rec.water);
    const totalWeightTons = (totalVolume * 2.35);

    const totalCost = totalVolume * priceM3;
    const mixersCount = Math.ceil(totalVolume / 7);

    document.getElementById('resTotalVolume').textContent = `${totalVolume.toFixed(2)} м³`;
    document.getElementById('resNetVolume').textContent = `Чистий об'єм опалубки: ${netVolume.toFixed(2)} м³ (вага бетону ~${totalWeightTons.toFixed(1)} т)`;

    document.getElementById('resCement').textContent = `${formatBetonNum(cementKg)} кг (${cementBags25} міш. по 25 кг / ${cementBags50} по 50 кг)`;
    document.getElementById('resSand').textContent = `${sandTons.toFixed(2)} т (~${(sandTons / 1.5).toFixed(2)} м³)`;
    document.getElementById('resGravel').textContent = `${gravelTons.toFixed(2)} т (~${(gravelTons / 1.4).toFixed(2)} м³)`;
    document.getElementById('resRatio').textContent = `${rec.ratio} (вода: ~${formatBetonNum(waterLiters)} л)`;
    document.getElementById('resMixer').textContent = totalVolume > 0 ? `${mixersCount} міксер(и) по 7 м³` : '0 міксерів';
    document.getElementById('resCost').textContent = `${formatBetonNum(totalCost)} грн`;
}

function copyResults() {
    const text = `Розрахунок бетону та фундаменту (БудКальк):\n` +
                 `• Загальний об'єм бетону (із запасом): ${document.getElementById('resTotalVolume').textContent}\n` +
                 `• ${document.getElementById('resNetVolume').textContent}\n` +
                 `• Цемент (М400): ${document.getElementById('resCement').textContent}\n` +
                 `• Пісок: ${document.getElementById('resSand').textContent}\n` +
                 `• Щебінь: ${document.getElementById('resGravel').textContent}\n` +
                 `• Пропорція (Ц : П : Щ): ${document.getElementById('resRatio').textContent}\n` +
                 `• Замовлення міксера: ${document.getElementById('resMixer').textContent}\n` +
                 `• Орієнтовна вартість товарного бетону: ${document.getElementById('resCost').textContent}`;

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        const orig = btn.textContent;
        btn.textContent = '✅ Скопійовано!';
        setTimeout(() => btn.textContent = orig, 2000);
    });
}

window.addEventListener('DOMContentLoaded', calculateConcrete);
