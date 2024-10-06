'use strict';

class Node {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.neighbors = [];
        this.parent = null;
        this.isWall = false;
    }
}

class Grid {
    constructor(size) {
        this.size = size;
        this.grid = [];
        this.start = null;
        this.end = null;
        this.createGrid();
    }

    createGrid() {
        for (let i = 0; i < this.size; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = new Node(i, j);
            }
        }
    }

    setNeighbors() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j].neighbors = this.getNeighbors(i, j);
            }
        }
    }

    getNeighbors(row, col) {
        const neighbors = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (let [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;
            if (this.isValid(newRow, newCol)) {
                neighbors.push(this.grid[newRow][newCol]);
            }
        }
        return neighbors;
    }

    isValid(row, col) {
        return row >= 0 && row < this.size && col >= 0 && col < this.size;
    }
}

class AStarVisualizer {
    constructor(gridSize) {
        this.grid = new Grid(gridSize);
        this.gridElement = document.getElementById('grid');
        this.createGridButton = document.getElementById('createGrid');
        this.startButton = document.getElementById('startVisualization');
        this.pauseButton = document.getElementById('pauseVisualization');
        this.resetButton = document.getElementById('resetVisualization');
        this.gridSizeInput = document.getElementById('gridSize');
        this.isRunning = false;
        this.isPaused = false;

        this.initEventListeners();
        this.createGridUI();
    }

    initEventListeners() {
        this.createGridButton.addEventListener('click', () => this.createNewGrid());
        this.startButton.addEventListener('click', () => this.startVisualization());
        this.pauseButton.addEventListener('click', () => this.pauseVisualization());
        this.resetButton.addEventListener('click', () => this.resetVisualization());
    }

    createGridUI() {
        this.gridElement.style.gridTemplateColumns = `repeat(${this.grid.size}, 20px)`;
        this.gridElement.innerHTML = '';

        for (let i = 0; i < this.grid.size; i++) {
            for (let j = 0; j < this.grid.size; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', (e) => this.handleCellClick(e));
                this.gridElement.appendChild(cell);
            }
        }
    }

    handleCellClick(event) {
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);

        if (!this.grid.start) {
            this.grid.start = this.grid.grid[row][col];
            event.target.classList.add('start');
        } else if (!this.grid.end) {
            this.grid.end = this.grid.grid[row][col];
            event.target.classList.add('end');
        } else {
            this.grid.grid[row][col].isWall = !this.grid.grid[row][col].isWall;
            event.target.classList.toggle('wall');
        }
    }

    createNewGrid() {
        const newSize = parseInt(this.gridSizeInput.value);
        if (newSize >= 5 && newSize <= 50) {
            this.grid = new Grid(newSize);
            this.createGridUI();
        } else {
            alert('Grid size must be between 5 and 50');
        }
    }

    startVisualization() {
        if (!this.grid.start || !this.grid.end) {
            alert('Please set start and end points');
            return;
        }

        this.isRunning = true;
        this.isPaused = false;
        this.grid.setNeighbors();
        this.aStarAlgorithm();
    }

    pauseVisualization() {
        this.isPaused = !this.isPaused;
    }

    resetVisualization() {
        this.isRunning = false;
        this.isPaused = false;
        this.grid = new Grid(this.grid.size);
        this.createGridUI();
    }

    async aStarAlgorithm() {
        const openSet = [this.grid.start];
        const closedSet = [];

        while (openSet.length > 0 && this.isRunning) {
            if (this.isPaused) {
                await new Promise(resolve => setTimeout(resolve, 100));
                continue;
            }

            let current = this.lowestFScoreNode(openSet);
            if (current === this.grid.end) {
                this.reconstructPath(current);
                return;
            }

            openSet.splice(openSet.indexOf(current), 1);
            closedSet.push(current);

            for (let neighbor of current.neighbors) {
                if (closedSet.includes(neighbor) || neighbor.isWall) continue;

                let tentativeGScore = current.g + 1;

                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                } else if (tentativeGScore >= neighbor.g) {
                    continue;
                }

                neighbor.parent = current;
                neighbor.g = tentativeGScore;
                neighbor.h = this.heuristic(neighbor, this.grid.end);
                neighbor.f = neighbor.g + neighbor.h;

                this.updateCellUI(neighbor, 'visited');
            }

            await new Promise(resolve => setTimeout(resolve, 50));
        }

        alert('No path found!');
    }

    lowestFScoreNode(nodes) {
        return nodes.reduce((lowest, node) => (node.f < lowest.f ? node : lowest));
    }

    heuristic(a, b) {
        return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
    }

    reconstructPath(current) {
        const path = [];
        while (current) {
            path.unshift(current);
            current = current.parent;
        }

        for (let node of path) {
            this.updateCellUI(node, 'path');
        }
    }

    updateCellUI(node, className) {
        const cell = this.gridElement.children[node.row * this.grid.size + node.col];
        cell.classList.add(className);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new AStarVisualizer(20);
});