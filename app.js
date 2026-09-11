const MAX_DMX = 512;
const dipValues = [1,2,4,8,16,32,64,128,256];

let address = clamp(parseInt(localStorage.getItem('dmxAddress') || '1', 10), 1, MAX_DMX);
let channels = clamp(parseInt(localStorage.getItem('dmxChannels') || '15', 10), 1, MAX_DMX);
let keypadBuffer = '';

const addressDisplay = document.getElementById('addressDisplay');
const binaryDisplay = document.getElementById('binaryDisplay');
const dipContainer = document.getElementById('dipContainer');
const channelsInput = document.getElementById('channelsInput');
const rangeWarning = document.getElementById('rangeWarning');

function clamp(n, min, max){
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function pad3(n){ return String(n).padStart(3,'0'); }

function save(){
  localStorage.setItem('dmxAddress', String(address));
  localStorage.setItem('dmxChannels', String(channels));
}

function setAddress(n){
  address = clamp(Number(n),1,MAX_DMX);
  keypadBuffer = '';
  save();
  render();
}

function setChannels(n){
  channels = clamp(Number(n),1,MAX_DMX);
  channelsInput.value = channels;
  save();
  renderWarning();
}

function renderDips(){
  dipContainer.innerHTML = '';
  dipValues.forEach((value, idx) => {
    const on = (address & value) === value;
    const btn = document.createElement('button');
    btn.className = 'dip' + (on ? ' on' : '');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', `DIP ${idx+1}, værdi ${value}, ${on ? 'ON' : 'OFF'}`);
    btn.innerHTML = `
      <div class="dip-value">${value}</div>
      <div class="switch"><div class="switch-knob"></div></div>
      <div class="dip-index">${idx+1}</div>
    `;
    btn.addEventListener('click', () => {
      const next = on ? address - value : address + value;
      if(next >= 1 && next <= MAX_DMX) setAddress(next);
    });
    dipContainer.appendChild(btn);
  });
}

function renderWarning(){
  const lastChannel = address + channels - 1;
  if(lastChannel > MAX_DMX){
    rangeWarning.textContent = `Lampen bruger kanal ${address}–${lastChannel} og går derfor ud over DMX 512.`;
    rangeWarning.classList.remove('hidden');
  } else {
    rangeWarning.classList.add('hidden');
    rangeWarning.textContent = '';
  }
}

function render(){
  addressDisplay.textContent = pad3(address);
  binaryDisplay.textContent = address.toString(2).padStart(9,'0');
  channelsInput.value = channels;
  renderDips();
  renderWarning();
}

document.getElementById('keypad').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-key]');
  if(!btn) return;
  const key = btn.dataset.key;

  if(key === 'clear'){
    keypadBuffer = '';
    setAddress(1);
    return;
  }
  if(key === 'back'){
    keypadBuffer = keypadBuffer.slice(0,-1);
    if(keypadBuffer.length === 0){
      address = 1;
    } else {
      address = clamp(parseInt(keypadBuffer,10),1,MAX_DMX);
    }
    save();
    render();
    return;
  }

  keypadBuffer += key;
  let parsed = parseInt(keypadBuffer,10);
  if(parsed > MAX_DMX){
    keypadBuffer = key;
    parsed = parseInt(key,10);
  }
  if(parsed === 0){
    address = 1;
  } else {
    address = clamp(parsed,1,MAX_DMX);
  }
  save();
  render();
});

document.getElementById('previousBtn').addEventListener('click', () => setAddress(address - channels));
document.getElementById('nextBtn').addEventListener('click', () => setAddress(address + channels));

document.getElementById('channelsMinus').addEventListener('click', () => setChannels(channels - 1));
document.getElementById('channelsPlus').addEventListener('click', () => setChannels(channels + 1));

channelsInput.addEventListener('change', () => setChannels(channelsInput.value));
channelsInput.addEventListener('input', () => {
  const val = parseInt(channelsInput.value,10);
  if(!Number.isNaN(val)){
    channels = clamp(val,1,MAX_DMX);
    save();
    renderWarning();
  }
});

document.querySelectorAll('[data-ch]').forEach(btn => {
  btn.addEventListener('click', () => setChannels(parseInt(btn.dataset.ch,10)));
});

document.getElementById('resetBtn').addEventListener('click', () => setAddress(1));

if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

render();
