Feature: Coord Router

  Background:
    Given the server is running

  Scenario: Coord endpoint
    When the "/v1/coords" endpoint is requested
    Then the response should be a JSON array with at least one item
    And each item in the array should have "type" and "latitude" properties
    And the "type" property of each item should be "coords"
    And the "latitude" property of each item should be a numeric value
    And the "longitude" property of each item should be a numeric value
