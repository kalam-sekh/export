// Product category filter and inquiry form for the export site
(function () {
    // Product category filter
    const buttons = document.querySelectorAll('.product-filter__btn');
    const cards = document.querySelectorAll('.lp-product-card');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            buttons.forEach(b => {
                const active = b === btn;
                b.classList.toggle('is-active', active);
                b.setAttribute('aria-selected', String(active));
            });

            cards.forEach(card => {
                const category = card.querySelector('.lp-product-card__category');
                const match = filter === 'all' || (category && category.textContent.trim() === filter);
                card.hidden = !match;
            });
        });
    });

    // Inquiry form: opens the visitor's email app with the details filled in
    const form = document.getElementById('inquiryForm');
    const error = document.getElementById('inquiryError');
    if (!form) return;

    form.addEventListener('submit', event => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());

        if (!data.name.trim() || !data.email.trim() || !data.country.trim()) {
            error.hidden = false;
            return;
        }
        error.hidden = true;

        const subject = `Export inquiry: ${data.product || 'Leather products'} from ${data.country}`;
        const body = [
            `Name: ${data.name}`,
            `Company: ${data.company || '-'}`,
            `Email: ${data.email}`,
            `Phone / WhatsApp: ${data.phone || '-'}`,
            `Country: ${data.country}`,
            `Product interest: ${data.product}`,
            `Estimated quantity: ${data.quantity || '-'}`,
            '',
            data.message || ''
        ].join('\n');

        window.location.href = `mailto:info@akint.co.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
})();
