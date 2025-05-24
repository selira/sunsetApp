require_relative 'sunrise_sunset_api_client'

module Services
  class LocationHistory
    def initialize(location, start_date_str, end_date_str)
      @location = location
      @start_date = Date.parse(start_date_str.to_s)
      @end_date = Date.parse(end_date_str.to_s)
      @api_client = SunriseSunsetApiClient.new
    rescue ArgumentError => e
      raise ArgumentError, "Invalid date format provided to LocationHistory service: #{e.message}"
    end

    def self.history(location, start_date:, end_date:)
      new(location, start_date, end_date).fetch_and_store_history
    end

    def fetch_and_store_history
      all_dates_in_range, existing_dates_map, missing_dates = determine_date_details

      if missing_dates.any?
        api_data = fetch_api_data_for_dates
        records_to_create = prepare_database_records(api_data, missing_dates)

        if records_to_create.any?
          newly_created_dates_map = store_and_index_new_records(records_to_create)
          existing_dates_map.merge!(newly_created_dates_map)
        end
      end

      build_final_response(all_dates_in_range, existing_dates_map)
    end

    private

    def determine_date_details
      all_dates_in_range = (@start_date..@end_date).to_a
      existing_location_dates_map = @location.location_dates
                                           .where(date: all_dates_in_range)
                                           .index_by(&:date)
      missing_dates = all_dates_in_range.reject { |date| existing_location_dates_map.key?(date) }
      [all_dates_in_range, existing_location_dates_map, missing_dates]
    end

    def fetch_api_data_for_dates
      @api_client.fetch_daily_data(
        latitude: @location.latitude,
        longitude: @location.longitude,
        start_date: @start_date,
        end_date: @end_date
      )
    end

    def prepare_database_records(api_response_data, missing_dates)
      records_to_create = []
      (api_response_data&.dig('results') || []).each do |day_data|
        current_api_date = Date.parse(day_data['date'])
        if missing_dates.include?(current_api_date)
          records_to_create << {
            location_id: @location.id,
            date: current_api_date,
            sunrise: day_data['sunrise'],
            sunset: day_data['sunset'],
            golden_hour: day_data['golden_hour']
          }
        end
      end
      records_to_create
    end

    def store_and_index_new_records(records_to_create)
      LocationDate.insert_all(records_to_create)
      @location.location_dates
              .where(date: records_to_create.map { |r| r[:date] })
              .index_by(&:date)
    end

    def build_final_response(all_dates_in_range, final_location_dates_map)
      all_dates_in_range.map do |date|
        db_record = final_location_dates_map[date]
        if db_record
          {
            date: db_record.date.iso8601,
            sunrise: db_record.sunrise,
            sunset: db_record.sunset,
            golden_hour: db_record.golden_hour
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