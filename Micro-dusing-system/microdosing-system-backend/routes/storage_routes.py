
from flask import Blueprint, request, jsonify
from models.storage import StorageBucket, StorageBucketSchema
from models.material import Material
from extensions import db
import uuid  # Used for generating unique barcodes

storage_bp = Blueprint("storage_bp", __name__)
storage_schema = StorageBucketSchema()
storages_schema = StorageBucketSchema(many=True)

# GET all storage buckets
@storage_bp.route("/storage", methods=["GET"])
def get_all_buckets():
    buckets = StorageBucket.query.all()
    return storages_schema.jsonify(buckets), 200


# GET bucket by barcode
@storage_bp.route("/storage/<string:barcode>", methods=["GET"])
def get_bucket_by_barcode(barcode):
    bucket = StorageBucket.query.filter_by(barcode=barcode).first()
    if not bucket:
        return jsonify({"error": "Bucket not found"}), 404
    return storage_schema.jsonify(bucket), 200


# POST create storage bucket for a material
@storage_bp.route("/storage", methods=["POST"])
def create_bucket():
    data = request.get_json()

    material_id = data.get("material_id")
    location_id = data.get("location_id")

    # ✅ Validate material exists
    material = Material.query.get(material_id)
    if not material:
        return jsonify({"error": "Material not found in master"}), 404

    # ✅ Check if bucket already exists for this material
    existing_bucket = StorageBucket.query.filter_by(material_id=material_id).first()
    if existing_bucket:
        return jsonify({"error": "Storage bucket already exists for this material"}), 400

    # ✅ Generate unique barcode
    barcode = f"B-{uuid.uuid4().hex[:10].upper()}"

    # ✅ Create and commit the bucket
    new_bucket = StorageBucket(
        location_id=location_id,
        material_id=material_id,
        barcode=barcode
    )

    db.session.add(new_bucket)
    db.session.commit()

    return storage_schema.jsonify(new_bucket), 201

@storage_bp.route("/storage/update/<int:bucket_id>", methods=["PUT"])
def update_bucket_by_id(bucket_id):
    data = request.get_json()

    bucket = StorageBucket.query.get(bucket_id)
    if not bucket:
        return jsonify({"error": "Bucket not found"}), 404

    # Update location_id if provided
    if "location_id" in data:
        bucket.location_id = data["location_id"]

    # Update barcode if provided (check uniqueness)
    if "barcode" in data:
        existing = StorageBucket.query.filter_by(barcode=data["barcode"]).first()
        if existing and existing.bucket_id != bucket_id:
            return jsonify({"error": "Barcode already exists for another bucket"}), 400
        bucket.barcode = data["barcode"]

    db.session.commit()
    return storage_schema.jsonify(bucket), 200

@storage_bp.route("/storage/delete/<int:bucket_id>", methods=["DELETE"])
def delete_bucket_by_id(bucket_id):
    bucket = StorageBucket.query.get(bucket_id)
    if not bucket:
        return jsonify({"error": "Bucket not found"}), 404

    db.session.delete(bucket)
    db.session.commit()

    return jsonify({"message": f"Bucket with ID {bucket_id} deleted successfully"}), 200
