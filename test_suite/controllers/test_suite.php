<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Test Suite Index
 * Perform a series of test cases to determine the registry is fully functioning
 *
 * @author Minh Duc Nguyen <minh.nguyen@ands.org.au>
 */
class Test_suite extends MX_Controller {

	private $tests;

	function __construct(){
		$this->output->set_status_header(200);
		$this->output->set_header('Content-type: application/json');
		set_exception_handler('json_exception_handler');
		$this->tests = array(
			'doi_ip_test'
		);
	}

	function index() {
		$data['title'] = 'Test Suite';
		$data['scripts'] = array('test_suite_app');
		$data['js_lib'] = array('core', 'angular', 'select2', 'location_capture_widget', 'googleapi', 'google_map');
		$this->load->view('test_suite_index', $data);
	}

	function tests() {
		echo json_encode($this->tests);
	}

	function do_test($test='') {
		if($test=='') throw new Exception('Test must be specified');
		if(!in_array($test, $this->tests)) throw new Exception('Test not found');
		try{
			$this->load->model($test, 'test_mdl');
			$result = $this->test_mdl->test();
			echo $result;
		} catch (Exception $e) {
			throw new Exception($e);
		}
	}
}
