class Location < ApplicationRecord
  has_many :location_dates, dependent: :destroy
end
