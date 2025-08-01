
const dashboardCSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTy2OsKRSZmzWdCN2l7W3BeAkJiVffjZb2-0JLzhSZ_rOKiZchgUfHvbzxPY_Bm0i2crOF1jmRwczhd/pub?gid=387505936&single=true&output=csv';
const reportsCSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTy2OsKRSZmzWdCN2l7W3BeAkJiVffjZb2-0JLzhSZ_rOKiZchgUfHvbzxPY_Bm0i2crOF1jmRwczhd/pub?gid=986012157&single=true&output=csv';
const inboundCSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTy2OsKRSZmzWdCN2l7W3BeAkJiVffjZb2-0JLzhSZ_rOKiZchgUfHvbzxPY_Bm0i2crOF1jmRwczhd/pub?gid=0&single=true&output=csv';


function navigate(section) {
  document.querySelectorAll('.section').forEach(el => el.style.display = 'none');
  document.getElementById(section).style.display = 'block';
  if (section === 'dashboard') updateDashboard();
  if (section === 'reports') loadReports();
  if (section === 'inbound') loadInbound();
}

function loadInbound() {
  const tableContainer = document.getElementById('inboundTable');
  if (!tableContainer) return;

  showLoader('inboundTable');

  fetch(inboundCSV)
    .then(response => {
      if (!response.ok) throw new Error('Network error');
      return response.text();
    })
    .then(csvText => {
      const parsed = Papa.parse(csvText.trim(), { header: true });
      const dataRows = parsed.data;
      const headers = parsed.meta.fields;

      if (!headers || headers.length === 0 || dataRows.length === 0) {
        tableContainer.innerHTML = '<p>No data available.</p>';
        return;
      }

      let html = '<thead><tr>';
      headers.forEach(h => {
        html += `<th>${h}</th>`;
      });
      html += '</tr></thead><tbody>';

      for (const row of dataRows) {
        html += '<tr>';
        headers.forEach(header => {
          const key = header.toLowerCase();
          const value = (row[header] || '').trim();

          if (key.includes('photo')) {
            html += value
              ? `<td><img src="${value}" class="photo-thumb" onclick="openImage('${value}')"/></td>`
              : `<td></td>`;
          } else if (key.includes('condition')) {
            if (value.toLowerCase() === 'good') {
              html += `<td><span class="badge-green">${value}</span></td>`;
            } else if (value === '') {
              html += `<td></td>`;
            } else {
              html += `<td><span class="badge">${value}</span></td>`;
            }
          } else if (key.includes('completed')) {
            if (value.toLowerCase() === 'yes') {
              html += `<td><span class="badge-green">${value}</span></td>`;
            } else if (value === '') {
              html += `<td><span class="badge-yellow">On The Way</span></td>`;
            } else {
              html += `<td><span class="badge">${value}</span></td>`;
            }
          } else {
            html += `<td>${value}</td>`;
          }
        });
        html += '</tr>';
      }

      html += '</tbody>';
      tableContainer.innerHTML = html;
    })
    .catch(err => {
      console.error('Error loading inbound data:', err);
      tableContainer.innerHTML = `<p style="color:red;">Failed to load data.</p>`;
    });
}



function updateDashboard() {
  const container = document.getElementById('ringsContainer');
  showLoader('ringsContainer');

  fetch(dashboardCSV)
    .then(r => r.text())
    .then(text => {
      const lines = text.trim().split('\n').map(r => r.split(','));
      const header = lines[0]; // Get header row
      const month = document.getElementById('monthSelect').value;

      // Find the matching row for selected month
      const entry = lines.find((row, index) =>
        index > 0 && row[0].toLowerCase() === month.toLowerCase()
      );

      if (!entry) {
        container.innerHTML = '<p style="color:red;">No data found for selected month.</p>';
        return;
      }

      const received = entry[1] || "0";
      const shipped = entry[2] || "0";
      const asins = entry[4] || "0";
      const cost = entry[12] || "£0.00";

      const data = [
        { label: 'Units Received', value: received, cls: 'glow-yellow' },
        { label: 'Units Shipped', value: shipped, cls: 'glow-green' },
        { label: 'Total ASINs', value: asins, cls: 'glow-blue' },
        { label: 'Cost (ex. VAT)', value: `£${parseFloat(cost).toFixed(2)}`, cls: 'glow-red' },
      ];

      container.innerHTML = '';
      for (const item of data) {
        const div = document.createElement('div');
        div.className = `ring ${item.cls}`;
        div.innerHTML = `<div>${item.value}</div><div style="font-size:13px; margin-top:5px;">${item.label}</div>`;
        container.appendChild(div);
      }
    });
}


function loadReports() {
  const table = document.getElementById('reportsTable');
  if (!table) return;

  showLoader('reportsTable');

  fetch(reportsCSV)
    .then(response => {
      if (!response.ok) throw new Error('Network error');
      return response.text();
    })
    .then(csvText => {
      const parsed = Papa.parse(csvText.trim(), { header: true });
      const dataRows = parsed.data;
      let headers = parsed.meta.fields || [];

      // Filter out any empty or undefined headers
      headers = headers.filter(Boolean);
      console.log("Headers:", headers);

      if (!headers.length || !dataRows.length) {
        table.innerHTML = '<p>No data available.</p>';
        return;
      }

      let html = '<thead><tr>';
      headers.forEach(h => {
        html += `<th>${h}</th>`;
      });
      html += '</tr></thead><tbody>';

      for (const row of dataRows) {
        html += '<tr>';
        headers.forEach(header => {
          const key = header.toLowerCase();
          const value = (row[header] || '').trim();

          if (key.includes('shipment')) {
            html += `<td><span class="badge">${value}</span></td>`;
          } else if (key.includes('photo')) {
            html += value
              ? `<td><img src="${value}" class="photo-thumb" onclick="openImage('${value}')"/></td>`
              : `<td></td>`;
          } else {
            html += `<td>${value}</td>`;
          }
        });
        html += '</tr>';
      }

      html += '</tbody>';
      table.innerHTML = html;
    })
    .catch(err => {
      console.error('Error loading reports data:', err);
      table.innerHTML = `<p style="color:red;">Failed to load data.</p>`;
    });
}



function getCurrentMonthName() {
  return new Date().toLocaleString('default', { month: 'long' });
}

document.addEventListener("DOMContentLoaded", () => {
  const currentMonth = getCurrentMonthName();
  const monthSelect = document.getElementById("monthSelect");
  if (monthSelect) {
    [...monthSelect.options].forEach((opt) => {
      if (opt.value.toLowerCase() === currentMonth.toLowerCase()) {
        opt.selected = true;
      }
    });
  }
  updateDashboard();
});

function showLoader(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '<div class="loader"></div>';
}

function closeModal() {
  document.getElementById("imageModal").style.display = "none";
}

function openImage(src) {
  document.getElementById("modalImage").src = src;
  document.getElementById("imageModal").style.display = "flex";
}

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById('toggleSidebar');
  const sidebar = document.getElementById('sidebar');
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });
});
