use actix_web::Error;
use actix_web::dev::ServiceRequest;
use actix_web::http::header;
use jsonwebtoken::{decode, Validation, DecodingKey, EncodingKey, Header, encode};
use serde::{Deserialize, Serialize};

use crate::models::UserRole;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub role: UserRole,
    pub exp: usize,
}

const JWT_SECRET: &[u8] = b"your-secret-key";

#[allow(dead_code)]
pub fn create_token(user_id: &str, role: UserRole) -> Result<String, Error> {
    let expiration = chrono::Utc::now() + chrono::Duration::hours(24);
    let claims = Claims {
        sub: user_id.to_owned(),
        role,
        exp: expiration.timestamp() as usize,
    };
    
    encode(&Header::default(), &claims, &EncodingKey::from_secret(JWT_SECRET))
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to create token"))
}

#[allow(dead_code)]
pub fn validate_token(token: &str) -> Result<Claims, Error> {
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(JWT_SECRET),
        &Validation::default(),
    )
    .map(|data| data.claims)
    .map_err(|_| actix_web::error::ErrorUnauthorized("Invalid token"))
}

#[allow(dead_code)]
pub async fn auth_middleware(
    req: ServiceRequest,
    _credentials: String,
) -> Result<ServiceRequest, (Error, ServiceRequest)> {
    let token = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok())
        .and_then(|h| h.strip_prefix("Bearer "));

    match token {
        Some(t) => {
            match validate_token(t) {
                Ok(_claims) => Ok(req),
                Err(e) => Err((e, req)),
            }
        }
        None => Err((actix_web::error::ErrorUnauthorized("No token provided"), req)),
    }
}