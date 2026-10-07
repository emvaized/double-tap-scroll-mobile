document.addEventListener('DOMContentLoaded', function() {
    const fastScrollingEnabled = document.getElementById('fastScrollingEnabled');
    const scrollVelocityMultiplier = document.getElementById('scrollVelocityMultiplier');
    const continueScrollingOnSingleTap = document.getElementById('continueScrollingOnSingleTap');
    const doubleTapTimeout = document.getElementById('doubleTapTimeout');

    // Load saved options
    chrome.storage.sync.get(['fastScrollingEnabled', 'scrollVelocityMultiplier', 'continueScrollingOnSingleTap', 'doubleTapTimeout'], function(result) {
        fastScrollingEnabled.checked = result.fastScrollingEnabled ?? false;
        scrollVelocityMultiplier.value = result.scrollVelocityMultiplier ?? 1;
        doubleTapTimeout.value = result.doubleTapTimeout ?? 200;
        continueScrollingOnSingleTap.checked = result.continueScrollingOnSingleTap ?? true;
    });

    // Save options
    fastScrollingEnabled.addEventListener('change', function() {
        chrome.storage.sync.set({
            fastScrollingEnabled: fastScrollingEnabled.checked
        });
    });

    scrollVelocityMultiplier.addEventListener('change', function() {
        chrome.storage.sync.set({
            scrollVelocityMultiplier: parseFloat(scrollVelocityMultiplier.value)
        });
    });

    continueScrollingOnSingleTap.addEventListener('change', function() {
        chrome.storage.sync.set({
            continueScrollingOnSingleTap: continueScrollingOnSingleTap.checked
        });
    });

    doubleTapTimeout.addEventListener('change', function() {
        chrome.storage.sync.set({
            doubleTapTimeout: parseInt(doubleTapTimeout.value)
        });
    });

    setFooterButtons();
});


function setFooterButtons(){
    document.querySelector("#donateButton").addEventListener("click", function () {
        window.open('https://github.com/emvaized/emvaized.github.io/wiki/Donate-Page', '_blank');
    });
    
    document.querySelector("#githubButton").addEventListener("click", function () {
        window.open('https://github.com/emvaized/double-tap-scroll-mobile/tree/main', '_blank');
    });
    document.querySelector("#writeAReviewButton").addEventListener("click", function () {
        const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
        window.open(isFirefox ? 'https://addons.mozilla.org/firefox/addon/double-tap-scroll/' : 'https://addons.mozilla.org/firefox/addon/double-tap-scroll/', '_blank');
    });
}