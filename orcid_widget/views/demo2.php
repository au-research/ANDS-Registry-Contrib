<?php $this->load->view('header');?>
<div class="content-header">
    <h1>ANDS - ORCID Widget</h1>
</div>
<div id="breadcrumb">
    <?php echo anchor(registry_url(), '<i class="icon-home"></i> Home', array('tip'=>'Go to Home')); ?>
    <?php echo anchor('/orcid_widget', 'ORCID Widget', array('class'=>'current')) ?>
</div>
<div class="container-fluid">
    <div class="widget-box">
        <div class="widget-title">
            <h5>ORCID Widget</h5>
        </div>
        <div class="widget-content">

            <form action="" class="form-inline">
                <h4>Class orcid_widget bind</h4>
                <input type="text" name="name" value="" size="40" class="orcid_widget"/>
            </form>
            <form action="" class="form-inline">
                <h4>Default Settings</h4>
                <input type="text" name="name" id="default_settings_orcid" value="" size="40" class=""/>
            </form>
            <form action="" class="form-inline">
                <h4>Custom Settings</h4>
                <input type="text" name="name" id="custom_settings_orcid" value="0000-0002-6440-7059" size="40" class=""/>
            </form>
            <form action="" class="form-inline">
                <h4>Error</h4>
                <input type="text" name="name" value="should-just-error" size="40" class="orcid_widget" data-autolookup="true"/>
            </form>
        </div>
    </div>
</div>
<?php $this->load->view('footer');?>