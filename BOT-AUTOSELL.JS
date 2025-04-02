// ==UserScript==
// @name         Automatic Resource Sale
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Automates resource management in RivalRegions
// @author       E-CORP
// @match        https://rivalregions.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let selectedResource = null;
    let minimumPrice = null;

    // Function to wait until the element is available using MutationObserver
    function waitForElement(xpath) {
        return new Promise((resolve) => {
            const observer = new MutationObserver(() => {
                let element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            // Timeout: If after 10 seconds the element does not appear, resolve with null
            setTimeout(() => {
                observer.disconnect();
                resolve(null);
            }, 10000);
        });
    }

    // Function to simulate a mouse click on an element
    function simulateClick(element) {
        if (element) {
            const mouseEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
            element.dispatchEvent(mouseEvent);
        }
    }

    // Function to type text into a field realistically
    async function typeText(field, text) {
        field.value = '';
        for (let i = 0; i < text.length; i++) {
            field.value += text.charAt(i);
            await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));
        }
        field.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Function to show a persistent notification
    function showNotification(message) {
        let notification = document.getElementById('script-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'script-notification';
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.padding = '10px 20px';
            notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            notification.style.color = '#fff';
            notification.style.borderRadius = '5px';
            notification.style.fontSize = '16px';
            notification.style.zIndex = '9999';
            document.body.appendChild(notification);
        }

        notification.innerHTML = `${message} <span>⏳</span>`;
        notification.style.opacity = '1';
    }

    // Function to hide the notification
    function hideNotification() {
        let notification = document.getElementById('script-notification');
        if (notification) {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }
    }

    // Main function
    async function runScript() {
        showNotification("The script is running...");

        if (window.location.href !== 'https://rivalregions.com/#storage') {
            showNotification("⚠️ This script only runs on the storage page.");
            return;
        }

        let resourceContainerXpath = '/html/body/div[6]/div[1]';
        let resourceContainer = await waitForElement(resourceContainerXpath);

        if (!selectedResource) {
            let resource = prompt("Enter a number to choose the resource:\n1: OIL\n2: ORE\n3: DIAMOND\n4: URANIUM\n5: OXYGEN\n6: RIVALIUM\n7: HELIUM");

            if (!resource || resource < 1 || resource > 7) {
                showNotification("❌ Invalid number. The script will stop.");
                return;
            }

            const resources = {
                "1": { name: "OIL", xpath: '/html/body/div[6]/div[1]/div[3]' },
                "2": { name: "ORE", xpath: '/html/body/div[6]/div[1]/div[4]' },
                "3": { name: "DIAMOND", xpath: '/html/body/div[6]/div[1]/div[6]' },
                "4": { name: "URANIUM", xpath: '/html/body/div[6]/div[1]/div[5]' },
                "5": { name: "OXYGEN", xpath: '/html/body/div[6]/div[1]/div[7]' },
                "6": { name: "RIVALIUM", xpath: '/html/body/div[6]/div[1]/div[9]' },
                "7": { name: "HELIUM", xpath: '/html/body/div[6]/div[1]/div[8]' }
            };

            selectedResource = resources[resource];

            let userPrice = prompt("Enter the lowest price at which you would sell the resource (no commas or dots):");
            minimumPrice = parseFloat(userPrice.replace(/[^0-9]/g, ''));

            if (isNaN(minimumPrice) || minimumPrice <= 0) {
                showNotification("❌ Invalid price. The script will stop.");
                return;
            }
        }

        let resourceElement = await waitForElement(selectedResource.xpath);
        if (!resourceElement) {
            showNotification("❌ Could not find the resource. The script will stop.");
            return;
        }
        simulateClick(resourceElement);

        let priceXpath = '/html/body/div[6]/div[1]/div[1]/div[2]/div[1]/div[3]/span/span';
        let priceElement = await waitForElement(priceXpath);

        if (!priceElement) {
            showNotification("❌ Could not get the current resource price.");
            return;
        }

        let currentPrice = parseFloat(priceElement.innerText.replace(/[^0-9]/g, ''));

        if (currentPrice < minimumPrice) {
            showNotification("⚠️ Transaction not profitable. Trying again in 2 minutes.");
            setTimeout(runScript, 120000);
            return;
        }

        let nextXpath = '/html/body/div[6]/div[1]/div[1]/div[1]/div/span';
        let nextElement = await waitForElement(nextXpath);
        simulateClick(nextElement);

        let textFieldXpath = '/html/body/div[6]/div[1]/div[1]/div[2]/div[3]/input';
        let textField = await waitForElement(textFieldXpath);
        if (textField) {
            await typeText(textField, (currentPrice - 1).toString());
        } else {
            showNotification("❌ Could not find the input field.");
            return;
        }

        let confirmButtonXpath = '/html/body/div[6]/div[1]/div[1]/div[2]/div[4]/div';
        let confirmButton = await waitForElement(confirmButtonXpath);
        if (confirmButton) {
            confirmButton.classList.remove('no_pointer');
            confirmButton.classList.add('button_green');
            simulateClick(confirmButton);
            showNotification("✅ Transaction completed! Restarting in 2 minutes.");
            setTimeout(runScript, 120000);
        } else {
            showNotification("❌ Could not find the confirm button.");
        }

        hideNotification();
    }

    runScript();
})();
