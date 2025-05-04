# Late Payment Impact Simulator

This project provides a simple web application to simulate the potential consequences of a late credit card payment using a Python backend (Flask) and a static frontend (HTML, CSS, JS).

It focuses particularly on the impact of becoming 30 or more days late, which is the threshold for reporting to major credit bureaus.


## Setup

1.  **Clone or Download:** Get the project files onto your computer.
2.  **Install Python:** Ensure you have Python 3.6+ installed.
3.  **Set up Backend:**
    *   Navigate to the `backend/` directory in your terminal.
    *   Create a virtual environment (recommended):
        ```bash
        python -m venv venv
        ```
    *   Activate the virtual environment:
        *   On macOS/Linux:
            ```bash
            source venv/bin/activate
            ```
        *   On Windows:
            ```bash
            venv\Scripts\activate
            ```
    *   Install dependencies:
        ```bash
        pip install -r requirements.txt
        ```
4.  **Set up Frontend:** The frontend is static. You just need to open `frontend/index.html` in a web browser. No separate server is required for the frontend files themselves, as they will communicate with the running backend server.

## How to Run

1.  **Start the Backend Server:**
    *   Open your terminal and navigate to the `backend/` directory.
    *   Activate your virtual environment (if not already active):
        *   macOS/Linux: `source venv/bin/activate`
        *   Windows: `venv\Scripts\activate`
    *   Run the Flask app:
        ```bash
        python app.py
        ```
    *   You should see output indicating the Flask development server is running, likely on `http://127.0.0.1:5001`.
2.  **Open the Frontend:**
    *   Navigate to the `frontend/` directory in your file explorer.
    *   Double-click on `index.html` to open it in your preferred web browser.
3.  **Use the Simulator:**
    *   Enter your credit card's current balance and APR.
    *   Enter the number of days the payment is late.
    *   Click "Simulate Impact".
    *   The results section will display estimated fees, estimated credit score drop, and a list of potential consequences. The visual "domino chain" will highlight the relevant impacts based on the number of days late.

## Important Notes & Limitations

*   **Estimates Only:** All figures (fees, score drops) are *estimates* based on common industry practices and data. The actual impact can vary significantly.
*   **30-Day Threshold:** The most severe credit report impacts typically occur when a payment is 30 or more days late. The simulator highlights this distinction. Payments less than 30 days late might incur fees but generally do not appear on standard credit reports used for FICO/VantageScore.
*   **Single Payment:** This simulates the impact of a *single* late payment. Multiple late payments have compounding negative effects.
*   **No Penalty APR Calculation:** While "Penalty APR" is listed as a potential consequence, the simulator does not calculate the *amount* of extra interest you might pay if a penalty APR is triggered. This depends heavily on the cardholder agreement.
*   **No Interest Calculation During Late Period:** The simulator does not precisely calculate the small amount of extra interest that accrues just from the few extra days being late.

## Customization

*   **Styling:** Modify `frontend/static/css/style.css`.
*   **Frontend Logic:** Enhance `frontend/static/js/script.js`, e.g., for more dynamic visual effects, specific alerts based on days late, or showing/hiding sections.
*   **Backend Logic:** Adjust the estimates or add more complex calculations in `backend/impact_calculator.py` (e.g., add logic for penalty APR estimation, though this is complex without specific card terms).
*   **Lead Magnet:** The `index.html` includes a placeholder for a lead magnet. Implementing this requires adding backend logic to handle email submission and potentially generate detailed information (which isn't part of this simulation logic).

## Troubleshooting

*   **Backend not running:** Check terminal output for errors when running `python app.py`. Ensure Flask and Flask-CORS are installed.
*   **Frontend not displaying results:** Open browser developer console (F12). Check "Console" and "Network" tabs. Look for failed requests to `http://127.0.0.1:5001/api/calculate_late_impact`. Ensure backend is running and accessible on port 5001. Check CORS errors.
*   **Calculation Errors:** If the backend returns a 400 error, check input values (non-negative numbers, integer for days late).