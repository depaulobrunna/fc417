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
  context.log('analysis started')

  const env_vars = Utils.env_to_obj(context.environment);
  if (!env_vars.fc_token) return context.log('Missing device_token environment variable');
  // Instantiate the device with your device token
  const device = new Device(env_vars.fc_token);
  var data = {}
  data = scope.find(x => x.variable === "payload").value
  context.log(`Data is ${data}`);
  //const payload = Number(data);
  //context.log(`payload is ${payload}`);
  payload = Buffer.from(data, 'base64').toString('utf8');
  context.log(`payload is ${payload}`);

  // Create separate the string into two hexadecimal values
  var values = Buffer.from(data, 'base64'); //nao ta convertendo
  context.log(`value ${values}`);
  
  var len = values.readUInt1BE(0);
  context.log(`len ${len}`);
  
  // Create the two variables Temperature and Humidity to send to TagoIO
  //const variables = [{
    //variable: 'RADIO ID',
    //value: status
  //}];

  // Insert the actual variables temperature and humidity to TagoIO
  //await device.insert(variables).then(context.log).catch(context.log);


  // Insert the actual variables temperature and humidity to TagoIO
  device.insert(variables).then(context.log('Successfully Inserted')).catch(error => context.log('Error when inserting:', error));
  context.log('Ga analysis finished')
  

}

// The analysis token in only necessary to run the analysis outside Tago
module.exports = new Analysis(myAnalysis, 'YOUR-ANALYSIS-TOKEN');