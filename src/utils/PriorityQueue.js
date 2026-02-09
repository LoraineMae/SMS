// src/utils/PriorityQueue.js
export class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  // Assigns a numerical value to urgency for comparison
  getUrgencyScore(urgency) {
    const scores = { critical: 1, high: 2, medium: 3, low: 4 };
    return scores[urgency] || 3;
  }

  insert(patient) {
    this.heap.push(patient);
    this.bubbleUp(this.heap.length - 1);
  }

  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const current = this.heap[index];
      const parent = this.heap[parentIndex];
      
      const currentPriority = this.getUrgencyScore(current.urgency);
      const parentPriority = this.getUrgencyScore(parent.urgency);
      
      // Sort by priority first, then by arrival time if priorities are equal
      if (currentPriority < parentPriority || 
          (currentPriority === parentPriority && current.arrivalTime < parent.arrivalTime)) {
        this.heap[index] = parent;
        this.heap[parentIndex] = current;
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown(0);
    return min;
  }

  bubbleDown(index) {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (leftChild < this.heap.length) {
        const smallestPriority = this.getUrgencyScore(this.heap[smallest].urgency);
        const leftPriority = this.getUrgencyScore(this.heap[leftChild].urgency);
        
        if (leftPriority < smallestPriority || 
            (leftPriority === smallestPriority && 
             this.heap[leftChild].arrivalTime < this.heap[smallest].arrivalTime)) {
          smallest = leftChild;
        }
      }

      if (rightChild < this.heap.length) {
        const smallestPriority = this.getUrgencyScore(this.heap[smallest].urgency);
        const rightPriority = this.getUrgencyScore(this.heap[rightChild].urgency);
        
        if (rightPriority < smallestPriority || 
            (rightPriority === smallestPriority && 
             this.heap[rightChild].arrivalTime < this.heap[smallest].arrivalTime)) {
          smallest = rightChild;
        }
      }

      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      } else {
        break;
      }
    }
  }

  getAll() {
    return [...this.heap];
  }

  size() {
    return this.heap.length;
  }
}