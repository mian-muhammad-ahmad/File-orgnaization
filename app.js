// Main Application JavaScript
// File Organizer & Sorting Algorithm Analyzer

class SortingApp {
    constructor() {
        this.analyzer = new SortingAnalyzer();
        this.currentData = [];
        this.currentResults = {};
        this.charts = {};
        
        this.initializeEventListeners();
        this.updateInputMethod();
    }

    initializeEventListeners() {
        // Input method change
        document.getElementById('inputMethod').addEventListener('change', () => this.updateInputMethod());
        
        // Data type change
        document.getElementById('dataType').addEventListener('change', () => this.updateDataType());
        
        // Validate button
        document.getElementById('validateBtn').addEventListener('click', () => this.validateInput());
        
        // Generate sample data
        document.getElementById('generateSampleBtn').addEventListener('click', () => this.generateSampleData());
        
        // Run analysis
        document.getElementById('runAnalysisBtn').addEventListener('click', () => this.runAnalysis());
        
        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        
        // File upload
        document.getElementById('fileUpload').addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Export buttons
        document.getElementById('exportCsvBtn').addEventListener('click', () => this.exportCSV());
        document.getElementById('exportJsonBtn').addEventListener('click', () => this.exportJSON());
    }

    updateInputMethod() {
        const method = document.getElementById('inputMethod').value;
        const manualInput = document.getElementById('manualInput');
        const fileInput = document.getElementById('fileInput');
        
        if (method === 'manual') {
            manualInput.classList.remove('d-none');
            fileInput.classList.add('d-none');
        } else {
            manualInput.classList.add('d-none');
            fileInput.classList.remove('d-none');
        }
        
        this.clearValidationMessage();
    }

    updateDataType() {
        const dataType = document.getElementById('dataType').value;
        const dataInput = document.getElementById('dataInput');
        
        if (dataType === 'integer') {
            dataInput.placeholder = 'Example: 1024, 2048, 512, 4096, 8192';
        } else {
            dataInput.placeholder = 'Example: document.pdf, image.jpg, video.mp4, archive.zip';
        }
        
        this.clearValidationMessage();
    }

