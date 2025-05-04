import sys
import os

# Add the parent directory to the system path to allow importing calculator
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask, request, jsonify
from flask_cors import CORS
from impact_calculator import calculate_late_payment_impact # Import the function

app = Flask(__name__)
CORS(app) # Enable CORS

@app.route('/api/calculate_late_impact', methods=['POST'])
def calculate_impact():
    """
    API endpoint to estimate late payment impact.
    Expects JSON body like:
    {
      "balance": 1500.0,
      "apr": 19.99,
      "days_late": 35
    }
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid JSON data provided."}), 400

    balance = data.get('balance')
    apr = data.get('apr')
    days_late = data.get('days_late')

    # Basic type and minimal value validation
    if not isinstance(balance, (int, float)) or balance < 0:
        return jsonify({"error": "'balance' must be a non-negative number."}), 400
    if not isinstance(apr, (int, float)) or apr < 0:
        return jsonify({"error": "'apr' must be a non-negative number."}), 400
    if not isinstance(days_late, int) or days_late < 0:
        # Allow 0 days late for showing minimal impact
        return jsonify({"error": "'days_late' must be a non-negative integer."}), 400

    # Pass data to the calculation logic
    impact_results = calculate_late_payment_impact(balance, apr, days_late)

    # The calculator function returns dict with error key on validation fail
    if "error" in impact_results:
         return jsonify(impact_results), 400 # Return the specific error from the calculator

    return jsonify(impact_results), 200

# Optional: Add a simple root route
@app.route('/')
def index():
    return "Late Payment Impact Backend is running. Access the frontend via index.html."


if __name__ == '__main__':
    # Run the Flask development server
    app.run(debug=True, port=5001) # Use a different port like 5001 to avoid conflict