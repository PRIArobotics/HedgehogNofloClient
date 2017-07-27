module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    noflo_browser: {
      build: {
        files: {
          'build/browser/noflo-hedgehog.js': ['package.json']
        }
      }
    },
    uglify: {
      options: {
        report: 'min'
      },
      noflo: {
        files: {
          './build/browser/noflo-core.min.js': ['./build/browser/noflo-core.js']
        }
      }
    },
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
    babel: {
      options: {
        presets: ['es2015']
      },
      all: {
        files: []
      }
    },
    clean: [
      'build',
      'components',
      'tmp'
    ],
    copy: {
      all: {
        files: []
      }
    },
    tslint: {
      options: {
        configuration: "tslint.json"
      },
      all: 'src/components/**/*.ts',
      test: 'test/**/*.ts'
    }
  });

  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks("grunt-tslint");
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-symlink');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-noflo-browser');
  grunt.loadNpmTasks('grunt-babel');

  grunt.registerTask('compile', ['ts', 'noflo_browser', 'uglify', 'babel']);
  grunt.registerTask('build', ['clean', 'compile', 'copy']);
};
