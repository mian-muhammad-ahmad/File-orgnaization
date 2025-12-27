// Sorting Algorithms Implementation
// Each algorithm tracks execution time, comparisons, and swaps/moves

class SortingAnalyzer {
    constructor() {
        this.resetMetrics();
    }

    resetMetrics() {
        this.metrics = {
            comparisons: 0,
            swaps: 0,
            moves: 0,
            startTime: 0,
            endTime: 0,
            executionTime: 0
        };
    }

    // Utility function to compare values (works for both strings and numbers)
    compare(a, b) {
        this.metrics.comparisons++;
        if (typeof a === 'string' && typeof b === 'string') {
            return a.localeCompare(b);
        }
        return a - b;
    }

    // Utility function to swap elements
    swap(arr, i, j) {
        this.metrics.swaps++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    // Utility function to move element (for algorithms like insertion sort)
    move(arr, from, to) {
        this.metrics.moves++;
        const temp = arr[from];
        arr.splice(from, 1);
        arr.splice(to, 0, temp);
    }

    // Bubble Sort
    bubbleSort(arr) {
        this.resetMetrics();
        this.metrics.startTime = performance.now();
        
        const array = [...arr]; // Create a copy
        const n = array.length;
        
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (this.compare(array[j], array[j + 1]) > 0) {
                    this.swap(array, j, j + 1);
                }
            }
        }
        
        this.metrics.endTime = performance.now();
        this.metrics.executionTime = this.metrics.endTime - this.metrics.startTime;
        
        return {
            sorted: array,
            metrics: { ...this.metrics }
        };
    }

    // Selection Sort
    selectionSort(arr) {
        this.resetMetrics();
        this.metrics.startTime = performance.now();
        
        const array = [...arr];
        const n = array.length;
        
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            
            for (let j = i + 1; j < n; j++) {
                if (this.compare(array[j], array[minIdx]) < 0) {
                    minIdx = j;
                }
            }
            
            if (minIdx !== i) {
                this.swap(array, i, minIdx);
            }
        }
        
        this.metrics.endTime = performance.now();
        this.metrics.executionTime = this.metrics.endTime - this.metrics.startTime;
        
        return {
            sorted: array,
            metrics: { ...this.metrics }
        };
    }

    // Insertion Sort
    insertionSort(arr) {
        this.resetMetrics();
        this.metrics.startTime = performance.now();
        
        const array = [...arr];
        const n = array.length;
        
        for (let i = 1; i < n; i++) {
            let key = array[i];
            let j = i - 1;
            
            while (j >= 0 && this.compare(array[j], key) > 0) {
                array[j + 1] = array[j];
                this.metrics.moves++;
                j--;
            }
            
            array[j + 1] = key;
            this.metrics.moves++;
        }
        
        this.metrics.endTime = performance.now();
        this.metrics.executionTime = this.metrics.endTime - this.metrics.startTime;
        
        return {
            sorted: array,
            metrics: { ...this.metrics }
        };
    }

    // Merge Sort
    mergeSort(arr) {
        this.resetMetrics();
        this.metrics.startTime = performance.now();
        
        const array = [...arr];
        this.mergeSortHelper(array, 0, array.length - 1);
        
        this.metrics.endTime = performance.now();
        this.metrics.executionTime = this.metrics.endTime - this.metrics.startTime;
        
        return {
            sorted: array,
            metrics: { ...this.metrics }
        };
    }

    mergeSortHelper(arr, left, right) {
        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            
            this.mergeSortHelper(arr, left, mid);
            this.mergeSortHelper(arr, mid + 1, right);
            this.merge(arr, left, mid, right);
        }
    }

    merge(arr, left, mid, right) {
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
            if (this.compare(leftArr[i], rightArr[j]) <= 0) {
                arr[k] = leftArr[i];
                i++;
            } else {
                arr[k] = rightArr[j];
                j++;
            }
            k++;
            this.metrics.moves++;
        }
        
        while (i < leftArr.length) {
            arr[k] = leftArr[i];
            i++;
            k++;
            this.metrics.moves++;
        }
        
        while (j < rightArr.length) {
            arr[k] = rightArr[j];
            j++;
            k++;
            this.metrics.moves++;
        }
    }

    // Run all selected algorithms
    runAllAlgorithms(arr, selectedAlgorithms) {
        const results = {};
        
        if (selectedAlgorithms.includes('bubble')) {
            results.bubble = this.bubbleSort(arr);
        }
        
        if (selectedAlgorithms.includes('selection')) {
            results.selection = this.selectionSort(arr);
        }
        
        if (selectedAlgorithms.includes('insertion')) {
            results.insertion = this.insertionSort(arr);
        }
        
        if (selectedAlgorithms.includes('merge')) {
            results.merge = this.mergeSort(arr);
        }
        
        return results;
    }

    // Get algorithm display names
    getAlgorithmNames() {
        return {
            bubble: 'Bubble Sort',
            selection: 'Selection Sort',
            insertion: 'Insertion Sort',
            merge: 'Merge Sort'
        };
    }

    // Calculate efficiency rating based on metrics
    calculateEfficiency(metrics) {
        const timeScore = metrics.executionTime;
        const comparisonScore = metrics.comparisons;
        const swapScore = metrics.swaps + metrics.moves;
        
        // Lower scores are better, so we use inverse for efficiency
        const efficiency = 1000 / (timeScore + comparisonScore * 0.1 + swapScore * 0.1);
        
        if (efficiency > 50) return 'Excellent';
        if (efficiency > 20) return 'Good';
        if (efficiency > 10) return 'Fair';
        return 'Poor';
    }

    // Find the most efficient algorithm
    findMostEfficient(results) {
        let bestAlgorithm = null;
        let bestScore = Infinity;
        
        Object.keys(results).forEach(algorithm => {
            const metrics = results[algorithm].metrics;
            const score = metrics.executionTime + metrics.comparisons * 0.1 + (metrics.swaps + metrics.moves) * 0.1;
            
            if (score < bestScore) {
                bestScore = score;
                bestAlgorithm = algorithm;
            }
        });
        
        return bestAlgorithm;
    }
}

