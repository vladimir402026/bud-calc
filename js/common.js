(function() {
  let path = window.location.pathname;

  // 1. Головна сторінка: /index.html -> /
  if (path === '/index.html') {
    path = '/';
  } 
  // 2. Внутрішні сторінки: якщо у вашому sitemap.xml посилання ВКАЗАНІ з .html,
  // додаємо .html тим URL, які відкрили без розширення:
  else if (!path.endsWith('/') && !path.endsWith('.html')) {
    path += '.html';
  }

  const canonicalUrl = 'https://bud-calc.com.ua' + path;

  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', canonicalUrl);
})();

document.addEventListener('DOMContentLoaded', () => {
    const formBox = document.querySelector('.calc-form-box');
    const resultBox = document.querySelector('.calc-result-box');
    if (!formBox || !resultBox) return;

    const calcFn = Object.keys(window).find(
        k => (k.startsWith('calculate') || k.startsWith('calc')) && typeof window[k] === 'function'
    );

    function getMainQuantity() {
        const card = resultBox.querySelector('.result-main-card');
        const strong = card?.querySelector('strong');
        if (!strong) return { qty: 0, unit: 'од.' };
        const raw = strong.textContent.trim();

        if (raw.includes('$') || raw.includes('грн')) {
            return { qty: 0, unit: '' };
        }

        if (raw.includes('×')) {
            const areaMatch = card.textContent.replace(',', '.').match(/[\d.]+(?=\s*м²)/);
            if (areaMatch) {
                return { qty: parseFloat(areaMatch.toString()), unit: 'м²' };
            }
            return { qty: 0, unit: '' };
        }

        const match = raw.replace(',', '.').match(/[\d.]+/);
        const qty = match ? parseFloat(match.toString()) : 0;
        const unit = raw.replace(/[\d.,\s~]+/, '').trim() || 'од.';
        return { qty, unit };
    }

    let costInput = null;
    let costTotalEl = null;
    let costUnitLabel = null;

    const initialMain = getMainQuantity();
    if (initialMain.qty > 0 && initialMain.unit !== '') {
        const costBox = document.createElement('div');
        costBox.id = 'costEstimatorBox';
        costBox.style.cssText = 'margin: 16px 0; padding: 14px; background: #fff; border: 1px solid #fed7aa; border-radius: 8px;';
        costBox.innerHTML = `
            <div style="font-size: 0.9rem; font-weight: 700; color: #1e293b; margin-bottom: 8px;">
                💰 Орієнтовна вартість (необов'язково)
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="number" id="unitPriceInput" placeholder="Ціна за 1 ${initialMain.unit} (грн)" min="0" step="1"
                    style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem;">
            </div>
            <div id="costTotalRow" style="display: none; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #cbd5e1; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.9rem; color: #334155;">Разом за матеріал:</span>
                <strong id="costTotalVal" style="font-size: 1.2rem; color: #ea580c;">0 грн</strong>
            </div>
        `;

        const resultList = resultBox.querySelector('.result-list');
        if (resultList) {
            resultList.insertAdjacentElement('afterend', costBox);
        }

        costInput = document.getElementById('unitPriceInput');
        costTotalEl = document.getElementById('costTotalVal');
        costUnitLabel = document.getElementById('costTotalRow');
    }

    function updateCost() {
        if (!costInput || !costTotalEl || !costUnitLabel) return;
        const { qty, unit } = getMainQuantity();
        costInput.placeholder = `Ціна за 1 ${unit} (грн)`;
        const price = parseFloat(costInput.value) || 0;

        if (price > 0 && qty > 0) {
            const total = Math.round(qty * price);
            const formatted = total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            costTotalEl.textContent = `${formatted} грн`;
            costUnitLabel.style.display = 'flex';
        } else {
            costUnitLabel.style.display = 'none';
        }
    }

    const run = () => {
        if (calcFn) window[calcFn]();
        updateCost();
    };

    if (costInput) {
        costInput.addEventListener('input', updateCost);
    }

    const oldBtn = document.getElementById('copyBtn') || resultBox.querySelector('.btn-copy');
    if (oldBtn) {
        const btn = oldBtn.cloneNode(true);
        btn.removeAttribute('onclick');
        oldBtn.replaceWith(btn);

        btn.addEventListener('click', () => {
            const titleEl = document.querySelector('h1');
            const title = titleEl ? titleEl.textContent.trim() : 'Розрахунок';
            let text = `📐 ${title} (БудКальк):\n\n`;

            const main = resultBox.querySelector('.result-main-card');
            if (main) text += `★ ${main.innerText.replace(/\n+/g, ' ')}\n`;

            resultBox.querySelectorAll('.result-list li').forEach(li => {
                text += `• ${li.innerText.replace(/\n+/g, ' ')}\n`;
            });

            if (costInput && parseFloat(costInput.value) > 0 && costTotalEl) {
                text += `\n💰 Орієнтовна вартість: ${costTotalEl.textContent} (по ${costInput.value} грн)\n`;
            }

            text += `\n🔗 ${window.location.href}`;

            navigator.clipboard.writeText(text);
            const orig = btn.textContent;
            btn.textContent = '✅ Скопійовано!';
            setTimeout(() => (btn.textContent = orig), 2000);
        });

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
    formBox.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', run);
        el.addEventListener('change', run);
    });

    // SEO-мікророзмітка Schema.org
    const title = document.querySelector('h1')?.textContent.trim();
    const desc = document.querySelector('meta[name="description"]')?.getAttribute('content') || title;
    const url = window.location.origin + window.location.pathname;
    if (title) {
        const schemas = [{
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": title,
            "description": desc,
            "url": url,
            "applicationCategory": "UtilitiesApplication",
            "operatingSystem": "All",
            "inLanguage": "uk",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "UAH" }
        }];

        const faqItems = [];
        document.querySelectorAll('.seo-article li').forEach(li => {
            const strong = li.querySelector('strong');
            if (strong && strong.textContent.includes('?')) {
                const q = strong.textContent.trim();
                const a = li.textContent.replace(q, '').trim();
                if (a.length > 10) {
                    faqItems.push({
                        "@type": "Question",
                        "name": q,
                        "acceptedAnswer": { "@type": "Answer", "text": a }
                    });
                }
            }
        });
        if (faqItems.length > 0) {
            schemas.push({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faqItems });
        }

        schemas.forEach(obj => {
            const s = document.createElement('script');
            s.type = 'application/ld+json';
            s.textContent = JSON.stringify(obj);
            document.head.appendChild(s);
        });
    }
  // === MICROSOFT CLARITY ===
(function(c, l, a, r, i, t, y) {
  c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments); };
  t = l.createElement(r);
  t.async = 1;
  t.src = "https://www.clarity.ms/tag/" + i;
  y = l.getElementsByTagName(r)[0];
  y.parentNode.insertBefore(t, y);
})(window, document, "clarity", "script", "zk9rl3wxqm");

});
