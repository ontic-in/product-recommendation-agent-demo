"use strict";

/**
 * Retail Agent Assistant
 * Embeds a chat widget with floating message prompts
 */

// Configuration
var MESSAGES = [{
  text: "Hi there! 👋" + "Looking for something perfect? I'm here to help you find the best products based on your preferences, needs, and budget. Just tell me what you're looking for, and I’ll take care of the rest!",
  position: "left",
  delay: 500,
  id: "intro-msg"
}, {
  text: "Can you recommend me some sofa sets?",
  position: "right",
  delay: 1000,
  id: "rec-sofa-sets-question"
}, {
  text: "Can you find a sofa with storage?",
  position: "right",
  delay: 2000,
  id: "rec-sofa-sets-with-storage-question"
}];
var AGENT_ID = "00D7x00000EuqtW";
var AGENT_NAME = "Product_Recommendation_Agent_ESD";
var AGENT_URL = "https://realfast-ai--sandboxjtb.sandbox.my.site.com/ESWProductRecommendation1743574996532";

// Create and inject CSS styles
function injectStyles() {
  var style = document.createElement("style");
  style.textContent = "\n    .floating-message-container {\n      position: fixed;\n      bottom: 100px;\n      right: 20px;\n      width: auto;\n      font-family: Arial, sans-serif;\n      display: flex;\n      flex-direction: column;\n      align-items: flex-end;\n      gap: 10px;\n      z-index: 999999;\n    }\n    \n    .floating-message {\n      max-width: 360px;\n      padding: 15px 20px;\n      border-radius: 18px;\n      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);\n      animation: fadeIn 0.5s ease-out;\n      position: relative;\n      background: white;\n      color: #333;\n      transition: all 0.3s ease;\n      cursor: pointer;\n    }\n    \n    .clickable {\n      border-radius: 100px;\n      color: #3277e6;\n    }\n\n    .floating-message:hover {\n      opacity: 0.9;\n    }\n    \n    .floating-chat-icon {\n      position: fixed;\n      bottom: 20px;\n      right: 20px;\n      width: 60px;\n      height: 60px;\n      background: #28323c;\n      border-radius: 50%;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);\n      cursor: pointer;\n      z-index: 10000;\n    }\n    \n    .floating-chat-icon svg {\n      width: 30px;\n      height: 30px;\n      fill: white;\n    }\n    \n    @keyframes fadeIn {\n      from { opacity: 0; transform: translateY(20px); }\n      to { opacity: 1; transform: translateY(0); }\n    }\n\n    .close-prompt-messages-btn {\n      position: relative;\n      background: #f9fafbAA;\n      border: none;\n      outline: none;\n      border-radius: 25px;\n      height: 32px;\n      width: 32px;\n      cursor: pointer;\n      color: #555;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n    }\n  ";
  document.head.appendChild(style);
}

// Fetch IP address and set as hidden field
function setIPAddress() {
  if (!window.fetch) return;
  fetch("https://api.ipify.org?format=json").then(function (response) {
    if (!response.ok) {
      throw new Error("HTTP error! Status: ".concat(response.status));
    }
    return response.json();
  }).then(function (data) {
    if (data && data.ip) {
      embeddedservice_bootstrap.prechatAPI.setHiddenPrechatFields({
        ip_address: data.ip
      });
    }
  }).catch(function (error) {
    console.warn("Could not retrieve IP address:", error.message);
  });
}

// Get UTM parameters from URL
function getUTMParam(param) {
  var urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param) || null;
}

// Track events using Clarity if available
function trackEvent(eventName) {
  if (window.clarity) {
    window.clarity("event", eventName);
  }
}

// Hide message prompts
function hideMessages() {
  var container = document.querySelector(".floating-message-container");
  if (container) {
    container.style.display = "none";
  }
}

// Open chat and hide message prompts
function openChat() {
  var chatButton = document.querySelector("#embeddedMessagingConversationButton");
  if (chatButton) {
    chatButton.click();
    hideMessages();
  } else {
    console.error("Chat button not found.");
  }
}

// Create and add a message to container
function addMessage(container, message, classes) {
  var messageElement = document.createElement("div");
  messageElement.className = "floating-message ".concat(classes);
  messageElement.textContent = message.text;
  messageElement.id = message.id;
  messageElement.addEventListener("click", function () {
    trackEvent("Clicked_".concat(message.id));
    openChat();
  });
  container.appendChild(messageElement);
}

// Display message prompts
function showMessages() {
  // Create container if it doesn't exist
  var container = document.querySelector(".floating-message-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "floating-message-container";
    document.body.appendChild(container);
  }

  // Create close button
  var closeButton = document.createElement("button");
  closeButton.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z\"/></svg>";
  closeButton.className = "close-prompt-messages-btn";
  closeButton.onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();
    hideMessages();
    trackEvent("Clicked_Close_Chat");
  };
  container.appendChild(closeButton);

  // Display messages with delays
  MESSAGES.forEach(function (message, index) {
    setTimeout(function () {
      var classes = index > 0 ? "clickable" : "";
      addMessage(container, message, classes);
    }, message.delay);
  });
}

// Initialize message prompts with retry logic
function initMessagePrompts() {
  var attempts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
  // get the salesforce chat widget
  var chatButton = document.querySelector("#embeddedMessagingConversationButton");
  if (chatButton) {
    showMessages();

    // Add event listener to native chat button
    chatButton.addEventListener("click", function () {
      hideMessages();
      trackEvent("Clicked_Open_Chat");
    });
    console.log("Chat prompts initialized successfully.");
  } else if (attempts > 0) {
    console.warn("Chat button not found. Retrying...");
    setTimeout(function () {
      return initMessagePrompts(attempts - 1);
    }, 1000);
  } else {
    console.error("Failed to initialize chat prompts after multiple attempts.");
  }
}

// Initialize embedded messaging service
function initEmbeddedMessaging() {
  try {
    embeddedservice_bootstrap.settings.language = "en_US";

    // Handle ready event
    window.addEventListener("onEmbeddedMessagingReady", function () {
      console.log("Embedded messaging ready");
      embeddedservice_bootstrap.prechatAPI.setHiddenPrechatFields({
        utm_source: getUTMParam("utm_source"),
        utm_campaign: getUTMParam("utm_campaign"),
        utm_content: getUTMParam("utm_content"),
        utm_term: getUTMParam("utm_term"),
        utm_medium: getUTMParam("utm_medium")
      });
      setIPAddress();
    });

    // Initialize the embedded service
    embeddedservice_bootstrap.init(AGENT_ID, AGENT_NAME, AGENT_URL, {
      scrt2URL: "https://realfast-ai--sandboxjtb.sandbox.my.salesforce-scrt.com"
    });

    // Check if widget was previously opened
    var widgetStorage = localStorage.getItem("".concat(AGENT_ID, "_WEB_STORAGE"));
    var widgetData = JSON.parse(widgetStorage || "{}");

    // Open the message hints if the widget was never opened
    if (!(widgetData && widgetData.CONVERSATION_BUTTON_CLICK_TIME)) {
      setTimeout(function () {
        return initMessagePrompts();
      }, 1000);
    }

    // Show message prompts after a delay
  } catch (err) {
    console.error("Error loading Embedded Messaging:", err);
  }
}

// Initialize styles to show question prompts
(function () {
  injectStyles();
})();
//# sourceMappingURL=realfast.js.map