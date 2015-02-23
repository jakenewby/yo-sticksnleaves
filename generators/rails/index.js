"use strict";

var co = require("co"),
    Generators = require("yeoman-generator"),
    Promise = require("bluebird");

require("babel/polyfill");

module.exports = Generators.Base.extend({
  initializing: function initializing(projectDest) {
    this.projectDest = projectDest;

    this.destinationRoot(this.destinationPath() + "/" + this.projectDest);
  },

  prompting: {
    askForRailsVersion: function askForRailsVersion() {
      var async = this.async();

      var questions = [{
        name: "railsVersion",
        message: "What version of Rails would you like to use?",
        "default": "4.2.0"
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
        "default": "2.2.0"
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
        message: "Is this project an API?"
      }];

      this.prompt(questions, (function (answers) {
        this.isAPI = answers.isAPI;

        async();
      }).bind(this));
    }
  },

  writing: function writing() {
    var async = this.async();

    this._copyRbenv();

    async();
  },

  install: function install() {
    co(regeneratorRuntime.mark(function callee$1$0() {
      var _this = this;

      var async;
      return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            async = _this.async();
            context$2$0.next = 3;
            return _this._downloadRails();

          case 3:
            context$2$0.next = 5;
            return _this._installRails();

          case 5:

            _this._copyGemfile();

            async();

          case 7:
          case "end":
            return context$2$0.stop();
        }
      }, callee$1$0, this);
    }).bind(this));
  },

  // private

  /**
   * Copy Gemfile to project. If the project is an API then an API specific
   * Gemfile will be copied.
   */
  _copyGemfile: function _copyGemfile() {
    var gemfileTemplate = this.isAPI ? "Gemfile-api" : "Gemfile";

    this.fs.copyTpl(this.templatePath(gemfileTemplate), this.destinationPath("Gemfile"), {
      rubyVersion: this.rubyVersion,
      console: "<%= console %>"
    });
  },

  /**
   * Copy .rbenv-version and .rbenv-gemsets to project.
   */
  _copyRbenv: function _copyRbenv() {
    this.fs.copyTpl(this.templatePath("rbenv-version"), this.destinationPath(".rbenv-version"), { rubyVersion: this.rubyVersion });

    this.fs.copyTpl(this.templatePath("rbenv-gemsets"), this.destinationPath(".rbenv-gemsets"));
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
  }
});