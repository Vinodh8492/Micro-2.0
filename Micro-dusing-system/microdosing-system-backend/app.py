from flask import Flask
from config import Config
from extensions import db, ma, migrate, jwt
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    

    db.init_app(app)
    ma.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

    with app.app_context():
        try:
            from models.user import User
            from models.material import Material
            from models.recipe import Recipe, RecipeMaterial
            from models.production import ProductionOrder, Batch, BatchMaterialDispensing, MaterialTransaction
            from models.weight import WeightEntry
            from models.storage import StorageBucket

            if not app.config["FLASK_ENV"] == "production":
                db.create_all()

        except Exception as e:
            print(f"⚠️ Error initializing database models: {e}")

        # ✅ Import Blueprints inside the app context to avoid circular import issues
        try:
            from routes.user_routes import user_bp
            from routes.material_routes import material_bp
            from routes.recipe_routes import recipe_bp
            from routes.production_routes import production_bp
            from routes.weight_routes import weight_bp  # ✅ Import this
            from routes.storage_routes import storage_bp

            app.register_blueprint(storage_bp, url_prefix="/api")
            app.register_blueprint(user_bp, url_prefix="/api")
            app.register_blueprint(material_bp, url_prefix="/api")
            app.register_blueprint(recipe_bp, url_prefix="/api")
            app.register_blueprint(production_bp, url_prefix="/api")
            app.register_blueprint(weight_bp, url_prefix="/api")  # ✅ Add this line

        except Exception as e:
            print(f"⚠️ Error registering Blueprints: {e}")

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
