Feature: Smoke Test Server

  Background:
    Given the server is running

  Scenario: Root endpoint version property
    When the root endpoint is requested
    Then the response should contain a version property

  Scenario: Unknown route returns the 404 catch-all
    When the "/no-such-route" endpoint is requested
    Then the response status should be 404
    And the response should have error "not found"

  Scenario: Unknown nested route returns the 404 catch-all
    When the "/no/such/nested/route" endpoint is requested
    Then the response status should be 404
    And the response should have error "not found"
