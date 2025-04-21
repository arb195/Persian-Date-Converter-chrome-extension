// Load excluded URLs when popup opens
document.addEventListener("DOMContentLoaded", loadExcludedUrls);

// Add URL button click handler
document.getElementById("addUrl").addEventListener("click", addNewUrl);

// Function to load excluded URLs from storage
function loadExcludedUrls() {
  chrome.storage.sync.get(["excludedUrls"], function (result) {
    const excludedUrls = result.excludedUrls || [];
    displayUrls(excludedUrls);
  });
}

// Function to display URLs in the popup
function displayUrls(urls) {
  const container = document.getElementById("excludedUrls");
  container.innerHTML = "";

  urls.forEach((url) => {
    const urlItem = document.createElement("div");
    urlItem.className = "url-item";

    const urlText = document.createElement("span");
    urlText.textContent = url;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "حذف";
    deleteBtn.onclick = () => deleteUrl(url);

    urlItem.appendChild(urlText);
    urlItem.appendChild(deleteBtn);
    container.appendChild(urlItem);
  });
}

// Function to add a new URL
function addNewUrl() {
  const input = document.getElementById("urlInput");
  const url = input.value.trim();

  if (url) {
    chrome.storage.sync.get(["excludedUrls"], function (result) {
      const excludedUrls = result.excludedUrls || [];
      if (!excludedUrls.includes(url)) {
        excludedUrls.push(url);
        chrome.storage.sync.set({ excludedUrls: excludedUrls }, function () {
          displayUrls(excludedUrls);
          input.value = "";
        });
      }
    });
  }
}

// Function to delete a URL
function deleteUrl(urlToDelete) {
  chrome.storage.sync.get(["excludedUrls"], function (result) {
    const excludedUrls = result.excludedUrls || [];
    const updatedUrls = excludedUrls.filter((url) => url !== urlToDelete);
    chrome.storage.sync.set({ excludedUrls: updatedUrls }, function () {
      displayUrls(updatedUrls);
    });
  });
}
