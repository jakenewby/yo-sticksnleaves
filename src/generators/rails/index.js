'use strict';

var co         = require('co'),
    Generators = require('yeoman-generator'),
    Promise    = require('bluebird');

require('babel/polyfill');

module.exports = Generators.Base.extend({
  constructor: function() {
    var args = Array.prototype.slice.call(arguments);

    args[1].force = true;

    Generators.Base.apply(this, args);
  },

  initializing: function(projectDest) {
    this.projectDest = projectDest;

    this.projectName = this.options.projectName;
  },

  prompting: {
    askForRailsVersion: function() {
      var async = this.async();

      var questions = [{
        name: 'railsVersion',
        message: 'What version of Rails would you like to use?',
        default: '4.2.1'
      }];

      this.prompt(questions, function(answers) {
        this.railsVersion = answers.railsVersion;

        async();
      }.bind(this));
    },

    askForRubyVersion: function() {
      var async = this.async();

      var questions = [{
        name: 'rubyVersion',
        message: 'What version of Ruby would you like to use?',
        default: '2.2.1'
      }];

      this.prompt(questions, function(answers) {
        this.rubyVersion = answers.rubyVersion;

        async();
      }.bind(this));
    },

    askIfAPI: function() {
      var async = this.async();

      var questions = [{
        type: 'confirm',
        name: 'isAPI',
        message: 'Are you building an API?'
      }];

      this.prompt(questions, function(answers) {
        this.isAPI = answers.isAPI;

        async();
      }.bind(this));
    }
  },

  install: function() {
    co(function *() {
      try {
        var async = this.async();

        yield this._gitInit();

        yield this._copyRbenv();

        yield this._downloadRails();

        yield this._installRails();

        yield this._stopSpring();

        yield this._copyGemfile();

        yield this._bundleInstall();

        yield this._copyDatabaseConfig();

        yield this._createDatabase();

        yield this._makeRSpecDir();

        yield this._copyRSpec();

        yield this._copyUnicornConfig();

        yield this._copyProcfile();

        yield this._copyGitIgnore();

        yield this._copyRubocop();

        async();
      } catch (err) {
        console.log(err);
      }
    }.bind(this));
  },

  // private

  /**
   * Install application dependencies using the command:
   *
   * `bundle install --without production`
   */
  _bundleInstall: function() {
    return new Promise(function(resolve, reject) {
      this.spawnCommand('bundle', ['install', '--without', 'production'])
        .on('exit', function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
    }.bind(this));
  },

  /**
   * Copy `database.yml` into `config/database.yml`. Build database name with
   * project name.
   */
  _copyDatabaseConfig: function() {
    this.fs.copyTpl(
      this.templatePath('database.yml'),
      this.destinationPath('config/database.yml'),
      { databaseName: this.projectName }
    );

    return new Promise(function(resolve) {
      this._writeFiles(function() {
        resolve();
      });
    }.bind(this));
  },

  /**
   * Copy Gemfile to project. If the project is an API then an API specific
   * Gemfile will be used.
   */
  _copyGemfile: function() {
    var gemfileTemplate = this.isAPI ? 'Gemfile-api' : 'Gemfile';

    this.fs.copyTpl(
      this.templatePath(gemfileTemplate),
      this.destinationPath('Gemfile'),
      {
        rubyVersion: this.rubyVersion,
        console: '<%= console %>'
      }
    );

    return new Promise(function(resolve) {
      this._writeFiles(function() {
        resolve();
      });
    }.bind(this));
  },

  _copyGitIgnore: function() {
    this.fs.copyTpl(
      this.templatePath('gitignore'),
      this.destinationPath('.gitignore')
    );

    return new Promise(function(resolve) {
      this._writeFiles(function() {
        resolve();
      });
    }.bind(this));
  },

  _copyProcfile: function() {
    this.fs.copyTpl(
      this.templatePath('Procfile'),
      this.destinationPath('Procfile')
    );

    return new Promise(function(resolve) {
      this._writeFiles(function() {
        resolve();
      });
    }.bind(this));
  },

  /**
   * Copy .rbenv-version and .rbenv-gemsets to project.
   */
  _copyRbenv: function() {
    this.fs.copyTpl(
      this.templatePath('rbenv-version'),
      this.destinationPath('.rbenv-version'),
      { rubyVersion: this.rubyVersion }
    );

    this.fs.copyTpl(
      this.templatePath('rbenv-gemsets'),
      this.destinationPath('.rbenv-gemsets')
    );

    return new Promise(function(resolve) {
      this._writeFiles(function() {
        resolve();
      });
    }.bind(this));
  },

  /**
   * Copy all rspec helpers to project.
   */
   _copyRSpec: function() {
     this.fs.copyTpl(
       this.templatePath('rspec'),
       this.destinationPath('.rspec')
     );

     this.fs.copyTpl(
       this.templatePath('rails_helper.rb'),
       this.destinationPath('spec/rails_helper.rb')
     );

     this.fs.copyTpl(
       this.templatePath('spec_helper.rb'),
       this.destinationPath('spec/spec_helper.rb')
     );

     return new Promise(function(resolve) {
       this._writeFiles(function() {
         resolve();
       });
     }.bind(this));
   },

   _copyRubocop: function() {
     this.fs.copyTpl(
       this.templatePath('rubocop.yml'),
       this.destinationPath('.rubocop.yml')
     );

     return new Promise(function(resolve) {
       this._writeFiles(function() {
         resolve();
       });
     }.bind(this));
   },

   /**
    * Copy unicorn.rb into project config/ directory.
    */
   _copyUnicornConfig: function() {
     this.fs.copyTpl(
       this.templatePath('unicorn.rb'),
       this.destinationPath('config/unicorn.rb')
     );

     return new Promise(function(resolve) {
       this._writeFiles(function() {
         resolve();
       });
     }.bind(this));
   },

  /**
   * Generate the project's database using the command:
   *
   * `rake db:create`
   */
  _createDatabase: function() {
    return new Promise(function(resolve, reject) {
      this.spawnCommand('rake', ['db:create'])
        .on('exit', function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
    }.bind(this));
  },

  /**
   * Download the `rails` gem using the command:
   *
   * `gem install rails --no-document -v *railsVersion*`
   */
  _downloadRails: function() {
    return new Promise(function(resolve, reject) {
      this.spawnCommand(
        'gem',
        ['install', 'rails', '--no-document', '-v', this.railsVersion]
      )
      .on('exit', function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }.bind(this));
  },

  /**
   * Initialize git repository using the command:
   *
   * `git init`
   */
  _gitInit: function() {
    return new Promise(function(resolve, reject) {
      this.spawnCommand('git', ['init'])
        .on('exit', function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
    }.bind(this));
  },

  /**
   * Install Rails using the command:
   *
   * `rails new . -T`
   */
  _installRails: function() {
    return new Promise(function(resolve, reject) {
      this.spawnCommand('rbenv', ['exec', 'rails', 'new', '.', '-T'])
        .on('exit', function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
    }.bind(this));
  },

  /**
   * Create spec directory using the command:
   *
   * `mkdir spec`
   */
  _makeRSpecDir: function() {
    return new Promise(function(resolve, reject) {
      this.spawnCommand('mkdir', ['spec'])
        .on('exit', function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
    }.bind(this));
  },

   /**
    * Stopping spring. Spring seems to cause some hangs.
    */
   _stopSpring: function() {
     return new Promise(function(resolve, reject) {
       this.spawnCommand('spring', ['stop'])
         .on('exit', function(err) {
           if (err) {
             reject(err);
           } else {
             resolve();
           }
         });
     }.bind(this));
   }
});
