use actix_web::{web, HttpResponse, Error};
use crate::config::AppState;
use crate::models::{LoginRequest, LoginResponse, CreateUserRequest, User};
use bcrypt::{hash, verify, DEFAULT_COST};

pub async fn login(
    state: web::Data<AppState>,
    req: web::Json<LoginRequest>,
) -> Result<HttpResponse, Error> {
    let user = sqlx::query_as::<_, User>(
        "SELECT id, email, password_hash, full_name, role, is_active, last_login, created_at, updated_at FROM users WHERE email = $1 AND is_active = true",
    )
    .bind(&req.email)
    .fetch_optional(state.db.as_ref())
    .await;

    match user {
        Ok(Some(db_user)) => {
            if verify(&req.password, &db_user.password_hash).unwrap_or(false) {
                let response = LoginResponse {
                    token: "jwt_token_placeholder".to_string(),
                    user: crate::models::UserInfo {
                        id: db_user.id,
                        email: db_user.email,
                        full_name: db_user.full_name,
                        role: db_user.role,
                    },
                };
                Ok(HttpResponse::Ok().json(response))
            } else {
                Ok(HttpResponse::Unauthorized().json(serde_json::json!({
                    "error": "Invalid credentials"
                })))
            }
        }
        _ => Ok(HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Invalid credentials"
        }))),
    }
}

pub async fn register(
    state: web::Data<AppState>,
    req: web::Json<CreateUserRequest>,
) -> Result<HttpResponse, Error> {
    let password_hash = hash(&req.password, DEFAULT_COST).unwrap();
    
    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (email, password_hash, full_name, role, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, true, NOW(), NOW()) RETURNING id, email, password_hash, full_name, role, is_active, last_login, created_at, updated_at",
    )
    .bind(&req.email)
    .bind(&password_hash)
    .bind(&req.full_name)
    .bind(&req.role)
    .fetch_one(state.db.as_ref())
    .await;

    match user {
        Ok(u) => Ok(HttpResponse::Created().json(UserInfo {
            id: u.id,
            email: u.email,
            full_name: u.full_name,
            role: u.role,
        })),
        _ => Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Failed to create user"
        }))),
    }
}

use crate::models::UserInfo;

pub fn routes() -> actix_web::Scope {
    web::scope("/api/auth")
        .route("/login", web::post().to(login))
        .route("/register", web::post().to(register))
}