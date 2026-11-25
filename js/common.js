document.addEventListener('DOMContentLoaded', () => {
    const formBox = document.querySelector('.calc-form-box');
    const resultBox = document.querySelector('.calc-result-box');
    if (!formBox || !resultBox) return;

    const calcFn = Object.keys(window).find(k => (k.startsWith('calculate') || k.startsWith('calc')) && typeof window[k] === 'function');
    const run = () => { if (calcFn) window[calcFn](); };

    // Кнопка копіювання
    const oldBtn = document.getElementById('copyBtn') || resultBox.querySelector('.btn-copy');
    if (oldBtn) {
        const btn = oldBtn.cloneNode(true);
        btn.removeAttribute('onclick');
        oldBtn.replaceWith(btn);

        btn.addEventListener('click', () => {
            const title = document.querySelector('h1')?.textContent.trim() || 'Розрахунок';
            let text = `📐 ${title} (БудКальк):\n\n`;

            const main = resultBox.querySelector('.result-main-card');
            if (main) text += `★ ${main.innerText.replace(/\n+/g, ' ')}\n`;

            resultBox.querySelectorAll('.result-list li').forEach(li => {
                text += `• ${li.innerText.replace(/\n+/g, ' ')}\n`;
            });

            text += `\n🔗 ${window.location.href}`;

            navigator.clipboard.writeText(text);
            const orig = btn.textContent;
            btn.textContent = '✅ Скопійовано!';
            setTimeout(() => btn.textContent = orig, 2000);
        });

        // Кнопка PDF
        if (!document.getElementById('printBtn')) {
            const pdf = document.createElement('button');
            pdf.id = 'printBtn';
            pdf.type = 'button';
            pdf.className = btn.className;
            pdf.style.marginTop = '8px';
            pdf.style.background = '#475569';
            pdf.textContent = '🖨️ Зберегти в PDF / Друк';
            pdf.onclick = () => window.print();
            btn.after(pdf);
        }
    }

    run();
    formBox.querySelectorAll('input, select').forEach(el => el.addEventListener('input', run));
});
