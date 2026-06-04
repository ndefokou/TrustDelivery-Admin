#[allow(dead_code)]
pub struct PricingService;

#[allow(dead_code)]
impl PricingService {
    pub fn calculate_price(distance_km: f64) -> f64 {
        if distance_km <= 3.0 {
            1000.0
        } else if distance_km <= 5.0 {
            1500.0
        } else if distance_km <= 10.0 {
            2500.0
        } else {
            3000.0 + (distance_km - 10.0) * 200.0
        }
    }

    pub fn get_pricing_tier(distance_km: f64) -> (String, f64) {
        if distance_km <= 3.0 {
            ("0-3 km".to_string(), 1000.0)
        } else if distance_km <= 5.0 {
            ("3-5 km".to_string(), 1500.0)
        } else if distance_km <= 10.0 {
            ("5-10 km".to_string(), 2500.0)
        } else {
            ("10+ km".to_string(), 3000.0 + (distance_km - 10.0) * 200.0)
        }
    }
}