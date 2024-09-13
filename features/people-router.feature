Feature: People Router

  Background:
    Given the server is running

  Scenario: People endpoint
    When the "/v1/people" endpoint is requested
    Then the response should be a JSON array with at least one item
    And each item in the array should have "type" and "first" properties
    And the "type" property of each item should be "people"
    And the "age" property of each item should be a numeric value
    And the "prefix" property of each item should be a non-empty string
    And the "first" property of each item should be a non-empty string
    And the "last" property of each item should be a non-empty string
    And the "birthday" property of each item should be a non-empty string
    And the "gender" property of each item should be a non-empty string
    And the "zip" property of each item should be a non-empty string
    And the "ssnFour" property of each item should be a non-empty string
    And the "phone" property of each item should be a non-empty string
    And the "email" property of each item should be a non-empty string
