const rockets = {
  gamma: 0,
  t1: 0,
  t2: 0,
  isOn: true
};

function update() {
  const v = document.getElementById("velocity").value;
  const time = Number(document.getElementById("time").value);
  const dist = Number(document.getElementById("length").value);
  const mass = Number(document.getElementById("mass").value);
  rockets.gamma = 1 / Math.sqrt(1 - v * v);
  const vTime = time * rockets.gamma;
  const vDist = dist / rockets.gamma;
  const vMass = mass * rockets.gamma;
  document.getElementById("velocity2").value = v * 3;
  document.getElementById("gamma").value = Math.round(rockets.gamma * 1000000000000) / 1000000000000;
  document.getElementById("v_time").value = vTime.toFixed(4);
  document.getElementById("v_length").value = vDist.toFixed(4);
  document.getElementById("v_mass").value = vMass.toFixed(4);
  // document.getElementById("length1").style.width = dist * 10 + "px";
  // document.getElementById("length2").style.width = vDist * 10 + "px";
}

function updateMoving() {
  const v = document.getElementById("velocity").value;
  rockets.gamma = 1 / Math.sqrt(1 - v * v);
  const vTime = Number(document.getElementById("v_time").value);
  const vDist = Number(document.getElementById("v_length").value);
  const vMass = Number(document.getElementById("v_mass").value);
  const time = vTime / rockets.gamma;
  const dist = vDist * rockets.gamma;
  const mass = vMass / rockets.gamma;
  document.getElementById("velocity2").value = v * 3;
  document.getElementById("gamma").value = Math.round(rockets.gamma * 1000000000000) / 1000000000000;
  document.getElementById("time").value = time.toFixed(4);
  document.getElementById("length").value = dist.toFixed(4);
  document.getElementById("mass").value = mass.toFixed(4);
  // document.getElementById("length1").style.width = dist * 10 + "px";
  // document.getElementById("length2").style.width = vDist * 10 + "px";
}
function convertVelocity() {
  const v = document.getElementById("velocity2").value / 3;
  document.getElementById("velocity").value = v;
  update();
}
function convertGamma() {
  const g = document.getElementById("gamma").value;
  document.getElementById("velocity").value = Math.sqrt(1 - 1 / g * (1 / g));
  update();
}
update();

document.getElementById("velocity").addEventListener("input", update);
document.getElementById("velocity2").addEventListener("input", convertVelocity);
document.getElementById("gamma").addEventListener("input", convertGamma);
document.getElementById("time").addEventListener("input", update);
document.getElementById("length").addEventListener("input", update);
document.getElementById("mass").addEventListener("input", update);
document.getElementById("v_time").addEventListener("input", updateMoving);
document.getElementById("v_length").addEventListener("input", updateMoving);
document.getElementById("v_mass").addEventListener("input", updateMoving);

//draw the clock
var canvas = document.getElementById("rockets");
var ctx = canvas.getContext("2d");

function drawRocket(x, y, time = 0, scale = 1) {
  //move canvas to the ship and compress in the horizontal direction
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, 1);

  //rocket fins
  ctx.fillStyle = "#D90429";
  ctx.beginPath();
  ctx.moveTo(20, 10);
  ctx.lineTo(-20, -10);
  ctx.quadraticCurveTo(20, -20, 100, 10);
  ctx.closePath();
  ctx.fill();
  //lower fin
  ctx.beginPath();
  ctx.moveTo(20, 90);
  ctx.lineTo(-20, 110);
  ctx.quadraticCurveTo(20, 120, 100, 90);
  ctx.closePath();
  ctx.fill();
  //rocket body
  ctx.fillStyle = "#EDF2F4";
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.quadraticCurveTo(140, -30, 200, 50);
  ctx.quadraticCurveTo(140, 130, 0, 90);
  ctx.closePath();
  ctx.fill();
  //nose
  ctx.fillStyle = "#D90429";
  ctx.beginPath();
  ctx.moveTo(179, 28);
  ctx.quadraticCurveTo(203, 49, 200, 50);
  ctx.quadraticCurveTo(203, 49, 179, 72);
  ctx.closePath();
  ctx.fill();

  //clock outline
  ctx.fillStyle = "#D3DBDE";
  ctx.beginPath();
  ctx.arc(80, 50, 45, 0, 2 * Math.PI * 60);
  ctx.fill();
  //clock

  ctx.fillStyle = "#2B2D42";
  ctx.beginPath();
  ctx.moveTo(80, 50);
  ctx.arc(80, 50, 45, 0, Math.round(time % (2 * Math.PI * 60)) / 60);
  ctx.fill();
  //undo canvas transformations
  ctx.restore();
}

//___________________animation loop ___________________
function cycle() {
  if (checkVisible(canvas) && rockets.isOn) {
    rockets.t1 += 1 / rockets.gamma;
    rockets.t2++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRocket(20, 20, rockets.t1, 1 / rockets.gamma);
    drawRocket(320, 20, rockets.t2);
  }
  requestAnimationFrame(cycle);
}
requestAnimationFrame(cycle);

function checkVisible(elm) {
  var rect = elm.getBoundingClientRect();
  var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

canvas.addEventListener("click", function() {
  if (rockets.isOn) {
    rockets.isOn = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    rockets.isOn = true;
  }
});
