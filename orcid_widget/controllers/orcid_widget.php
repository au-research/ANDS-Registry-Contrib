<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Orcid_widget extends MX_Controller {

    function index(){
        $data['title'] = 'Orcid Widget - ANDS';
        $data['scripts'] = array('orcid_widget_loader');
        $data['js_lib'] = array('core', 'orcid_widget', 'prettyprint');
        $this->load->view('documentation', $data);
    }
}
