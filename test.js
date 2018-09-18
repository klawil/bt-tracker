const noble = require('noble');
const KalmanFilter = require('kalmanjs').default;

// Clear the console
process.stdout.write('\x1Bc');

// Used to determine which line we should use
let ids = {};
let index = 0;
let stdout = process.stdout;
let longest = 0;
let filters = {};

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning([], true);
  }
});

noble.on('discover', function(p) {
  let lineStart = `${p.advertisement.localName} (${p.address} [${p.addressType}]):`;

  if (lineStart.length > longest) {
    longest = lineStart.length;
  }

  lineStart = lineStart + ' '.repeat(longest - lineStart.length);

  if (typeof ids[p.address] === 'undefined') {
    ids[p.address] = index;
    index++;
  }

  let power = p.measuredPower || p.advertisement.txPower || p.advertisement.txPowerLevel;

  let powerInt = p.measuredPower
    ? 0
    : p.advertisement.txPower
      ? 1
      : 2;

  let dist = Math.round(distance(p.address, p.rssi, power) * 100) / 100;

  if (dist > 10E4) {
    dist = 'OVER  ';
  } else {
    dist = dist.toString().split('.');
    if (dist.length < 2) {
      dist.push('00');
    } else {
      dist[1] = ('00' + dist[1]).slice(-2);
    }

    dist = ('000000' + dist.join('.')).slice(-6);
  }

  stdout.cursorTo(0, ids[p.address]);
  stdout.write(`${lineStart} ${dist} (${powerInt}, ${typeof power === 'undefined' ? 1 : 0})`);
});

process.on('SIGINT', function() {
  stdout.cursorTo(0, index++);
  process.exit();
});

function distance(id, rssi, txPower) {
  if (rssi === 0) {
    return -1.0;
  }

  if (!txPower) {
    txPower = -59;
  }

  const ratio = rssi * 1.0 / txPower;
  let distance;
  if (ratio < 1.0) {
    distance = Math.pow(ratio, 10);
  } else {
    distance = (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
  }

  distance = smoothDistance(id, distance);

  return distance;
}

function smoothDistance(id, distance) {
  if (typeof filters[id] === 'undefined') {
    filters[id] = new KalmanFilter();
  }

  return filters[id].filter(distance);
}
