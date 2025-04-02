"use strict";

/**
 * Houzi AI Real Estate Assistant
 * Embeds a chat widget with floating message prompts
 */

// Configuration
const MESSAGES = [
  {
    text: "Hi there! 👋" + 
          "Looking for something perfect? I'm here to help you find the best products based on your preferences, needs, and budget. Just tell me what you're looking for, and I’ll take care of the rest!",
    position: "left",
    delay: 500,
    id: "intro-msg",
  },
  {
    text: "Can you recommend me some sofa sets?",
    position: "right",
    delay: 1000,
    id: "rec-sofa-sets-question",
  },
  {
    text: "Can you find a sofa with storage?",
    position: "right",
    delay: 2000,
    id: "rec-sofa-sets-with-storage-question",
  },
];

const AGENT_ID = "00D7x00000EuqtW";
const AGENT_NAME = "Product_Recommendation_Agent_ESD";
const AGENT_URL =
  "https://realfast-ai--sandboxjtb.sandbox.my.site.com/ESWProductRecommendation1743574996532";

// Create and inject CSS styles
function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .floating-message-container {
      position: fixed;
      bottom: 100px;
      right: 20px;
      width: auto;
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      z-index: 999999;
    }
    
    .floating-message {
      max-width: 360px;
      padding: 15px 20px;
      border-radius: 18px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      animation: fadeIn 0.5s ease-out;
      position: relative;
      background: white;
      color: #333;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .clickable {
      border-radius: 100px;
      color: #3277e6;
    }

    .floating-message:hover {
      opacity: 0.9;
    }
    
    .floating-chat-icon {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: #28323c;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      z-index: 10000;
    }
    
    .floating-chat-icon svg {
      width: 30px;
      height: 30px;
      fill: white;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .close-prompt-messages-btn {
      position: relative;
      background: #f9fafbAA;
      border: none;
      outline: none;
      border-radius: 25px;
      height: 32px;
      width: 32px;
      cursor: pointer;
      color: #555;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;
  document.head.appendChild(style);
}

// Fetch IP address and set as hidden field
function setIPAddress() {
  if (!window.fetch) return;

  fetch("https://api.ipify.org?format=json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.ip) {
        embeddedservice_bootstrap.prechatAPI.setHiddenPrechatFields({
          ip_address: data.ip,
        });
      }
    })
    .catch((error) => {
      console.warn("Could not retrieve IP address:", error.message);
    });
}

// Get UTM parameters from URL
function getUTMParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
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
  const container = document.querySelector(".floating-message-container");
  if (container) {
    container.style.display = "none";
  }
}

// Open chat and hide message prompts
function openChat() {
  const chatButton = document.querySelector(
    "#embeddedMessagingConversationButton"
  );
  if (chatButton) {
    chatButton.click();
    hideMessages();
  } else {
    console.error("Chat button not found.");
  }
}

// Create and add a message to container
function addMessage(container, message, classes) {
  const messageElement = document.createElement("div");
  messageElement.className = `floating-message ${classes}`;
  messageElement.textContent = message.text;
  messageElement.id = message.id;

  messageElement.addEventListener("click", function () {
    trackEvent(`Clicked_${message.id}`);
    openChat();
  });

  container.appendChild(messageElement);
}

// Display message prompts
function showMessages() {
  // Create container if it doesn't exist
  let container = document.querySelector(".floating-message-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "floating-message-container";
    document.body.appendChild(container);
  }

  // Create close button
  const closeButton = document.createElement("button");
  closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg>`;
  closeButton.className = "close-prompt-messages-btn";
  closeButton.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    hideMessages();
    trackEvent("Clicked_Close_Chat");
  };

  container.appendChild(closeButton);

  // Display messages with delays
  MESSAGES.forEach((message, index) => {
    setTimeout(() => {
      const classes = index > 0 ? "clickable" : "";
      addMessage(container, message, classes);
    }, message.delay);
  });
}

// Initialize message prompts with retry logic
function initMessagePrompts(attempts = 10) {
  // get the salesforce chat widget
  const chatButton = document.querySelector(
    "#embeddedMessagingConversationButton"
  );

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
    setTimeout(() => initMessagePrompts(attempts - 1), 1000);
  } else {
    console.error("Failed to initialize chat prompts after multiple attempts.");
  }
}

// Initialize embedded messaging service
function initEmbeddedMessaging() {
  try {
    embeddedservice_bootstrap.settings.language = "en_US";

    // Handle ready event
    window.addEventListener("onEmbeddedMessagingReady", () => {
      console.log("Embedded messaging ready");

      embeddedservice_bootstrap.prechatAPI.setHiddenPrechatFields({
        utm_source: getUTMParam("utm_source"),
        utm_campaign: getUTMParam("utm_campaign"),
        utm_content: getUTMParam("utm_content"),
        utm_term: getUTMParam("utm_term"),
        utm_medium: getUTMParam("utm_medium"),
      });

      setIPAddress();
    });

    // Initialize the embedded service
    embeddedservice_bootstrap.init(AGENT_ID, AGENT_NAME, AGENT_URL, {
      scrt2URL: "https://realfast-ai--sandboxjtb.sandbox.my.salesforce-scrt.com",
    });

    // Check if widget was previously opened
    const widgetStorage = localStorage.getItem(`${AGENT_ID}_WEB_STORAGE`);
    const widgetData = JSON.parse(widgetStorage || "{}");

    // Open the message hints if the widget was never opened
    if (!(widgetData && widgetData.CONVERSATION_BUTTON_CLICK_TIME)) {
      setTimeout(() => initMessagePrompts(), 1000);
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