    validateInput() {
        const method = document.getElementById('inputMethod').value;
        const dataType = document.getElementById('dataType').value;
        
        let input;
        if (method === 'manual') {
            input = document.getElementById('dataInput').value;
        } else {
            const fileInput = document.getElementById('fileUpload');
            if (!fileInput.files.length) {
                this.showValidationMessage('Please select a file to upload', 'danger');
                return;
            }
            // File validation will be handled in handleFileUpload
            return;
        }
        
        try {
            const validation = DataUtils.validateInput(input, dataType);
            
            if (validation.valid) {
                this.currentData = validation.data;
                this.showValidationMessage(
                    `Validated ${validation.data.length} items successfully!`, 
                    'success'
                );
                document.getElementById('runAnalysisBtn').disabled = false;
            } else {
                this.showValidationMessage(validation.error, 'danger');
                document.getElementById('runAnalysisBtn').disabled = true;
            }
        } catch (error) {
            this.showValidationMessage(error.message, 'danger');
            document.getElementById('runAnalysisBtn').disabled = true;
        }
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const content = await DataUtils.parseFile(file);
            const dataType = document.getElementById('dataType').value;
            
            const validation = DataUtils.validateInput(content, dataType);
            
            if (validation.valid) {
                this.currentData = validation.data;
                this.showValidationMessage(
                    `Loaded ${validation.data.length} items from file successfully!`, 
                    'success'
                );
                document.getElementById('runAnalysisBtn').disabled = false;
            } else {
                this.showValidationMessage(validation.error, 'danger');
                document.getElementById('runAnalysisBtn').disabled = true;
            }
        } catch (error) {
            this.showValidationMessage(`Error reading file: ${error.message}`, 'danger');
            document.getElementById('runAnalysisBtn').disabled = true;
        }
    }

    generateSampleData() {
        const dataType = document.getElementById('dataType').value;
        const sampleData = DataUtils.generateSampleData(dataType, 15);
        
        document.getElementById('dataInput').value = sampleData;
        this.showValidationMessage('Sample data generated! Click "Validate Input" to continue.', 'info');
    }

    getSelectedAlgorithms() {
        const algorithms = [];
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        
        checkboxes.forEach(checkbox => {
            algorithms.push(checkbox.value);
        });
        
        if (algorithms.length === 0) {
            this.showValidationMessage('Please select at least one algorithm', 'warning');
            return null;
        }
        
        return algorithms;
    }

    async runAnalysis() {
        if (this.currentData.length === 0) {
            this.showValidationMessage('Please validate input data first', 'warning');
            return;
        }
        
        const selectedAlgorithms = this.getSelectedAlgorithms();
        if (!selectedAlgorithms) return;
        
        // Show loading state
        const runBtn = document.getElementById('runAnalysisBtn');
        const originalText = runBtn.innerHTML;
        runBtn.innerHTML = '<span class="loading-spinner"></span> Running Analysis...';
        runBtn.disabled = true;
        
        // Run algorithms with a small delay to allow UI update
        setTimeout(() => {
            try {
                this.currentResults = this.analyzer.runAllAlgorithms(this.currentData, selectedAlgorithms);
                this.displayResults();
                this.showValidationMessage('Analysis completed successfully!', 'success');
            } catch (error) {
                this.showValidationMessage(`Error during analysis: ${error.message}`, 'danger');
            } finally {
                runBtn.innerHTML = originalText;
                runBtn.disabled = false;
            }
        }, 100);
    }

    displayResults() {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.classList.remove('d-none');
        resultsSection.classList.add('fade-in');
        
        this.displayMetricsTable();
        this.displayCharts();
        this.displaySortedResults();
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    displayMetricsTable() {
        const tbody = document.getElementById('metricsTableBody');
        tbody.innerHTML = '';
        
        const algorithmNames = this.analyzer.getAlgorithmNames();
        const mostEfficient = this.analyzer.findMostEfficient(this.currentResults);
        
        Object.keys(this.currentResults).forEach(algorithm => {
            const result = this.currentResults[algorithm];
            const metrics = result.metrics;
            const efficiency = this.analyzer.calculateEfficiency(metrics);
            const totalOps = metrics.comparisons + metrics.swaps + metrics.moves;
            
            const row = document.createElement('tr');
            
            // Highlight most efficient algorithm
            if (algorithm === mostEfficient) {
                row.classList.add('table-success');
                row.style.fontWeight = 'bold';
            }
            
            // Efficiency badge
            let efficiencyBadge = 'bg-danger';
            if (efficiency === 'Excellent') efficiencyBadge = 'bg-success';
            else if (efficiency === 'Good') efficiencyBadge = 'bg-warning';
            
            row.innerHTML = `
                <td>
                    ${algorithmNames[algorithm]}
                    ${algorithm === mostEfficient ? '<i class="fas fa-trophy text-warning ms-2"></i>' : ''}
                </td>
                <td>${metrics.executionTime.toFixed(4)}</td>
                <td>${metrics.comparisons.toLocaleString()}</td>
                <td>${(metrics.swaps + metrics.moves).toLocaleString()}</td>
                <td><span class="badge ${efficiencyBadge}">${efficiency}</span></td>
            `;
            
            tbody.appendChild(row);
        });
    }

    displayCharts() {
        const algorithmNames = this.analyzer.getAlgorithmNames();
        const labels = Object.keys(this.currentResults).map(algo => algorithmNames[algo]);
        
        // Prepare data for charts
        const timeData = Object.values(this.currentResults).map(result => result.metrics.executionTime);
        const comparisonsData = Object.values(this.currentResults).map(result => result.metrics.comparisons);
        const swapsData = Object.values(this.currentResults).map(result => result.metrics.swaps + result.metrics.moves);
        
        // Destroy existing charts
        Object.values(this.charts).forEach(chart => chart.destroy());
        this.charts = {};
        
        // Time chart
        const timeCtx = document.getElementById('timeChart').getContext('2d');
        this.charts.time = new Chart(timeCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Execution Time (ms)',
                    data: timeData,
                    backgroundColor: 'rgba(13, 110, 253, 0.6)',
                    borderColor: 'rgba(13, 110, 253, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Execution Time Comparison'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time (ms)'
                        }
                    }
                }
            }
        });
        
        // Comparisons chart
        const comparisonsCtx = document.getElementById('comparisonsChart').getContext('2d');
        this.charts.comparisons = new Chart(comparisonsCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Comparisons',
                    data: comparisonsData,
                    backgroundColor: 'rgba(25, 135, 84, 0.6)',
                    borderColor: 'rgba(25, 135, 84, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Number of Comparisons'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Comparisons'
                        }
                    }
                }
            }
        });
        
        // Swaps/Moves chart
        const swapsCtx = document.getElementById('swapsChart').getContext('2d');
        this.charts.swaps = new Chart(swapsCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Swaps/Moves',
                    data: swapsData,
                    backgroundColor: 'rgba(255, 193, 7, 0.6)',
                    borderColor: 'rgba(255, 193, 7, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Number of Swaps/Moves'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Swaps/Moves'
                        }
                    }
                }
            }
        });
    }

    displaySortedResults() {
        const container = document.getElementById('sortedResults');
        container.innerHTML = '';
        
        const algorithmNames = this.analyzer.getAlgorithmNames();
        const mostEfficient = this.analyzer.findMostEfficient(this.currentResults);
        
        Object.keys(this.currentResults).forEach(algorithm => {
            const result = this.currentResults[algorithm];
            const sortedData = result.sorted;
            
            // Create collapsible section for each algorithm
            const resultDiv = document.createElement('div');
            resultDiv.className = 'sorted-result mb-3';
            
            if (algorithm === mostEfficient) {
                resultDiv.classList.add('border-success');
            }
            
            const displayCount = Math.min(sortedData.length, 10);
            const displayData = sortedData.slice(0, displayCount);
            const hasMore = sortedData.length > displayCount;
            
            resultDiv.innerHTML = `
                <h5>
                    ${algorithmNames[algorithm]}
                    ${algorithm === mostEfficient ? '<span class="badge bg-success ms-2">Most Efficient</span>' : ''}
                </h5>
                <div class="sorted-data">
                    ${displayData.join(', ')}
                    ${hasMore ? `... and ${sortedData.length - displayCount} more items` : ''}
                </div>
                <div class="mt-2">
                    <small class="text-muted">
                        Total items: ${sortedData.length} | 
                        Time: ${result.metrics.executionTime.toFixed(4)}ms | 
                        Comparisons: ${result.metrics.comparisons} | 
                        Operations: ${result.metrics.swaps + result.metrics.moves}
                    </small>
                </div>
            `;
            
            container.appendChild(resultDiv);
        });
    }

    exportCSV() {
        if (Object.keys(this.currentResults).length === 0) {
            this.showValidationMessage('No results to export', 'warning');
            return;
        }
        
        ExportUtils.exportToCSV(this.currentResults, this.currentData);
        this.showValidationMessage('Results exported as CSV', 'success');
    }

    exportJSON() {
        if (Object.keys(this.currentResults).length === 0) {
            this.showValidationMessage('No results to export', 'warning');
            return;
        }
        
        ExportUtils.exportToJSON(this.currentResults, this.currentData);
        this.showValidationMessage('Results exported as JSON', 'success');
    }

    reset() {
        // Clear data
        this.currentData = [];
        this.currentResults = {};
        
        // Reset form
        document.getElementById('dataInput').value = '';
        document.getElementById('fileUpload').value = '';
        document.getElementById('validationMessage').innerHTML = '';
        
        // Reset checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = true;
        });
        
        // Hide results
        document.getElementById('resultsSection').classList.add('d-none');
        
        // Disable run button
        document.getElementById('runAnalysisBtn').disabled = true;
        
        // Destroy charts
        Object.values(this.charts).forEach(chart => chart.destroy());
        this.charts = {};
        
        this.showValidationMessage('Application reset successfully', 'info');
    }

    showValidationMessage(message, type) {
        const messageDiv = document.getElementById('validationMessage');
        messageDiv.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="fas fa-${this.getAlertIcon(type)} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        // Auto-dismiss after 5 seconds for success/info messages
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                const alert = messageDiv.querySelector('.alert');
                if (alert) {
                    const bsAlert = new bootstrap.Alert(alert);
                    bsAlert.close();
                }
            }, 5000);
        }
    }

    clearValidationMessage() {
        document.getElementById('validationMessage').innerHTML = '';
    }

    getAlertIcon(type) {
        const icons = {
            success: 'check-circle',
            danger: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sortingApp = new SortingApp();
    
    // Disable run button initially
    document.getElementById('runAnalysisBtn').disabled = true;
    
    // Add some helpful tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});
