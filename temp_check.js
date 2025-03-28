document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
    const steps = document.querySelectorAll('.step-content');
    const stepIndicators = document.querySelectorAll('.step');
    const progressBar = document.querySelector('.bg-blue-600');
    let currentStep = 1;

    function showStep(stepNumber) {
        steps.forEach(step => step.classList.add('hidden'));
        document.getElementById(`step-${stepNumber}`).classList.remove('hidden');
        
        // Update step indicators
        stepIndicators.forEach((indicator, index) => {
            const circle = indicator.querySelector('div');
            const text = indicator.querySelector('span');
            if (index < stepNumber) {
                circle.classList.remove('bg-gray-200', 'text-gray-600');
                circle.classList.add('bg-blue-600', 'text-white');
                text.classList.remove('text-gray-500');
                text.classList.add('text-gray-700');
            } else {
                circle.classList.remove('bg-blue-600', 'text-white');
                circle.classList.add('bg-gray-200', 'text-gray-600');
                text.classList.remove('text-gray-700');
                text.classList.add('text-gray-500');
            }
        });
        
        // Update progress bar
        const progress = (stepNumber / steps.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    document.querySelectorAll('.next-step').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentStep < steps.length) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    document.querySelectorAll('.prev-step').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });

    // Initialize
    showStep(1);
});

// Form submission handler
const generateBtn = document.getElementById('generate-btn');
if (generateBtn) {
    generateBtn.addEventListener('click', async function() {
        // Collect form data
        const formData = {
            destination: document.getElementById('destination').value,
            startDate: document.querySelector('#step-2 input[type="date"]:first-of-type').value,
            endDate: document.querySelector('#step-2 input[type="date"]:last-of-type').value,
            travelers: document.querySelector('#step-2 select').value,
            budget: document.querySelector('#step-3 input[name="budget"]:checked').parentElement.querySelector('p').textContent,
            interests: Array.from(document.querySelectorAll('#step-3 input[type="checkbox"]:checked'))
                        .map(cb => cb.parentElement.querySelector('p').textContent),
            email: document.querySelector('#step-4 input[type="email"]').value
        };

        // Validate required fields
        let errorFields = [];
        if (!formData.destination) errorFields.push('Destination');
        if (!formData.startDate) errorFields.push('Start Date');
        if (!formData.endDate) errorFields.push('End Date');
        if (!formData.email) errorFields.push('Email');
    
        if (errorFields.length > 0) {
            const errorHtml = `
                <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-circle text-red-400"></i>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-red-700">
                                Please fill in these required fields: ${errorFields.join(', ')}
                            </p>
                        </div>
                    </div>
                </div>
            `;
            document.querySelector('#step-4').insertAdjacentHTML('afterbegin', errorHtml);
            return;
        }

        const btn = this;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch btn-spin mr-2"></i> Generating...';
        btn.classList.add('cursor-not-allowed');
        
        // Add progress bar
        const progressHtml = `
            <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div id="generation-progress" class="bg-blue-600 h-2.5 rounded-full" style="width: 0%"></div>
            </div>
        `;
        btn.insertAdjacentHTML('afterend', progressHtml);

        try {
            const response = await fetch('http://localhost:3000/api/generate-itinerary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    destination: formData.destination,
                    dates: { 
                        start: formData.startDate, 
                        end: formData.endDate 
                    },
                    travelers: formData.travelers,
                    budget: formData.budget,
                    interests: formData.interests,
                    email: formData.email
                })
            });

            constresult = await response.json();
            
            if (result.success) {
                document.getElementById('generation-progress').style.width = '100%';
                // Show success message
                const successHtml = `
                    <div class="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-check-circle text-green-400"></i>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm text-green-700">
                                    Itinerary generated successfully! Check your email at ${formData.email}
                                </p>
                            </div>
                        </div>
                    </div>
                `;
                document.querySelector('#step-4').insertAdjacentHTML('afterbegin', successHtml);
                
                // Reset form after 3 seconds
                setTimeout(() => {
                    document.querySelector('form').reset();
                    showStep(1);
                }, 3000);
            } else {
                throw new Error(result.error ? result.error : 'An unexpected error occurred while generating the itinerary. Please try again later.');
            }
        } catch (error) {
            // Show error message
            const errorHtml = `
                <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-circle text-red-400"></i>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-red-700">
                                Error: ${error.message}
                            </p>
                        </div>
                    </div>
                </div>
            `;
            document.querySelector('#step-4').insertAdjacentHTML('afterbegin', errorHtml);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Generate Itinerary';
            btn.classList.remove('cursor-not-allowed');
        }
    });
}
