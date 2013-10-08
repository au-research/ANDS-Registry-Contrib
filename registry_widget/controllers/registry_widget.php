<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Registry Widget Controller
 * Acts as proxy and documentation
 *
 * @author  Minh Duc Nguyen <minh.nguyen@ands.org.au>
 */
class Registry_widget extends MX_Controller{

	/**
	 * Display Documentation
	 * @return HTML 
	 */
	function index(){
		$this->load->model('registry/registry_object/registry_objects', 'ro');
		$ro = $this->ro->getByID(137458);
		$data['title'] = 'Registry Widget - ANDS';
        $data['scripts'] = array();
        $data['js_lib'] = array('core', 'registry_widget', 'prettyprint');
        $this->load->view('documentation', $data);
	}

	function download(){
		
	}
}