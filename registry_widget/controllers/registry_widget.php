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
		$data['title'] = 'Registry Widget - ANDS';
        $data['scripts'] = array();
        $data['js_lib'] = array('core', 'registry_widget', 'prettyprint');
        $this->load->view('documentation', $data);
	}

	function proxy($action=''){
		set_exception_handler('json_exception_handler');
		header('Cache-Control: no-cache, must-revalidate');
		header('Content-type: application/json');
		$callback = (isset($_GET['callback'])? $_GET['callback']: '?');
		if($action=='lookup'){
			if(isset($_GET['q'])){
				$r = $this->lookup($_GET['q']);
				$this->JSONP($callback, $r);
			}else{
				$r = array('status'=>1, 'message'=>'q must be specified');
				$this->JSONP($callback, $r);
			}
		}
	}

	private function JSONP($callback, $r){
		echo ($callback) . '(' . json_encode($r) . ')';
	}

	private function lookup($query){
		$query = urldecode($query);
		$r = array();
		$this->load->model('registry/registry_object/registry_objects', 'ro');
		$ro = $this->ro->getByID($query);
		if(!$ro) $ro = $this->ro->getBySlug($query);
		if(!$ro) $ro = $this->ro->getPublishedByKey($query);
		if($ro){
			$r['status'] = 0;
			$r['result'] = array(
				'id'=>$ro->id,
				'rda_link'=>portal_url($ro->slug),
				'key'=>$ro->key,
				'slug'=>$ro->slug,
				'title'=>$ro->title,
				'class'=>$ro->class,
				'type'=>$ro->type
			);
		}else{
			$r['status'] = 1;
			$r['message'] = 'No Registry Object Found';
		}
		return $r;
	}



	function download(){
		
	}
}