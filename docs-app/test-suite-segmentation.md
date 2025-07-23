# Test Suite Segmentation

Some test suites like to segment which tests run based on various facets such as type of test, feature being tested, and so on. This can be accomplished by leveraging Testem's ability to have multiple test pages:

```json
{
  "test_page": [
    "tests/index.html?filter=acceptance",
    "tests/index.html?filter=!acceptance"
  ]
}
```

You can use this feature in conjunction with Ember Exam's features, which will allow you to segment your test suite but still gain benefits from randomization and splitting.