// Utility functions for data validation and generation
class DataUtils {
    // Validate input data
    static validateInput(input, dataType) {
        if (!input || input.trim() === '') {
            return { valid: false, error: 'Input cannot be empty' };
        }

        const values = input.split(',').map(item => item.trim()).filter(item => item !== '');
        
        if (values.length === 0) {
            return { valid: false, error: 'No valid data found' };
        }

        if (dataType === 'integer') {
            const integers = values.map(value => {
                const num = parseInt(value);
                if (isNaN(num)) {
                    throw new Error(`"${value}" is not a valid integer`);
                }
                return num;
            });
            
            return { valid: true, data: integers };
        } else {
            return { valid: true, data: values };
        }
    }

    // Generate sample data
    static generateSampleData(dataType, size = 10) {
        if (dataType === 'integer') {
            const sizes = [];
            for (let i = 0; i < size; i++) {
                sizes.push(Math.floor(Math.random() * 10000) + 100);
            }
            return sizes.join(', ');
        } else {
            const extensions = ['.pdf', '.doc', '.txt', '.jpg', '.png', '.mp4', '.mp3', '.zip', '.exe', '.csv'];
            const prefixes = ['document', 'image', 'video', 'audio', 'archive', 'program', 'data', 'report', 'presentation', 'spreadsheet'];
            const fileNames = [];
            
            for (let i = 0; i < size; i++) {
                const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
                const extension = extensions[Math.floor(Math.random() * extensions.length)];
                const number = Math.floor(Math.random() * 100) + 1;
                fileNames.push(`${prefix}_${number}${extension}`);
            }
            
            return fileNames.join(', ');
        }
    }

    // Parse uploaded file
    static parseFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    resolve(content);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }
}

// Export utilities
class ExportUtils {
    // Export results as CSV
    static exportToCSV(results, originalData) {
        let csv = 'Algorithm,Execution Time (ms),Comparisons,Swaps,Moves,Total Operations,Efficiency,Sorted Data\n';
        
        Object.keys(results).forEach(algorithm => {
            const result = results[algorithm];
            const metrics = result.metrics;
            const totalOps = metrics.comparisons + metrics.swaps + metrics.moves;
            const efficiency = new SortingAnalyzer().calculateEfficiency(metrics);
            const sortedData = result.sorted.join(';');
            
            csv += `"${algorithm}",${metrics.executionTime.toFixed(4)},${metrics.comparisons},${metrics.swaps},${metrics.moves},${totalOps},"${efficiency}","${sortedData}"\n`;
        });
        
        this.downloadFile(csv, 'sorting-analysis.csv', 'text/csv');
    }

    // Export results as JSON
    static exportToJSON(results, originalData) {
        const exportData = {
            timestamp: new Date().toISOString(),
            originalData: originalData,
            results: results,
            summary: {
                totalAlgorithms: Object.keys(results).length,
                mostEfficient: new SortingAnalyzer().findMostEfficient(results),
                dataCount: originalData.length
            }
        };
        
        const json = JSON.stringify(exportData, null, 2);
        this.downloadFile(json, 'sorting-analysis.json', 'application/json');
    }

    // Download file utility
    static downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
