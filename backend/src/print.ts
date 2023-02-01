
export class PrintQueue {
  private queue: string[];

  constructor() {
    this.queue = [];
  }

  public push(name: string) {
    this.queue.push(name);
  }

  public dumpAsCSV() {
    let currentQueue = this.queue.join();
    this.queue = [];
    return currentQueue;
  }
}