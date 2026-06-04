use uuid::Uuid;
use rand::Rng;

#[allow(dead_code)]
pub fn generate_otp() -> String {
    let mut rng = rand::thread_rng();
    format!("{:06}", rng.gen::<u32>() % 1000000)
}

#[allow(dead_code)]
pub fn format_phone_number(phone: &str) -> String {
    if phone.starts_with('+') {
        phone.to_string()
    } else {
        format!("+237{}", phone)
    }
}

#[allow(dead_code)]
pub fn calculate_distance(lat1: f64, lng1: f64, lat2: f64, lng2: f64) -> f64 {
    let earth_radius_km = 6371.0;
    
    let d_lat = (lat2 - lat1).to_radians();
    let d_lng = (lng2 - lng1).to_radians();
    
    let lat1_rad = lat1.to_radians();
    let lat2_rad = lat2.to_radians();
    
    let a = (d_lat / 2.0).sin() * (d_lat / 2.0).sin()+
        (d_lng / 2.0).sin() * (d_lng / 2.0).sin() * lat1_rad.cos() * lat2_rad.cos();
    let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());
    
    earth_radius_km * c
}

#[allow(dead_code)]
pub fn format_timestamp(dt: chrono::DateTime<chrono::Utc>) -> String {
    dt.format("%Y-%m-%d %H:%M:%S").to_string()
}

#[allow(dead_code)]
pub fn generate_transaction_id() -> String {
    format!("TXN-{}", Uuid::new_v4())
}