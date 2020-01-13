/* This is an generic payload parser example.
** The code find the payload variable and parse it if exists.
**
** IMPORTANT: In most case, you will only need to edit the parsePayload function.
**
** Testing:
** You can do manual tests to this parse by using the Device Emulator. Copy and Paste the following code:
** [{ "variable": "payload", "value": "0109611395" }]
**
** The ignore_vars variable in this code should be used to ignore variables
** from the device that you don't want.
*/
// Add ignorable variables in this array.
const ignore_vars = [];
var input_pack
/**
 * This is the main function to parse the payload. Everything else doesn't require your attention.
 * @param {String} payload_raw 
 * @returns {Object} containing key and value to TagoIO
 */

function parsePayload(payload_raw) 
{
  try 
  {
    const buffer = Buffer.from(payload_raw, 'hex');
    
    var status = buffer[1];

    if (status == 1)
    {
      var data = 
      [
        { variable: 'alarme', value: 'bateria fraca'},
        { variable: 'volume_acumulado',  value: (buffer[6]| buffer[7] << 8| buffer[8] << 16| buffer[9] << 24 ), unit: 'L' },
      ];
      return data;
    }
    if (status == 2)
    {
      var data = 
      [
        { variable: 'alarme', value: 'linha quebrada'},
        { variable: 'volume_acumulado',  value: (buffer[6]| buffer[7] << 8| buffer[8] << 16| buffer[9] << 24 ), unit: 'L' },
      ];
      return data;
    }
    if (status == 3)
    {
      var data = 
      [
        { variable: 'alarme', value: 'bateria fraca e linha quebrada'},
        { variable: 'volume_acumulado',  value: (buffer[6]| buffer[7] << 8| buffer[8] << 16| buffer[9] << 24 ), unit: 'L' },
      ];
      return data;
    }

    var data = 
      [
        { variable: 'alarme', value: 'sem alarmes'},
        { variable: 'volume_acumulado',  value: (buffer[6]| buffer[7] << 8| buffer[8] << 16| buffer[9] << 24 ), unit: 'L' },
      ];
      return data;


  } catch (e) {return [{ variable: 'parse_error', value: e.message }];}
}
// Remove unwanted variables.
payload = payload.filter(x => !ignore_vars.includes(x.variable));

// Payload is an environment variable. Is where what is being inserted to your device comes in.
// Payload always is an array of objects. [ { variable, value...}, {variable, value...} ...]
const payload_raw = payload.find(x => x.variable === 'payload_raw' || x.variable === 'payload' || x.variable === 'data');
if (payload_raw) 
{
  // Get a unique serie for the incoming data.
  const { value, serie } = payload_raw;

  // Parse the payload_raw to JSON format (it comes in a String format)
  if (value) 
  {
    payload = parsePayload(value).map(x => ({ ...x, serie }));
  }
}
