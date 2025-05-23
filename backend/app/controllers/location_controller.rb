class LocationController < ApplicationController
  before_action :set_location, only: %i[ show ]
  before_action :validate_date_params, only: %i[show]

  # GET /locations
  def index
    @locations = Location.all

    render json: @locations
  end

  # GET /locations/1
  def show
    calculated_data = Services::LocationSunriseSunset.history(@location, start_date: params[:start_date], end_date: params[:end_date])
    render json: calculated_data
  end

  private
    def set_location
      @location = Location.find(params[:id])
    end

    def validate_date_params
      unless params[:start_date].present? && params[:end_date].present?
        render json: { error: "start_date and end_date parameters are required" }, status: :bad_request and return
      end

      begin
        @start_date = Date.parse(params[:start_date])
        @end_date = Date.parse(params[:end_date])
      rescue ArgumentError
        render json: { error: "Invalid date format for start_date or end_date. Please use a valid date format (e.g., YYYY-MM-DD)." }, status: :bad_request and return
      end

      if @start_date > @end_date
        render json: { error: "Start date cannot be after end date" }, status: :bad_request and return
      end
    end
end