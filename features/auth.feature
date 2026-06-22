Feature: API key enforcement
  When the server is launched with an API_KEY set, the /v1 routes require a
  matching x-api-key header. The test server is started with API_KEY=demo-key.

  Background:
    Given the server is running

  Scenario: Request with a valid api key succeeds
    When the "/v1/people/count" endpoint is requested
    Then the response status should be 200

  Scenario: Request without an api key is rejected
    When the "/v1/people/count" endpoint is requested without an api key
    Then the response status should be 401
    And the response should have error "unauthorized"

  Scenario: Request with an invalid api key is rejected
    When the "/v1/people/count" endpoint is requested with an invalid api key
    Then the response status should be 401
    And the response should have error "unauthorized"
