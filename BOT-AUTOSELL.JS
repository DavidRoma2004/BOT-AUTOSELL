// ==UserScript==
// @name         Automatic Resource Sale
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Automates resource management in RivalRegions
// @author       E-CORP
// @match        https://rivalregions.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Global variables to store the resource and minimum price
    let selectedResource = null;
    let minimumPrice = null;

    // Function to wait until the element is available
    function waitForElement(xpath) {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                let element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (element) {
                    clearInterval(interval);
                    resolve(element);
                }
            }, 500); // Check every 500ms
        });
    }

    // Function to simulate a mouse click on an element
    function simulateClick(element) {
        const mouseEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        element.dispatchEvent(mouseEvent);
    }

    // Function to type text into a field realistically
    async function typeText(field, text) {
        field.value = ''; // Clear the text field before writing

        for (let i = 0; i < text.length; i++) {
            field.value += text.charAt(i);
            await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100)); // Random delay
        }
        field.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Function to show notification with loading emoji and keep it on screen
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
            notification.style.transition = 'opacity 0.3s ease';
            document.body.appendChild(notification);
        }

        notification.innerHTML = `${message} <span>⏳</span>`;
        notification.style.opacity = '1'; // Ensure it's visible
    }

    // Function to hide the notification
    function hideNotification() {
        let notification = document.getElementById('script-notification');
        if (notification) {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }
    }

    // Main function to execute the entire flow
    async function runScript() {
        // Show notification that the script is waiting
        showNotification("The script is waiting...");

        // Check if we are on the correct page
        if (window.location.href !== 'https://rivalregions.com/#storage') {
            console.log("This script only runs on the storage page.");
            return;
        }

        // Wait until the resource container is available
        let resourceContainerXpath = '/html/body/div[6]/div[1]';
        await waitForElement(resourceContainerXpath);

        // Step 1: If no resource was selected previously, ask the user to choose a number for the resource
        if (!selectedResource) {
            let resource = prompt("Enter a number to choose the resource:\n1: OIL\n2: ORE\n3: DIAMOND\n4: URANIUM\n5: OXYGEN\n6: RIVALIUM\n7: HELIUM");

            if (resource < 1 || resource > 7) {
                alert("Invalid number. The script will stop.");
                return;
            }

            // Map the resource number to the corresponding XPath
            const resources = {
                1: { name: "OIL", xpath: '/html/body/div[6]/div[1]/div[3]' },
                2: { name: "ORE", xpath: '/html/body/div[6]/div[1]/div[4]' },
                3: { name: "DIAMOND", xpath: '/html/body/div[6]/div[1]/div[6]' },
                4: { name: "URANIUM", xpath: '/html/body/div[6]/div[1]/div[5]' },
                5: { name: "OXYGEN", xpath: '/html/body/div[6]/div[1]/div[7]' },
                6: { name: "RIVALIUM", xpath: '/html/body/div[6]/div[1]/div[9]' },
                7: { name: "HELIUM", xpath: '/html/body/div[6]/div[1]/div[8]' }
            };

            // Save the selected resource to the global variable
            selectedResource = resources[parseInt(resource)];

            // Step 2: Ask the user for the lowest price at which they would sell the resource
            let userPrice = prompt("Enter the lowest price at which you would sell the resource (no commas or dots):");
            minimumPrice = parseFloat(userPrice.replace(/[^0-9]/g, ''));
        }

        // Find the resource on the page and click it
        let resourceXpath = selectedResource.xpath;
        let resourceElement = await waitForElement(resourceXpath);
        if (resourceElement) {
            resourceElement.click();
        } else {
            alert("Could not find the resource. The script will stop.");
            return;
        }

        // Step 5: Get the current price on the page
        let priceXpath = '/html/body/div[6]/div[1]/div[1]/div[2]/div[1]/div[3]/span/span';
        let priceElement = await waitForElement(priceXpath);

        if (priceElement) {
            let currentPriceText = priceElement.innerText.replace(/[^0-9]/g, ''); // Remove non-numeric characters
            let currentPrice = parseFloat(currentPriceText);

            // Step 6: Check if the transaction is profitable
            if (currentPrice < minimumPrice) {
                alert("Transaction not profitable. We will try again in 2 minutes.");
                setTimeout(runScript, 120000); // Wait 2 minutes before trying again
            } else {
                // Step 7: Click on the next button (simulate click with MouseEvent)
                let nextXpath = '/html/body/div[6]/div[1]/div[1]/div[1]/div/span';
                let nextElement = await waitForElement(nextXpath);
                if (nextElement) {
                    simulateClick(nextElement);

                    // Step 8: Enter the number in the text field
                    let textFieldXpath = '/html/body/div[6]/div[1]/div[1]/div[2]/div[3]/input';
                    let textField = await waitForElement(textFieldXpath);
                    if (textField) {
                        await typeText(textField, (currentPrice - 1).toString());

                        // Step 9: Check if the confirmation button is enabled
                        let confirmButtonXpath = '/html/body/div[6]/div[1]/div[1]/div[2]/div[4]/div';
                        let confirmButton = await waitForElement(confirmButtonXpath);
                        if (confirmButton) {
                            if (confirmButton.classList.contains('no_pointer')) {
                                confirmButton.classList.remove('no_pointer');
                                confirmButton.classList.add('button_green');
                            }

                            simulateClick(confirmButton);

                            // Step 10: Wait 2 minutes and repeat the process
                            setTimeout(runScript, 120000); // Wait 2 minutes before restarting the process
                        } else {
                            alert("Could not find the confirm button. The script will stop.");
                        }
                    }
                } else {
                    alert("Could not find the next button. The script will stop.");
                }
            }
        } else {
            alert("Could not get the current resource price. The script will stop.");
        }

        // After completing the entire process, hide the notification
        hideNotification();
    }

    // Execute the main function
    runScript();
})();
