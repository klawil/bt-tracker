const noble = require('noble');

// Clear the console
process.stdout.write('\x1Bc');

// Used to determine which line we should use
let ids = {};
let index = 0;
let stdout = process.stdout;

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning([], true);
  }
});

noble.on('discover', function(p) {
  let lineStart = `${p.advertisement.localName} (${p.address} [${p.addressType}]): `;

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

  let dist = Math.round(distance(p.rssi, power) * 100) / 100;

  if (dist > 10E4) {
    dist = 'OVER  ';
  } else {
    dist = ('000000' + dist.toString()).slice(-6);
  }

  stdout.cursorTo(0, ids[p.address]);
  stdout.write(`${lineStart} ${dist} (${powerInt}, ${typeof power === 'undefined' ? 1 : 0})`);
});

process.on('SIGINT', function() {
  stdout.cursorTo(0, index++);
  process.exit();
});

function distance(rssi, txPower) {
  if (rssi === 0) {
    return -1.0;
  }

  if (!txPower) {
    txPower = -59;
  }

  const ratio = rssi * 1.0 / txPower;
  if (ratio < 1.0) {
    return Math.pow(ratio, 10);
  }

  return (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
}
