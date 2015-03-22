"use strict";

var _ = require("lodash"),
    chalk = require("chalk"),
    Generators = require("yeoman-generator"),
    yosay = require("yosay");

_.mixin(require("underscore.string").exports());

module.exports = Generators.Base.extend({
  initializing: function initializing(projectDest) {
    this.projectDest = projectDest || ".";

    if (this.projectDest === ".") {
      this.projectName = _.dasherize(this.determineAppname());
    } else {
      this.projectName = _.dasherize(this.projectDest);
    }

    this.destinationRoot(this.destinationPath() + "/" + this.projectDest);

    this.log(yosay("Welcome to the magical and whimsical world of " + chalk.green("Sticksnleaves") + "! Let's create a project."));
  },

  prompting: {
    askForProjectType: function askForProjectType() {
      var async = this.async();

      var questions = [{
        type: "list",
        name: "projectType",
        message: "What type of project would you like to create?",
        choices: [{
          name: "Ruby on Rails",
          value: "rails"
        }, {
          name: "React",
          value: "react"
        }]
      }];

      this.prompt(questions, (function (answers) {
        this.projectType = answers.projectType;

        async();
      }).bind(this));
    }
  },

  "default": function _default() {
    this.composeWith("sticksnleaves:" + this.projectType, {
      args: [this.projectDest],
      options: {
        projectName: this.projectName
      }
    });
  }
});