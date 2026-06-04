use sqlx::PgPool;

#[allow(dead_code)]
pub struct Database;

#[allow(dead_code)]
impl Database {
    pub async fn create_pool(database_url: &str) -> Result<PgPool, sqlx::Error> {
        PgPool::connect(database_url).await
    }
}