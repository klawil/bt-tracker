const noble = require('noble');
const KalmanFilter = require('kalmanjs').default;

// Clear the console
process.stdout.write('\x1Bc');

// Used to determine which line we should use
let ids = [];
let stdout = process.stdout;
let longest = 0;
let filters = {};

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning([], true);
  }
});

noble.on('discover', function(p) {
  let data = {
    id: p.address,
    lineStart: `${p.advertisement.localName} (${p.address} [${p.addressType}]):`
  };

  if (data.lineStart.length > longest) {
    longest = data.lineStart.length;
  }

  if (ids.filter((item) => item.id === data.id).length === 0) {
    ids.push(data);
  } else {
    ids = ids.map((item) => item.id === data.id ? data : item);
  }

  let power = p.measuredPower || p.advertisement.txPower || p.advertisement.txPowerLevel;
  data.powerType = typeof power === 'undefined'
    ? 0
    : 1;

  data.powerInt = p.measuredPower
    ? 0
    : p.advertisement.txPower
      ? 1
      : 2;

  data.dist = Math.round(distance(p.address, p.rssi, power) * 100) / 100;

  ids
    .sort((a, b) => a.dist < b.dist 
      ? -1
      : 1)
    .forEach(printData);
});

process.on('SIGINT', function() {
  stdout.cursorTo(0, ids.length);
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

  return smoothDistance(id, distance);
}

function smoothDistance(id, distance) {
  if (typeof filters[id] === 'undefined') {
    filters[id] = new KalmanFilter();
  }

  return filters[id].filter(distance);
}

function printData(data, line) {
  stdout.cursorTo(0, line);

  lineStart = data.lineStart + ' '.repeat(longest - data.lineStart.length);

  let dist = data.dist;
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

  stdout.write(`${lineStart} ${dist} (${data.powerInt}, ${data.powerType})`);
}
