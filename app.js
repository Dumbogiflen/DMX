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
const channelStatus = document.getElementById('channelStatus');
const settingsOverlay = document.getElementById('settingsOverlay');

function clamp(n,min,max){
  if(Number.isNaN(n)) return min;
  return Math.max(min,Math.min(max,n));
}
function pad3(n){ return String(n).padStart(3,'0'); }
function save(){
  localStorage.setItem('dmxAddress',String(address));
  localStorage.setItem('dmxChannels',String(channels));
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
  render();
}
function renderDips(){
  dipContainer.innerHTML = '';
  dipValues.forEach((value,idx)=>{
    const on = (address & value) === value;
    const btn = document.createElement('button');
    btn.className = 'dip' + (on ? ' on':'');
    btn.setAttribute('aria-pressed',on?'true':'false');
    btn.innerHTML = `
      <div class="dip-value">${value}</div>
      <div class="switch"><div class="switch-knob"></div></div>
      <div class="dip-index">${idx+1}</div>`;
    btn.addEventListener('click',()=>{
      const next = on ? address-value : address+value;
      if(next>=1 && next<=MAX_DMX) setAddress(next);
    });
    dipContainer.appendChild(btn);
  });
}
function renderWarning(){
  const lastChannel = address + channels - 1;
  if(lastChannel > MAX_DMX){
    rangeWarning.textContent = `${address}–${lastChannel} går over DMX 512`;
    rangeWarning.classList.remove('hidden');
  } else {
    rangeWarning.textContent = '';
    rangeWarning.classList.add('hidden');
  }
}
function render(){
  addressDisplay.textContent = pad3(address);
  binaryDisplay.textContent = address.toString(2).padStart(9,'0');
  channelsInput.value = channels;
  channelStatus.textContent = `${channels} kanaler`;
  renderDips();
  renderWarning();
}

document.getElementById('keypad').addEventListener('click',(e)=>{
  const btn = e.target.closest('button[data-key]');
  if(!btn) return;
  const key = btn.dataset.key;

  if(key==='clear'){
    keypadBuffer='';
    setAddress(1);
    return;
  }
  if(key==='back'){
    keypadBuffer = keypadBuffer.slice(0,-1);
    address = keypadBuffer.length ? clamp(parseInt(keypadBuffer,10),1,MAX_DMX) : 1;
    save(); render(); return;
  }

  keypadBuffer += key;
  let parsed = parseInt(keypadBuffer,10);
  if(parsed > MAX_DMX){
    keypadBuffer = key;
    parsed = parseInt(key,10);
  }
  address = parsed === 0 ? 1 : clamp(parsed,1,MAX_DMX);
  save(); render();
});

document.getElementById('previousBtn').addEventListener('click',()=>setAddress(address-channels));
document.getElementById('nextBtn').addEventListener('click',()=>setAddress(address+channels));
document.getElementById('resetBtn').addEventListener('click',()=>setAddress(1));

document.getElementById('settingsBtn').addEventListener('click',()=>{
  settingsOverlay.classList.remove('hidden');
  settingsOverlay.setAttribute('aria-hidden','false');
});
document.getElementById('closeSettingsBtn').addEventListener('click',closeSettings);
settingsOverlay.addEventListener('click',(e)=>{
  if(e.target===settingsOverlay) closeSettings();
});
function closeSettings(){
  settingsOverlay.classList.add('hidden');
  settingsOverlay.setAttribute('aria-hidden','true');
}

document.getElementById('channelsMinus').addEventListener('click',()=>setChannels(channels-1));
document.getElementById('channelsPlus').addEventListener('click',()=>setChannels(channels+1));
channelsInput.addEventListener('change',()=>setChannels(channelsInput.value));
channelsInput.addEventListener('input',()=>{
  const val = parseInt(channelsInput.value,10);
  if(!Number.isNaN(val)){
    channels = clamp(val,1,MAX_DMX);
    save();
    channelStatus.textContent = `${channels} kanaler`;
    renderWarning();
  }
});
document.querySelectorAll('[data-ch]').forEach(btn=>{
  btn.addEventListener('click',()=>setChannels(parseInt(btn.dataset.ch,10)));
});

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  });
}

render();
