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
  var data = {}
  data = scope.find(x => x.variable === "payload").value
  //data = '56000049005300000010d8'
  const buffer = Buffer.from(data, 'hex');
  var volume_acumulado = buffer.readUInt32BE(6);
  var status_buffer = (buffer[1]|252)^252;
  var status_string;

  if (status_buffer == 0)
  {
    status_string = 'ok';
  }
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
    const display_real = (result_array[0].value) * 0.001;

    if (volume_acumulado == 0)
    {
      display_virtual = display_real;
    }
    if (volume_acumulado != 0)
    {
      display_virtual = parseFloat(display_real + (volume_acumulado * 0.001));
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