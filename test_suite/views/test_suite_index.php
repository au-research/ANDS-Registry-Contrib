<?php $this->load->view('header'); ?>
<div ng-app="test_suite_app">
	<div ng-view></div>
</div>

<div id="index_template" class="hide">
	<div class="content-header">
		<h1>Test Suite</h1>
	</div>
	<div id="breadcrumb" style="clear:both;">
		<?php echo anchor(registry_url('auth/dashboard'), '<i class="icon-home"></i> Home'); ?>
		<a href="#/" class="current">Test Suite</a>
	</div>
	<div class="container-fluid">
		<div class="widget-box">
			<div class="widget-title">
				<h5>Tests</h5>
			</div>
			<div class="widget-content">
				<div class="row-fluid">
					<div class="span3">
						<ul class="nav nav-list">
							<li class="nav-header">List header</li>
							<li class="active"><a href="#">Home</a></li>
							<li><a href="#">Library</a></li>
						</ul>
					</div>
					<div class="span9">

					</div>
				</div>
			</div>
		</div>

	</div>
</div>
<?php $this->load->view('footer'); ?>