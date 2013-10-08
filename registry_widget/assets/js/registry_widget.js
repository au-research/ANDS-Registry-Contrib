/*
  Copyright 2013 The Australian National University
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  *******************************************************************************/

/**
 * Registry plugin for search and display of registry objects
 * @author Minh Duc Nguyen <minh.nguyen@ands.org.au>
 */
 ;(function($) {
	
	//settings
	var WIDGET_NAME = "ANDS Registry service";
	var WIDGET_ID = "_registry_widget_list";

	//init the registry_widget()
	$.fn.registry_widget = function(options, param) {

		//set params
		param = typeof(param) === 'undefined' ? false : param;

		var defaults = {
			//mode: [search, display]
			mode: 'search',

			//location (absolute URL) of the jsonp proxy
			proxy: ''
		};

		//bind and merge the defaults with the given options
		var settings;
		var handler;
		if (typeof(options) !== 'string') {
			settings = $.extend({}, defaults, options);
			//do some quick and nasty fixes
			settings.list_class = typeof(settings.list_class) === 'undefined' ? "" :
			settings.list_class;
			settings._wname = WIDGET_NAME;
			settings._wid = WIDGET_ID;
			try {
				//bind the plugin handler to this
				return this.each(function() {
					var $this = $(this);
					// handler = new OrcidSearcher($this, settings);
					bind_registry_plugin($this, settings);
				});
			}
			catch (err) { throw err; alert(err); }
		}
	}

	function bind_registry_plugin(){
		
	}

	//catch all .registry_widget and apply registry_widget() with default settings on
	$('.registry_widget').each(function(){
		var elem = $(this);
		var widget = elem.registry_widget();
	});
})( jQuery );