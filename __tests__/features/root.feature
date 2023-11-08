Feature: Application Requests

  @meetings
  Scenario: Make a GET request to the to URL
    Given I make a "GET" request to "/"
    When I receive a response
    Then I expect response should have a status 200
