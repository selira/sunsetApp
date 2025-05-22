# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the `bin/rails db:seed` command (or created alongside the database with `db:setup`).

puts "Seeding Locations..."

locations_data = [
  # Poles
  { name: "North Pole", latitude: 90.0, longitude: 0.0 },
  { name: "South Pole", latitude: -90.0, longitude: 0.0 },

  # Sample World Capitals (Add more as needed)
  # Africa
  { name: "Cairo", latitude: 30.0444, longitude: 31.2357 }, # Egypt
  { name: "Nairobi", latitude: -1.2921, longitude: 36.8219 }, # Kenya
  { name: "Accra", latitude: 5.6037, longitude: -0.1870 }, # Ghana
  { name: "Pretoria", latitude: -25.7461, longitude: 28.1879 }, # South Africa (Administrative)

  # Americas
  { name: "Washington, D.C.", latitude: 38.9072, longitude: -77.0369 }, # USA
  { name: "Ottawa", latitude: 45.4215, longitude: -75.6972 }, # Canada
  { name: "Mexico City", latitude: 19.4326, longitude: -99.1332 }, # Mexico
  { name: "Brasília", latitude: -15.8267, longitude: -47.9218 }, # Brazil
  { name: "Buenos Aires", latitude: -34.6037, longitude: -58.3816 }, # Argentina
  { name: "Lima", latitude: -12.0464, longitude: -77.0428 }, # Peru

  # Asia
  { name: "Beijing", latitude: 39.9042, longitude: 116.4074 }, # China
  { name: "Tokyo", latitude: 35.6895, longitude: 139.6917 }, # Japan
  { name: "New Delhi", latitude: 28.6139, longitude: 77.2090 }, # India
  { name: "Seoul", latitude: 37.5665, longitude: 126.9780 }, # South Korea
  { name: "Jakarta", latitude: -6.2088, longitude: 106.8456 }, # Indonesia
  { name: "Riyadh", latitude: 24.7136, longitude: 46.6753 }, # Saudi Arabia
  { name: "Ankara", latitude: 39.9334, longitude: 32.8597 }, # Turkey

  # Europe
  { name: "London", latitude: 51.5072, longitude: -0.1276 }, # UK
  { name: "Paris", latitude: 48.8566, longitude: 2.3522 }, # France
  { name: "Berlin", latitude: 52.5200, longitude: 13.4050 }, # Germany
  { name: "Madrid", latitude: 40.4168, longitude: -3.7038 }, # Spain
  { name: "Rome", latitude: 41.9028, longitude: 12.4964 }, # Italy
  { name: "Moscow", latitude: 55.7558, longitude: 37.6173 }, # Russia
  { name: "Kyiv", latitude: 50.4501, longitude: 30.5234 }, # Ukraine
  { name: "Lisbon", latitude: 38.7223, longitude: -9.1393 }, # Portugal

  # Oceania
  { name: "Canberra", latitude: -35.2809, longitude: 149.1300 }, # Australia
  { name: "Wellington", latitude: -41.2865, longitude: 174.7762 }, # New Zealand
  { name: "Suva", latitude: -18.1333, longitude: 178.4419 }  # Fiji
]

locations_data.each do |loc_data|
  Location.find_or_create_by!(loc_data)
end

puts "Finished seeding Locations."
puts "Total locations in DB: #{Location.count}"