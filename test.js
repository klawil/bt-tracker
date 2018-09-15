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

  let lineStart = `\r${p.advertisement.localName} (${p.address} [${p.addressType}]): `;

  stdout.cursorTo(localIndex);
  stdout.write(`${lineStart} ${p.rssi} (${count})`);

  function update() {
    p.updateRssi((err, rssi) => {
      setTimeout(update, 500);

      stdout.cursorTo(localIndex);

      if (err) {
        stdout.write(`${lineStart} ${err}`);
        return;
      }

      count++;
      stdout.write(`${lineStart} ${rssi} (${count})`);
    });
  }

  setTimeout(update, 500);
});
