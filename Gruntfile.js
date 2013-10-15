module.exports = function(grunt){
	//configuration goes here
	var yeomanConfig = {
		orcid_widget: 'orcid_widget/assets',
		registry_widget: 'registry_widget/assets'
	}
	grunt.initConfig({
		yeoman: yeomanConfig,
		uglify:{
			options:{mangle: false,report: 'min'},
			orcid_widget:{
				files:{'<%= yeoman.orcid_widget %>/dist/orcid_widget.min.js':['<%= yeoman.orcid_widget %>/js/orcid_widget.js']}
			},
			registry_widget:{
				files:{'<%= yeoman.registry_widget %>/dist/registry_widget.min.js':['<%= yeoman.registry_widget %>/js/registry_widget.js']}
			}
		},
		cssmin:{
			options:{report:'min'},
			orcid_widget:{
				src:'<%= yeoman.orcid_widget %>/css/orcid_widget.css',
				dest:'<%= yeoman.orcid_widget %>/dist/orcid_widget.min.css'
			},
			registry_widget:{
				src:'<%= yeoman.registry_widget %>/css/registry_widget.css',
				dest:'<%= yeoman.registry_widget %>/dist/registry_widget.min.css'
			}
		},
	});
	require('load-grunt-tasks')(grunt);

	//define your tasks
	grunt.registerTask('default', [
		'uglify',
		'cssmin'
	]);
}