class CreateLocationDates < ActiveRecord::Migration[8.0]
  def change
    create_table :location_dates do |t|
      t.references :location, null: false, foreign_key: true
      t.date :date, null: false
      t.string :sunrise
      t.string :sunset
      t.string :golden_hour

      t.timestamps
    end

    add_index :location_dates, [:location_id, :date], unique: true, name: 'index_location_dates_on_location_and_date'
  end
end
