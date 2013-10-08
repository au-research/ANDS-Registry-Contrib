<?php $this->load->view('header');?>
<div class="content-header">
    <h1>ANDS - Registry Widget</h1>
</div>
<div id="breadcrumb">
    <?php echo anchor(registry_url(), '<i class="icon-home"></i> Home', array('tip'=>'Go to Home')); ?>
    <?php echo anchor('/registry_widget', 'Registry Widget', array('class'=>'current')) ?>
</div>
<div class="container-fluid">
    <div class="widget-box">
        <div class="widget-title">
            <h5>Registry Widget</h5>
        </div>
        <div class="widget-content">

            <div class="alert alert-info">
                <b>Developer Zone</b>
                <p>Some basic web development knowledge may be needed to implement this widget</p>
            </div>

            <form class="form-inline">
                <input type="text" class="registry_widget">
            </form>

            <h2>License</h2>
            <p>
                Apache License, Version 2.0: <a href="http://www.apache.org/licenses/LICENSE-2.0">http://www.apache.org/licenses/LICENSE-2.0</a>
            </p>

            
        </div>
    </div>
</div>
<?php $this->load->view('footer');?>