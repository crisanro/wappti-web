document.addEventListener("DOMContentLoaded", function() {
    const includes = document.querySelectorAll('[data-include]');
    const promises = Array.from(includes).map(el => {
        const file = el.getAttribute('data-include') + '.html';
        return fetch(file)
            .then(res => res.text())
            .then(data => {
                el.innerHTML = data;
                el.removeAttribute('data-include');
            });
    });

    Promise.all(promises).then(() => {
        // --- AQUÍ LLAMAMOS AL MAIN JS ---
        if (typeof initWapptiApp === "function") {
            initWapptiApp();
        }

        // Lógica de scroll/anclas
        if (window.location.hash) {
            const target = document.querySelector(window.location.hash);
            if (target) {
                setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        }
    });
});