document.addEventListener('DOMContentLoaded', function() {
  const sendBtn = document.getElementById('send-request');
  if (sendBtn) sendBtn.addEventListener('click', sendRequest);
  
  const addHeaderBtn = document.querySelector('.add-header');
  if (addHeaderBtn) addHeaderBtn.addEventListener('click', addHeaderRow);
});

function addHeaderRow() {
  const headersDiv = document.getElementById('headers');
  if (!headersDiv) return;
  
  const newRow = document.createElement('div');
  newRow.className = 'header-row';
  newRow.innerHTML = `
    <input type="text" placeholder="Key" class="header-key">
    <input type="text" placeholder="Value" class="header-value">
    <button class="remove-header">-</button>
  `;
  headersDiv.appendChild(newRow);
  
  const removeBtn = newRow.querySelector('.remove-header');
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
      headersDiv.removeChild(newRow);
    });
  }
}

async function sendRequest() {
  const method = document.getElementById('method')?.value || 'GET';
  const url = document.getElementById('url')?.value.trim();
  const requestBody = document.getElementById('request-body')?.value || '';
  const sendBtn = document.getElementById('send-request');
  const statusCodeEl = document.getElementById('status-code');
  const responseBodyEl = document.getElementById('response-body');

  // Reset UI
  if (statusCodeEl) statusCodeEl.textContent = '';
  if (responseBodyEl) {
    responseBodyEl.textContent = '';
    responseBodyEl.style.color = 'inherit';
  }

  // Validate URL
  if (!url) {
    showError('Please enter a URL');
    return;
  }

  // Collect headers
  const headers = {};
  document.querySelectorAll('.header-row').forEach(row => {
    const key = row.querySelector('.header-key')?.value.trim();
    const value = row.querySelector('.header-value')?.value.trim();
    if (key && value) headers[key] = value;
  });

  // Prepare request
  const options = {
    method: method,
    headers: headers
  };

  // Handle request body
  if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (headers['Content-Type'].includes('application/json')) {
      try {
        options.body = requestBody ? JSON.stringify(JSON.parse(requestBody)) : '{}';
      } catch (e) {
        showError('Invalid JSON format');
        return;
      }
    } else {
      options.body = requestBody;
    }
  }

  try {
    // Show loading state
    if (sendBtn) sendBtn.disabled = true;
    if (statusCodeEl) statusCodeEl.textContent = 'Sending...';

    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    let responseData;

    if (contentType?.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // Display results
    if (statusCodeEl) {
      statusCodeEl.textContent = `Status: ${response.status} ${response.statusText}`;
    }
    if (responseBodyEl) {
      responseBodyEl.textContent = typeof responseData === 'string' 
        ? responseData 
        : JSON.stringify(responseData, null, 2);
    }
  } catch (error) {
    showError(error.message);
    console.error('Request failed:', error);
  } finally {
    if (sendBtn) sendBtn.disabled = false;
  }
}

function showError(message) {
  const statusCodeEl = document.getElementById('status-code');
  const responseBodyEl = document.getElementById('response-body');

  if (statusCodeEl) statusCodeEl.textContent = 'Error';
  if (responseBodyEl) {
    responseBodyEl.textContent = message;
    responseBodyEl.style.color = 'red';
  }
}