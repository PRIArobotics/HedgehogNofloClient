module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    ts: {
      default: {
        tsconfig: {
          passThrough: true
        }
      }
    },
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

  grunt.registerTask('build', ['clean', 'ts']);
};
