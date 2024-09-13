Feature: Value Router

  Background:
    Given the server is running

  Scenario: Value endpoint
    When the "/v1/values" endpoint is requested
    Then the response should be a JSON array with at least one item
    And each item in the array should have "type" and "value" properties
    And the "type" property of each item should be "values"
    And the "value" property of each item should be a numeric value
    And the "name" property of each item should be a non-empty string
