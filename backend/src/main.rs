mod handlers;
mod models;
mod services;
mod middleware;
mod config;
mod utils;

use actix_cors::Cors;
use actix_web::{App, HttpServer, middleware::Logger};
use std::env;

use actix_web::web::Data;
use config::app_state::AppState;
use handlers::{
    auth, deliveries, riders, merchants, reports, payments, settings, notifications, dashboard,
};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    env_logger::init();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());

    let app_state = AppState::new(&database_url).await;

    println!("Server running at http://{}:{}", host, port);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .app_data(Data::new(app_state.clone()))
            .wrap(cors)
            .wrap(Logger::default())
            .service(auth::routes())
            .service(deliveries::routes())
            .service(riders::routes())
            .service(merchants::routes())
            .service(reports::routes())
            .service(payments::routes())
            .service(settings::routes())
            .service(notifications::routes())
            .service(dashboard::routes())
    })
    .bind(format!("{}:{}", host, port))?
    .run()
    .await
}