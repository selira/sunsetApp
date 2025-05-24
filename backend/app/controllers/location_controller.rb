class LocationController < ApplicationController
  before_action :set_location, only: %i[history]
  before_action :validate_date_params, only: %i[history]

  # GET /locations
  def index
    render json: Location.all
  end

  # GET /locations/1
  def history
    history_data = Services::LocationHistory.history(
      @location,
      start_date: params[:start_date],
      end_date: params[:end_date]
    )
    render json: history_data
  rescue StandardError => e
    render json: { error: "Failed to fetch sunrise/sunset data: #{e.message}" },
           status: :internal_server_error
  end

  private

  def set_location
    @location = Location.find(params[:id])
  end

  def validate_date_params
    unless params[:start_date].present? && params[:end_date].present?
      render json: { error: 'start_date and end_date parameters are required' }, status: :bad_request
      return
    end

    begin
      parsed_start_date = Date.parse(params[:start_date])
      parsed_end_date = Date.parse(params[:end_date])
    rescue ArgumentError
      render json: { error: 'Invalid date format for start_date or end_date. Please use YYYY-MM-DD.' },
             status: :bad_request
      return
    end

    if parsed_start_date > parsed_end_date
      render json: { error: 'Start date cannot be after end date' }, status: :bad_request
    end
  end
end