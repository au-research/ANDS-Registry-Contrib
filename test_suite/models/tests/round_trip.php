<?php
require_once(APP_PATH. 'test_suite/models/_GenericTest.php');
class Round_trip extends _GenericTest {


	function run_test() {

		//create example datasource
		$sample_key = 'test_ds';
		$this->load->model('registry/data_source/data_sources', 'ds');
		$this->ds->create($sample_key, 'test-ds');
		$test = $this->ds_exist($sample_key);
		$this->unit->run($test, true, 'Datasource Insert');

		//delete example datasource
		$data_source = $this->ds->getByKey($sample_key, false);
		if($data_source) $data_source->eraseFromDB();
		$test2 = $this->ds_exist($sample_key);
		$this->unit->run($test2, false, 'Datasource Delete');
	}

	function ds_exist($key){
		$this->load->model('registry/data_source/data_sources', 'ds');
		$ds = $this->ds->getByKey($key, false);
		if ($ds) {
			return true;
		}else return false;
	}

}