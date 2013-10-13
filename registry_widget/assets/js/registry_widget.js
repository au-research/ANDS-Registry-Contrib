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
			//jsonp proxy endpoint
			proxy: 'http://researchdata.ands.org.au/apps/registry_widget/proxy/',

			//mode: [search, display_single, display_multi]
			mode: 'search',

			search: true,
			wrapper: '<div class="rowidget_wrapper"></div>',
			search_btn_text: 'Search',
			search_btn_class: 'rowidget_search btn btn-small',
			search_callback:false,

			lookup:true,
			auto_lookup:false,
			lookup_btn_text: 'Resolve',
			lookup_btn_class: 'rowidget_lookup btn btn-small',
			lookup_callback: false,

			single_template: '<div class="rowidget_single"><a href="{{rda_link}}" target="_blank">{{title}}</a></div>',

			//return_type: [key, slug, title, id]
			return_type:'key',

			//location (absolute URL) of the jsonp proxy
			proxy: ''
		};

		//ANDS Environment
		if (typeof(window.real_base_url) !== 'undefined'){
			defaults['proxy'] = window.real_base_url + 'apps/registry_widget/proxy/';
		} 

		//bind and merge the defaults with the given options
		var settings;
		var handler;
		if (typeof(options) !== 'string') {
			settings = $.extend({}, defaults, options);
			//do some quick and nasty fixes
			settings.list_class = typeof(settings.list_class) === 'undefined' ? "" :
			settings._wname = WIDGET_NAME;
			settings._wid = WIDGET_ID;
			try {
				//bind the plugin handler to this
				return this.each(function() {
					var $this = $(this);
					if($this.is('input') && settings.mode=='search'){
						bind_search($this, settings);
					}else if(settings.mode=='display'){
						bind_display($this, settings);
					}else{
						// alert('mode failed');
					}
				});
			}
			catch (err) { throw err; alert(err); }
		}
	}

	function bind_search(obj, s){

		obj.wrap(s.wrapper);
		obj.p = obj.parent();
		var p = obj.p;

		// console.log(obj, p, s);

		if(s.search){
			var search_btn = $('<button>').addClass(s.search_btn_class).html(s.search_btn_text);
			p.append(search_btn);
			// p.append(template.renderTpl(values));
			$(search_btn).on('click', function(e){
				e.preventDefault();e.stopPropagation();
				// _search_form(obj,s);
			});
		}

		if(s.lookup){
			var lookup_btn = $('<button>').html(s.lookup_btn_text).addClass(s.lookup_btn_class);
			p.append(lookup_btn);
			p.append($('<div>').addClass('rowidget_display_container'));
			$(lookup_btn).on('click', function(e){
				e.preventDefault();e.stopPropagation();
				_lookup(obj,s);
			});
		}
	}

	function bind_display(obj, s){
		console.log(obj);
		$.ajax({
			url:s.proxy+'lookup?q='+obj.attr('data-query')+'&callback=?', 
			success: function(data){
				if(data.status==0){
					var template = s.single_template;
					obj.html(template.renderTpl(data.result));
				}else{
					// console.log(data);
				}
			}
		});
	}

	function _lookup(obj,s){
		var query = obj.val();
		$.ajax({
			url:s.proxy+'lookup?q='+encodeURIComponent(query)+'&callback=?', 
			success: function(data){
				if(data.status==0){
					var template = s.single_template;
					obj..append(template.renderTpl(data.result));
					if(s.return_type){
						if(typeof (data.result[s.return_type])!='undefined') obj.val(data.result[s.return_type]);
					}
				}else{
					// console.log(data);
				}
			}
		});
	}

	String.prototype.renderTpl = function() {
		var args = arguments;
		if (typeof(args[0]) == 'undefined') return this; 
		var values = args[0];

		template = this.replace(/{{#(.*?)}}([\s\S]*?){{\/\1}}/g, function(match, subTplName, subTplValue) {         
			if (typeof(values[subTplName]) != 'undefined' 
				&& values[subTplName] instanceof Array 
				&& values[subTplName].length > 0)
			{
				replacement = ''; 
				for (i=0; i<values[subTplName].length; i++)
				{
					var partial = subTplValue.renderTpl(values[subTplName][i]);
					if (partial != subTplValue)
					{
						replacement += partial;
					}
				}
				return (replacement != '' ? replacement : subTplValue);
	 
			}
			else
				return '';
		});
		return template.replace(/{{([\s\S]*?)}}/g, function(match, field_name) { 
			return typeof values[field_name] != 'undefined'
			 ? values[field_name]
			 : match
			;
		}); 
	};

	//catch all .registry_widget and apply registry_widget() with default settings on
	$('.registry_widget').each(function(){
		var elem = $(this);
		var widget = elem.registry_widget();
	});
})( jQuery );

