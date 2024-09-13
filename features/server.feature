Feature: Smoke Test Server

Background:
  Given the server is running

Scenario: Root endpoint version property
  When the root endpoint is requested
  Then the response should contain a version property

Scenario: Empty endpoint
  When the "/v1/empty" endpoint is requested
  Then the response should be an empty JSON array

Scenario: Coord endpoint
  When the "/v1/coords" endpoint is requested
  Then the response should be a JSON array with at least one item
  And each item in the array should have "type" and "latitude" properties
  And the "type" property of each item should be "coords"
  And the "latitude" property of each item should be a numeric value
  And the "longitude" property of each item should be a numeric value

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

Scenario: Value endpoint
  When the "/v1/values" endpoint is requested
  Then the response should be a JSON array with at least one item
  And each item in the array should have "type" and "value" properties
  And the "type" property of each item should be "values"
  And the "value" property of each item should be a numeric value
  And the "name" property of each item should be a non-empty string

Scenario: Words endpoint
  When the "/v1/words" endpoint is requested
  Then the response should be a JSON array with at least one item
  And each item in the array should have "type" and "value" properties
  And the "type" property of each item should be "words"
  And the "value" property of each item should be a non-empty string
