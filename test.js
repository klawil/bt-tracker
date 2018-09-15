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
    ids[p.address] = {
      count: 0,
      line: index
    }
    index++;
  }

  ids[p.address].count++;

  stdout.cursorTo(0, ids[p.address].line);
  stdout.write(`${lineStart} ${p.rssi} (${ids[p.address].count})`);

  p.on('rssiUpdate', (rssi) => {
    stdout.cursorTo(0, ids[p.address].line);
    stdout.write(`${lineStart} ${rssi}* (${ids[p.address].count})`);
  });
});

process.on('SIGINT', function() {
  stdout.cursorTo(0, index++);
  process.exit();
});
