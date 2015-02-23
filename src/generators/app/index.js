'use strict';

var chalk      = require('chalk'),
    Generators = require('yeoman-generator'),
    yosay      = require('yosay');

module.exports = Generators.Base.extend({
  constructor: function() {
    var args = Array.prototype.slice.call(arguments);

    args[1].force = true;

    Generators.Base.apply(this, args);
  },

  initializing: function(projectDest) {
    this.projectDest = projectDest || '.';

    this.log(
      yosay(
        'Welcome to the magical and whimsical world of ' +
        chalk.green('Sticksnleaves') + '! Let\'s create a project.'
      )
    );
  },

  prompting: {
    askForProjectType: function() {
      var async = this.async();

      var questions = [{
        type: 'list',
        name: 'projectType',
        message: 'What type of project would you like to create?',
        choices: [
          {
            name: 'Ruby on Rails',
            value: 'rails'
          },
          {
            name: 'React',
            value: 'react'
          }
        ]
      }];

      this.prompt(questions, function(answers) {
        this.projectType = answers.projectType;

        async();
      }.bind(this));
    }
  },

  default: function() {
    this.composeWith(
      'sticksnleaves:' + this.projectType, { args: [this.projectDest] }
    );
  }
});
