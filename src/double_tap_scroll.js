// ==UserScript==
// @name         Scroll page on double tap (mobile)
// @description  This userscript is designed for mobile browsers, and scrolls page on double tap. Top half of the screen scrolls up, and bottom half scrolls down. When page is already scrolling, single tap will scroll it further. Fast scrolling mode when double tap and move finger (disabled by default).
// @description:ru Этот скрипт разработан для мобильных браузеров, и прокручивает страницу при двойном нажатии. Верхняя половина экрана прокручивает вверх, а нижняя половина — вниз. Когда страница уже прокручивается, одиночный тап прокрутит её дальше. Режим быстрой прокрутки при двойном тапе и движении пальцем (выключен по умолчанию). 
// @version      1.0.5
// @author       emvaized
// @license      MIT
// @namespace    scroll_page_on_double_tap
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
 
(async function() {
    'use strict';
 
    // Configs
    let fastScrollingEnabled = false; // To enter fast scrolling mode, double tap and move finger on a second tap
    let scrollVelocityMultiplier = 1; // Multiplier for scroll speed (higher values will make it faster)
    let continueScrollingOnSingleTap = true; // If true, single tap will scroll page further when it is already scrolling (kinetic scrolling)

    // Constants
    const fastScrollingFriction = 0.93; // Multiplier for dy touch movement during fast scrolling
    const scrollVelocity = 13.5; // Initial speed of the scroll (higher values will make it faster)
    const scrollDecay = 0.98; // The rate at which the scroll slows down (values closer to 1 will make the scroll slower to decelerate) 
    const scrollInterval = 8; // Time in milliseconds between each scroll step (16 ms gives approximately 60 frames per second)
    const doubleTapTimeout = 200; // Timeout for second tap in milliseconds
    const maxTapMovement = 10; // Maximum touch movement (in pixels) to qualify as a tap
 
    // Service variables
    let lastTapUpTime = 0; // To track timing between taps
    let startX = 0; // Start position for touch
    let startY = 0;
    let isFastScrolling = false; // Manual scroll mode on double tap + move
    let lastMoveY; // Last Y position for manual scrolling
    let doubleTapDownTimeout;
    let lastTapDownTime = 0; // To track timing between taps
    let preventFlingScrolling = false; // Use to stop fling scroll when user manually scrolled page
    let isFlingScrolling = false; // To track if page is currently in kinetic scrolling state

    // Load saved options from Chrome storage if available
    if (typeof chrome !== "undefined" && chrome.storage) {
        let configs = await chrome.storage.sync.get(['fastScrollingEnabled', 'scrollVelocityMultiplier', 'continueScrollingOnSingleTap']);
        if (configs) {
            fastScrollingEnabled = configs.fastScrollingEnabled || false;
            scrollVelocityMultiplier = configs.scrollVelocityMultiplier || 1;
            continueScrollingOnSingleTap = configs.continueScrollingOnSingleTap !== undefined ? configs.continueScrollingOnSingleTap : true;
        }

        chrome.storage.onChanged.addListener((c) => {
            if (c.fastScrollingEnabled) {
                fastScrollingEnabled = c.fastScrollingEnabled.newValue;
            }
            if (c.scrollVelocityMultiplier) {
                scrollVelocityMultiplier = c.scrollVelocityMultiplier.newValue || 1;
            }
            if (c.continueScrollingOnSingleTap) {
                continueScrollingOnSingleTap = c.continueScrollingOnSingleTap.newValue;
            }
        });
    }

    document.addEventListener('touchstart', function(event) {
        // Only handle single-finger touches
        if (event.touches.length === 1) {
            if (!isFlingScrolling && isElementPrevented(event.target)) return;
            
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
            
            // Reset variables from last taps
            lastMoveY = null;
            preventFlingScrolling = false;
 
            // Detect double tap for manual scrolling
            const currentTapDownTime = new Date().getTime();
            const tapDownInterval = currentTapDownTime - lastTapDownTime;
 
            if (fastScrollingEnabled && tapDownInterval < doubleTapTimeout && tapDownInterval > 0) {
                // Double-tap detected within timeout
                cancelEvent(event);
 
                // Enable manual scrolling mode
                doubleTapDownTimeout = setTimeout(() => {
                    isFastScrolling = true;
                }, doubleTapTimeout);
            } else {
                // First tap: store the event and set timeout for single-tap action
                lastTapDownTime = currentTapDownTime;
                isFastScrolling = false;
            }
        }
    },  { passive: fastScrollingEnabled ? false : true}, true);
 
    
    window.addEventListener('touchmove', function(event){
        if ((isFastScrolling || isFlingScrolling) && event.touches.length === 1) {
            
            const currentMoveY = event.touches[0].clientY;
            if(!lastMoveY) lastMoveY = currentMoveY;
            const scrollDelta = lastMoveY - currentMoveY;
            const scrollDeltaAbs = Math.abs(scrollDelta);
            
            if(isFastScrolling){
                // Prevent default action (scrolling page)
                cancelEvent(event);
                
                lastMoveY = currentMoveY;
                if(scrollDeltaAbs > 0.3) 
                    flingScroll(
                        window, 
                        (fastScrollingFriction * scrollDelta) * 2 * scrollVelocityMultiplier, 
                        scrollDecay, scrollInterval
                    );

            } else if(isFlingScrolling && scrollDeltaAbs > 0.3) {
                isFlingScrolling = false;
                preventFlingScrolling = true;
            }
        }
    }, { passive: fastScrollingEnabled ? false : true }, true);

    document.addEventListener('touchend', function(event) {
        // Only proceed if it’s a single-finger touch event
        if (event.changedTouches.length > 1 ) return;
        if (isElementPrevented(event.target) && !isFlingScrolling) return;
 
        const endX = event.changedTouches[0].clientX;
        const endY = event.changedTouches[0].clientY;
        const deltaX = Math.abs(endX - startX);
        const deltaY = Math.abs(endY - startY);
 
        // If movement exceeds maxTapMovement, consider it a scroll/swipe and ignore
        if (deltaX > maxTapMovement || deltaY > maxTapMovement) return;
 
        const currentTime = new Date().getTime();
        const tapInterval = currentTime - lastTapUpTime;
 
        // Disable manual scrolling mode
        isFastScrolling = false;
        clearTimeout(doubleTapDownTimeout);
 
        // Scroll up if tapped in top half of the screen, scroll down if tapped in bottom half
        const scrollDown = event.changedTouches[0].screenY > (window.screen.height / 2);
 
        if (tapInterval < doubleTapTimeout && tapInterval > 0) {
            // Double-tap detected within timeout
            
            // Prevent default action (including link navigation)
            cancelEvent(event);
        
            // Execute custom double-tap action: scroll down
            scrollPage(scrollDown);
 
            // Reset stored event and timing
            lastTapUpTime = 0;
        } else {
            // First tap
            // If kinetic scrolling in proccess, scroll again
            if(isFlingScrolling && continueScrollingOnSingleTap){
                cancelEvent(event);
                scrollPage(scrollDown);
                return;
            }
 
            // Set timeout for single-tap action
            lastTapUpTime = currentTime;
        }
    },  { passive: continueScrollingOnSingleTap ? false : true }, true);

    if (fastScrollingEnabled) {
        // Prevent regular scrolling when manual scroll is in progress
        document.addEventListener('wheel', function(e) { 
            if(isFastScrolling) cancelEvent(event);
        }, { passive: false });
    
        document.addEventListener('scroll', function(e) { 
            if(isFastScrolling) cancelEvent(event);
        }, { passive: false });
    }
 
    // Scroll page up or down
    function scrollPage(scrollDown){
        flingScroll(
            document.scrollingElement, 
            (scrollDown ? 1 : -1) * 
                scrollVelocity / window.visualViewport.scale * scrollVelocityMultiplier,
            scrollDecay, 
            scrollInterval
        )
    }
 
    // Prevent default event action
    function cancelEvent(event){
        event.preventDefault(); 
        event.stopPropagation();
        // event.stopImmediatePropagation();
    }

    function isElementPrevented(element){
        return element.closest('img, video, iframe, a');
    }
 
    // For fling scroll (kinetic scrolling)
    function flingScroll(element, velocity = 13.5, decay = 0.98, interval = 8) {
        let currentVelocity = velocity; // initial velocity of the fling scroll
 
        function scrollStep() {
            isFlingScrolling = true;
            
            if(preventFlingScrolling && !isFastScrolling) {
                isFlingScrolling = false;
                return;
            }
            // Scroll the element by the current velocity
            element.scrollBy({
                left: 0,
                top: currentVelocity,
                behavior: "instant"
            });
 
            // Reduce the velocity to simulate natural slowing down
            currentVelocity *= decay;
 
            // Stop scrolling if the velocity is very low
            if (Math.abs(currentVelocity) > 1) {
                setTimeout(scrollStep, interval);
            } else { 
                isFlingScrolling = false; 
            }
        }
        // Start the fling scroll
        scrollStep();
    }
})();