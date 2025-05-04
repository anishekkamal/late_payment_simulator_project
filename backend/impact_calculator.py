def calculate_late_payment_impact(balance, apr, days_late):
    """
    Estimates the impact of a late payment.

    Args:
        balance (float): The balance of the card.
        apr (float): The annual percentage rate.
        days_late (int): The number of days the payment is late.

    Returns:
        dict: A dictionary containing estimated impacts.
              Returns None or a dict with an error key if input is invalid.
    """
    # Basic validation (should also be done on frontend, but good practice here)
    if not isinstance(balance, (int, float)) or balance < 0:
         return {"error": "Invalid balance provided."}
    if not isinstance(apr, (int, float)) or apr < 0:
         return {"error": "Invalid APR provided."}
    if not isinstance(days_late, int) or days_late < 0:
         return {"error": "Invalid days late provided. Must be a non-negative integer."}

    # Initialize impacts
    impacts = {
        "days_late": days_late,
        "fee_estimate": {"min": 0, "max": 0},
        "score_drop_estimate": {"min": 0, "max": 0},
        "major_credit_impact": False,
        "potential_consequences": []
    }

    # --- Estimate Fee ---
    # Late fees vary. Typical range for first offense is $25-$40.
    # Some might be based on balance or minimum payment, but a fixed range is a common estimate.
    # Fee usually applies once the payment is late, often after a grace period, but sometimes immediately.
    # Let's apply the estimate if it's more than a few days late, and especially if it hits 30+.
    # Using a simple threshold like > 5 days late for fee estimate, but this is just an approximation.
    if days_late > 5: # Assume fee charged after a few days/internal grace period
         impacts["fee_estimate"] = {"min": 25, "max": 40} # Common estimated range

    # --- Estimate Credit Score Impact ---
    # Credit bureaus (Equifax, Experian, TransUnion) are typically notified once a payment is 30+ days late.
    # This is a *major* negative mark and the most impactful factor for credit scores.
    # The score drop varies greatly based on the *starting* score (higher scores drop more points)
    # and the overall credit profile.
    # The range 40-100 points is a widely cited estimate for a single 30-day late payment.
    # This is where the "Domino Effect" starts.
    if days_late >= 30:
        impacts["major_credit_impact"] = True
        impacts["score_drop_estimate"] = {"min": 40, "max": 100} # Estimated range

        # Add other potential consequences
        impacts["potential_consequences"].append("Major negative mark on credit reports (stays for 7 years).")
        impacts["potential_consequences"].append(f"Significant estimated credit score drop ({impacts['score_drop_estimate']['min']}-{impacts['score_drop_estimate']['max']} points typically).")
        impacts["potential_consequences"].append("Increased difficulty getting approved for new loans or credit.")
        impacts["potential_consequences"].append("Higher interest rates on existing or future credit (penalty APR might apply).")
        impacts["potential_consequences"].append("Could lead to further fees or collections if not addressed.")

    elif days_late > 0: # Late but less than 30 days
         impacts["potential_consequences"].append("Potential late fee from the lender.")
         impacts["potential_consequences"].append("May incur interest charges on outstanding balance.")
         # Note: Usually doesn't affect credit *report* at this stage, but lender might report to specialized bureaus or internal records.
         impacts["potential_consequences"].append("Generally does NOT affect main credit report (FICO/VantageScore) unless 30+ days late.")


    # Add general consequence regardless of days late if balance > 0
    if balance > 0:
         impacts["potential_consequences"].append("Interest continues to accrue on the balance until paid.")


    return impacts

# --- Example Usage ---
if __name__ == "__main__":
    print("--- Late Payment Impact Simulator ---")

    # Scenario 1: Slightly late (no credit report impact)
    print("\nScenario 1: 10 days late")
    impact_10_days = calculate_late_payment_impact(balance=1000.0, apr=20.0, days_late=10)
    print(impact_10_days)
    # Expected: Fee estimate range, no major credit impact, list of potential consequences

    # Scenario 2: 35 days late (hits credit report)
    print("\nScenario 2: 35 days late")
    impact_35_days = calculate_late_payment_impact(balance=2500.0, apr=22.0, days_late=35)
    print(impact_35_days)
    # Expected: Fee estimate range, major credit impact=True, score drop estimate range, longer list of consequences

    # Scenario 3: Invalid input
    print("\nScenario 3: Invalid input")
    impact_invalid = calculate_late_payment_impact(balance=-100, apr=20.0, days_late=10)
    print(impact_invalid)
     # Expected: Error message