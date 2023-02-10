
export class PrintQueue {
  private queue: string[];

  constructor() {
    this.queue = [];
  }

  // Add to the end of the queue.
  public push(name: string) {
    this.queue.push(name);
  }

  // This is what the printer app receives.
  public dumpAsCSV() {
    let currentQueue = this.queue.join('\n');
    this.queue = [];
    return currentQueue;
  }
}