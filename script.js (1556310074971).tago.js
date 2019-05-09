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

var getFVal = function(val, multip) 
{
  var multiplier = 
  {
    0x13: 0.001,
    0x14: 0.01,
    0x15: 0.1,
    0x16: 0.0,
    0x02: 0.00001  
  };
  return val * multiplier[multip];
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
    //context.log(`pass`);
    
    var acumulador = values.readUIntBE(11, 1).toString(16);
    //context.log(`acumulador value ${acumulador}`);


    var today_value = values.readUIntLE(17, 4).toString(16);
    var finaltoday = getFVal(today_value, values.readUIntBE(16, 1));
    //context.log(`today ${finaltoday}`);
    
    var yesterday_value = values.readUIntLE(23, 4).toString(16);
    var finalyesterday = getFVal(yesterday_value, values.readUIntBE(22, 1));
    //context.log(`yesterday ${finalyesterday}`);
    


    //var test = values.readUIntLE(28, 4).toString(16);
    //context.log(`test value ${test}`);
    //context.log(`multiplicador`, values.readUIntBE(32, 2));
    //var final_test = getFVal(test, values.readUIntBE(32, 2));
    //context.log(`test after function ${final_test}`);

    var before_yesterday_value = values.readUIntLE(28, 4).toString(16);
    var finalbefyesterday = getFVal(before_yesterday_value, values.readUIntBE(32, 2));
    //context.log(`bef yesterday ${finalbefyesterday}`);
    //context.log(`multi before yesterday`, values.readUIntBE(32, 1));
    
   
   const variables = [{
      variable: 'hoje',
      value: finaltoday,
      unit: 'm3'
    }, {
      variable: 'ontem',
      value: finalyesterday,
      unit: 'm3'
    }, {
      variable: 'anteontem',
      value: finalbefyesterday,
      unit: 'm3'
  }];
    // Insert the actual variables temperature and humidity to TagoIO
    device.insert(variables).then(context.log('Successfully Inserted')).catch(error => context.log('Error when inserting:', error));
    context.log('analysis finished')

}
module.exports = new Analysis(myAnalysis, '');