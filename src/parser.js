const xml2js = require('xml2js');
const fs = require('fs');

const transform = (data, withVulnerabilities) => {
  var json = {};
  json['host'] = data.nmaprun.host[0].hostnames[0].hostname[0].$.name;
  json['protocol'] = data.nmaprun.scaninfo[0].$.protocol;
  json['closed_ports'] = data.nmaprun.host[0].ports[0].extraports[0].$.count;
  json['open_ports'] = [];
  var open_ports = data.nmaprun.host[0].ports[0].port;
  open_ports.forEach((port) => {
    var open_port = {};
    open_port['service'] = {};
    open_port['service']['name'] = port.service[0].$.name
    open_port['service']['product'] = port.service[0].$.product
    open_port['service']['id'] = port.$.portid
    open_port['service']['version'] = port.service[0].$.version
    open_port['service']['vulnerabilities'] = [];
    if (withVulnerabilities) {
      var vulnerabilities = [];
      if (port.script && port.script[0].table && port.script[0].table.length > 0 && port.script[0].table[0].table)
        vulnerabilities = port.script[0].table[0].table;
      vulnerabilities.forEach((vulnerability) => {
        if (vulnerability && vulnerability.elem && vulnerability.elem.length > 2) {
          var vuln_elem = {};
          vulnerability.elem.forEach((elem) => { vuln_elem[elem.$.key] = elem._; });
          open_port['service']['vulnerabilities'].push(vuln_elem);
        }
      });
    }
    json['open_ports'].push(open_port);
  });
  return json;
};

/**
 * Returns json nmap results from xml file
 *
 * @param {string} path The xml file path
 *
 * @returns {Promise<string>}
 */
const parse = (path, file, raw, withVulnerabilities) => {
  console.warn(`Parse xml results from file ${path + '/' + file} to ${raw ? 'raw' : 'transformed'} json`);
  const parser = new xml2js.Parser();
  const xmlData = fs.readFileSync(path + '/' + file);
  return parser.parseStringPromise(xmlData).then((json) => !raw ? transform(json, withVulnerabilities) : json);
};

module.exports = parse;