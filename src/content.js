// Function to check if current URL is excluded
function isUrlExcluded() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["excludedUrls"], function (result) {
      const excludedUrls = result.excludedUrls || [];
      const currentUrl = window.location.hostname;

      // Check if current URL matches any of the excluded URLs
      const isExcluded = excludedUrls.some((url) => {
        // Remove http://, https://, and www. if present
        const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, "");
        const cleanCurrentUrl = currentUrl.replace(
          /^(https?:\/\/)?(www\.)?/,
          ""
        );

        // Check if the clean URL is included in the current URL
        return cleanCurrentUrl.includes(cleanUrl);
      });

      resolve(isExcluded);
    });
  });
}

// Function to convert a date to Persian format
function convertToPersianDate(date) {
  try {
    const persianDate = new Date(date).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    return persianDate;
  } catch (error) {
    console.error("Error converting date:", error);
    return date;
  }
}

// Function to check if a string is a valid date
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// Function to find and convert dates in text content
function convertDatesInText(node) {
  const text = node.textContent;
  // Regular expression to match common date formats
  const dateRegex =
    /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b|\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/g;

  if (dateRegex.test(text)) {
    const dates = text.match(dateRegex);
    let newText = text;

    dates.forEach((date) => {
      if (isValidDate(date)) {
        const persianDate = convertToPersianDate(date);
        newText = newText.replace(date, persianDate);
      }
    });

    if (newText !== text) {
      node.textContent = newText;
    }
  }
}

// Function to walk through the DOM and process text nodes
function walkDOM(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    convertDatesInText(node);
  } else {
    for (let child of node.childNodes) {
      walkDOM(child);
    }
  }
}

// Function to initialize date conversion
async function initializeDateConversion() {
  // Check if current URL is excluded
  const excluded = await isUrlExcluded();
  if (excluded) {
    return; // Don't convert dates if URL is excluded
  }

  // First immediate conversion
  walkDOM(document.body);

  // Second conversion after a short delay to catch any late-loading content
  setTimeout(() => {
    walkDOM(document.body);
  }, 1000);
}

// Start the conversion process when the page is fully loaded
window.addEventListener("load", initializeDateConversion);

// Also run on dynamic content changes
const observer = new MutationObserver((mutations) => {
  isUrlExcluded().then((excluded) => {
    if (excluded) return; // Don't convert dates if URL is excluded

    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            walkDOM(node);
          }
        });
      } else if (mutation.type === "characterData") {
        convertDatesInText(mutation.target);
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});
