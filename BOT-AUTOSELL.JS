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

    // Licencia del script
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

    // ========================== FUNCIONES DE INTERACCIÓN CON LA PÁGINA ==========================

    // Esperar a que un elemento esté disponible
    function waitForElement(xpath) {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                let element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (element) {
                    clearInterval(interval);
                    resolve(element);
                }
            }, 500); // Revisar cada 500ms
        });
    }

    // Simular un clic en un elemento
    function simulateClick(element) {
        const mouseEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        element.dispatchEvent(mouseEvent);
    }

    // Escribir texto en un campo de entrada de forma realista
    async function typeText(field, text) {
        field.value = ''; // Limpiar el campo de texto

        for (let i = 0; i < text.length; i++) {
            field.value += text.charAt(i);
            await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100)); // Retraso aleatorio entre 100 y 400ms
        }
        field.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Mostrar una notificación
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
        notification.style.opacity = '1';
    }

    // Ocultar la notificación
    function hideNotification() {
        let notification = document.getElementById('script-notification');
        if (notification) {
            notification.style.opacity = '0'; 
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }
    }

    // ========================== FUNCIÓN PRINCIPAL DEL SCRIPT ==========================

    // Función principal que ejecuta el script
    async function runScript() {
        showNotification("El script está esperando...");

        if (window.location.href !== 'https://rivalregions.com/#storage') {
            console.log("Este script solo corre en la página de almacenamiento.");
            return;
        }

        // Esperar hasta que el contenedor de recursos esté disponible
        const resourceContainerXpath = '/html/body/div[6]/div[1]';
        await waitForElement(resourceContainerXpath);

        let selectedResource = await getUserResourceChoice();

        if (!selectedResource) {
            alert("No se seleccionó un recurso válido. El script se detendrá.");
            return;
        }

        // Esperar que el precio esté disponible y tomar acción según el precio
        await handleResourceTransaction(selectedResource);
        
        hideNotification();  // Ocultar la notificación después de completar el proceso
    }

    // Obtener la elección del recurso por parte del usuario
    async function getUserResourceChoice() {
        let resource = prompt("Ingresa un número para elegir el recurso:\n1: OIL\n2: ORE\n3: DIAMOND\n4: URANIUM\n5: OXYGEN\n6: RIVALIUM\n7: HELIUM");

        const resources = {
            1: { name: "OIL", xpath: '/html/body/div[6]/div[1]/div[3]' },
            2: { name: "ORE", xpath: '/html/body/div[6]/div[1]/div[4]' },
            3: { name: "DIAMOND", xpath: '/html/body/div[6]/div[1]/div[6]' },
            4: { name: "URANIUM", xpath: '/html/body/div[6]/div[1]/div[5]' },
            5: { name: "OXYGEN", xpath: '/html/body/div[6]/div[1]/div[7]' },
            6: { name: "RIVALIUM", xpath: '/html/body/div[6]/div[1]/div[9]' },
            7: { name: "HELIUM", xpath: '/html/body/div[6]/div[1]/div[8]' }
        };

        if (resources[resource]) {
            return resources[resource];
        } else {
            return null;
        }
    }

    // Manejar la transacción del recurso seleccionado
    async function handleResourceTransaction(selectedResource) {
        const resourceElement = await waitForElement(selectedResource.xpath);
        if (resourceElement) {
            resourceElement.click();
        } else {
            alert("No se encontró el recurso. El script se detendrá.");
            return;
        }

        const priceXpath = '/html/body/div[6]/div[1]/div[1]/div[2]/div[1]/div[3]/span/span';
        let priceElement = await waitForElement(priceXpath);

        if (priceElement) {
            const currentPrice = parseFloat(priceElement.innerText.replace(/[^0-9]/g, ''));
            const minimumPrice = await getMinimumPrice();
            
            if (currentPrice < minimumPrice) {
                alert("La transacción no es rentable. Intentaremos de nuevo en 2 minutos.");
                setTimeout(runScript, 120000); // Intentar nuevamente después de 2 minutos
            } else {
                await processTransaction(currentPrice);
            }
        } else {
            alert("No se pudo obtener el precio actual. El script se detendrá.");
        }
    }

    // Obtener el precio mínimo de transacción
    async function getMinimumPrice() {
        let userPrice = prompt("Ingresa el precio más bajo al que venderías el recurso:");
        return parseFloat(userPrice.replace(/[^0-9]/g, ''));
    }

    // Procesar la transacción: clic en el botón 'Next', escribir el precio y confirmar
    async function processTransaction(currentPrice) {
        const nextXpath = '/html/body/div[6]/div[1]/div[1]/div[1]/div/span';
        let nextElement = await waitForElement(nextXpath);

        if (nextElement) {
            simulateClick(nextElement);
            
            const textFieldXpath = '/html/body/div[6]/div[1]/div[1]/div[2]/div[3]/input';
            let textField = await waitForElement(textFieldXpath);
            await typeText(textField, (currentPrice - 1).toString());

            const confirmButtonXpath = '/html/body/div[6]/div[1]/div[1]/div[2]/div[4]/div';
            let confirmButton = await waitForElement(confirmButtonXpath);
            if (confirmButton) {
                if (confirmButton.classList.contains('no_pointer')) {
                    confirmButton.classList.remove('no_pointer');
                    confirmButton.classList.add('button_green');
                }

                simulateClick(confirmButton);
                setTimeout(runScript, 60000); // Repetir el proceso cada 1 minuto
            }
        } else {
            alert("No se encontró el botón de siguiente. El script se detendrá.");
        }
    }

    // Verificar la licencia al inicio
    verificarLicencia();
})();
