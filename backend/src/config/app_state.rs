use std::sync::Arc;
use sqlx::PgPool;

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<PgPool>,
}

impl AppState {
    pub async fn new(database_url: &str) -> Self {
        let pool = PgPool::connect(database_url)
            .await
            .expect("Failed to connect to database");
        
        Self {
            db: Arc::new(pool),
        }
    }
}