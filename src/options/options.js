document.addEventListener('DOMContentLoaded', function() {
    // const fastScrollingEnabled = document.getElementById('fastScrollingEnabled');
    const scrollVelocityMultiplier = document.getElementById('scrollVelocityMultiplier');
    const continueScrollingOnSingleTap = document.getElementById('continueScrollingOnSingleTap');

    // Load saved options
    chrome.storage.sync.get(['fastScrollingEnabled', 'scrollVelocityMultiplier', 'continueScrollingOnSingleTap'], function(result) {
        // fastScrollingEnabled.checked = result.fastScrollingEnabled || false;
        scrollVelocityMultiplier.value = result.scrollVelocityMultiplier || 1;
        continueScrollingOnSingleTap.checked = result.continueScrollingOnSingleTap !== undefined ? result.continueScrollingOnSingleTap : true;
    });

    // Save options
    // fastScrollingEnabled.addEventListener('change', function() {
    //     chrome.storage.sync.set({
    //         fastScrollingEnabled: fastScrollingEnabled.checked
    //     });
    // });

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

    setFooterButtons();
});


function setFooterButtons(){
    document.querySelector("#donateButton").addEventListener("click", function () {
        window.open('https://github.com/emvaized/emvaized.github.io/wiki/Donate-Page', '_blank');
    });
    
    // document.querySelector("#githubButton").addEventListener("click", function () {
    //     window.open('https://github.com/emvaized/open-in-popup-window-extension', '_blank');
    // });
    // document.querySelector("#writeAReviewButton").addEventListener("click", function () {
    //     const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
    //     window.open(isFirefox ? 'https://addons.mozilla.org/firefox/addon/open-in-popup-window/' : 'https://chrome.google.com/webstore/detail/open-in-popup-window/gmnkpkmmkhbgnljljcchnakehlkihhie/reviews', '_blank');
    // });
}