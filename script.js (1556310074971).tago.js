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

async function myAnalysis(context, scope) {
  context.log('analysis started')

  const env_vars = Utils.env_to_obj(context.environment);
  if (!env_vars.fctoken) return context.log('Missing device_token environment variable');

  const device = new Device(env_vars.fctoken);
  var data = {}
  data = scope.find(x => x.variable === "payload").value
  
  var payload = {}
  payload = Buffer.from(data, 'base64').toString('utf8');
  //context.log(`3 payload is ${payload}`);
    var values = Buffer.from(data, 'base64');
    //context.log(`values is ${values}`);
    var today_value = values.readUIntBE(15, 1).toString(2); //buf.readUIntLE(offset, byteLength) suports 6 bytes, tostring(2) converte em binario
    var yesterday_value = values.readUIntBE(21, 1).toString(2);
    var before_yesterday_value = values.readUIntBE(27, 1).toString(2);
    //context.log(`today value ${today_value}`);
    //context.log(`read1`);
    today = bcd2number(today_value);
    yesterday = bcd2number(yesterday_value);
    before_yesterday = bcd2number(before_yesterday_value);
    
   const variables = [{
      variable: 'valor_atual',
      value: vari,
      unit: 'm3'
    //}, {
      //variable: 'yesterday_value',
      //value: yesterday_value,
      //unit: 'Hz'
    //}, {
      //variable: 'before_yesterday_value',
      //value: before_yesterday_value,
      //unit: 'Hz'
  }];

    // Insert the actual variables temperature and humidity to TagoIO
    device.insert(variables).then(context.log('Successfully Inserted')).catch(error => context.log('Error when inserting:', error));
    context.log('analysis finished')
  

}
module.exports = new Analysis(myAnalysis, 'YOUR-ANALYSIS-TOKEN');