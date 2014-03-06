<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * DOI API function Test
 * Perform a series of test cases to determine the functionality of the DOI API
 * used mainly in the DOI_APP
 *
 * @author Liz Woods <liz.woods@ands.org.au>
 */
class Doi_test extends MX_Controller {

	function index(){

		/* Set up variables to pass to the test functions to stimulate good and faulty DOI API calls */
		$app_id = $this->config->item('gDOIS_TEST_APP_ID');
		$incorrect_app_id = 'mvivnnvnjvn4tjvmve2432nvbthth';

		$shared_secret = $this->config->item('gDOIS_TEST_SHARED_SECRET');
		$incorrect_shared_secret = 'gmpryonty';

		$url = 'http://devl.ands.org.au/example1.php';
		$incorrect_url = 'http;//no.domain.exists/example.php';

		$doiversion_service_points = array('v1.0'=>'https://services.ands.org.au/home/dois/doi_' , 'v1.1'=>'https://services.ands.org.au/doi/1.1/', 'test' => apps_url().'/mydois/');

		/* first we mint a DOI using the latest version of the CMD API*/
		//$testDOI = test_mint($app_id,$shared_secret,$goodurl);

		$testDOI = '10.5072/00/530FB71A47EFD';
		$validxml = 'xml=<?xml version="1.0" encoding="UTF-8"?>
<resource xmlns="http://datacite.org/schema/kernel-2.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://datacite.org/schema/kernel-2.1 http://schema.datacite.org/meta/kernel-2.1/metadata.xsd">
  <identifier identifierType="DOI">'.$testDOI.'</identifier>
  <creators>
    <creator>
      <creatorName>Woods, Liz</creatorName>
    </creator>
  </creators>
  <titles>
    <title>Data Test Example</title>
  </titles>
  <publisher>ANDS</publisher>
  <publicationYear>2014</publicationYear>
</resource>';

$invalidxml = 'xml=<?xml version="1.0" encoding="UTF-8"?>
<resource xmlns="http://datacite.org/schema/kernel-2.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://datacite.org/schema/kernel-2.1 http://schema.datacite.org/meta/kernel-2.1/metadata.xsd">
  <identifier identifierType="DOI">'.$testDOI.'</identifier>
  <anelement>dsfdsfgS</anelement>
  <creators>
    <creator>
      <creatorName>Woods, Liz</creatorName>
    </creator>
  </creators>
  <titles>
    <title>Data Test Example</title>
  </titles>
  <publisher>ANDS</publisher>
  <publicationYear>2014</publicationYear>
</resource>';




		/* Now use the just minted test DOI to test autentication function using the update DOI API call */
		$this->load->library('unit_test');
		/**
		 * A series of test case
		 * @var in the form of array(test_name, 1st argument, 2nd argument, expected_result)
		 */
		$requestURI = $doiversion_service_points['v1.1'];
		$requestURI = $doiversion_service_points['test'];
		$v1_service_url = $doiversion_service_points['v1.0'];

		$data['authentication'] = $this->test_doi_authentication($app_id,$incorrect_app_id,$shared_secret, $incorrect_shared_secret,$url,$testDOI,$requestURI);
		unset($this->unit->results);
		$data['valid_xml'] = $this->test_doi_xml($app_id,$shared_secret,$url,$testDOI,$validxml,$invalidxml,$requestURI);
		unset($this->unit->results);
		$data['service_point'] = $this->test_doi_service_point($app_id,$shared_secret,$url,$testDOI,$validxml,$v1_service_url,$requestURI);
		unset($this->unit->results);
		$data['result_type'] = $this->test_result_type($app_id,$shared_secret,$url,$testDOI,$validxml,$requestURI);		
		$this->load->view('doi_test',$data);


	}

	function test_doi_authentication($app_id,$incorrect_app_id,$shared_secret, $incorrect_shared_secret,$url,$testDOI,$requestURI)
	{
		$test_cases = array(
			array('Update a doi - correct app_id and shared_secret', $app_id, $shared_secret, $url,$testDOI,'update', 'string',$requestURI, '[MT002]'),	
			array('Update a doi - incorrect app_id', $incorrect_app_id, $shared_secret, $url,$testDOI,'update', 'string',$requestURI, '[MT009]'),			
			array('Update a doi - incorrect shared_secret', $app_id, $incorrect_shared_secret, $url,$testDOI,'update','string',$requestURI, '[MT009]'),		
		);

		foreach($test_cases as $case){
			$test = $this->test_doi_api($case[1], $case[2], $case[3],$case[4],$case[5],$case[6],$case[7]);
			$this->unit->run($test, $case[8], $case[0].':  Expected message'. $case[8]);
		} 
		return $this->unit->report(); 

	}


	function test_doi_xml($app_id,$shared_secret,$url,$testDOI,$validxml,$invalidxml,$requestURI)
	{

		$test_xml_cases = array(
			array('Update a doi - valid xml', $app_id, $shared_secret, $url,$testDOI,'update', 'string',$requestURI,$validxml, '[MT002]'),	
			array('Mint a doi - Invalid xml', $app_id, $shared_secret, $url,$testDOI,'mint', 'string',$requestURI ,$invalidxml,'[MT006]'),
			array('Update a doi - Invalid xml', $app_id, $shared_secret, $url,$testDOI,'update', 'string',$requestURI, $invalidxml, '[MT007]'),			
	
		);

		foreach($test_xml_cases as $case){
			$test = $this->test_doi_api($case[1], $case[2], $case[3],$case[4],$case[5],$case[6],$case[7],$case[8]);
			$this->unit->run($test, $case[9], $case[0].':  Expected message'. $case[9]);
		} 

		return $this->unit->report(); 
	}

