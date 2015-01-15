'use strict';

var chalk      = require('chalk'),
    Generators = require('yeoman-generator'),
    yosay      = require('yosay');

module.exports = Generators.NamedBase.extend({
  initializing: function() {
    this.log(yosay('Welcome to the magical and whimsical world of ' + chalk.green('Sticksnleaves') + '!\nLet\'s create a project.'));
  },

  prompting: {
    askForProjectType: function() {
      var questions = [{
        type: 'list',
        name: 'projectType',
        message: 'What type of project would you like to create?',
        choices: [
          {
            name: 'Ruby on Rails (4.2.0)',
            value: 'rails'
          },
          {
            name: 'React (0.12.0)',
            value: 'rect'
          }
        ],
        default: 'rails'
      }];

      this.prompt(questions, function(answers) {
        this.projectType = answers.projectType;

        this.async()();
      }.bind(this));
    }
  }
});
