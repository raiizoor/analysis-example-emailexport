/* 
 * Analysis Example
 * Email export
 * 
 * Learn how to send an email with data in a .csv file attachment.
 * 
 * This analysis will read the variable fuel_level from your device,
 * and send the values in a .csv file to an e-mail address
 * 
 * Instructions
 * To run this analysis you need to add a device token and the e-mail to the environment variables.
 * To do that, go to your device, then token and copy your token.
 * Go the the analysis, then environment variables, 
 * type device_token on key, and paste your token on value
 * click the + button to add a new environment
 * on key, type email and on value, type the e-mail address
*/

const Analysis = require('tago/analysis');
const Utils    = require('tago/utils');
const Device   = require('tago/device');
const Service  = require('tago/services');

// The function myAnalysis will run when you execute your analysis
async function myAnalysis(context) {
  // reads the values from the environment and saves it in the variable env_vars
  const env_vars = Utils.env_to_obj(context.environment);
  if (!env_vars.device_token) return context.log('device_token environment variable not found');
  if (!env_vars.email) return context.log('email environment variable not found');
  
  const device = new Device(env_vars.device_token);
  
  // Get the 5 last records of the variable fuel_level in the device bucket.
  const fuel_list = await device.find({ variable: 'fuel_level', qty: 5 });

  // Create csv header
  let csv = 'Fuel Level';

  // For each record in the fuel_list, add the value in the csv text.
  // Use \n to break the line.
  fuel_list.forEach((fuel_item) => {
    csv = `${csv},\n${fuel_item.value}`;
  });

  // Print the csv text to the Tago analysis console, as a preview
  context.log(csv);

  // Start the email service
  const email = new Service(context.token).email;

  // Pass to .send function the email addres, subject, body_msg, from and attachment.
  // See the docs to know what is optional.
  const email_address = env_vars.email;
  const subject       = 'Exported File from Tago';
  const body_msg      = 'This is an example of a body message';
  const from          = 'tago@tago.io';
  const attachment    = {
    archive: csv,
    filename: 'exportedfile.csv'
  };

  // Send the email.
  await email.send(email_address, subject, body_msg, from, attachment).then(context.log);
}

// The analysis token in only necessary to run the analysis outside Tago
module.exports = new Analysis(myAnalysis, 'MY-ANALYSIS-TOKEN-HERE');