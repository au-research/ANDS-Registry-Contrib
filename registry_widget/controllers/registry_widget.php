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
        $data['scripts'] = array('registry_widget_loader');
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
				$this->JSONP($callback, array('status'=>1, 'message'=>'q must be specified'));
			}
		}elseif($action=='search'){
			$q = (isset($_GET['q'])? $_GET['q']: false);
			if($q){
				$r = $this->search($q);
				$this->JSONP($callback, $r);
			}else{
				$this->JSONP($callback, array('status'=>1, 'message'=>'q must be specified'));
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
				'type'=>$ro->type,
				'group'=>$ro->group,
			);
			if($ro->getMetadata('the_description')) {
				$r['result']['description']=$ro->getMetadata('the_description');
			}else $r['result']['description'] = '';
		}else{
			$r['status'] = 1;
			$r['message'] = 'No Registry Object Found';
		}
		return $r;
	}

	private function search($query){
		$q = urldecode($query);
		$r = array();
		$this->load->library('solr');
		$filters = array('q'=>$q);
		$this->solr->setFilters($filters);
		$this->solr->executeSearch();
		
		$result = $this->solr->getResult();
		$r['result'] = $this->solr->getResult();
		$r['numFound'] = $this->solr->getNumFound();

		if($r['numFound'] > 0){
			$r['status']=0;
		}else{
			$r['status']=1;
			$r['message'] = 'No Result Found!';
		}
		$r['solr_header'] = $this->solr->getHeader();
		$r['timeTaken'] = $r['solr_header']->{'QTime'} / 1000;
		return $r;
	}



	function download(){
		
	}
}