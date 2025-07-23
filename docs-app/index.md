---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "ember-exam"
  # text: "Run your tests with randomization, splitting, and parallelization for beautiful tests."
  tagline: "Run your tests with randomization, splitting, and parallelization for beautiful tests."
  actions:
    - theme: brand
      text: Quickstart 
      link: /quickstart
    # - theme: alt
    #   text: API Examples
    #   link: /api-examples

features:
  - title: Partitioning 
    details: Specify the number of parallel browser instances to use to speed up your test suite. 
  - title: Load Balancing 
    details: Balance tests to maximize the effectivess of parallel browsers that would otherwise completely quickly due to happenstance of being given quickly running tests.
  - title: Randomization 
    details: Find and eliminate brittle tests by changing the order of tests within the test suite. 
  - title: Replay 
    details: Record and replay test execution order for reliably reproducing potentially flaky behaviors. 
---


<span class="badges">

![Build Status](https://github.com/ember-cli/ember-exam/actions/workflows/ci.yml/badge.svg?event=push)
[![NPM Version](https://badge.fury.io/js/ember-exam.svg)][npm]
[![Ember Observer Score](https://emberobserver.com/badges/ember-exam.svg)][score]

</span>

[npm]: https://npmjs.com/package/ember-exam
[score]: https://emberobserver.com/addons/ember-exam

Ember Exam is an addon to allow you more control over how you run your tests when used in conjunction with [ember-qunit](https://github.com/emberjs/ember-qunit). It provides the ability to randomize, split, parallelize, and load-balance your test suite by adding a more robust CLI command.

It started as a way to help reduce flaky tests and encourage healthy test driven development. 

[![Introduction to Ember Exam](https://cloud.githubusercontent.com/assets/2922250/22800360/157ad67c-eed7-11e6-8d33-d2c59238c7f1.png)](https://embermap.com/video/ember-exam)


