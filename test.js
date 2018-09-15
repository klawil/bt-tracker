const noble = require('noble');

// Clear the console
process.stdout.write('\x1Bc');

// Used to determine which line we should use
let index = 0;
let stdout = process.stdout;

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  }
});

noble.on('discover', function(p) {
  let localIndex = index;
  index++;

  let count = 1;

  let lineStart = `${p.advertisement.localName} (${p.address} [${p.addressType}]): `;

  stdout.cursorTo(0, localIndex);
  stdout.write(`${lineStart} ${p.rssi} (${count})`);

  p.on('rssiUpdate', (rssi) => {
      setTimeout(update, 500);
      count++;

      stdout.cursorTo(0, localIndex);

      stdout.write(`${lineStart} ${rssi} (${count})`);
  });

  function update() {
    p.updateRssi();
  }

  setTimeout(update, 500);
});
