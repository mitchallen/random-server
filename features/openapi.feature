Feature: OpenAPI spec for tool generators

  Background:
    Given the server is running

  Scenario: The spec is served without an API key
    When the OpenAPI spec is requested without an API key
    Then the response status should be 200

  Scenario: The served spec names this server with an absolute URL
    When the OpenAPI spec is requested without an API key
    Then the spec server URL should be this server's address

  Scenario: Every operation can become a named tool
    When the OpenAPI spec is requested without an API key
    Then every operation should have a unique operationId

  Scenario: Every /v1 operation declares the API key as a security scheme
    When the OpenAPI spec is requested without an API key
    Then every /v1 operation should require the apiKey security scheme
    And no operation should take the API key as a parameter

  Scenario: The root operation stays open
    When the OpenAPI spec is requested without an API key
    Then the root operation should not require a security scheme

  Scenario: Every collection route is documented and answers
    When the OpenAPI spec is requested without an API key
    Then the spec should document the "coords" collection
    And the spec should document the "people" collection
    And the spec should document the "words" collection
    And the spec should document the "values" collection
    And the spec should document the "empty" collection
    And every documented path without a parameter should answer 200
