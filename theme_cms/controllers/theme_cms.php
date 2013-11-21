<?php

class Theme_cms extends MX_Controller {
	private $directory = './assets/shared/theme_pages/';
	private $index_file = 'theme_cms_index.json';


	function index(){
		$this->checkWritable();
		$data['title']='Theme CMS';
		$data['scripts'] = array('theme_cms_app');
		$data['js_lib'] = array('core', 'tinymce', 'angular', 'colorbox', 'select2', 'registry_widget');
		$this->load->view('theme_cms_index', $data);
	}

	function bulk_tag(){
		$data['title'] = 'Bulk Tagging Tool';
		$data['scripts'] = array('bulk_tag_app');
		$data['js_lib'] = array('core', 'angular', 'select2', 'location_capture_widget', 'googleapi', 'google_map');

		$this->load->model("registry/data_source/data_sources","ds");
	 	$dataSources = $this->ds->getAll(0,0);
		$items = array();
		foreach($dataSources as $ds){
			$item = array();
			$item['title'] = $ds->title;
			$item['key'] = $ds->key;
			array_push($items, $item);
		}
		$data['dataSources'] = $items;

		$this->load->view('bulk_tag_index', $data);
	}

	function checkWritable(){
		// Check the upload directory exists/is writeable
		if (!is_dir($this->directory) || !is_writeable($this->directory)){
			throw new Exception("Uploads directory has not been created or cannot be read/written to.<br/><br/> Please create the directory: " . $this->directory);
		}
	}

	public function get($slug){
		header('Cache-Control: no-cache, must-revalidate');
		header('Content-type: application/json');
		$file = read_file($this->directory.$slug.'.json');
		echo $file;
	}

	public function new_page(){
		header('Cache-Control: no-cache, must-revalidate');
		header('Content-type: application/json');
		$data = file_get_contents("php://input");
		$array = json_decode($data);
		if($this->write($array->slug, $data)){
			echo 1;
		}else echo 0;
		$this->build_index();
	}

	public function delete_page(){
		$data = file_get_contents('php://input');
		$array = json_decode($data);
		unlink($this->directory.$array->slug.'.json');
		$this->build_index();
	}

	public function save_page(){
		$data = file_get_contents("php://input");
		$array = json_decode(file_get_contents("php://input"));
		echo json_encode($array);
		if($this->write($array->slug, $data) && $this->build_index() && $this->build_solr_index($array->slug)){
			echo $data;
			echo 1;
		}else echo 0;
	}

	public function write($slug, $content){
		if(!write_file($this->directory.$slug.'.json', $content, 'w+')){
			return false;
		}else return true;
	}

	public function view($slug=''){
		$data['title'] = 'Theme CMS';
		$data['scripts'] = array('theme_cms');
		$data['js_lib'] = array('core', 'tinymce');
		$this->load->view('theme_cms_view', $data);
	}

	public function list_pages(){
		$index = read_file($this->directory.$this->index_file);
		echo $index;
	}

	public function build_index(){
		$root = scandir($this->directory, 1);
		$result = array();
		foreach($root as $value){
			if($value === '.' || $value === '..') {continue;} 
			$pieces = explode(".", $value);
			if(is_file("$this->directory/$value")) {
				if($pieces[0].'.json'!=$this->index_file){
					$file = json_decode(read_file($this->directory.$pieces[0].'.json'), true);
					$result[] = array(
						'title' => (isset($file['title'])?$file['title']:'No Title'),
						'slug' => (isset($file['slug'])?$file['slug']:$pieces[0]),
						'img_src'=> (isset($file['img_src'])?$file['img_src']:false),
						'desc'=>(isset($file['desc'])?$file['desc']:false),
						'visible'=>(isset($file['visible'])?$file['visible']:false),
					);
				}
			} 
		}
		if(!write_file($this->directory.$this->index_file, json_encode($result), 'w+')){
			return false;
		} else {
			return true;
		}
	}

	public function build_solr_index($slug=''){
		$this->load->library('solr');
		if($slug!=''){
			$xml = $this->transformSOLR($slug);
			$this->solr->deleteByQueryCondition("id:(topic_".$slug.")");
			echo $this->solr->addDoc('<add>' . $xml . '</add>');
			echo $this->solr->commit();
		}else{
			$root = scandir($this->directory, 1);
			$xml = '';
			foreach($root as $value){
				if($value === '.' || $value === '..') {continue;} 
				$pieces = explode(".", $value);
				if(is_file("$this->directory/$value")) {
					if($pieces[0].'.json'!=$this->index_file){
						$xml.=$this->transformSOLR($pieces[0]);	
					}
				} 
			}
			$this->solr->deleteByQueryCondition("class:(topic)");
			echo $this->solr->addDoc('<add>' . $xml . '</add>');
			echo $this->solr->commit();
		}
	}


	public function transformSOLR($slug){
		$file = read_file($this->directory.$slug.'.json');
		$file = json_decode($file, true);
		$xml = '<doc>';
		$xml .=	"<field name='id'>topic_" . $file['slug'] ."</field>" . NL;
		$xml .=	"<field name='data_source_id'>topic</field>" . NL;
		$xml .=	"<field name='key'>topic</field>" . NL;
		$xml .=	"<field name='display_title'>".$file['title']." Theme Page</field>" . NL;
		$xml .=	"<field name='list_title'>".$file['title']." Theme Page</field>" . NL;
		$xml .=	"<field name='simplified_title'>".$file['title']." Theme Page</field>" . NL;

		$xml .=	"<field name='class'>topic</field>" . NL;
		$xml .=	"<field name='slug'>theme/".$file['slug']."</field>" . NL;
		$xml .=	"<field name='status'>PUBLISHED</field>" . NL;
		//$xml .=	"<field name='logo'>".$topic."</field>" . NL;

		if(isset($file['desc'])) $xml .= "<field name='description'>".htmlentities($file['desc'])."</field>" . NL;
		if(isset($file['desc'])) $xml .= "<field name='description_value'>".htmlentities($file['desc'])."</field>" . NL;
		$xml .='</doc>';
		return $xml;
	}

	public function build(){
		if($this->build_index()) echo 'Index Built <br/>';
	}
	
	// Initialise
	function __construct(){
		parent::__construct();
		acl_enforce('PORTAL_STAFF');
		$this->load->helper('file');
	}
}