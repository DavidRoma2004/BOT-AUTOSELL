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
(function() {
    'use strict';

    // Definir la licencia directamente en el código
    const LICENCIA = "1234";  // Cambia este valor cuando actualices la licencia
    const DURACION_LICENCIA = 30;  // Duración de la licencia en días (1 mes)

    // Función para obtener la fecha actual en formato YYYY-MM-DD
    function obtenerFechaActual() {
        return new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    }

    // Función para obtener la licencia almacenada en localStorage
    function obtenerLicenciaGuardada() {
        return JSON.parse(localStorage.getItem("licencia_data"));
    }

    // Función para guardar la licencia en localStorage
    function guardarLicencia() {
        const fechaActivacion = obtenerFechaActual();
        const fechaExpiracion = new Date();
        fechaExpiracion.setDate(fechaExpiracion.getDate() + DURACION_LICENCIA); // Sumar 1 mes (30 días)

        const licenciaData = {
            codigo: LICENCIA,
            fecha_activacion: fechaActivacion,
            fecha_expiracion: fechaExpiracion.toISOString().split('T')[0] // Guardar en formato YYYY-MM-DD
        };

        localStorage.setItem("licencia_data", JSON.stringify(licenciaData));
    }

    // Función para verificar si la licencia es válida
    function verificarLicencia() {
        const licenciaData = obtenerLicenciaGuardada();

        if (!licenciaData) {
            console.log("❌ No hay licencia guardada. Guardando la nueva licencia...");
            guardarLicencia();  // Guardamos la nueva licencia al ejecutarse por primera vez
            alert("✅ Licencia activada. Expira en 1 mes.");
            ejecutarCodigo(); // Ejecutar el código
            return;
        }

        const hoy = new Date(obtenerFechaActual());
        const fechaExpiracion = new Date(licenciaData.fecha_expiracion);

        if (hoy > fechaExpiracion) {
            alert("⏳ Tu licencia ha expirado. Ingresa una nueva licencia.");
            localStorage.removeItem("licencia_data"); // Eliminar la licencia caducada
            return;
        }

        console.log("✅ Licencia válida hasta:", licenciaData.fecha_expiracion);
        ejecutarCodigo(); // Ejecutar el código si la licencia es válida
    }

    // Función para ejecutar el código del script
    function ejecutarCodigo() {
        console.log("🔥 Código del script ejecutándose...");
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
        // Clear the text field before writing
        field.value = ''; // This line clears the text field

        for (let i = 0; i < text.length; i++) {
            field.value += text.charAt(i);
            await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100)); // Random delay between 100 and 400 ms
        }
        // Simulate the input event to trigger class change
        field.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Function to show notification with loading emoji and keep it on screen
    function showNotification(message) {
        // Create the notification container if it doesn't exist
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

        // Update the message and emoji to show loading
        notification.innerHTML = `${message} <span>⏳</span>`;
        notification.style.opacity = '1'; // Ensure it's visible
    }

    // Function to hide the notification
    function hideNotification() {
        let notification = document.getElementById('script-notification');
        if (notification) {
            notification.style.opacity = '0'; // Fade out the notification
            setTimeout(() => {
                notification.style.display = 'none'; // After fading out, remove the notification
            }, 300); // Wait for the fade effect to complete before hiding
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
        let resourceContainerXpath = '/html/body/div[6]/div[1]'; // Adjust this XPath if needed
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
            selectedResource = resources[resource];

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
                setTimeout(runScript, 60000); // Wait 1 minutes before trying again
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
                        // Clear the text field and type the price minus 1 realistically
                        await typeText(textField, (currentPrice - 1).toString());

                        // Step 9: Check if the confirmation button is enabled
                        let confirmButtonXpath = '/html/body/div[6]/div[1]/div[1]/div[2]/div[4]/div';
                        let confirmButton = await waitForElement(confirmButtonXpath);
                        if (confirmButton) {
                            // Check if the button is disabled (with the 'no_pointer' class)
                            if (confirmButton.classList.contains('no_pointer')) {
                                // Change the class to enable the button (remove 'no_pointer' and add 'button_green')
                                confirmButton.classList.remove('no_pointer');
                                confirmButton.classList.add('button_green');
                            }

                            // Now that the button has the correct class, simulate a click
                            simulateClick(confirmButton);

                            // Step 10: Wait 1 minutes and repeat the process
                            setTimeout(runScript, 60000); // Wait 1 minutes before restarting the process
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
    }

    // Verificar licencia al inicio
    verificarLicencia();
})();
