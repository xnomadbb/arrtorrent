module.exports = function(grunt) {
	grunt.initConfig({
		clean: {client: ['web_build']},

		copy: {
			static: {
				files: [
					{
						expand: true,
						cwd: 'client/',
						src: ['favicon.ico', 'index.html', 'assets/**', '!assets/**/*.scss'],
						dest: 'web_build/',
					},
				],
			},
		},

		browserify: {
			options: {
				transform: ['reactify'],
				browserifyOptions: {extensions: '.jsx'},
			},
			dev: {
				files: {'web_build/assets/main.js': ['./client/js/**/*.jsx']},
				options: {debug: true},
			},
			prod: {
				files: {'web_build/assets/main.js': ['./client/js/**/*.jsx']},
				options: {debug: false},
			},
			watch: {
				files: {'web_build/assets/main.js': ['./client/js/**/*.jsx']},
				options: {debug: true, watch: true, keepAlive: true},
			},
		},

		uglify: {
			options: {
				mangle: true,
				'screw-ie8': true,
				compress: {
					sequences: true,
					dead_code: true,
					drop_debugger: true,
					conditionals: true,
					comparisons: true,
					evaluate: true,
					loops: true,
					booleans: true,
					cascade: true,
					unused: true,
					if_return: true,
					join_vars: true,
				},
			},
			prod: {
				files: {'web_build/assets/main.js': ['web_build/assets/main.js']}
			},
		},

		sass: {
			dev: {
				options: {
					sourceMap: true,
				},
				files: [
					{
						expand: true,
						cwd: 'client/',
						src: ['assets/main.scss', 'assets/themes/*/main.scss'],
						dest: 'web_build/',
						ext: '.css',
					},
				],
			},
			prod: {
				options: {
					outputStyle: 'compressed',
				},
				files: [
					{
						expand: true,
						cwd: 'client/',
						src: ['assets/main.scss', 'assets/themes/*/main.scss'],
						dest: 'web_build/',
						ext: '.css',
					},
				],
			},
		},

		// Watch-related stuff from here on
		execute: {
			arr: {
				options: {cwd: './server'},
				src: ['./server/main.js'],
			}
		},

		watch: {
			sass: {
				files: ['client/assets/**/*.scss'],
				tasks: ['sass:dev'],
				options: {interrupt: true},
			},
			static: {
				files: ['client/**', '!client/**/*.jsx', '!client/**/*.scss'],
				tasks: ['copy:static'],
			},
			execute: {
				// Restart server when anything changes
				files: ['web_build/**', 'server/**'],
				tasks: ['execute:arr'],
				options: {interrupt: true},
			},
		},

		concurrent: {
			options: {logConcurrentOutput: true},
			watch: ['watch:sass', 'watch:static', 'browserify:watch', 'execute:arr'],
		},
	});

	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-concurrent');    // Because node is async except when it's not
	grunt.loadNpmTasks('grunt-contrib-clean'); // Because basic file operations make great plugins
	grunt.loadNpmTasks('grunt-contrib-copy');  // Because basic file operations make great plugins
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-execute');
	grunt.loadNpmTasks('grunt-sass');

	grunt.registerTask('dev',  ['clean:client', 'copy:static', 'sass:dev',  'browserify:dev']);
	grunt.registerTask('prod', ['clean:client', 'copy:static', 'sass:prod', 'browserify:prod', 'uglify:prod']);
	grunt.registerTask('arrwatch', ['dev', 'concurrent:watch']);
	grunt.registerTask('run', ['execute:arr']);

	grunt.registerTask('default', ['dev']);
};
