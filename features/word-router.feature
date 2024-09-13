Feature: Word Router

  Background:
    Given the server is running

  Scenario: Words endpoint
    When the "/v1/words" endpoint is requested
    Then the response should be a JSON array with at least one item
    And each item in the array should have "type" and "value" properties
    And the "type" property of each item should be "words"
    And the "value" property of each item should be a non-empty string
