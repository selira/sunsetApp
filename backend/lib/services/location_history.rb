require_relative 'sunrise_sunset_api_client'

module Services
  class LocationHistory

    def initialize(location, start_date_str, end_date_str)
      @location = location
      @start_date = Date.parse(start_date_str.to_s)
      @end_date = Date.parse(end_date_str.to_s)
      @api_client = SunriseSunsetApiClient.new
    rescue ArgumentError => e
      raise ArgumentError, "Invalid date format provided to LocationSunriseSunset service: #{e.message}"
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
        api_response_data = @api_client.fetch_daily_data(
          latitude: @location.latitude,
          longitude: @location.longitude,
          start_date: @start_date,
          end_date: @end_date
        )

        records_to_create = []
        api_response_data['results'].each do |day_data|
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
          # Re-fetch to update existing_location_dates with newly created ones
          newly_created_records = @location.location_dates
                                           .where(date: records_to_create.map { |r| r[:date] })
                                           .index_by(&:date)
          existing_location_dates.merge!(newly_created_records)
        end
      end

      all_dates_in_range.map do |date|
        db_record = existing_location_dates[date]
        if db_record
          {
            date: db_record.date.iso8601,
            sunrise: db_record.sunrise,
            sunset: db_record.sunset,
            golden_hour: db_record.golden_hour,
          }
        else
          {
            date: date.iso8601,
            sunrise: nil,
            sunset: nil,
            golden_hour: nil,
            error: "Data not found for this date. API fetch might have failed or data was not available from the source."
          }
        end
      end
    end
  end
end