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

  stdout.cursorTo(0, ids[p.address]);
  stdout.write(`${lineStart} ${p.rssi} ${power} (${powerInt})`);
});

process.on('SIGINT', function() {
  stdout.cursorTo(0, index++);
  process.exit();
});
