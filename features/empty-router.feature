Feature: Empty Router

  Background:
    Given the server is running

  Scenario: Empty endpoint
    When the "/v1/empty" endpoint is requested
    Then the response should be an empty JSON array
