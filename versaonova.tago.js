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
  data = '5533004900530100000090000000901908240510033600d816'//scope.find(x => x.variable === "payload").value
  context.log('data', data);
  
  var dev_id = data.slice(4, 12);
  context.log('id', dev_id);
  
  var medida_atual = data.slice(18, 22) ; // EM LITROS
  context.log('hoje', medida_atual);
  
  var tensao_bateria = data.slice(42, 44); 
  context.log('bateria', tensao_bateria);
  
  var status = data.slice(44, 46);
  context.log('status0', status[0]);
  context.log('status1', status[1]);
  
  var status_linha = 'ok' 
  var status_bateria = 'ok' 
  if(status == 2)
  {
    status_linha = 'quebra'
  }
  if(status == 1)
  {
    status_bateria = 'baixa'
  }
  if(status == 3)
  {
    status_linha = 'quebra'
    status_bateria = 'baixa'
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
    context.log('display conversao is', display_conv);
    if (medida_atual == 0)
    {
      context.log('carai');
      display_virtual = display_real;
    }
    if (medida_atual != 0)
    {
      context.log('eita');
      medida_cov = (medida_atual * 0.001);
      context.log('medida de conversao', medida_cov);
      display_virtual = parseFloat(display_real + medida_cov);
      context.log('display virtual:', display_virtual);
    }
    const variables = 
    [
      {
        variable: 'radio_id',
        value: dev_id
      },{
        variable: 'medida_atual',
        value: medida_atual,
        unit: 'Litros'
      },{
        variable: 'display_virtual',
        value: display_virtual.toFixed(3),
        unit: 'm³'
      },{
        variable: 'tensao_bateria',
        value: tensao_bateria / 10,
        unit: 'Volts'
      },{
        variable: 'status_bateria',
        value: status_bateria
      },{
        variable: 'status_linha',
        value: status_linha
      }
    ];

  device.insert(variables).then(context.log('Successfully Inserted')).catch(error => context.log('Error when inserting:', error));
  }).catch(context.log);
  context.log('analysis finished')
}
module.exports = new Analysis(myAnalysis, '');