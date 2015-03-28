"use strict";

var co = require("co"),
    Generators = require("yeoman-generator"),
    Promise = require("bluebird");

require("babel/polyfill");

module.exports = Generators.Base.extend({
  constructor: function constructor() {
    var args = Array.prototype.slice.call(arguments);

    args[1].force = true;

    Generators.Base.apply(this, args);
  },

  initializing: function initializing(projectDest) {
    this.projectDest = projectDest;

    this.projectName = this.options.projectName;
  },

  prompting: {
    askForRailsVersion: function askForRailsVersion() {
      var async = this.async();

      var questions = [{
        name: "railsVersion",
        message: "What version of Rails would you like to use?",
        "default": "4.2.1"
      }];

      this.prompt(questions, (function (answers) {
        this.railsVersion = answers.railsVersion;

        async();
      }).bind(this));
    },

    askForRubyVersion: function askForRubyVersion() {
      var async = this.async();

      var questions = [{
        name: "rubyVersion",
        message: "What version of Ruby would you like to use?",
        "default": "2.2.1"
      }];

      this.prompt(questions, (function (answers) {
        this.rubyVersion = answers.rubyVersion;

        async();
      }).bind(this));
    },

    askIfAPI: function askIfAPI() {
      var async = this.async();

      var questions = [{
        type: "confirm",
        name: "isAPI",
        message: "Are you building an API?"
      }];

      this.prompt(questions, (function (answers) {
        this.isAPI = answers.isAPI;

        async();
      }).bind(this));
    }
  },

  install: function install() {
    co(regeneratorRuntime.mark(function callee$1$0() {
      var _this = this;

      var async;
      return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.prev = 0;
            async = _this.async();
            context$2$0.next = 4;
            return _this._gitInit();

          case 4:
            context$2$0.next = 6;
            return _this._copyRbenv();

          case 6:
            context$2$0.next = 8;
            return _this._downloadRails();

          case 8:
            context$2$0.next = 10;
            return _this._installRails();

          case 10:
            context$2$0.next = 12;
            return _this._stopSpring();

          case 12:
            context$2$0.next = 14;
            return _this._copyGemfile();

          case 14:
            context$2$0.next = 16;
            return _this._bundleInstall();

          case 16:
            context$2$0.next = 18;
            return _this._copyDatabaseConfig();

          case 18:
            context$2$0.next = 20;
            return _this._createDatabase();

          case 20:
            context$2$0.next = 22;
            return _this._makeRSpecDir();

          case 22:
            context$2$0.next = 24;
            return _this._copyRSpec();

          case 24:
            context$2$0.next = 26;
            return _this._copyUnicornConfig();

          case 26:
            context$2$0.next = 28;
            return _this._copyProcfile();

          case 28:
            context$2$0.next = 30;
            return _this._copyGitIgnore();

          case 30:
            context$2$0.next = 32;
            return _this._copyRubocop();

          case 32:

            async();
            context$2$0.next = 38;
            break;

          case 35:
            context$2$0.prev = 35;
            context$2$0.t0 = context$2$0["catch"](0);

            console.log(context$2$0.t0);

          case 38:
          case "end":
            return context$2$0.stop();
        }
      }, callee$1$0, this, [[0, 35]]);
    }).bind(this));
  },

  // private

  /**
   * Install application dependencies using the command:
   *
   * `bundle install --without production`
   */
  _bundleInstall: function _bundleInstall() {
    return new Promise((function (resolve, reject) {
      this.spawnCommand("bundle", ["install", "--without", "production"]).on("exit", function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }).bind(this));
  },

  /**
   * Copy `database.yml` into `config/database.yml`. Build database name with
   * project name.
   */
  _copyDatabaseConfig: function _copyDatabaseConfig() {
    this.fs.copyTpl(this.templatePath("database.yml"), this.destinationPath("config/database.yml"), { databaseName: this.projectName });

    return new Promise((function (resolve) {
      this._writeFiles(function () {
        resolve();
      });
    }).bind(this));
  },

  /**
   * Copy Gemfile to project. If the project is an API then an API specific
   * Gemfile will be used.
   */
  _copyGemfile: function _copyGemfile() {
    var gemfileTemplate = this.isAPI ? "Gemfile-api" : "Gemfile";

    this.fs.copyTpl(this.templatePath(gemfileTemplate), this.destinationPath("Gemfile"), {
      rubyVersion: this.rubyVersion,
      console: "<%= console %>"
    });

    return new Promise((function (resolve) {
      this._writeFiles(function () {
        resolve();
      });
    }).bind(this));
  },

  _copyGitIgnore: function _copyGitIgnore() {
    this.fs.copyTpl(this.templatePath("gitignore"), this.destinationPath(".gitignore"));

    return new Promise((function (resolve) {
      this._writeFiles(function () {
        resolve();
      });
    }).bind(this));
  },

  _copyProcfile: function _copyProcfile() {
    this.fs.copyTpl(this.templatePath("Procfile"), this.destinationPath("Procfile"));

    return new Promise((function (resolve) {
      this._writeFiles(function () {
        resolve();
      });
    }).bind(this));
  },

  /**
   * Copy .rbenv-version and .rbenv-gemsets to project.
   */
  _copyRbenv: function _copyRbenv() {
    this.fs.copyTpl(this.templatePath("rbenv-version"), this.destinationPath(".rbenv-version"), { rubyVersion: this.rubyVersion });

    this.fs.copyTpl(this.templatePath("rbenv-gemsets"), this.destinationPath(".rbenv-gemsets"));

    return new Promise((function (resolve) {
      this._writeFiles(function () {
        resolve();
      });
    }).bind(this));
  },

  /**
   * Copy all rspec helpers to project.
   */
  _copyRSpec: function _copyRSpec() {
    this.fs.copyTpl(this.templatePath("rspec"), this.destinationPath(".rspec"));

    this.fs.copyTpl(this.templatePath("rails_helper.rb"), this.destinationPath("spec/rails_helper.rb"));

    this.fs.copyTpl(this.templatePath("spec_helper.rb"), this.destinationPath("spec/spec_helper.rb"));

    return new Promise((function (resolve) {
      this._writeFiles(function () {
        resolve();
      });
    }).bind(this));
  },

  _copyRubocop: function _copyRubocop() {
    return new Promise((function (resolve, reject) {
      this.spawnCommand("mkdir", ["rubocop"]).on("exit", function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });

      this.fs.copyTpl(this.templatePath("rubocop.yml"), this.destinationPath(".rubocop.yml"));

      this.fs.copyTpl(this.templatePath("enabled.yml"), this.destinationPath("rubocop/enabled.yml"));

      this.fs.copyTpl(this.templatePath("disabled.yml"), this.destinationPath("rubocop/disabled.yml"));

      this._writeFiles(function () {
        resolve();
      });
    }).bind(this));
  },

  /**
   * Copy unicorn.rb into project config/ directory.
   */
  _copyUnicornConfig: function _copyUnicornConfig() {
    this.fs.copyTpl(this.templatePath("unicorn.rb"), this.destinationPath("config/unicorn.rb"));

    return new Promise((function (resolve) {
      this._writeFiles(function () {
        resolve();
      });
    }).bind(this));
  },

  /**
   * Generate the project's database using the command:
   *
   * `rake db:create`
   */
  _createDatabase: function _createDatabase() {
    return new Promise((function (resolve, reject) {
      this.spawnCommand("rake", ["db:create"]).on("exit", function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }).bind(this));
  },

  /**
   * Download the `rails` gem using the command:
   *
   * `gem install rails --no-document -v *railsVersion*`
   */
  _downloadRails: function _downloadRails() {
    return new Promise((function (resolve, reject) {
      this.spawnCommand("gem", ["install", "rails", "--no-document", "-v", this.railsVersion]).on("exit", function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }).bind(this));
  },

  /**
   * Initialize git repository using the command:
   *
   * `git init`
   */
  _gitInit: function _gitInit() {
    return new Promise((function (resolve, reject) {
      this.spawnCommand("git", ["init"]).on("exit", function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }).bind(this));
  },

  /**
   * Install Rails using the command:
   *
   * `rails new . -T`
   */
  _installRails: function _installRails() {
    return new Promise((function (resolve, reject) {
      this.spawnCommand("rbenv", ["exec", "rails", "new", ".", "-T"]).on("exit", function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }).bind(this));
  },

  /**
   * Create spec directory using the command:
   *
   * `mkdir spec`
   */
  _makeRSpecDir: function _makeRSpecDir() {
    return new Promise((function (resolve, reject) {
      this.spawnCommand("mkdir", ["spec"]).on("exit", function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }).bind(this));
  },

  /**
   * Stopping spring. Spring seems to cause some hangs.
   */
  _stopSpring: function _stopSpring() {
    return new Promise((function (resolve, reject) {
      this.spawnCommand("spring", ["stop"]).on("exit", function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }).bind(this));
  }
});