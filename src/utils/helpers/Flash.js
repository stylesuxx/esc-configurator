class Flash {

  // Pad data to fixed size
  static fillImage(data, size, flashOffset) {
    var image = new Uint8Array(size).fill(0xFF);

    //data.data.forEach((block) => {
    for(let i = 0; i < data.data.length; i += 1) {
      const block = data.data[i];
      const address = block.address - flashOffset;

      // Check preconditions
      if (address >= image.byteLength) {
        return null;
      }

      // block.data may be too large, select maximum allowed size
      var clampedLength = Math.min(block.bytes, image.byteLength - address);
      image.set(block.data.slice(0, clampedLength), address);
    }

    return image;
  }

  static parseHex(string) {
    string = string.split("\n");

    // check if there is an empty line in the end of hex file, if there is, remove it
    if (string[string.length - 1] === "") {
      string.pop();
    }

    var result = {
      data: [],
      endOfFile: false,
      bytes: 0,
      startLinearAddress: 0,
    };

    var extendedLinearAddress = 0;
    var nextAddress = 0;

    for (var i = 0; i < string.length; i += 1) {
      // each byte is represnted by two chars
      var byteCount = parseInt(string[i].substr(1, 2), 16);
      var address = parseInt(string[i].substr(3, 4), 16);
      var recordType = parseInt(string[i].substr(7, 2), 16);
      var content = string[i].substr(9, byteCount * 2); // still in string format
      var checksum = parseInt(string[i].substr(9 + byteCount * 2, 2), 16); // (this is a 2's complement value)

      switch (recordType) {
        // data record
        case 0x00: {
          if (address !== nextAddress || nextAddress === 0) {
            result.data.push({
              'address': extendedLinearAddress + address,
              'bytes': 0,
              'data': [],
            });
          }

          // store address for next comparison
          nextAddress = address + byteCount;

          // process data
          var crc = byteCount + parseInt(string[i].substr(3, 2), 16) + parseInt(string[i].substr(5, 2), 16) + recordType;
          for (var needle = 0; needle < byteCount * 2; needle += 2) { // * 2 because of 2 hex chars per 1 byte
            var num = parseInt(content.substr(needle, 2), 16); // get one byte in hex and convert it to decimal
            var string_block = result.data.length - 1;

            result.data[string_block].data.push(num);
            result.data[string_block].bytes += 1;


            crc += num;
            result.bytes += 1;
          }

          // change crc to 2's complement
          crc = (~crc + 1) & 0xFF;

          // Return in case of fail
          if (crc !== checksum) {
            return null;
          }
        } break;

        // end of file record
        case 0x01: {
          result.endOfFile = true;
        } break;

        // extended segment address record
        case 0x02: {
          if (parseInt(content, 16) !== 0) { // ignore if segment is 0
            console.debug('extended segment address record found - NOT IMPLEMENTED!');
          }
        } break;

        // start segment address record
        case 0x03: {
          if (parseInt(content, 16) !== 0) { // ignore if segment is 0
            console.debug('start segment address record found - NOT IMPLEMENTED!');
          }
        } break;

        // extended linear address record
        case 0x04: {
          extendedLinearAddress = (parseInt(content.substr(0, 2), 16) << 24) | (parseInt(content.substr(2, 2), 16) << 16);
        } break;

        // start linear address record
        case 0x05: {
          result.startLinearAddress = parseInt(content, 16);
        } break;

        default: {
          console.log('Unknown record type', recordType);
        }
      }
    }

    if (result.endOfFile) {
      return result;
    }

    return null;
  }
}

export default Flash;
