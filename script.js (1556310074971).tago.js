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


// The function myAnalysis will run when you execute your analysis
async function myAnalysis(context, scope) {
  // Create a variable called payload with the value sent by the device
  // change payload to the name of you variable here ||
  //                                                 \/
  context.log('1 analysis started')

  const env_vars = Utils.env_to_obj(context.environment);
  if (!env_vars.fctoken) return context.log('Missing device_token environment variable');

  // Instantiate the device with your device token
  const device = new Device(env_vars.fctoken);
  var data = {}
  data = scope.find(x => x.variable === "payload").value
  context.log(`2 Data is ${data}`);
  var payload = {}
  payload = Buffer.from(data, 'base64').toString('utf8');
  context.log(`3 payload is ${payload}`);

    // Create separate the string into two hexadecimal values
    var values = Buffer.from(data, 'base64');
    context.log(`4 values ${values}`);
    
    var length = values.readUInt8(0);
    context.log(`5 length is ${length}`);
    context.log('6')
    // Create the two variables Temperature and Humidity to send to TagoIO
    const variables = [{
      variable: 'length',
      value: length,
      unit: 'H'
    }];
    context.log('7')

    // Insert the actual variables temperature and humidity to TagoIO
    device.insert(variables).then(context.log('Successfully Inserted')).catch(error => context.log('Error when inserting:', error));
    context.log('Ga analysis finished')
  

}

// The analysis token in only necessary to run the analysis outside Tago
module.exports = new Analysis(myAnalysis, 'YOUR-ANALYSIS-TOKEN');