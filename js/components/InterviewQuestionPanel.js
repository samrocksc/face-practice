// js/components/InterviewQuestionPanel.js
class InterviewQuestionPanel extends HTMLElement {
    constructor() {
        super();
        this.questions = [
            "Tell me about yourself.",
            "What are your strengths?",
            "What are your weaknesses?",
            "Why do you want to work here?",
            "Describe a challenging project you worked on.",
            "How do you handle conflict in the workplace?",
            "Where do you see yourself in 5 years?",
            "Why should we hire you?"
        ];
        this.currentQuestionIndex = 0;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Interview Questions</h2>
            <div class="question-display">
                <p id="current-question" class="text-gray-700">${this.questions[this.currentQuestionIndex]}</p>
            </div>
            <div class="question-controls">
                <button id="prev-question" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg">Previous</button>
                <button id="next-question" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg">Next</button>
                <button id="add-question" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg">Add Question</button>
            </div>
        `;
    }

    setupEventListeners() {
        this.querySelector('#prev-question').addEventListener('click', () => this.previousQuestion());
        this.querySelector('#next-question').addEventListener('click', () => this.nextQuestion());
        this.querySelector('#add-question').addEventListener('click', () => this.addQuestion());
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.updateQuestionDisplay();
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.updateQuestionDisplay();
        }
    }

    addQuestion() {
        const question = prompt("Enter a new interview question:");
        if (question && question.trim() !== '') {
            this.questions.push(question.trim());
            this.currentQuestionIndex = this.questions.length - 1;
            this.updateQuestionDisplay();
        }
    }

    updateQuestionDisplay() {
        const questionDisplay = this.querySelector('#current-question');
        if (questionDisplay) {
            questionDisplay.textContent = this.questions[this.currentQuestionIndex];
        }
    }
}

customElements.define('interview-question-panel', InterviewQuestionPanel);

export default InterviewQuestionPanel;
