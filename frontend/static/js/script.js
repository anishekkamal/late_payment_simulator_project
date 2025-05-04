document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('impact-form');
    const resultsDiv = document.getElementById('results');
    const errorMessageDiv = document.getElementById('error-message');
    const feeEstimateSpan = document.getElementById('fee-estimate');
    const scoreDropEstimateSpan = document.getElementById('score-drop-estimate');
    const majorCreditImpactStrong = document.getElementById('major-credit-impact');
    const consequencesList = document.getElementById('consequences-list');
    const dominoChainDiv = document.getElementById('domino-chain');
    const dominoElements = dominoChainDiv.querySelectorAll('.domino');


    // Handle form submission
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default page reload

        // Clear previous results and errors
        resultsDiv.classList.add('hidden');
        errorMessageDiv.classList.add('hidden');
        errorMessageDiv.innerHTML = '';
        consequencesList.innerHTML = ''; // Clear previous consequences
        resetDominoes(); // Reset visual dominoes

        // Collect data from the form
        const cardBalance = parseFloat(document.getElementById('card-balance').value);
        const cardApr = parseFloat(document.getElementById('card-apr').value);
        const daysLate = parseInt(document.getElementById('days-late').value, 10); // Base 10 for integer

        // Basic client-side validation (matches backend)
         if (isNaN(cardBalance) || cardBalance < 0) {
             displayError('Please enter a valid non-negative number for the card balance.');
             document.getElementById('card-balance').focus();
             return;
         }
          if (isNaN(cardApr) || cardApr < 0) {
             displayError('Please enter a valid non-negative number for the card APR.');
             document.getElementById('card-apr').focus();
             return;
         }
          if (isNaN(daysLate) || daysLate < 0) {
             displayError('Please enter a valid non-negative integer for days late.');
             document.getElementById('days-late').focus();
             return;
         }


        // Prepare data for the backend
        const data = {
            balance: cardBalance,
            apr: cardApr,
            days_late: daysLate
        };

        // Send data to the backend API
        try {
            const response = await fetch('http://127.0.0.1:5001/api/calculate_late_impact', { // <-- Ensure this matches your Flask server address/port (using 5001)
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const resultData = await response.json();

            if (!response.ok) {
                // Handle backend errors (e.g., validation errors)
                displayError(resultData.error || 'An error occurred during calculation.');
                return; // Stop processing if backend returned an error
            }

            // Display results
            displayImpactResults(resultData);

        } catch (error) {
            // Handle network errors or other unexpected issues
            console.error('Fetch error:', error);
            displayError('Could not connect to the simulation service. Please ensure the backend is running.');
        }
    });

    // Function to display error messages
    function displayError(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.classList.remove('hidden');
        resultsDiv.classList.add('hidden'); // Hide results if there's an error
    }

    // Function to reset domino visual state
    function resetDominoes() {
         dominoElements.forEach(domino => {
            domino.classList.remove('active');
            // Optionally reset image filter/fill if they were manipulated directly
         });
    }

    // Function to update domino visual based on impact
    function updateDominoes(impacts) {
         // Always activate 'fee' and 'debt-spiral' if days_late > 0 (or >= threshold for fee)
         // And others only if major_credit_impact is true
         const daysLate = impacts.days_late;

         // Fee domino (activate if fee is estimated)
         if (impacts.fee_estimate.min > 0) {
             document.querySelector('.domino[data-impact="fee"]').classList.add('active');
         }

         // Major impacts (activate if days_late >= 30)
         if (impacts.major_credit_impact) {
            document.querySelector('.domino[data-impact="score"]').classList.add('active');
            document.querySelector('.domino[data-impact="penalty-apr"]').classList.add('active');
            document.querySelector('.domino[data-impact="loan-difficulty"]').classList.add('active');
             document.querySelector('.domino[data-impact="debt-spiral"]').classList.add('active'); // Debt spiral is more likely with major impact
         } else {
             // For < 30 days late, maybe just show fee and mild debt spiral risk?
             // Or just fee and 'interest accrual' (which isn't a separate domino here)
             // Let's activate fee and a slightly milder visual for debt spiral risk if > 0 days late
             if (daysLate > 0) {
                 // Debt spiral might be less direct, but still a potential path
                 // document.querySelector('.domino[data-impact="debt-spiral"]').classList.add('active'); // Decide if debt spiral activates always or only on major
             }
         }


        // Simple animation: add 'active' class with a slight delay
        const activeDominoes = dominoChainDiv.querySelectorAll('.domino.active');
        activeDominoes.forEach((domino, index) => {
            domino.style.transitionDelay = `${index * 0.1}s`; // Sequential delay
        });

        // Reset delay after animation is implicitly done
        setTimeout(() => {
             dominoElements.forEach(domino => {
                domino.style.transitionDelay = '0s';
             });
        }, activeDominoes.length * 100 + 500); // Enough time for the last one + a buffer
    }


    // Function to display the results received from the backend
    function displayImpactResults(results) {
        // Format currency
        const formatCurrency = (value) => {
            return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };

        // Display Fee Estimate
        if (results.fee_estimate.min > 0 || results.fee_estimate.max > 0) {
            feeEstimateSpan.textContent = `$${formatCurrency(results.fee_estimate.min)} - $${formatCurrency(results.fee_estimate.max)}`;
        } else {
            feeEstimateSpan.textContent = 'Likely none reported (check card terms)';
        }


        // Display Credit Score Drop Estimate
        if (results.major_credit_impact) {
            scoreDropEstimateSpan.textContent = `${results.score_drop_estimate.min} - ${results.score_drop_estimate.max} points (Estimated)`;
            majorCreditImpactStrong.textContent = 'YES';
            majorCreditImpactStrong.style.color = '#dc3545'; // Red
        } else {
            scoreDropEstimateSpan.textContent = 'Likely none (if paid before 30 days)';
            majorCreditImpactStrong.textContent = 'No (if paid before 30 days late)';
             majorCreditImpactStrong.style.color = '#28a745'; // Green
        }

        // Display Consequences
        if (results.potential_consequences && results.potential_consequences.length > 0) {
            results.potential_consequences.forEach(consequence => {
                const li = document.createElement('li');
                li.textContent = consequence;
                consequencesList.appendChild(li);
            });
        } else {
             const li = document.createElement('li');
             li.textContent = "No major negative impacts estimated if paid very quickly (less than ~5-10 days late, check card terms). Interest may still accrue.";
             consequencesList.appendChild(li);
        }


        // Update the visual domino effect
        updateDominoes(results);


        // Show the results section
        resultsDiv.classList.remove('hidden');

        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }

});