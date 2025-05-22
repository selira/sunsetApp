require 'httparty'

module Services
  class LocationSunriseSunset
    BASE_API_URL = 'https://api.sunrisesunset.io/json'.freeze
    TIMEZONE = 'UTC'.freeze

    def initialize(location, start_date_str, end_date_str)
      @location = location
      @start_date = Date.parse(start_date_str.to_s)
      @end_date = Date.parse(end_date_str.to_s)
    rescue ArgumentError => e
      raise "Invalid date format: #{e.message}"
    end

    def self.history(location, start_date:, end_date:)
      new(location, start_date, end_date).fetch_and_store_history
    end

    def fetch_and_store_history
      all_dates_in_range = (@start_date..@end_date).to_a

      existing_location_dates = @location.location_dates
                                        .where(date: all_dates_in_range)
                                        .index_by(&:date)

      missing_dates = all_dates_in_range.reject { |date| existing_location_dates.key?(date) }

      if missing_dates.any?
        api_response = call_sunrise_sunset_api(@location.latitude, @location.longitude, @start_date, @end_date)

        if api_response
          records_to_create = []
          api_response['results'].each do |day_data|
            current_api_date = Date.parse(day_data['date'])

            if missing_dates.include?(current_api_date)
              records_to_create << {
                location_id: @location.id,
                date: current_api_date,
                sunrise: day_data['sunrise'],
                sunset: day_data['sunset'],
                golden_hour: day_data['golden_hour'],
                created_at: Time.current,
                updated_at: Time.current
              }
            end
          end

          if records_to_create.any?
            LocationDate.insert_all(records_to_create)
            newly_created_records = @location.location_dates
                                             .where(date: records_to_create.map { |r| r[:date] })
                                             .index_by(&:date)
            existing_location_dates.merge!(newly_created_records)
          end
        else
          Rails.logger.error "Failed to fetch data from SunriseSunset.io API for location #{@location.id}"
        end
      end

      all_dates_in_range.map do |date|
        db_record = existing_location_dates[date]
        if db_record
          {
            date: db_record.date.iso8601,
            sunrise: db_record.sunrise,
            sunset: db_record.sunset,
            golden_hour: db_record.golden_hour, # Added
            source: 'database'
          }
        else
          {
            date: date.iso8601,
            sunrise: nil,
            sunset: nil,
            golden_hour: nil, # Added
            error: "Data not found for this date"
          }
        end
      end
    end

    private

    def call_sunrise_sunset_api(latitude, longitude, start_date, end_date)
      query_params = {
        lat: latitude,
        lng: longitude,
        date_start: start_date.iso8601,
        date_end: end_date.iso8601,
        timezone: TIMEZONE
      }
      response = HTTParty.get(BASE_API_URL, query: query_params, timeout: 10)

      if response.success? && response.parsed_response['status'] == 'OK'
        response.parsed_response
      else
        Rails.logger.error "SunriseSunset.io API Error: #{response.code} - #{response.body}"
        nil
      end
    rescue HTTParty::Error, SocketError => e
      Rails.logger.error "SunriseSunset.io API Request failed: #{e.message}"
      nil
    end
  end
end