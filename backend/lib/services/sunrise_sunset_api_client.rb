require 'httparty'

module Services
  class SunriseSunsetApiError < StandardError; end
  class SunriseSunsetApiConnectionError < SunriseSunsetApiError; end
  class SunriseSunsetApiResponseError < SunriseSunsetApiError; end

  class SunriseSunsetApiClient
    BASE_API_URL = 'https://api.sunrisesunset.io/json'.freeze
    API_TIMEOUT = 10 # seconds

    # Fetches data for a date range from the SunriseSunset.io API
    #
    # @param latitude [Float]
    # @param longitude [Float]
    # @param start_date [Date]
    # @param end_date [Date]
    # @return [Hash] The parsed JSON response from the API if successful.
    # @raise [Services::SunriseSunsetApiConnectionError] if there's a network issue.
    # @raise [Services::SunriseSunsetApiResponseError] if the API returns an error or unexpected response.
    def fetch_daily_data(latitude:, longitude:, start_date:, end_date:)
      query_params = {
        lat: latitude,
        lng: longitude,
        date_start: start_date.iso8601,
        date_end: end_date.iso8601
      }

      response = HTTParty.get(BASE_API_URL, query: query_params, timeout: API_TIMEOUT)

      if response.success? && response.parsed_response&.dig('status') == 'OK'
        response.parsed_response
      else
        raise Services::SunriseSunsetApiResponseError, JSON.parse(response)['body'] || 'Unknown error'
      end
    rescue HTTParty::Error, SocketError => e
      connection_error_message = "SunriseSunset.io API Request failed: #{e.message}"
      raise Services::SunriseSunsetApiConnectionError, connection_error_message
    end
  end
end