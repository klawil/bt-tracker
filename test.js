var noble = require('noble');

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    console.log('State: ' + state);
  }
});

noble.on('discover', function(p) {
  console.log(`${p.advertisement.localName} (${p.address} [${p.addressType}]): ${p.rssi}`);
});
