/// Pricing service for calculating delivery costs based on distance
use chrono::Timelike;

pub struct PricingService;

impl PricingService {
    /// Calculate base delivery cost based on distance
    /// Pricing tiers:
    /// 0-1 km = 1000 FCFA
    /// 1-3 km = 1500 FCFA
    /// 3-5 km = 2000 FCFA
    /// 5-10 km = 2500 FCFA
    /// 10+ km = 3000 FCFA + 200 FCFA per additional km
    pub fn calculate_base_cost(distance_km: f64) -> i64 {
        if distance_km <= 0.0 {
            return 0;
        }
        
        if distance_km <= 1.0 {
            1000
        } else if distance_km <= 3.0 {
            1500
        } else if distance_km <= 5.0 {
            2000
        } else if distance_km <= 10.0 {
            2500
        } else {
            3000 + ((distance_km - 10.0) * 200.0) as i64
        }
    }

    /// Calculate price with all factors
    pub fn calculate_price(distance_km: f64, is_peak_hour: bool, is_cod: bool, amount_to_collect: Option<f64>) -> i64 {
        let mut cost = Self::calculate_base_cost(distance_km);
        
        // Peak hour surcharge
        if is_peak_hour {
            cost = (cost as f64 * 1.10) as i64; // +10%
        }
        
        // COD handling fee
        if is_cod {
            cost += 200;
        }
        
        // High-value COD additional handling
        if let Some(amount) = amount_to_collect {
            if amount > 50000.0 {
                cost += 300; // Additional handling for high-value COD
            }
        }
        
        cost
    }

    /// Get pricing tier description
    pub fn get_pricing_tier(distance_km: f64) -> (String, i64) {
        if distance_km <= 1.0 {
            ("0-1 km".to_string(), 1000)
        } else if distance_km <= 3.0 {
            ("1-3 km".to_string(), 1500)
        } else if distance_km <= 5.0 {
            ("3-5 km".to_string(), 2000)
        } else if distance_km <= 10.0 {
            ("5-10 km".to_string(), 2500)
        } else {
            ("10+ km".to_string(), 3000 + ((distance_km - 10.0) * 200.0) as i64)
        }
    }

    /// Calculate carrier earnings (85% of delivery cost)
    pub fn calculate_carrier_earnings(delivery_cost: i64) -> i64 {
        (delivery_cost as f64 * 0.85) as i64
    }

    /// Calculate platform fee (15% of delivery cost)
    pub fn calculate_platform_fee(delivery_cost: i64) -> i64 {
        (delivery_cost as f64 * 0.15) as i64
    }

    /// Check if current time is peak hour (17:00-20:00)
    pub fn is_peak_hour() -> bool {
        use chrono::Utc;
        let hour = Utc::now().hour();
        hour >= 17 && hour <= 20
    }
}

/// Calculate distance between two coordinates using Haversine formula
pub fn calculate_distance(lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
    let earth_radius_km = 6371.0;
    
    let lat1_rad = lat1.to_radians();
    let lat2_rad = lat2.to_radians();
    let delta_lat = (lat2 - lat1).to_radians();
    let delta_lon = (lon2 - lon1).to_radians();
    
    let a = (delta_lat / 2.0).sin() * (delta_lat / 2.0).sin()
        + lat1_rad.cos() * lat2_rad.cos() * (delta_lon / 2.0).sin() * (delta_lon / 2.0).sin();
    
    let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());
    
    earth_radius_km * c
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_base_pricing_tier_1() {
        assert_eq!(PricingService::calculate_base_cost(0.5), 1000);
        assert_eq!(PricingService::calculate_base_cost(1.0), 1000);
    }

    #[test]
    fn test_base_pricing_tier_2() {
        assert_eq!(PricingService::calculate_base_cost(1.5), 1500);
        assert_eq!(PricingService::calculate_base_cost(2.5), 1500);
        assert_eq!(PricingService::calculate_base_cost(3.0), 1500);
    }

    #[test]
    fn test_base_pricing_tier_3() {
        assert_eq!(PricingService::calculate_base_cost(3.5), 2000);
        assert_eq!(PricingService::calculate_base_cost(4.0), 2000);
        assert_eq!(PricingService::calculate_base_cost(5.0), 2000);
    }

    #[test]
    fn test_base_pricing_tier_4() {
        assert_eq!(PricingService::calculate_base_cost(6.0), 2500);
        assert_eq!(PricingService::calculate_base_cost(9.5), 2500);
        assert_eq!(PricingService::calculate_base_cost(10.0), 2500);
    }

    #[test]
    fn test_base_pricing_tier_5() {
        assert_eq!(PricingService::calculate_base_cost(10.5), 3100);
        assert_eq!(PricingService::calculate_base_cost(15.0), 4000);
        assert_eq!(PricingService::calculate_base_cost(50.0), 11000);
    }

    #[test]
    fn test_zero_distance() {
        assert_eq!(PricingService::calculate_base_cost(0.0), 0);
    }

    #[test]
    fn test_distance_calculation() {
        // Distance from Bastos to Centre Ville Yaoundé (approx 5 km)
        let distance = calculate_distance(3.8808, 11.5022, 3.8625, 11.5167);
        assert!(distance > 0.0 && distance < 10.0);
    }

    #[test]
    fn test_carrier_earnings() {
        assert_eq!(PricingService::calculate_carrier_earnings(2000), 1700);
        assert_eq!(PricingService::calculate_carrier_earnings(1500), 1275);
    }

    #[test]
    fn test_platform_fee() {
        assert_eq!(PricingService::calculate_platform_fee(2000), 300);
        assert_eq!(PricingService::calculate_platform_fee(1500), 225);
    }
}