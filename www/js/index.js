var nfcRing = {};

var app = {
  initialize: function () {
    this.bind();
  },
  bind: function () {
    document.addEventListener('deviceready', this.deviceready, false);
  },
  deviceready: function () {
    // note that this is an event handler so the scope is that of the event
    // so we need to call app.report(), and not this.report()
    console.log('deviceready');
    alert = navigator.notification.alert;
    prompt = navigator.notification.prompt;

    if (nfc) {
      nfc.addNdefListener(function (nfcEvent) {
        nfcRing.readOrWrite(nfcEvent);
        console.log("Attempting to bind to NFC");
      }, function () {
        console.log("Success.  Listening for rings..");
      }, function () {
        alert("NFC Functionality is not working, is NFC enabled on your device?");
        $('#createNew, #read, #scan').attr('disabled', 'disabled');
      });
      // console.log('is barcode ready? ' + window.barcodescanner);
    }
  }
};

function debug(msg) {
  console.log(msg);
}

nfcRing.readOrWrite = function(nfcEvent){
  if(nfcRing.toWrite){
    nfcRing.write(nfcEvent);
    $('#writeRing').show();
  }else{
    nfcRing.read(nfcEvent);
  }
}

nfcRing.write = function(nfcEvent){
  var ndefRecord = ndef.uriRecord(nfcRing.toWrite); // support more types.. TODO
  nfc.write([ndefRecord], function () {
    navigator.notification.vibrate(100);
    console.log("Written", ndefRecord);
    alert("Woohoo!  Your ring is ready.");
  }, function (reason) {
    console.log("Inlay write failed")
  });
}

nfcRing.read = function(nfcEvent){
  console.log("Reading")
  console.log(nfcEvent);
  var ring = nfcEvent.tag;
  console.log(ring);
  ringData = nfc.bytesToString(ring.ndefMessage[0].payload); // TODO make this less fragile 
  alert(ringData);
}

function runCoOrds() {
  // Oh my, this is a test of the sweet spot..   Isn't this exciting!
  // Basically when we get a successful read we need to GET data from the arduino

  $.ajax({
    url: "http://192.168.1.177",
    success: function (coOrds) {
      console.log(coOrds);
      // coOrds = $.parseJSON(coOrds);
      data = {
        "coOrds": coOrds,
        "deviceUuid": device.uuid,
        "deviceModel": device.model
      };
      x = coOrds.x / 10000; // Note this is prolly unhealthy
      y = coOrds.y / 10000; // Note this is prolly unhealthy
      console.log(x, y);
      totalCount++;
      $('.actionContents').append("<li>Count:" + totalCount + ", X: " + x + " ,Y: " + y + "</li>");

      console.log("got ", data);

      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);

    },
    error: function (xhr, ajaxOts, e) {
      console.log(xhr, ajaxOts, e);
    }
  });
}

function fail(error) {
  console.log(error.code);
}
