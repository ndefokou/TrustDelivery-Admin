use actix_web::{web, HttpResponse, Error};
use crate::models::{Settings, PricingRule, CompanySettings};

pub async fn get_settings() -> Result<HttpResponse, Error> {
    let settings = Settings {
        company: CompanySettings {
            company_name: "TrustDelivery".to_string(),
            address: "Yaoundé, Cameroon".to_string(),
            phone: "+237 XXX XXX XXX".to_string(),
            email: "info@trustdelivery.cm".to_string(),
            logo_url: None,
        },
        pricing_rules: vec![
            PricingRule { min_distance_km: 0.0, max_distance_km: 3.0, base_price: 1000.0, price_per_km: None },
            PricingRule { min_distance_km: 3.0, max_distance_km: 5.0, base_price: 1500.0, price_per_km: None },
            PricingRule { min_distance_km: 5.0, max_distance_km: 10.0, base_price: 2500.0, price_per_km: None },
            PricingRule { min_distance_km: 10.0, max_distance_km: f64::MAX, base_price: 3000.0, price_per_km: Some(200.0) },
        ],
    };

    Ok(HttpResponse::Ok().json(settings))
}

pub async fn update_settings(
    req: web::Json<crate::models::UpdateSettingsRequest>,
) -> Result<HttpResponse, Error> {
    let settings = Settings {
        company: req.company.clone().unwrap_or_else(|| CompanySettings {
            company_name: "TrustDelivery".to_string(),
            address: "Yaoundé, Cameroon".to_string(),
            phone: "+237 XXX XXX XXX".to_string(),
            email: "info@trustdelivery.cm".to_string(),
            logo_url: None,
        }),
        pricing_rules: req.pricing_rules.clone().unwrap_or_default(),
    };

    Ok(HttpResponse::Ok().json(settings))
}

pub fn routes() -> actix_web::Scope {
    web::scope("/api/settings")
        .route("", web::get().to(get_settings))
        .route("", web::put().to(update_settings))
}