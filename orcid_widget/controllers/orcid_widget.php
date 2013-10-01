<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Orcid_widget extends MX_Controller {

    function index(){
        $data['title'] = 'Orcid Widget - ANDS';
        $data['scripts'] = array('orcid_widget_loader');
        $data['js_lib'] = array('core', 'orcid_widget', 'prettyprint');
        $this->load->view('documentation', $data);
    }

    function download(){
        $this->load->library('zip');
        $this->zip->read_file('./applications/apps/orcid_widget/assets/css/orcid_widget.css');
        $this->zip->read_file('./applications/apps/orcid_widget/assets/js/orcid_widget.js');
        $this->zip->download('orcid_widget.zip');
    }
}
