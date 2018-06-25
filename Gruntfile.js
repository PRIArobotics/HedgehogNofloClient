module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    ts: {
      options: {
        target: 'es6',
        module: 'commonjs',
        moduleResolution: 'node',
        sourceMap: true,
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        removeComments: false,
        noImplicitAny: false,
        allowJs: true
      },
      all: {
        src: ['src/**/*.ts', 'typings/index.d.ts'],
        outDir: '.'
      },
      test: {
        src: ['test/**/*.ts', 'typings/index.d.ts'],
        outDir: 'build'
      }
    },
    // babel: {
    //   options: {
    //     presets: ['es2015']
    //   },
    //   all: {
    //     files: []
    //   }
    // },
    clean: [
      'build',
      'components',
      'lib',
      'tmp'
    ],
    tslint: {
      options: {
        configuration: "tslint.json"
      },
      all: 'src/**/*.ts',
      test: 'test/**/*.ts'
    }
  });

  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks("grunt-tslint");
  grunt.loadNpmTasks('grunt-contrib-clean');
  // grunt.loadNpmTasks('grunt-babel');

  // grunt.registerTask('compile', ['ts', 'babel']);
  grunt.registerTask('compile', ['ts']);
  grunt.registerTask('build', ['clean', 'compile']);
};
