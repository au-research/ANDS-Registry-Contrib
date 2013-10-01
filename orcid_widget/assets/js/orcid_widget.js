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

;(function($) {
    var WIDGET_NAME = "ANDS Orcid service";
    var WIDGET_ID = "_orcid_widget_list";

    //init the orcid_widget()
    $.fn.orcid_widget = function(options, param) {

    	//set params
		param = typeof(param) === 'undefined' ? false : param;

		var defaults = {
		    //location (absolute URL) of the jsonp proxy
		    search_endpoint: 'http://pub.orcid.org/search/orcid-bio?q=',
		   	lookup_endpoint: 'http://pub.orcid.org/',
		    //search mode: what to show when no hits? set to boolean(false) to supress
		    nohits_msg: '<p>No matches found<br/>If you wish to register for an orcid please click <a href="https://orcid.org/register" target="_blank" style="float:none;padding:0px">here</a></p>',

		    pre_lookup: false,

		    //Text Settings
		    search: true,
		    pre_open_search: false,
		    search_text: '<i class="icon-search"></i> Search',
		    search_class: 'orcid_search btn btn-small',
		    lookup: true,
		    lookup_text: 'Look up',
		    lookup_class: 'orcid_lookup btn btn-small',

		    before_html: '<span class="orcid_before_html">http://orcid.org/</span>',
		    wrap_html: '<div class="orcid_wrapper"></div>',

		    result_success_class: 'orcid_success_div',
		    result_error_class: 'orcid_error_div',
		    search_div_class: 'orcid_search_div',

		    lookup_error_handler: false,
		    lookup_success_handler: false,
		    lookup_success_hook: false
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
				    bind_orcid_plugin($this, settings);
				});
		    }
		    catch (err) { throw err; alert(err); }
		}
	}

	//primary function 
	function bind_orcid_plugin(obj, settings){
		if(obj.parent().is('span.inputs_group')){
			var p = obj.closest('.controls');
			obj.p = p;
		}else{
			obj.wrap(settings.wrap_html);
			var p = obj.parent();
			obj.p = p;
		}
		
		if(settings.pre_lookup || (obj.attr('data-autolookup')==='true')) _lookup(obj, settings);

		if(settings.lookup){
			var lookup_btn = $('<button>').addClass(settings.lookup_class).html(settings.lookup_text);
			p.append(lookup_btn);
			$(lookup_btn).on('click', function(){
				_lookup(obj, settings);
			});
		}

		if(settings.search){
			var search_btn = $('<button>').addClass(settings.search_class).html(settings.search_text);
			var search_html = 'Search Query: <input type="text" class="orcid_search_input"/> <a class="search_orcid">Search</a> <div class="orcid_search_result"></div> <a class="close_search">Close</a>';
			var search_div = $('<div>').addClass(settings.search_div_class).html(search_html);
			if(!settings.pre_open_search) $(search_div).hide();
			p.append(search_btn).append(search_div);
			$(search_btn).on('click', function(e){
				e.preventDefault();
				_search_form(obj, settings);
			});
			$('input.orcid_search_input', p).on('keypress', function(e){
				console.log(e);
				if(e.keyCode==13){
					_search($(this).val(), obj, settings); return false;
				}
			});
			$('.search_orcid', p).on('click', function(e){
				e.preventDefault();
				e.stopPropagation();
				var query = $('.orcid_search_input', p).val();
				_search(query, obj, settings);
			});
			$('.close_search', p).on('click', function(){
				$('.'+settings.search_div_class, p).slideUp();
			});
		}
		
		if(settings.before_html) obj.before(settings.before_html);
		//console.log(obj, settings);

		$(obj).on('keypress', function(e){
			if(e.keyCode==13){
				_lookup(obj, settings); return false;
			}
		});
	}

	//lookup function, called internally
	function _lookup(obj, settings){
		var value = obj.val();
		$.ajax({
			url:settings.lookup_endpoint+encodeURIComponent(value)+'?callback=?', 
			dataType: 'jsonp',
			timeout: 1000,
			success: function(data){
				if(settings.lookup_success_handler && (typeof settings.lookup_success_handler === 'function')){
					settings.lookup_success_handler(data, obj);
				}else{
					_clean(obj, settings);
					var given = data['orcid-profile']['orcid-bio']['personal-details']['given-names'].value || '';
					var family = data['orcid-profile']['orcid-bio']['personal-details']['family-name'].value || '';
					var orcid = data['orcid-profile']['orcid-id'];
					var html = '<b>ORCID: </b><a href="'+orcid+'" target="_blank">'+orcid+'</a><br/>'+'<b>Full Name: </b>'+given+' '+family;
					var result_div = $('<div>').addClass(settings.result_success_class).html(html);
					obj.p.append(result_div);
					if(settings.lookup_success_hook && (typeof settings.lookup_success_hook ==='function')){
						settings.lookup_success_hook();
					}
				}
			},
			error: function(xhr){
				if(settings.lookup_error_handler && (typeof settings.lookup_error_handler === 'function')){
					settings.lookup_error_handler(xhr);
				}else{
					_clean(obj, settings);
					var result_div = $('<div>').addClass(settings.result_error_class).html(settings.nohits_msg);
					obj.p.append(result_div);
					obj.addClass('error');
				}
			}
		});
	}

	function _search(query, obj, settings){
		var p = obj.p;
		var result_div = p.find('.'+settings.orcid_search_result);
		if($.trim(query)==""){
			$('.orcid_search_result', p).html('Please enter a search string');
		}else{
			$('.orcid_search_result', p).html('Loading...');
			$.ajax({
				url:settings.search_endpoint+encodeURIComponent(query)+'&start=0&rows=10&wt=json&callback=?', 
				dataType: 'jsonp',
				success: function(data){
					if(settings.success_handler && (typeof settings.success_handler === 'function')){
						settings.success_handler(data, obj, settings);
					}else{
						if(data['orcid-search-results']){
							var html='<ul>';
							$.each(data['orcid-search-results']['orcid-search-result'], function(){
								var orcid = this['orcid-profile']['orcid'].value;
								var given = this['orcid-profile']['orcid-bio']['personal-details']['given-names'].value || '';
								var family = this['orcid-profile']['orcid-bio']['personal-details']['family-name'].value || '';
								html+='<li>';
								html+='<a class="select_orcid_search_result" orcid-id="'+orcid+'">'+given+' '+family+'</a>';
								html+='</li>';
							});
							html+='</ul>';
							$('.orcid_search_result', p).html(html);
						}else{
							$('.orcid_search_result', p).html(settings.nohits_msg);
						}
					}
					$('.select_orcid_search_result', p).on('click', function(){
						obj.val($(this).attr('orcid-id'));
						_lookup(obj, settings);
					});
					
				},
				error: function(xhr){
					if(settings.error_handler && (typeof settings.error_handler === 'function')){
						settings.error_handler(xhr);
					}else{
						console.error(xhr);
					}
				}
			});
		}
	}

	//remove (if exist) error and result
	function _clean(obj, settings){
		obj.removeClass('error');
		if(obj.p.children('.'+settings.result_error_class).length>0){
			obj.p.children('.'+settings.result_error_class).remove();
		}
		if(obj.p.children('.'+settings.result_success_class).length>0){
			obj.p.children('.'+settings.result_success_class).remove();
		}
	}

	//open the search form
	function _search_form(obj, settings){
		obj.p.children('.'+settings.search_div_class).slideToggle();
	}

	//catch all .orcid_widget and apply orcid_widget() with default settings on
	$('.orcid_widget').each(function(){
	   	var elem = $(this);
	   	var widget = elem.orcid_widget();
    });
})( jQuery );