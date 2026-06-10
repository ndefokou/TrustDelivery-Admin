use std::sync::Arc;
use sqlx::postgres::PgPoolOptions;

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<sqlx::PgPool>,
}

impl AppState {
    pub async fn new(database_url: &str) -> Self {
        let pool = PgPoolOptions::new()
            .max_connections(10)
            .connect(database_url)
            .await
            .expect("Failed to connect to database");
        
        Self {
            db: Arc::new(pool),
        }
    }
}