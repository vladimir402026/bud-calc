function formatNumber(num) {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function calculateRoof() {
    const slopes = parseInt(document.getElementById('roofType').value) || 2;
    const length = parseFloat(document.getElementById('houseLength').value) || 0;
    const width = parseFloat(document.getElementById('houseWidth').value) || 0;
    const angleDeg = parseFloat(document.getElementById('roofAngle').value) || 30;
    const overhang = parseFloat(document.getElementById('overhang').value) || 0;

    const matData = document.getElementById('materialType').value.split('|').map(Number);
    const usefulWidth = matData[0];
    const screwsPerSqm = matData[1];

    const priceSqm = parseFloat(document.getElementById('priceSqm').value) || 0;
    const reserve = parseFloat(document.getElementById('reserve').value) || 0;

    const angleRad = angleDeg * (Math.PI / 180);
    const cosAngle = Math.cos(angleRad);

    const totalRoofLength = length + (2 * overhang);
    const horizontalRun = slopes === 2 ? (width / 2) + overhang : width + (2 * overhang);
    const slopeLength = cosAngle > 0 ? (horizontalRun / cosAngle) : horizontalRun;

    const netArea = totalRoofLength * slopeLength * slopes;
    const totalArea = netArea * (1 + reserve / 100);

    const sheetsPerSlope = Math.ceil(totalRoofLength / usefulWidth);
    const totalSheets = sheetsPerSlope * slopes;
    const sheetLength = (Math.ceil(slopeLength * 20) / 20).toFixed(2);

    const ridgeLength = slopes === 2 ? totalRoofLength : 0;
    const ridgePieces = ridgeLength > 0 ? Math.ceil(ridgeLength / 1.9) : 0;

    const windLength = slopeLength * 2 * slopes;
    const windPieces = Math.ceil(windLength / 1.9);

    const membraneArea = netArea * 1.15;
    const membraneRolls = Math.ceil(membraneArea / 65);

    const screwsTotal = Math.ceil((netArea * screwsPerSqm + (ridgeLength + windLength) * 4) / 10) * 10;
    const screwPacks = Math.ceil(screwsTotal / 250);
    const totalCost = totalArea * priceSqm;

    document.getElementById('resTotalArea').textContent = `${totalArea.toFixed(1)} м²`;
    document.getElementById('resNetArea').textContent = `Чиста площа схилів: ${netArea.toFixed(1)} м² (довжина скату: ${slopeLength.toFixed(2)} м)`;
    document.getElementById('resSheets').textContent = `${totalSheets} шт. (довжина листа ${sheetLength} м)`;
    document.getElementById('resRidge').textContent = slopes === 2
        ? `${ridgePieces} шт. (${ridgeLength.toFixed(1)} пог. м)`
        : `Не потрібен (односхилий дах)`;
    document.getElementById('resWind').textContent = `${windPieces} шт. (${windLength.toFixed(1)} пог. м)`;
    document.getElementById('resMembrane').textContent = `${membraneRolls} рул. (~${Math.round(membraneArea)} м²)`;
    document.getElementById('resScrews').textContent = `~${formatNumber(screwsTotal)} шт. (${screwPacks} уп. по 250 шт.)`;
    document.getElementById('resCost').textContent = `${formatNumber(totalCost)} грн`;
}

function copyResults() {
    const text = `Розрахунок покрівлі (БудКальк):\n` +
                 `• Загальна площа: ${document.getElementById('resTotalArea').textContent}\n` +
                 `• ${document.getElementById('resNetArea').textContent}\n` +
                 `• Покрівельні листи: ${document.getElementById('resSheets').textContent}\n` +
                 `• Конькова планка: ${document.getElementById('resRidge').textContent}\n` +
                 `• Вітрова планка: ${document.getElementById('resWind').textContent}\n` +
                 `• Гідроізоляція: ${document.getElementById('resMembrane').textContent}\n` +
                 `• Саморізи: ${document.getElementById('resScrews').textContent}\n` +
                 `• Орієнтовна вартість покриття: ${document.getElementById('resCost').textContent}`;

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        const orig = btn.textContent;
        btn.textContent = '✅ Скопійовано!';
        setTimeout(() => btn.textContent = orig, 2000);
    });
}

window.addEventListener('DOMContentLoaded', calculateRoof);