	function test_doi_service_point($app_id,$shared_secret,$url,$testDOI,$validxml,$v1_service_url,$requestURI)
	{

		$test_xml_cases = array(
			array('Update a doi - v1.0 service url', $app_id, $shared_secret, $url,$testDOI,'update', 'string',$v1_service_url,$validxml, '[MT009]'),	
			array('Update a doi - v1.1 service url', $app_id, $shared_secret, $url,$testDOI,'update', 'string',$requestURI ,$validxml,'[MT002]'),	
	
		);

		foreach($test_xml_cases as $case){
			$test = $this->test_doi_api($case[1], $case[2], $case[3],$case[4],$case[5],$case[6],$case[7],$case[8]);
			$this->unit->run($test, $case[9], $case[0].':  '.$case[7].' Expected message'. $case[9]);
		} 

		return $this->unit->report(); 
	}

	function test_result_type($app_id,$shared_secret,$url,$testDOI,$validxml,$requestURI)
	{

		$test_xml_cases = array(
			array('Update a doi - v1.0 service url', $app_id, $shared_secret, $url,$testDOI,'update', 'string',$requestURI ,$validxml, '[MT002]'),	
			array('Update a doi - v1.1 service url', $app_id, $shared_secret, $url,$testDOI,'update', 'json',$requestURI ,$validxml,'[MT002]'),	
			//array('Update a doi - v1.1 service url', $app_id, $shared_secret, $url,$testDOI,'update', 'xml',$requestURI ,$validxml,'[MT002]'),		
	
		);

		foreach($test_xml_cases as $case){
			$test = $this->test_doi_api($case[1], $case[2], $case[3],$case[4],$case[5],$case[6],$case[7],$case[8]);
			$this->unit->run($test, $case[9], $case[0].':  '.$case[7].' Expected message'. $case[9]);
		} 

		return $this->unit->report(); 
	}
	function test_doi_api($app_id,$shared_secret,$url,$testDOI,$action,$result_type,$requestURI,$postdata='')
	{

		$context  = array('Content-Type: application/xml;charset=UTF-8','Authorization: Basic '.base64_encode($app_id.":".$shared_secret));

		if(str_replace("doi_","",$requestURI)!=$requestURI) 
		{
			$action= $action.".php";
		}else{
			$action = $action.".".$result_type;
		}
		$requestURI = $requestURI.$action.'/?url='.$url.'&app_id='.$app_id.'&doi='.$testDOI;
		$newch = curl_init();
		curl_setopt($newch, CURLOPT_URL, $requestURI);
		curl_setopt($newch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($newch, CURLOPT_POST, 1);
		curl_setopt($newch, CURLOPT_POSTFIELDS,$postdata);				
		curl_setopt($newch, CURLOPT_HTTPHEADER,$context);

		$result = curl_exec($newch);

		$curlinfo = curl_getinfo($newch);
		curl_close($newch);

		/* if we identifiy that our request has been redirected, then lets request to the redirect */

		if($curlinfo['redirect_url'])
		{
			$requestURI = $curlinfo['redirect_url'];

			$newch2 = curl_init();
			curl_setopt($newch2, CURLOPT_URL, $requestURI);
			curl_setopt($newch2, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($newch2, CURLOPT_POST, 1);
			curl_setopt($newch2, CURLOPT_POSTFIELDS,$postdata);				
			curl_setopt($newch2, CURLOPT_HTTPHEADER,$context);

			$result = curl_exec($newch2);

			$curlinfo = curl_getinfo($newch2);

			curl_close($newch2);
		}

		if($result_type=='string')
		{
			$message_code = substr($result,0,7);
		}elseif($result_type=='json')
		{
			$obj = json_decode( $result, true );
			$message_code = $obj['response']['responsecode'];

		}elseif($result_type=='xml')
		{

			$obj = simplexml_load_string($result);

			//print_r($obj->{'responsecode'}[0]->text());

			//$message_code = $obj->{'responsecode'}->{0};
		}else
		{
			echo $result;
		}

		return $message_code;


	}



	function test_mint($app_id,$shared_secret,$url,$result_type,$postdata='')
	{

		$context  = array('Content-Type: application/xml;charset=UTF-8','Authorization: Basic '.base64_encode($app_id.":".$shared_secret));
		//$context = array('Content-Type: application/xml;charset=UTF-8');		
		$requestURI = 'http://devl.ands.org.au/workareas/liz/ands/apps/mydois/mint/?url='.$url.'&app_id='.$app_id;	

		$postdata = 'xml=<?xml version="1.0" encoding="UTF-8"?>

<resource xmlns="http://datacite.org/schema/kernel-2.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://datacite.org/schema/kernel-2.1 http://schema.datacite.org/meta/kernel-2.1/metadata.xsd">
  <identifier identifierType="DOI"></identifier>
  <creators>
    <creator>
      <creatorName>Woods, Liz</creatorName>
    </creator>
  </creators>
  <titles>
    <title>Data Test Example</title>
  </titles>
  <publisher>ANDS</publisher>
  <publicationYear>2014</publicationYear>
</resource>'; 
	
		$newch = curl_init();
		curl_setopt($newch, CURLOPT_URL, $requestURI);
		curl_setopt($newch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($newch, CURLOPT_POST, 1);
		curl_setopt($newch, CURLOPT_POSTFIELDS,$postdata);				
		curl_setopt($newch, CURLOPT_HTTPHEADER,$context);

		$result = curl_exec($newch);
		$curlinfo = curl_getinfo($newch);
		curl_close($newch);
		return $result;

	}


}
