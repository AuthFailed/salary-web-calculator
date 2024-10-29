export function initializeModal() {
    const modalBackdrop = document.getElementById('modal-backdrop');
    const hoursModal = document.getElementById('hours-help-modal');
    const rateModal = document.getElementById('rate-help-modal');
    const premiumModal = document.getElementById('premium-help-modal');

    const showHoursHelpButton = document.getElementById('show-hours-help');
    const showRateHelpButton = document.getElementById('show-rate-help');
    const showPremiumHelpButton = document.getElementById('show-premium-help');

    const closeHoursButton = document.getElementById('close-modal-hours');
    const closeRateButton = document.getElementById('close-modal-rate');
    const closePremiumButton = document.getElementById('close-modal-premium');

    let currentModal = null;

    function showModal(modalElement) {
        currentModal = modalElement;

        // Hide all modals and remove z-index
        [hoursModal, rateModal, premiumModal].forEach(modal => {
            modal.classList.add('scale-95', 'opacity-0');
            modal.style.zIndex = '0';
            modal.style.pointerEvents = 'none';
        });

        // Show backdrop
        modalBackdrop.classList.remove('hidden');
        modalBackdrop.classList.add('opacity-0');
        modalBackdrop.offsetHeight; // Force reflow

        // Fade in backdrop
        modalBackdrop.classList.remove('opacity-0');
        modalBackdrop.classList.add('opacity-100');

        // Show and enable current modal
        setTimeout(() => {
            modalElement.style.zIndex = '1';
            modalElement.style.pointerEvents = 'auto';
            modalElement.classList.remove('scale-95', 'opacity-0');
            modalElement.classList.add('scale-100', 'opacity-100');
        }, 150);
    }

    function hideModal() {
        if (!currentModal) return;

        // Disable pointer events immediately
        currentModal.style.pointerEvents = 'none';

        // Animate out
        currentModal.classList.remove('scale-100', 'opacity-100');
        currentModal.classList.add('scale-95', 'opacity-0');

        setTimeout(() => {
            modalBackdrop.classList.remove('opacity-100');
            modalBackdrop.classList.add('opacity-0');

            setTimeout(() => {
                modalBackdrop.classList.add('hidden');
                currentModal.style.zIndex = '0';
                currentModal = null;
            }, 300);
        }, 150);
    }

    // Show modal handlers
    showHoursHelpButton.addEventListener('click', () => showModal(hoursModal));
    showRateHelpButton.addEventListener('click', () => showModal(rateModal));
    showPremiumHelpButton.addEventListener('click', () => showModal(premiumModal));

    // Close modal handlers
    closeHoursButton.addEventListener('click', (e) => {
        e.stopPropagation();
        hideModal();
    });
    closeRateButton.addEventListener('click', (e) => {
        e.stopPropagation();
        hideModal();
    });
    closePremiumButton.addEventListener('click', (e) => {
        e.stopPropagation();
        hideModal();
    });

    // Close on backdrop click
    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop || e.target.classList.contains('relative')) {
            hideModal();
        }
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modalBackdrop.classList.contains('hidden')) {
            hideModal();
        }
    });
}