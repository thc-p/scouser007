
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
    .then(csv => {
      const rows = csv.trim().split('\n').map(r => r.split(','));
      if (rows.length < 2) {
        tableContainer.innerHTML = '<p>No data available.</p>';
        return;
      }

      const headers = rows[0];
      const dataRows = rows.slice(1).filter(row => row.length >= headers.length);

      let html = '<thead><tr>';
      headers.forEach(h => {
        html += `<th>${h}</th>`;
      });
      html += '</tr></thead><tbody>';

      for (const row of dataRows) {
        html += '<tr>';
        for (let i = 0; i < headers.length; i++) {
          const header = headers[i]?.toLowerCase();
          const value = (row[i] || '').trim();

          if (header.includes('photo')) {
            if (value) {
              html += `<td><img src="${value}" class="photo-thumb" onclick="openImage('${value}')"/></td>`;
            } else {
              html += `<td></td>`;
            }
          } else if (header.includes('condition')) {
            if (value.toLowerCase() === 'good') {
              html += `<td><span class="badge-green">${value}</span></td>`;
            } else if (value === '') {
              html += `<td></td>`;
            } else {
              html += `<td><span class="badge">${value}</span></td>`;
            }
          } else if (header.includes('completed')) {
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
        }
        html += '</tr>';
      }




function updateDashboard() {
  const container = document.getElementById('ringsContainer');
  showLoader('ringsContainer');
  fetch(dashboardCSV).then(r => r.text()).then(text => {
    const lines = text.trim().split('\n').map(r => r.split(','));
    const month = document.getElementById('monthSelect').value;
    const entry = lines.find(row => row[0].toLowerCase() === month.toLowerCase());
    const [, received, shipped, , asins] = entry || [];
    const r = received || "0", s = shipped || "0", a = asins || "0";
    const cost = (parseInt(s) < 1000 ? 0.25 : 0.20) * parseInt(s);
    const data = [
      { label: 'Units Received', value: r, cls: 'glow-yellow' },
      { label: 'Units Shipped', value: s, cls: 'glow-green' },
      { label: 'Total ASINs', value: a, cls: 'glow-blue' },
      { label: 'Cost (ex. VAT)', value: `£${cost.toFixed(2)}`, cls: 'glow-red' },
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
  showLoader('reportsTable');
  fetch(reportsCSV).then(r => r.text()).then(text => {
    const rows = text.trim().split('\n').map(r => r.split(','));
    const header = rows[0];
    const bodyRows = rows.slice(1);
    let html = '<thead><tr>';
    for (const h of header) {
      html += `<th>${h}</th>`;
    }
    html += '</tr></thead><tbody>';
    for (const row of bodyRows) {
      html += '<tr>';
      row.forEach((cell, index) => {
        if (header[index].toLowerCase().includes('shipment')) {
          html += `<td><span class="badge">${cell}</span></td>`;
        } else if (header[index].toLowerCase().includes('photo')) {
          html += `<td><img src="${cell}" class="photo-thumb" onclick="openImage('${cell}')"/></td>`;
        } else {
          html += `<td>${cell}</td>`;
        }
      });
      html += '</tr>';
    }
    html += '</tbody>';
    table.innerHTML = html;
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
