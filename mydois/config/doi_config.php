<?php
global $ENV;
$config['test_doi_prefix'] = '10.5072';
$config['gDOIS_SERVICE_BASE_URI'] = "https://mds.datacite.org/";
$config['gDOIS_DATACENTRE_NAME_PREFIX'] = "ANDS";
$config['gDOIS_DATACENTRE_NAME_MIDDLE'] = "CENTRE";

$config['gDOIS_DATACENTRE_PREFIXS'] = array( '10.4225/','10.4226/','10.4227/','10.5072/');

if (!isset($ENV['gDOIS_DATACITE_PASSWORD']))
{
	throw new Exception ("System is not configured for use with Data Cite API. Please set gDOIS_DATACITE_PASSWORD in global_config.php");
}
$config['gDOIS_DATACITE_PASSWORD'] = $ENV['gDOIS_DATACITE_PASSWORD'];
$config['gDOIS_RESPONSE_SUCCESS'] = "OK";
?>