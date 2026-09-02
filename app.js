const chartData = {
  day: { values: [22, 28, 35, 62, 48, 77, 94, 69, 55, 82, 45, 30], labels: ['0h','2h','4h','6h','8h','10h','12h','14h','16h','18h','20h','22h'], total: '482 L', comparison: '↓ 12% comparado a ontem' },
  week: { values: [61, 74, 58, 82, 66, 90, 53], labels: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'], total: '3.240 L', comparison: '↓ 6% comparado à semana anterior' },
  month: { values: [48, 58, 63, 54, 71, 66, 74, 62, 81, 73, 69, 86], labels: ['1','3','5','7','9','11','13','15','17','19','21','23'], total: '13,8 m³', comparison: '↓ 8% comparado ao mês anterior' }
};

const barChart = document.querySelector('#barChart');
const chartAxis = document.querySelector('#chartAxis');

function renderChart(period = 'day') {
  const data = chartData[period];
  const max = Math.max(...data.values);
  barChart.innerHTML = data.values.map((value, index) => `<button type="button" style="height:${Math.max(12, value / max * 100)}%" data-value="${value}${period === 'month' ? '%' : ' L'}" aria-label="${data.labels[index]}: ${value}"></button>`).join('');
  chartAxis.innerHTML = data.labels.map(label => `<span>${label}</span>`).join('');
  document.querySelector('#chartTotal').textContent = data.total;
  document.querySelector('#chartComparison').textContent = data.comparison;
}

document.querySelectorAll('[data-period]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-period]').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  renderChart(button.dataset.period);
}));

function renderSparkline() {
  const values = [35, 48, 40, 72, 55, 78, 68, 90, 60, 74, 53, 69];
  document.querySelector('#sparkline').innerHTML = values.map(value => `<i style="height:${value}%"></i>`).join('');
}

const alertRows = () => [...document.querySelectorAll('[data-alert]')];
function refreshAlerts() {
  const count = alertRows().length;
  document.querySelector('#activeAlerts').textContent = count;
  document.querySelector('#alertBadge').textContent = count;
  document.querySelector('#alertBadge').style.display = count ? '' : 'none';
  document.querySelector('#alertsList').style.display = count ? '' : 'none';
  document.querySelector('#emptyAlerts').classList.toggle('show', count === 0);
}

document.querySelectorAll('.resolve-button').forEach(button => button.addEventListener('click', () => {
  const row = button.closest('[data-alert]');
  row.style.opacity = '0'; row.style.transform = 'translateX(10px)';
  setTimeout(() => { row.remove(); refreshAlerts(); }, 240);
}));
document.querySelector('#resolveAll').addEventListener('click', () => { alertRows().forEach(row => row.remove()); refreshAlerts(); });

const menuButton = document.querySelector('#menuButton');
const sidebar = document.querySelector('#sidebar');
menuButton.addEventListener('click', () => {
  const open = sidebar.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', () => {
  document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
  link.classList.add('active'); sidebar.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false');
}));
document.querySelectorAll('[data-scroll]').forEach(button => button.addEventListener('click', () => document.querySelector(button.dataset.scroll).scrollIntoView({ behavior: 'smooth' })));

let today = 482;
setInterval(() => {
  const flow = Math.max(0, 4.2 + (Math.random() - .5) * 1.3);
  document.querySelector('#flowValue').textContent = flow.toFixed(1).replace('.', ',');
  if (flow > 0.5) today += flow / 12;
  document.querySelector('#todayValue').textContent = Math.round(today);
  document.querySelector('#syncTime').textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}, 5000);

renderChart(); renderSparkline(); refreshAlerts();
