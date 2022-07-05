//business logic

class Template {

  constructor() {
    this.stuff = []
  }

  addJunk(array) {
    array.forEach((thing) => {
      this.stuff.push(thing);
    });
  }
}
