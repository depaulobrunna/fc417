/* 
 * Analysis Example
 * Generic Payload Parse
 * 
 * Learn how to parse from a hexadecimal raw payload into temperature and humidity variables
 * Tutorial: https://tago.elevio.help/en/articles/118
 */

const Analysis = require('tago/analysis');
const Device = require('tago/device');
const Utils = require('tago/utils');

var bcd2number = function(bcd) 
{
    var n = 0;
    var m = 1;
    for(var i = 0; i<bcd.length; i+=1) {
        n += (bcd[bcd.length-1-i] & 0x0F) * m;
        n += ((bcd[bcd.length-1-i]>>4) & 0x0F) * m * 10;
        m *= 100;
    }
    return n;
}

var getFVal = function(val, multip) {
  var multiplier = {
    0x13: '10e-3',
    0x14: '10e-2',
    0x15: '10e-1',
    0x16: '10e+0',
    0x00: ''
  };
  return val + ' ' + (multiplier[multip] || multiplier[0x00]);
}

async function myAnalysis(context, scope) {
  context.log('analysis started')
  const env_vars = Utils.env_to_obj(context.environment);
  if (!env_vars.fctoken) return context.log('Missing device_token environment variable');
  const device = new Device(env_vars.fctoken);
  var data = {}
  data = scope.find(x => x.variable === "payload").value
  var payload = {}
  payload = Buffer.from(data, 'base64').toString('utf8');
    var values = Buffer.from(data, 'base64');
    //context.log(typeof values);
    //var today_value = values.readUIntBE(17, 1).toString(2); //string em binario
    context.log(`pass`);
    var today_value = values.readUIntLE(17, 4).toString(16);
    var today_value_mult = values.readUIntLE(22, 1).toString(16);
    context.log(`before ${today_value}`);
    //context.log(`multiplicador ${today_value_mult}`);
    context.log(bcd2number(today_value));
    //var today_values_buff = Buffer ([values.readUIntBE(17, 1), values.readUIntBE(18, 1), values.readUIntBE(19, 1), values.readUIntBE(20, 1)]);//dec (tipo number)
    //var today_values_buff = Buffer ([values.readUIntBE(17, 4)]);
    //context.log(Uint8Array.from(today_values_buff));
    //const buf1 = Buffer.from(today_values_raw);
    //context.log(typeof today_values_buff);
    //context.log(Buffer.isBuffer(today_values_buff));
    //context.log(today_values_buff.length);
    //var data = new Bcd(new KaitaiStream(today_values_buff));
    //fun_conv = bcd.decode(today_values_buff);
    //context.log(`value ${fun_conv}`);
    context.log(`pass 3`);
    var multi = 0.001
    var finaltoday = today_value * multi;
    context.log(`final today test ${finaltoday}`);
    //var yesterday_value = values.readUIntBE(21, 1).toString(2);
    //var yesterday_multip = values.readUIntBE(21, 1);
    //var before_yesterday_value = values.readUIntBE(27, 1).toString(2);
    //var before_yesterday_multip = values.readUIntBE(27, 1);
    
   
   const variables = [{
      variable: 'atual',
      value: finaltoday,
      unit: 'm3'
    }, {
      variable: 'ontem',
      value: yesterday_value,
      unit: 'm3'
    }, {
      variable: 'anteontem',
      value: before_yesterday_value,
      unit: 'm3'
  }];
    // Insert the actual variables temperature and humidity to TagoIO
    device.insert(variables).then(context.log('Successfully Inserted')).catch(error => context.log('Error when inserting:', error));
    context.log('analysis finished')

}
module.exports = new Analysis(myAnalysis, '');