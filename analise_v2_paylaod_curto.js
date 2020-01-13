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

async function myAnalysis(context, scope) 
{
  context.log('analysis started')
  const env_vars = Utils.env_to_obj(context.environment);
  if (!env_vars.device_token) return context.log('Missing device_token environment variable');
  const device = new Device(env_vars.device_token);

  var display_virtual;
  var medida_cov;
  var display_conv;


  var data = {}
  data = scope.find(x => x.variable === "payload").value
  //data = '4bed6404115bf8a362034e8e61dc9a006cdeaf095eb6b284a7'
  //context.log('data', data);
  //context.log('tipo data', typeof data);
  payload = Buffer.from(data);
  //context.log(`payload ${payload}`);
  //context.log('tipo payload', typeof payload);
  
  var volume_acumulado = (buffer[6]| buffer[7] >> 8| buffer[8] >> 16| buffer[9] >> 24 );

  var status_buffer = buffer[1];

  var status_string;

  if (status_buffer == 1)
  {
    status_string = 'bateria fraca';
  }
  if (status_buffer == 2)
  {
    status_string = 'linha quebrada';
  }
  if (status_buffer == 3)
  {
    status_string = 'bateria fraca e linha quebrada';
  }



  const filter = 
  {
    variable: 'input',
    query: 'last_item',
  };

  device.find(filter).then((result_array) => 
  {
    const display_real = result_array[0].value;
    display_conv = parseFloat(display_real);
    //context.log('display conversao is', display_conv);
    if (volume_acumulado == 0)
    {
      display_virtual = display_real;
    }
    if (volume_acumulado != 0)
    {
      medida_cov = (volume_acumulado * 0.001);
      //context.log('medida de conversao', medida_cov);
      display_virtual = parseFloat(display_real + medida_cov);
      //context.log('display virtual:', display_virtual);
    }
    const variables = 
    [
      { variable: 'volume_acumulado', value: volume_acumulado, unit: 'Litros'},
      { variable: 'display_virtual' , value: display_virtual.toFixed(3), unit: 'm³'},
      { variable: 'status', value: status_string},
    ];

  device.insert(variables).then(context.log('Successfully Inserted')).catch(error => context.log('Error when inserting:', error));
  }).catch(context.log);
  context.log('analysis finished')
}
module.exports = new Analysis(myAnalysis, '');